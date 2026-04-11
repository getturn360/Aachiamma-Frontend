import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import * as cfg from "@/config";
import { useToast } from "@/components/ui/use-toast";
import { ChevronDownIcon, SearchIcon } from "lucide-react";

const DEFAULT_ZONES = [
  { name: "south india", charge: 0 },
  { name: "north india", charge: 0 },
  { name: "special zones", charge: 0 },
];

function buildApiPath(pathWithoutApiPrefix) {
  const cleanPath = pathWithoutApiPrefix.startsWith("/")
    ? pathWithoutApiPrefix
    : "/" + pathWithoutApiPrefix;

  const base = axios.defaults.baseURL || "";

  try {
    if (base) {
      const b = base.endsWith("/") ? base.slice(0, -1) : base;
      if (b.includes("/api")) return `${b}${cleanPath}`;
      return `${b}/api${cleanPath}`;
    } else {
      return `/api${cleanPath}`;
    }
  } catch (e) {
    return `/api${cleanPath}`;
  }
}

export default function AdminShipping() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState(DEFAULT_ZONES);
  const [assignments, setAssignments] = useState({}); 
  const [allStates, setAllStates] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [thresholdInput, setThresholdInput] = useState("0");
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [unsavedThresholdChanged, setUnsavedThresholdChanged] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedStates, setSelectedStates] = useState(new Set());
  const [bulkZone, setBulkZone] = useState("");

  const [newZoneName, setNewZoneName] = useState("");

  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingOriginalName, setEditingOriginalName] = useState("");

  const [deleteIndex, setDeleteIndex] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  useEffect(() => {
    try {
      const stateControl = cfg.addressFormControls?.find((c) => c.name === "state");
      const statesArr =
        stateControl && stateControl.options ? stateControl.options.map((o) => (o && o.label) || o) : [];
      if (statesArr && statesArr.length > 0) setAllStates(statesArr);
      else fallbackStates();
    } catch (err) {
      fallbackStates();
    }

    fetchShipping();

  }, []);

  function fallbackStates() {
    setAllStates([
      "Kerala",
      "Tamil Nadu",
      "Karnataka",
      "Andhra Pradesh",
      "Telangana",
      "Puducherry",
      "Punjab",
      "Haryana",
      "Uttarakhand",
      "Delhi",
      "Uttar Pradesh",
      "Bihar",
      "Jharkhand",
      "Odisha",
      "West Bengal",
      "Rajasthan",
      "Gujarat",
      "Maharashtra",
      "Goa",
      "Madhya Pradesh",
      "Chhattisgarh",
      "Jammu and Kashmir",
      "Ladakh",
      "Himachal Pradesh",
      "Chandigarh",
      "Sikkim",
      "Andaman and Nicobar Islands",
      "Lakshadweep",
      "Dadra and Nagar Haveli",
      "Arunachal Pradesh",
      "Assam",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Tripura",
      "Daman and Diu",
    ]);
  }

  async function fetchShipping() {
    try {
      setLoading(true);
      setFetchError(null);
      const url = buildApiPath("/admin/shipping");
      const res = await axios.get(url);
      if (res.data && res.data.success && res.data.data) {
        const doc = res.data.data;
        if (Array.isArray(doc.zones) && doc.zones.length > 0) setZones(doc.zones);
        else setZones(DEFAULT_ZONES);

        if (doc.assignments) {
          try {
            const normalized = Object.fromEntries(Object.entries(doc.assignments));
            setAssignments(normalized);
          } catch (e) {
            setAssignments({});
          }
        } else {
          setAssignments({});
        }

        if (typeof doc.freeShippingThreshold !== "undefined" && doc.freeShippingThreshold !== null) {
          setFreeShippingThreshold(Number(doc.freeShippingThreshold || 0));
          setThresholdInput(String(doc.freeShippingThreshold || 0));
          setUnsavedThresholdChanged(false);
        } else {
          setFreeShippingThreshold(0);
          setThresholdInput("0");
          setUnsavedThresholdChanged(false);
        }
      } else {
        setZones(DEFAULT_ZONES);
        setAssignments({});
      }
    } catch (err) {
      console.error("fetchShipping error:", err);
      setFetchError(err && err.message ? err.message : String(err));
      setZones(DEFAULT_ZONES);
      setAssignments({});
    } finally {
      setLoading(false);
    }
  }

  function updateZoneCharge(index, value) {
    const copy = JSON.parse(JSON.stringify(zones));
    copy[index].charge = Number(value || 0);
    setZones(copy);
  }

  function setStateZone(stateName, zoneName) {
    setAssignments((prev) => {
      const next = { ...prev };
      if (!zoneName) {
        delete next[stateName];
      } else {
        next[stateName] = zoneName;
      }
      return next;
    });
  }

  function updateZoneName(index, newNameRaw) {
    const name = String(newNameRaw || "").trim();
    if (!name) {
      toast({ title: "Zone name cannot be empty", variant: "destructive" });
      return;
    }

    const exists = zones.some((z, i) => i !== index && z.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toast({ title: "Zone name must be unique", variant: "destructive" });
      return;
    }
    const oldName = zones[index].name;
    const copy = JSON.parse(JSON.stringify(zones));
    copy[index].name = name;
    setZones(copy);

    setAssignments((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((st) => {
        if (next[st] === oldName) next[st] = name;
      });
      return next;
    });
    toast({ title: `Renamed zone "${oldName}" → "${name}" (remember to Save Zones & Save Assignments)` });
  }

  function addZone() {
    const name = String(newZoneName || "").trim();
    if (!name) {
      toast({ title: "Enter zone name", variant: "destructive" });
      return;
    }
    if (zones.some((z) => z.name.toLowerCase() === name.toLowerCase())) {
      toast({ title: "Zone already exists", variant: "destructive" });
      return;
    }
    setZones((prev) => [...prev, { name, charge: 0 }]);
    setNewZoneName("");
    toast({ title: `Zone "${name}" added (remember to Save Zones)` });
  }

  function requestDeleteZone(index) {
    setDeleteIndex(index);
    setConfirmDeleteOpen(true);
  }

  function deleteZoneConfirmed() {
    const idx = deleteIndex;
    if (idx === null || typeof idx === "undefined") return;
    const target = zones[idx];
    if (!target) {
      setConfirmDeleteOpen(false);
      setDeleteIndex(null);
      return;
    }

    const copy = JSON.parse(JSON.stringify(zones));
    copy.splice(idx, 1);
    setZones(copy);

    setAssignments((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((st) => {
        if (next[st] === target.name) delete next[st];
      });
      return next;
    });

    setConfirmDeleteOpen(false);
    setDeleteIndex(null);
    toast({ title: `Deleted zone "${target.name}". Click Save Zones to persist.` });
  }

  async function saveZones() {
    try {
      const url = buildApiPath("/admin/shipping/zones");
      await axios.put(url, { zones });
      toast({ title: "Zones saved" });
      fetchShipping();
    } catch (err) {
      console.error("saveZones err", err);
      toast({ title: "Failed to save zones — see console", variant: "destructive" });
    }
  }

  async function saveAssignments() {
    try {
      const url = buildApiPath("/admin/shipping/assignments");
      await axios.put(url, { assignments });
      toast({ title: "Assignments saved" });
      fetchShipping();
      setSelectedStates(new Set());
      setBulkZone("");
    } catch (err) {
      console.error("saveAssignments err", err);
      toast({ title: "Failed to save assignments — see console", variant: "destructive" });
    }
  }

  // save threshold
  async function saveThreshold() {
    try {
      setSavingThreshold(true);
      const amount = Number(thresholdInput) || 0;
      const url = buildApiPath("/admin/shipping/threshold");
      const res = await axios.put(url, { amount });
      if (res.data && res.data.success) {
        setFreeShippingThreshold(Number(res.data.data.freeShippingThreshold || 0));
        setThresholdInput(String(res.data.data.freeShippingThreshold || 0));
        setUnsavedThresholdChanged(false);
        toast({ title: "Free shipping threshold saved" });
      } else {
        toast({ title: "Failed to save threshold", variant: "destructive" });
      }
    } catch (err) {
      console.error("saveThreshold err", err);
      toast({ title: "Failed to save threshold — check console", variant: "destructive" });
    } finally {
      setSavingThreshold(false);
    }
  }

  async function notifyAdmin(amount) {
    try {
      const payload = { subject: "Free shipping threshold changed", message: `Threshold changed to ₹${Number(amount || 0).toFixed(2)}` };
      await axios.post(buildApiPath("/admin/notify"), payload);
      toast({ title: "Notification sent to team" });
    } catch (err) {
      console.error("notifyAdmin err", err);
      toast({ title: "Failed to send notification", variant: "destructive" });
    }
  }

  const filteredStates = useMemo(() => {
    if (!search) return allStates;
    return allStates.filter((s) => s.toLowerCase().includes(search.trim().toLowerCase()));
  }, [allStates, search]);

  function toggleSelectState(stateName) {
    setSelectedStates((prev) => {
      const copy = new Set(prev);
      if (copy.has(stateName)) copy.delete(stateName);
      else copy.add(stateName);
      return copy;
    });
  }

  function selectAllVisible() {
    setSelectedStates(new Set(filteredStates));
  }

  function deselectAllVisible() {
    setSelectedStates(new Set());
  }

  function isAllSelectedVisible() {
    if (!filteredStates.length) return false;
    return filteredStates.every((s) => selectedStates.has(s));
  }

  function applyBulkAssign() {
    if (!bulkZone) {
      toast({ title: "Select a zone to assign", variant: "destructive" });
      return;
    }
    if (selectedStates.size === 0) {
      toast({ title: "Select states (checkboxes) to assign the chosen zone", variant: "destructive" });
      return;
    }
    const copy = { ...assignments };
    selectedStates.forEach((st) => {
      copy[st] = bulkZone;
    });
    setAssignments(copy);
    toast({ title: `Assigned ${selectedStates.size} state(s) to ${bulkZone}` });
  }

  function clearAllAssignments() {
    setConfirmClearOpen(true);
  }

  function confirmClearAssignments() {
    setAssignments({});
    setConfirmClearOpen(false);
    toast({ title: "All assignments cleared" });
  }

  function onThresholdInputChange(val) {
    setThresholdInput(val);
    if (!unsavedThresholdChanged) {
      setUnsavedThresholdChanged(true);
      const pretty = Number(val || 0).toFixed(2);
      toast({ title: `Threshold changed — ₹${pretty}. Click 'Save threshold' to persist.` });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Shipping zones & assignments</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {fetchError ? (
          <div className="p-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
            Warning: Could not load shipping from server. Using default values. Check console & server logs.
          </div>
        ) : null}

        <div className="p-4 border rounded-md space-y-4">
 
          <div className="pb-4 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-lg font-medium">Free shipping threshold</h3>
                <p className="text-sm text-muted-foreground mt-1">Set cart value above which shipping is free.</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={thresholdInput}
                  onChange={(e) => onThresholdInputChange(e.target.value)}
                  className="border rounded px-2 py-1 w-40"
                  aria-label="Free shipping threshold"
                />

                <Button onClick={saveThreshold} disabled={savingThreshold}>
                  Save threshold
                </Button>

              </div>
            </div>

            <div className="text-sm text-muted-foreground mt-3">
              Current free shipping threshold: <strong>₹{Number(freeShippingThreshold || 0).toFixed(2)}</strong>
              {unsavedThresholdChanged ? (
                <span className="ml-3 text-amber-600">(unsaved changes)</span>
              ) : null}
            </div>
          </div>

          <div className="py-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Zones (edit charges & names)</h3>
              <div className="flex items-center gap-2">
                <Button onClick={saveZones} className="whitespace-nowrap">
                  Save Zones
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <input
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="New zone name"
                  className="border p-1 rounded w-48"
                />
                <Button onClick={addZone} className="whitespace-nowrap">Add zone</Button>
              </div>

              {zones.map((z, idx) => (
                <div
                  key={z.name + idx}
                  className="flex items-center gap-4 justify-between bg-white/2 p-2 rounded"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={editingIndex === idx ? editingName : z.name}
                      onChange={(e) => {
                        if (editingIndex === idx) setEditingName(e.target.value);
                        else {
                 
                        }
                      }}
                      disabled={editingIndex !== idx}
                      className={`w-44 font-medium capitalize border p-1 rounded ${editingIndex === idx ? "bg-white" : "bg-transparent"}`}
                      aria-label={`Zone name ${z.name}`}
                    />
                    <div className="text-sm text-muted-foreground">Charge (₹)</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={z.charge}
                      onChange={(e) => updateZoneCharge(idx, e.target.value)}
                      className="border p-1 rounded w-36"
                      aria-label={`Charge for ${z.name}`}
                    />

                    {editingIndex === idx ? (
                      <>
                        <Button onClick={() => {
                          updateZoneName(idx, editingName);
                          setEditingIndex(null);
                          setEditingName("");
                          setEditingOriginalName("");
                        }}>Save</Button>
                        <Button
                          onClick={() => {
               
                            setZones((prev) => {
                              const copy = JSON.parse(JSON.stringify(prev));
                              copy[idx].name = editingOriginalName || copy[idx].name;
                              return copy;
                            });
                            setEditingIndex(null);
                            setEditingName("");
                            setEditingOriginalName("");
                          }}
                          className="bg-white border text-slate-700 hover:bg-gray-000  focus:ring-emerald-300"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => {
                          setEditingIndex(idx);
                          setEditingName(z.name);
                          setEditingOriginalName(z.name);
                        }}>Edit</Button>

                        <Button onClick={() => requestDeleteZone(idx)} className="bg-rose-600 text-white hover:bg-rose-700">
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
           
                <div className="hidden md:flex items-center bg-white border rounded-md px-3 py-1 shadow-sm">
                  <SearchIcon aria-hidden="true" className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search states..."
                    className="outline-none w-64 text-sm"
                  />
                  <button
                    onClick={() => setSearch("")}
                    className="ml-2 text-sm text-slate-500 hover:text-slate-700"
                    title="Clear"
                  >
                    Clear
                  </button>
                </div>

                <div className="md:hidden w-full relative">
                  <SearchIcon aria-hidden="true" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search states..."
                    className="w-full border rounded-md px-10 py-2"
                  />
                </div>

                <div className="flex items-center ml-2">
                  <Checkbox
                    checked={isAllSelectedVisible()}
                    onCheckedChange={() => (isAllSelectedVisible() ? deselectAllVisible() : selectAllVisible())}
                    aria-label="Select all visible states"
                  />
                  <span className="ml-2 text-sm select-none">Select all visible</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
         
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-3 py-2 border rounded-md focus:outline-none inline-flex items-center gap-2" aria-label="Assign selected">
                      <span>{bulkZone ? `${bulkZone}` : "Assign selected to..."}</span>
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setBulkZone("")}>Clear selection</DropdownMenuItem>
                    {zones.map((z) => (
                      <DropdownMenuItem key={z.name} onSelect={() => setBulkZone(z.name)}>
                        <div className="flex justify-between w-full">
                          <span className="capitalize">{z.name}</span>
                          <span className="text-sm text-muted-foreground">₹{z.charge ?? 0}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button onClick={applyBulkAssign}>Apply to selected</Button>
                <Button onClick={saveAssignments}>Save Assignments</Button>
                <Button onClick={clearAllAssignments} variant="destructive">Clear all</Button>
              </div>
            </div>

            <div className="space-y-2">
              {filteredStates.length === 0 ? (
                <div className="text-sm text-muted-foreground">No states found.</div>
              ) : (
                filteredStates.map((st) => {
                  const current = assignments[st] || "";
                  return (
                    <div
                      key={st}
                      className="flex items-center gap-3 p-2 bg-white/2 rounded justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedStates.has(st)}
                          onCheckedChange={() => toggleSelectState(st)}
                          aria-label={`Select ${st}`}
                        />
                        <div className="w-72">{st}</div>
                      </div>

                      <div className="flex items-center gap-3">
                  
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="px-3 py-2 border rounded-md focus:outline-none inline-flex items-center gap-2" aria-label={`Zone for ${st}`}>
                              <span>{current ? `${current} (₹${zones.find((z) => z.name === current)?.charge ?? 0})` : "-- select zone --"}</span>
                              <ChevronDownIcon className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => setStateZone(st, null)}>-- none --</DropdownMenuItem>
                            {zones.map((z) => (
                              <DropdownMenuItem key={z.name} onSelect={() => setStateZone(st, z.name)}>
                                <div className="flex justify-between w-full">
                                  <span className="capitalize">{z.name}</span>
                                  <span className="text-sm text-muted-foreground">₹{z.charge ?? 0}</span>
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="text-sm text-muted-foreground">
                          {current ? `Assigned: ${current}` : "Not assigned"}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-end gap-2 mt-3">
              <div className="text-sm text-muted-foreground mr-auto">Tip: use search & bulk assign for faster edits</div>
              <Button onClick={saveAssignments}>Save Assignments</Button>
            </div>
          </div>
        </div>

        <ConfirmDialog
          open={confirmClearOpen}
          title="Clear all state assignments"
          description={`This will remove all state → zone assignments. Are you sure?`}
          onConfirm={confirmClearAssignments}
          onCancel={() => setConfirmClearOpen(false)}
        />

        <ConfirmDialog
          open={confirmDeleteOpen}
          title={deleteIndex !== null ? `Delete zone "${zones[deleteIndex]?.name || ''}"` : "Delete zone"}
          description={`Deleting this zone will remove any state assignments that reference it. This action can be undone by re-adding the zone and reassigning states.`}
          onConfirm={deleteZoneConfirmed}
          onCancel={() => { setConfirmDeleteOpen(false); setDeleteIndex(null); }}
        />
      </CardContent>
    </Card>
  );
}

function ConfirmDialog({ open, title, description, onConfirm, onCancel, loading = false }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const prevHtmlOverflowX = html.style.overflowX;
    const prevBodyOverflowX = document.body.style.overflowX;

    html.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";

    setTimeout(() => {
      cancelRef.current?.focus();
    }, 0);

    return () => {
      html.style.overflowX = prevHtmlOverflowX;
      document.body.style.overflowX = prevBodyOverflowX;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape" && !loading) {
        onCancel && onCancel();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !loading && onCancel && onCancel()}
      />

      <div className="relative z-10 max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden border overflow-auto">
        <div className="flex items-start gap-4 p-6 border-b">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
            <svg
              className="w-6 h-6 text-rose-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              ></path>
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-lg font-semibold truncate">
              {title}
            </h3>
            {description ? (
              <p id="confirm-dialog-description" className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            ) : null}

            <div className="mt-6 flex items-center gap-3 justify-end">
              <button
                ref={cancelRef}
                onClick={() => !loading && onCancel && onCancel()}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-white border hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => !loading && onConfirm && onConfirm()}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-rose-600 text-white shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-300"
              >
                {loading ? "Working..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
