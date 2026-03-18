import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, LogIn, Settings } from "lucide-react";


function ToggleRow({ label, checked, onChange, hint }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div>
        <div className="font-medium">{label}</div>
        {hint ? <div className="text-xs text-muted-foreground mt-1">{hint}</div> : null}
      </div>
      <div>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="w-10 h-6 rounded-full appearance-none bg-gray-200 checked:bg-slate-700 relative transition-all"
          />
        </label>
      </div>
    </div>
  );
}

export default function AdminFeatures() {

  const [featureFlags, setFeatureFlags] = useState({
    privateMode: true,
    detailedAudit: true,
    roleBasedAccess: true,
    advancedAnalytics: false,
    featurePreview: false,
  });

  const [revealPrivate, setRevealPrivate] = useState(false);
  const [auditFilter, setAuditFilter] = useState("");
  const [exporting, setExporting] = useState(false);

  function setFlag(key, val) {
    setFeatureFlags((s) => ({ ...s, [key]: val }));

    console.log("FLAG UPDATE:", key, val);
  }

  async function handleExport(type = "csv") {
    setExporting(true);
    try {
   
      await new Promise((res) => setTimeout(res, 900));
      console.log("Exported", type);

    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
  
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">XL — Private & Ultra Features</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">
            Manage private details, feature flags, audit logs and advanced controls. Premium admin controls — ready to integrate.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="py-1 px-2">XL Mode</Badge>
          <Button onClick={() => setRevealPrivate((s) => !s)} className="inline-flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {revealPrivate ? "Hide Private" : "Reveal Private"}
          </Button>
        </div>
      </div>

 
      <div className="grid gap-6 md:grid-cols-3">
    
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Private Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="grid md:grid-cols-3 gap-2 items-center">
                <div className="text-sm font-medium">Admin Secret Key</div>
                <div className="col-span-2">
                  <Input
                    readOnly
                    value={revealPrivate ? "sk_live_************************" : "************************"}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-2 items-center">
                <div className="text-sm font-medium">Sentry / Error DSN</div>
                <div className="col-span-2">
                  <Input readOnly value={revealPrivate ? "https://sentry.example.com/abcd" : "hidden"} />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-2 items-center">
                <div className="text-sm font-medium">Webhook URL</div>
                <div className="col-span-2">
                  <Input readOnly value={revealPrivate ? "https://hooks.example.com/secret" : "hidden"} />
                </div>
              </div>

              <div className="pt-3">
                <div className="text-xs text-muted-foreground">Tip: store these values in env and never commit to git.</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button onClick={() => console.log("Rotate keys")} variant={undefined}>Rotate Keys</Button>
            <Button onClick={() => console.log("Open vault")} className="bg-slate-800 text-white">Open Vault</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Feature Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <ToggleRow
                label="Private Mode (restrict UI)"
                checked={featureFlags.privateMode}
                onChange={(v) => setFlag("privateMode", v)}
                hint="Enable to restrict specific admin screens to super-admin only."
              />
              <ToggleRow
                label="Detailed Audit Logging"
                checked={featureFlags.detailedAudit}
                onChange={(v) => setFlag("detailedAudit", v)}
                hint="Capture request/response snapshots for security investigations."
              />
              <ToggleRow
                label="Role Based Access"
                checked={featureFlags.roleBasedAccess}
                onChange={(v) => setFlag("roleBasedAccess", v)}
                hint="Enable granular permissions for admin users."
              />
              <ToggleRow
                label="Advanced Analytics"
                checked={featureFlags.advancedAnalytics}
                onChange={(v) => setFlag("advancedAnalytics", v)}
                hint="Extra charts and export options."
              />
              <ToggleRow
                label="Preview Feature Flags"
                checked={featureFlags.featurePreview}
                onChange={(v) => setFlag("featurePreview", v)}
                hint="Allow selected users to preview upcoming features."
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button onClick={() => console.log("Save flags")}>Save Flags</Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-3">
            <Input placeholder="Filter by user / action / id" value={auditFilter} onChange={(e) => setAuditFilter(e.target.value)} />
            <Button onClick={() => console.log("Apply filter:", auditFilter)}>Apply</Button>
            <Badge className="ml-auto">Showing 25 of 1,230</Badge>
          </div>

          <div className="overflow-auto max-h-72 border rounded-md">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 sticky top-0">
                <tr>
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Action</th>
                  <th className="text-left p-2">Resource</th>
                </tr>
              </thead>
              <tbody>
              
                <tr className="border-t">
                  <td className="p-2">2025-10-01 14:02</td>
                  <td className="p-2">admin@you.com</td>
                  <td className="p-2">Updated product</td>
                  <td className="p-2">/product/6432</td>
                </tr>
                <tr className="border-t bg-white/50">
                  <td className="p-2">2025-09-30 09:13</td>
                  <td className="p-2">ops@you.com</td>
                  <td className="p-2">Exported orders</td>
                  <td className="p-2">orders.csv</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">2025-09-28 20:55</td>
                  <td className="p-2">system</td>
                  <td className="p-2">Failed webhook</td>
                  <td className="p-2">/webhook/pay</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button onClick={() => handleExport("csv")} className="inline-flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
          <Button onClick={() => handleExport("json")} variant={undefined} className="inline-flex items-center gap-2">
            {exporting ? "Exporting..." : "Export JSON"}
          </Button>
        </CardFooter>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => console.log("Open role manager")}>Role & Permission Manager</Button>
        <Button onClick={() => console.log("Open sessions")}>Active Sessions</Button>
      </div>
    </div>
  );
}
