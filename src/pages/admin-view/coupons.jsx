import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SearchIcon } from "lucide-react";

const API_ADMIN = (() => {
  try {

    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) {
      const b = String(import.meta.env.VITE_API_BASE).replace(/\/$/, "");
      return b + "/api/admin/coupons";
    }
  } catch (e) {}

  try {
 
    if (typeof window !== "undefined" && window.REACT_APP_API_BASE_URL) {
      return String(window.REACT_APP_API_BASE_URL).replace(/\/$/, "") + "/api/admin/coupons";
    }
  } catch (e) {}

  try {

    if (typeof window !== "undefined") {
      const loc = window.location || {};
      const hostname = loc.hostname || "";
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "https://aachiamma-backend.fly.dev/api/admin/coupons";
      }
    }
  } catch (e) {}

  return "/api/admin/coupons";
})();

const PRIMARY_COLOR = "#08665F";
const PRIMARY_HOVER = "#064e4a";

function PrimaryButton({ children, className = "", style = {}, ...props }) {
  const baseStyle = {
    backgroundColor: PRIMARY_COLOR,
    color: "#fff",
    borderColor: "transparent",
  };
  return (
    <Button
      {...props}
      className={className}
      style={{
        ...baseStyle,
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = PRIMARY_HOVER;
        if (props.onMouseEnter) props.onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = PRIMARY_COLOR;
        if (props.onMouseLeave) props.onMouseLeave(e);
      }}
    >
      {children}
    </Button>
  );
}

