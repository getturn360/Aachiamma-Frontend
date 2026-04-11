import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/api/axios";
import { toast } from "@/lib/toast";


function InvoiceControlPage() {
  const [settings, setSettings] = useState({});
  const [logoUploading, setLogoUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef(null);

  const pollRef = useRef(null);
  const mountedRef = useRef(true);
  const initialSuccessRef = useRef(false); 
  const failCountRef = useRef(0); 
  const MAX_CONSECUTIVE_FAILURES = 3;
  const POLL_INTERVAL_MS = 5000;

  useEffect(() => {
    mountedRef.current = true;

    (async () => {
      const ok = await fetchSettings();
      if (ok && mountedRef.current) {
        initialSuccessRef.current = true;
        pollRef.current = setInterval(() => fetchSettings(), POLL_INTERVAL_MS);
      }
    })();

    const onVisibility = () => {
      if (document.hidden) {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } else {
      
        if (initialSuccessRef.current && !pollRef.current) {
          pollRef.current = setInterval(() => fetchSettings(), POLL_INTERVAL_MS);
        }
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mountedRef.current = false;
      document.removeEventListener("visibilitychange", onVisibility);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  
  }, []);

  async function fetchSettings() {
    try {
      const res = await api.get("/api/admin/invoice-settings/settings", { skipGlobalLoader: true });
      const j = res?.data;

      if (j && j.success) {
        failCountRef.current = 0; 
        if (mountedRef.current) setSettings(j.data || {});
        return true;
      } else {
     
        failCountRef.current += 1;
        if (mountedRef.current) {
          toast({ title: "Failed to load invoice settings", variant: "destructive" });
        }
        if (failCountRef.current >= MAX_CONSECUTIVE_FAILURES) {
          stopPolling();
        }
        return false;
      }
    } catch (err) {
      const status = err?.response?.status;
      console.error("fetchSettings err", status, err?.message || err);

  
      if (status === 401 || status === 403) {
        if (mountedRef.current) {
          toast({ title: "Unauthorized", description: "Please login with an admin account", variant: "destructive" });
          setSettings({});
        }
        stopPolling();
        return false;
      }

      failCountRef.current += 1;
      if (mountedRef.current) {
        toast({ title: "Failed to load invoice settings", description: err?.message || "See console", variant: "destructive" });
      }

      if (failCountRef.current >= MAX_CONSECUTIVE_FAILURES) {
        stopPolling();
      }

      return false;
    }
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function save() {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const payload = {
        companyName: settings.companyName || "",
        companyEmail: settings.companyEmail || "",
        companyPhone: settings.companyPhone || "",
        companyAddressLine1: settings.companyAddressLine1 || "",
        companyCity: settings.companyCity || "",
        companyState: settings.companyState || "",
        companyZip: settings.companyZip || "",
        logoUrl: settings.logoUrl || "",
        signatureUrl: settings.signatureUrl || "",
        invoicePrefix: settings.invoicePrefix || "",
        invoiceStart: Number.isFinite(Number(settings.invoiceStart)) ? Number(settings.invoiceStart) : 0,
        invoiceNote: settings.invoiceNote || "",
        gstNumber: settings.gstNumber || "",
        showHSN: !!settings.showHSN,
        lastInvoiceNumber: Number.isFinite(Number(settings.lastInvoiceNumber)) ? Number(settings.lastInvoiceNumber) : 0,
      };

      const res = await api.post("/api/admin/invoice-settings/settings", payload, {
        headers: { "Content-Type": "application/json" },
        skipGlobalLoader: true,
      });

      const j = res?.data;

      if (res.status >= 200 && res.status < 300 && j && j.success) {
        toast({ title: "Saved" });
        setSettings(j.data || { ...settings, ...payload });
      } else {
        const serverMsg = j?.message || j?.error || `HTTP ${res.status}`;
        toast({ title: "Error saving invoice settings", description: serverMsg, variant: "destructive" });
      }
    } catch (err) {
      console.error("save settings err", err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        stopPolling();
        toast({ title: "Unauthorized", description: "Please login as admin", variant: "destructive" });
      } else {
        toast({ title: "Save failed", description: err?.message || "See console", variant: "destructive" });
      }
    } finally {
      setIsSaving(false);
    }
  }

  const handleLogoSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const maxMb = 6;
    if (file.size > maxMb * 1024 * 1024) {
      toast({ title: "File too large", description: `Choose file smaller than ${maxMb}MB`, variant: "destructive" });
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    try {
      setLogoUploading(true);

      const fd = new FormData();
      fd.append("my_file", file);
      fd.append("variant", "front");

      const res = await api.post("/api/admin/site-media/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        skipGlobalLoader: true,
      });

      const data = res?.data || {};

      if (!(res.status >= 200 && res.status < 300) || !data) {
        toast({ title: "Upload failed", description: data?.message || `Server responded ${res.status}`, variant: "destructive" });
        return;
      }

      let url = "";
      if (data?.doc?.url) url = data.doc.url;
      else if (data?.doc?.secure_url) url = data.doc.secure_url;
      else if (data?.url) url = data.url;
      else if (data?.secure_url) url = data.secure_url;
      else if (data?.data?.url) url = data.data.url;

      if (!url) {
        toast({ title: "Upload failed", description: "No URL returned", variant: "destructive" });
        return;
      }

      setSettings((s) => ({ ...s, logoUrl: url }));
      toast({ title: "Logo uploaded" });
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      console.error("logo upload err", err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        stopPolling();
        toast({ title: "Unauthorized", description: "Please login as admin", variant: "destructive" });
      } else {
        toast({ title: "Upload failed", description: err?.message || "See console", variant: "destructive" });
      }
    } finally {
      setLogoUploading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Invoice Control</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm">Company Name</label>
          <Input value={settings.companyName || ""} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm">Company Email</label>
          <Input value={settings.companyEmail || ""} onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm">Company Phone</label>
          <Input value={settings.companyPhone || ""} onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm">GST / Tax Number</label>
          <Input value={settings.gstNumber || ""} onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm">Company Address (line 1)</label>
          <Input value={settings.companyAddressLine1 || ""} onChange={(e) => setSettings({ ...settings, companyAddressLine1: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm">City / State / Zip</label>
          <Input
            value={(settings.companyCity || "") + (settings.companyState ? ", " + settings.companyState : "") + (settings.companyZip ? ", " + settings.companyZip : "")}
            onChange={() => { }}
            placeholder="Use individual fields below (City, State, Zip)"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm">Company City</label>
          <Input value={settings.companyCity || ""} onChange={(e) => setSettings({ ...settings, companyCity: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm">Company State</label>
          <Input value={settings.companyState || ""} onChange={(e) => setSettings({ ...settings, companyState: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm">Company Zip</label>
          <Input value={settings.companyZip || ""} onChange={(e) => setSettings({ ...settings, companyZip: e.target.value })} />
        </div>

        <div className="col-span-full">
          <label className="block text-sm mb-2">Logo (upload)</label>

          <div className="flex items-center gap-4">
        
            <div className="flex-shrink-0">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="logo preview"
                  className="w-44 h-20 object-contain border border-gray-200 p-1"
                />
              ) : (
                <div className="w-44 h-20 border-dashed border border-gray-200 flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">No logo</span>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  disabled={logoUploading}
                  className="block"
                />

                {settings.logoUrl && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSettings({ ...settings, logoUrl: "" });
                      if (fileRef.current) fileRef.current.value = "";
                      toast({ title: "Logo removed" });
                    }}
                  >
                    Delete logo
                  </Button>
                )}
              </div>

              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">
                  Recommended: PNG/JPG, max 6MB. Upload will update Logo URL.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-full">
          <label className="block text-sm mb-2">Signature (use URL)</label>
          <Input value={settings.signatureUrl || ""} onChange={(e) => setSettings({ ...settings, signatureUrl: e.target.value })} />
          <div className="mt-2 text-sm text-muted-foreground">If you need to host signature image, upload externally and paste URL here.</div>
        </div>

        <div>
          <label className="block text-sm">Invoice Prefix</label>
          <Input value={settings.invoicePrefix || ""} onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })} />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox checked={!!settings.showHSN} onCheckedChange={(v) => setSettings({ ...settings, showHSN: !!v })} />
          <span className="text-sm">Show HSN on invoices</span>
        </div>

        <div className="col-span-full">
          <Label className="block text-sm mb-1">Invoice Note (shows under totals)</Label>
          <Textarea rows={4} value={settings.invoiceNote || ""} onChange={(e) => setSettings({ ...settings, invoiceNote: e.target.value })} />
        </div>

        <div className="col-span-full">
          <Label className="block text-sm mb-1">Last Invoice Number (persistent)</Label>
          <Input
            type="number"
            value={typeof settings.lastInvoiceNumber === "number" ? settings.lastInvoiceNumber : (settings.lastInvoiceNumber || 0)}
            onChange={(e) => {
              const v = parseInt(e.target.value || "0", 10);
              setSettings({ ...settings, lastInvoiceNumber: isNaN(v) ? 0 : v });
            }}
          />
          <div className="mt-2 text-sm text-muted-foreground">
            This reflects the last assigned invoice number stored in database. It will update automatically when new orders are created.
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Button onClick={save} disabled={isSaving} >
          {isSaving ? "Saving..." : "Save Invoice Settings"}
        </Button>
      </div>
    </div>
  );
}

export default InvoiceControlPage;
