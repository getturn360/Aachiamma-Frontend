import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast"; 
import api from "@/api/axios";

const TEMPLATE_KEYS = {
  THANKS: "order_payment_success",
  SHIPPING: "order_status_inShipping",
  DELIVERED: "order_status_delivered",
};

const ALLOWED_PLACEHOLDERS = [
 
  "orderId",
  "status",
  "customerName",
  "firstName",
  "lastName",
  "phone",
  "whatsapp",
  "streetAddress",
  "apartment",
  "city",
  "state",
  "postcode",
  "pincode",
  "totalAmount",
  "subtotal",
  "shippingAmount",
  "discountAmount",
  "paymentMethod",
  "paymentStatus",
  "paymentId",
  "orderDate",
  "itemsList",
  "shortItems",
  "itemCount",
  "trackingNumber",
  "courier",
  "estimatedDelivery",
  "supportPhone",
  "storeName",
];

const SAMPLE = {
  orderId: "ORD12345",
  status: "Processing",
  customerName: "Ammu Kutty",
  firstName: "Ammu",
  lastName: "Kutty",
  phone: "9012345678",
  whatsapp: "9012345678",
  streetAddress: "12, Market Road",
  apartment: "Flat 2B",
  city: "Kochi",
  state: "Kerala",
  postcode: "682001",
  pincode: "682001",
  totalAmount: "999.00",
  subtotal: "949.00",
  shippingAmount: "50.00",
  discountAmount: "0.00",
  paymentMethod: "razorpay",
  paymentStatus: "Paid",
  paymentId: "pay_ABC123456",
  orderDate: "2025-10-24",
  itemsList: "1x Idly - ₹40\n2x Dosa - ₹80",
  shortItems: "Idly, Dosa +1 more",
  itemCount: "3",
  trackingNumber: "TRK123456",
  courier: "FastShip",
  estimatedDelivery: "Oct 28, 2025",
  supportPhone: "9012345678",
  storeName: "Aachiamma",
};

function applySample(body = "") {
  if (!body) return "";
  let out = String(body);
  for (const k of Object.keys(SAMPLE)) {
    const re = new RegExp(`{{\\s*${k}\\s*}}`, "gi");
    out = out.replace(re, SAMPLE[k]);
  }

  out = out.replace(/{{\s*[^}]+\s*}}/g, "");
  return out;
}

function extractPlaceholders(body = "") {
  if (!body) return [];
  const matches = Array.from((body || "").matchAll(/{{\s*([^}]+)\s*}}/g));
  const keys = Array.from(new Set(matches.map(m => m[1].trim())));
  return keys;
}

function validatePlaceholders(body = "") {
  const keys = extractPlaceholders(body);
  for (const k of keys) {
    if (!ALLOWED_PLACEHOLDERS.includes(k)) return { ok: false, invalid: k };
  }
  return { ok: true };
}

function MessageBlock({ label, typeKey, data, onChange, onSave, saving }) {
  const placeholders = extractPlaceholders(data.body);

  return (
    <div className="p-4 border rounded shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{label}</div>
          <div className="text-xs text-slate-600">{typeKey}</div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onSave(typeKey)} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <label className="text-xs text-slate-500">Title (optional)</label>
        <Input
          value={data.title}
          onChange={(e) => onChange(typeKey, { ...data, title: e.target.value })}
          className="mt-1"
        />
      </div>

      <div className="mt-3">
        <label className="text-xs text-slate-500">
          Body <span className="text-xs text-slate-400"> (use placeholders)</span>
        </label>
        <Textarea
          value={data.body}
          onChange={(e) => onChange(typeKey, { ...data, body: e.target.value })}
          className="mt-1 h-28"
        />
      </div>

      <div className="mt-2 text-xs text-slate-500">
        Allowed placeholders (only these will be expanded):
        {" "}
        <div className="mt-1 flex flex-wrap gap-1">
          {ALLOWED_PLACEHOLDERS.map(p => (
            <code key={p} className="mr-1 px-2 py-0.5 bg-slate-100 rounded text-xs">{'{{' + p + '}}'}</code>
          ))}
        </div>
      </div>

      {placeholders.length > 0 && (
        <div className="mt-3 text-xs">
          <div className="mb-1 font-medium">Used in body</div>

          <div className="flex flex-wrap gap-2 items-center">
            {placeholders.map(p => {
              const valid = ALLOWED_PLACEHOLDERS.includes(p);
              return (
                <div
                  key={p}
                  className={`inline-flex items-center text-xs px-2 py-1 rounded-md border ${valid ? "bg-green-50 text-green-800 border-green-100" : "bg-red-50 text-red-800 border-red-100"}`}
                >
                  <span className="font-medium mr-2">{p}</span>
                  {!valid && <span className="text-red-600">!</span>}
                </div>
              );
            })}
          </div>

          {placeholders.some(p => !ALLOWED_PLACEHOLDERS.includes(p)) && (
            <div className="text-red-600 text-xs mt-2">Contains invalid placeholders — fix before saving.</div>
          )}
        </div>
      )}

      <div className="mt-3">
        <div className="text-sm font-medium mb-1">Preview</div>
        <div className="p-3 bg-slate-50 border rounded text-sm whitespace-pre-wrap">
          {data.body ? applySample(data.body) : <span className="text-slate-400">No body set — preview will appear here.</span>}
        </div>
      </div>
    </div>
  );
}