const safe = (v, fallback = "") => (v === undefined || v === null ? fallback : v);
const formatValue = (c) => {
  if (!c) return "-";
  return c.type === "percent" ? `${Number(c.value)}%` : `₹${Number(c.value).toFixed(2)}`;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [q, setQ] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [notification, setNotification] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const navigate = useNavigate();

  const fetchCoupons = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await axios.get(`${API_ADMIN}/list`);
      if (res.data && res.data.success) {
        const arr = Array.isArray(res.data.data) ? res.data.data : [];
        setCoupons(arr);
      } else {
        setErrorMsg(res.data?.message || "Failed to load coupons");
        setCoupons([]);
      }
    } catch (e) {
      console.error("fetchCoupons error", e);
      setErrorMsg(e.response?.data?.message || e.message || "Network error fetching coupons");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();

  }, [refreshFlag]);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(t);
  }, [notification]);

  const askDelete = (id) => {
    setPendingDeleteId(id);
  };

  const handleDeleteConfirmed = async () => {
    const id = pendingDeleteId;
    if (!id) {
      setPendingDeleteId(null);
      return;
    }
    setPendingDeleteId(null);

    try {
      const res = await axios.delete(`${API_ADMIN}/${id}`);
      const ok = res?.data?.success || res?.status === 200;
      if (ok) {
        setCoupons((s) => s.filter((c) => (c._id || c.id) !== id));
        setNotification({ type: "success", title: "Coupon deleted", message: "Coupon successfully removed." });
      } else {
        const msg = res?.data?.message || "Delete failed";
        setNotification({ type: "error", title: "Delete failed", message: msg });
      }
    } catch (e) {
      console.error("delete coupon", e);
      const msg = e?.response?.data?.message || e.message || "Network error during delete";
      setNotification({ type: "error", title: "Delete failed", message: msg });
    }
  };

  const handleDeleteCancel = () => setPendingDeleteId(null);

  const filtered = useMemo(() => {
    if (!q) return coupons;
    const qq = q.trim().toLowerCase();
    return coupons.filter((c) => {
      return (
        String(safe(c.name)).toLowerCase().includes(qq) ||
        String(safe(c.code)).toLowerCase().includes(qq) ||
        String(safe(c.type)).toLowerCase().includes(qq)
      );
    });
  }, [coupons, q]);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Coupons</h2>
          <p className="text-sm text-slate-500 mt-1">Manage coupons — create or remove promotional codes.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-white border rounded-md px-3 py-1 shadow-sm">
            <SearchIcon aria-hidden="true" className="w-4 h-4 text-slate-400 mr-2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name / code / type"
              className="outline-none w-64 text-sm"
            />
            <button
              onClick={() => setQ("")}
              className="ml-2 text-sm text-slate-500 hover:text-slate-700"
              title="Clear"
            >
              Clear
            </button>
          </div>

          <div className="sm:hidden mb-4 w-64">
            <div className="relative">
              <SearchIcon aria-hidden="true" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search coupons..."
                className="w-full border rounded-md px-10 py-2"
              />
            </div>
          </div>

          <PrimaryButton onClick={() => navigate("/admin/coupons/add")}>Add Coupon</PrimaryButton>

          <Button onClick={() => setRefreshFlag((s) => s + 1)} className="bg-slate-100 text-slate-800 hover:bg-slate-200">
            Refresh
          </Button>
        </div>
      </div>

      {notification && (
        <div className="mb-4" aria-live="polite">
          <div className="rounded-lg overflow-hidden shadow-sm border bg-white p-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-md ${notification.type === "success" ? "bg-emerald-50" : "bg-rose-50"} flex items-center justify-center`}>
                {notification.type === "success" ? (
                  <svg className="h-5 w-5 text-emerald-700" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-rose-600" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 17h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div>
                <div className={`text-sm font-semibold ${notification.type === "error" ? "text-rose-700" : ""}`}>{notification.title}</div>
                <div className="text-xs text-slate-600 mt-1">{notification.message}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => setNotification(null)} className="bg-slate-100 text-slate-800 hover:bg-slate-200">Close</Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded shadow">
        {errorMsg && (
          <div className="mb-4 p-3 rounded bg-rose-50 border border-rose-100 text-rose-700">
            <div className="font-medium">Error</div>
            <div className="text-sm mt-1">{errorMsg}</div>
            <div className="text-xs mt-2 text-slate-500">If you see CORS or network errors, set API base or use dev proxy.</div>
          </div>
        )}

        {loading ? (
          <div className="py-10 text-center text-slate-500">Loading coupons…</div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-slate-500 mb-3">No coupons found.</div>
            <div className="flex justify-center">
              <PrimaryButton onClick={() => navigate("/admin/coupons/add")}>Create coupon</PrimaryButton>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-auto">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-2">Name</th>
                  <th className="text-center">Code</th>
                  <th className="text-center">Type</th>
                  <th className="text-center">Value</th>
                  <th className="text-center">Used / Limit</th>
                  <th className="text-center">Valid</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const id = c._id || c.id;
                  const used = safe(c.usedCount, safe(c.used, 0)) || 0;
                  const usageLimit = c.usageLimit === null || c.usageLimit === undefined ? "∞" : c.usageLimit;
                  const starts = c.startsAt ? new Date(c.startsAt) : null;
                  const ends = c.endsAt ? new Date(c.endsAt) : null;

                  return (
                    <tr key={id || Math.random()} className="border-t">
                      <td className="py-3 align-middle">
                        <div className="font-medium">{safe(c.name, "-")}</div>
                        {c.description ? <div className="text-xs text-slate-500 mt-0.5">{c.description}</div> : null}
                      </td>

                      <td className="text-center align-middle font-mono">{safe(c.code, "-")}</td>

                      <td className="text-center align-middle">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            c.type === "percent" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {safe(c.type, "-")}
                        </span>
                      </td>

                      <td className="text-center align-middle">{formatValue(c)}</td>

                      <td className="text-center align-middle">
                        <div className="text-xs text-slate-600">{`${used} / ${usageLimit}`}</div>
                      </td>

                      <td className="text-center align-middle">
                        <div className="text-xs text-slate-600">
                          {starts ? starts.toLocaleDateString() : "—"} - {ends ? ends.toLocaleDateString() : "∞"}
                        </div>
                      </td>

                      <td className="text-center align-middle">
                        <div className="inline-flex items-center gap-2">
                          {/* EDIT */}
                          <button
                            onClick={() => navigate(`/admin/coupons/add/${id}`)}
                            title="Edit coupon"
                            className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100"
                            aria-label="Edit coupon"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4h6" />
                              <path d="M4 20l7-7" />
                              <path d="M14 7l3 3" />
                            </svg>
                          </button>

                          {/* DELETE */}
                          <button
                            onClick={() => askDelete(id)}
                            title="Delete coupon"
                            className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100"
                            aria-label="Delete coupon"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-rose-50 flex items-center justify-center">
                    <svg className="h-6 w-6 text-rose-600" viewBox="0 0 24 24" fill="none">
                      <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold">Delete coupon?</h3>
                  <p className="text-sm text-slate-600 mt-2">Are you sure you want to delete this coupon? This action cannot be undone.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 flex items-center justify-end gap-3">
              <Button onClick={handleDeleteCancel} className="bg-white text-slate-800 hover:bg-slate-100">Cancel</Button>
              <Button
                onClick={handleDeleteConfirmed}
                className="bg-rose-600 text-white hover:bg-rose-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