function MessageTemplatesPage() {
  const [templates, setTemplates] = useState({
    [TEMPLATE_KEYS.THANKS]: { key: TEMPLATE_KEYS.THANKS, title: "", body: "" },
    [TEMPLATE_KEYS.SHIPPING]: { key: TEMPLATE_KEYS.SHIPPING, title: "", body: "" },
    [TEMPLATE_KEYS.DELIVERED]: { key: TEMPLATE_KEYS.DELIVERED, title: "", body: "" },
  });
  const [loading, setLoading] = useState(false);
  const [savingKeys, setSavingKeys] = useState({}); 

  useEffect(() => {
    fetchTemplates();
 
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    try {
  
      const res = await api.get("/api/admin/templates/templates");
      const j = res?.data;
      if (j && j.success && Array.isArray(j.data)) {
     
        const copy = { ...templates };
        for (const t of j.data) {
          if (!t || !t.key) continue;
          if (Object.values(TEMPLATE_KEYS).includes(t.key)) {
            copy[t.key] = {
              key: t.key,
              title: t.title || "",
              body: t.body || "",
            };
          }
        }
        setTemplates(copy);
      } else {

      }
    } catch (e) {
      console.error("fetch templates error", e);
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        toast({ title: "Unauthorized", description: "Please login", variant: "destructive" });
      } else {
        toast({ title: "Error fetching templates", description: e.message || String(e), variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  }

  function handleChange(key, next) {
    setTemplates((prev) => ({ ...prev, [key]: next }));
  }

  async function saveTemplate(key) {
    const tpl = templates[key];
    if (!tpl || !tpl.key) {
      toast({ title: "Invalid template", variant: "destructive" });
      return;
    }
    if (!tpl.body || String(tpl.body).trim() === "") {
      toast({ title: "Body required", description: "Please enter message body", variant: "destructive" });
      return;
    }

    const v = validatePlaceholders(tpl.body);
    if (!v.ok) {
      toast({ title: "Invalid placeholder", description: `Unknown placeholder: ${v.invalid}`, variant: "destructive" });
      return;
    }

    setSavingKeys((s) => ({ ...s, [key]: true }));
    try {
     
      const res = await api.post("/api/admin/templates/templates", { key: tpl.key, title: tpl.title || tpl.key, body: tpl.body });
      const j = res?.data;
      if (j && j.success) {
        toast({ title: "Saved" });
       
        setTemplates((prev) => ({ ...prev, [key]: { key: tpl.key, title: j.data.title || tpl.title, body: j.data.body || tpl.body } }));
      } else {
        toast({ title: "Save failed", description: j && j.message ? j.message : "Unknown", variant: "destructive" });
      }
    } catch (e) {
      console.error("save template error", e);
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        toast({ title: "Unauthorized", variant: "destructive" });
      } else {
        toast({ title: "Save error", description: e.message || String(e), variant: "destructive" });
      }
    } finally {
      setSavingKeys((s) => ({ ...s, [key]: false }));
    }
  }

  async function saveAll() {
    const keys = Object.values(TEMPLATE_KEYS);
    for (const k of keys) {
   
      const tpl = templates[k];
      if (!tpl || !tpl.body || String(tpl.body).trim() === "") continue;
    
      await saveTemplate(k);
    }
    toast({ title: "All done" });
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Message Templates — Quick 3</h1>
        <div className="flex gap-2">
          <Button onClick={fetchTemplates} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
          <Button onClick={saveAll}>Save All</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MessageBlock
          label="Thanks for Order"
          typeKey={TEMPLATE_KEYS.THANKS}
          data={templates[TEMPLATE_KEYS.THANKS]}
          onChange={handleChange}
          onSave={() => saveTemplate(TEMPLATE_KEYS.THANKS)}
          saving={!!savingKeys[TEMPLATE_KEYS.THANKS]}
        />

        <MessageBlock
          label="Shipping (inShipping)"
          typeKey={TEMPLATE_KEYS.SHIPPING}
          data={templates[TEMPLATE_KEYS.SHIPPING]}
          onChange={handleChange}
          onSave={() => saveTemplate(TEMPLATE_KEYS.SHIPPING)}
          saving={!!savingKeys[TEMPLATE_KEYS.SHIPPING]}
        />

        <MessageBlock
          label="Delivered"
          typeKey={TEMPLATE_KEYS.DELIVERED}
          data={templates[TEMPLATE_KEYS.DELIVERED]}
          onChange={handleChange}
          onSave={() => saveTemplate(TEMPLATE_KEYS.DELIVERED)}
          saving={!!savingKeys[TEMPLATE_KEYS.DELIVERED]}
        />
      </div>
    </div>
  );
}

export default MessageTemplatesPage;
