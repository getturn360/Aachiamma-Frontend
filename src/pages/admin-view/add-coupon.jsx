import React, { useState, useRef, useEffect, useMemo } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";

import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

const PRODUCTS_ENDPOINT_CANDIDATES = [
    "/api/admin/products/get",
    "/api/admin/products/list",
    "/api/admin/products",
    "/api/products/list",
    "/api/products",
    "/api/admin/product/list",
];

const isoToLocalDatetime = (iso) => {
    if (!iso) return "";
    try {
        const d = new Date(iso);
        const tzOffset = d.getTimezoneOffset() * 60000;
        const localISO = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
        return localISO;
    } catch {
        return "";
    }
};
const localDatetimeToISO = (val) => {
    if (!val) return null;
    try {
        const d = new Date(val);
        return d.toISOString();
    } catch {
        return null;
    }
};

export default function AddCoupon() {
    const navigate = useNavigate();
    const { id: routeId } = useParams(); 
    const isEditing = !!routeId;

    const nameRef = useRef(null);
    const codeRef = useRef(null);

    const [form, setForm] = useState({
        name: "",
        code: "",
        type: "fixed", 
        value: "",
        usageLimit: "",
        perUserLimit: 1,
        startsAt: "",
        endsAt: "",
        active: true,
   
        applicableFor: "all", 
        applicableProducts: [], 
    });
    const [saving, setSaving] = useState(false);
    const [createdCoupon, setCreatedCoupon] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const [allProducts, setAllProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [notification, setNotification] = useState({ open: false, type: "info", title: "", message: "" });

    useEffect(() => {
   
        loadProducts();

        if (!isEditing) return;

        const load = async () => {
            setErrorMessage(null);
            try {
                const res = await api.get(`/api/admin/coupons/${routeId}`);
                const ok = res?.data?.success || res?.status === 200;
                const data = res?.data?.data || res?.data;
                if (!ok || !data) {
                    const msg = res?.data?.message || "Failed to load coupon";
                    setErrorMessage(msg);
                    setNotification({ open: true, type: "error", title: "Load failed", message: msg });
                    return;
                }
              
                setForm((s) => ({
                    ...s,
                    name: data.name || "",
                    code: data.code || "",
                    type: data.type || "fixed",
                    value: data.value !== undefined && data.value !== null ? String(data.value) : "",
                    usageLimit: data.usageLimit === null || data.usageLimit === undefined ? "" : String(data.usageLimit),
                    perUserLimit: data.perUserLimit || 1,
                    startsAt: isoToLocalDatetime(data.startsAt),
                    endsAt: isoToLocalDatetime(data.endsAt),
                    active: !!data.active,
                    applicableFor: data.applicableFor || "all",
                    applicableProducts: Array.isArray(data.applicableProducts)
                        ? data.applicableProducts.map((p) => String(p._id ? p._id : p))
                        : [],
                }));
            } catch (err) {
                console.error("load coupon", err);
                const msg = err?.response?.data?.message || err.message || "Failed to load coupon";
                setErrorMessage(msg);
                setNotification({ open: true, type: "error", title: "Load failed", message: msg });
            }
        };
        load();
       
    }, [isEditing, routeId]);

    
    const loadProducts = async () => {
        setLoadingProducts(true);
        try {
            let products = [];
            let lastErr = null;
            for (const ep of PRODUCTS_ENDPOINT_CANDIDATES) {
                try {
                    const res = await api.get(ep);
               
                    products = (res.data && (res.data.data || res.data)) || [];
                    if (!Array.isArray(products) && typeof products === "object") {
                        if (Array.isArray(products.items)) products = products.items;
                        else products = [];
                    }
                    if (Array.isArray(products)) {
                 
                        const normalized = products.map((p) => ({ ...p, _id: String(p._id || p.id || p.productId) }));
                        setAllProducts(normalized);
                        lastErr = null;
                        break;
                    }
                } catch (e) {
                    lastErr = e;
                 
                }
            }

            if (lastErr && (!Array.isArray(products) || products.length === 0)) {
          
                try {
                    const res2 = await api.get("/api/admin/products/get");
                    const products2 = (res2.data && (res2.data.data || res2.data)) || [];
                    const normalized2 = Array.isArray(products2) ? products2.map((p) => ({ ...p, _id: String(p._id || p.id || p.productId) })) : [];
                    setAllProducts(normalized2);
                } catch (e2) {
                    console.error("loadProducts error (all attempts):", lastErr, e2);
                    setAllProducts([]);
                }
            }
        } catch (e) {
            console.error("loadProducts error:", e);
            setAllProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    };


    useEffect(() => {
        if (!notification.open) return;
        const t = setTimeout(() => setNotification((s) => ({ ...s, open: false })), 4000);
        return () => clearTimeout(t);
    }, [notification.open]);

    const onChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

    const resetForm = () => {
        setForm({
            name: "",
            code: "",
            type: "fixed",
            value: "",
            usageLimit: "",
            perUserLimit: 1,
            startsAt: "",
            endsAt: "",
            active: true,
            applicableFor: "all",
            applicableProducts: [],
        });
        setErrorMessage(null);
        setCreatedCoupon(null);
        try {
            if (nameRef.current) nameRef.current.focus();
        } catch (e) { }
    };

    const validate = () => {
        if (!form.name.trim()) return "Please enter coupon name.";
        if (!form.code.trim()) return "Please enter coupon code.";
        const v = Number(form.value);
        if (Number.isNaN(v) || v <= 0) return "Please enter a valid value (> 0).";
        if (form.type === "percent" && (v <= 0 || v > 100)) return "Percent must be 1–100.";
        if (form.perUserLimit && Number(form.perUserLimit) <= 0) return "Per-user limit must be >= 1.";
        if (form.usageLimit !== "" && Number(form.usageLimit) <= 0) return "Usage limit must be empty or > 0.";
        if (form.startsAt && form.endsAt && new Date(form.startsAt) > new Date(form.endsAt)) return "Start must be before end.";
        if (form.applicableFor === "custom" && (!Array.isArray(form.applicableProducts) || form.applicableProducts.length === 0)) {
            return "For custom applicability select at least one product (or choose All products).";
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(null);

        const vErr = validate();
        if (vErr) {
            setErrorMessage(vErr);
            setNotification({ open: true, type: "error", title: "Validation failed", message: vErr });
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                code: form.code.trim().toUpperCase(),
                type: form.type,
                value: Number(form.value),
                usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
                perUserLimit: Number(form.perUserLimit || 1),
                startsAt: localDatetimeToISO(form.startsAt),
                endsAt: localDatetimeToISO(form.endsAt),
                active: !!form.active,
                applicableFor: form.applicableFor || "all",
                applicableProducts: form.applicableFor === "custom" ? (form.applicableProducts || []) : [],
            };

            let res;
            if (isEditing) {
       
                res = await api.put(`/api/admin/coupons/${routeId}`, payload);
            } else {
                res = await api.post("/api/admin/coupons/create", payload);
            }

            const ok = res?.data?.success || res?.status === 200;
            const data = res?.data?.data || res?.data || payload;

            if (ok) {
                setCreatedCoupon(data);
                setNotification({
                    open: true,
                    type: "success",
                    title: isEditing ? "Coupon updated" : "Coupon created",
                    message: `${data.code || payload.code} ${isEditing ? "updated" : "created"} successfully.`,
                });
                if (!isEditing) resetForm();

                if (isEditing) {
                    setForm((s) => ({
                        ...s,
                        name: data.name || s.name,
                        code: data.code || s.code,
                        type: data.type || s.type,
                        value: data.value !== undefined && data.value !== null ? String(data.value) : s.value,
                        usageLimit: data.usageLimit === null || data.usageLimit === undefined ? "" : String(data.usageLimit),
                        perUserLimit: data.perUserLimit || s.perUserLimit,
                        startsAt: isoToLocalDatetime(data.startsAt) || s.startsAt,
                        endsAt: isoToLocalDatetime(data.endsAt) || s.endsAt,
                        active: !!data.active,
                        applicableFor: data.applicableFor || s.applicableFor || "all",
                        applicableProducts: Array.isArray(data.applicableProducts)
                            ? data.applicableProducts.map((p) => String(p._id ? p._id : p))
                            : s.applicableProducts,
                    }));
                }
            } else {
                const msg = res?.data?.message || "Failed to save coupon";
                setErrorMessage(msg);
                setNotification({ open: true, type: "error", title: "Save failed", message: msg });
            }
        } catch (err) {
            console.error(err);
            const msg = err?.response?.data?.message || err.message || "Failed to save coupon";
            setErrorMessage(msg);
            setNotification({ open: true, type: "error", title: "Save failed", message: msg });
        } finally {
            setSaving(false);
        }
    };

    const copyCode = async () => {
        const code = createdCoupon?.code;
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code);
            setNotification({ open: true, type: "success", title: "Copied", message: `${code} copied to clipboard` });
        } catch {
            setNotification({ open: true, type: "error", title: "Copy failed", message: `Could not copy ${code}` });
        }
    };

    const valuePreview = () =>
        form.value ? (form.type === "percent" ? `${Number(form.value)}% off` : `₹${Number(form.value).toFixed(2)}`) : "-";

    const grayHoverClass = "hover:bg-slate-200";

    const toggleProductSelection = (productId) => {
        const pid = String(productId);
        setForm((prev) => {
            const setIds = new Set((prev.applicableProducts || []).map(String));
            if (setIds.has(pid)) setIds.delete(pid);
            else setIds.add(pid);
            return { ...prev, applicableProducts: Array.from(setIds) };
        });
    };

    const selectedSet = useMemo(() => new Set((form.applicableProducts || []).map(String)), [form.applicableProducts]);

    return (
        <div className=" flex items-start justify-center py-10 px-4 mb-[50px]">
            <div className="w-full max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold">{isEditing ? "Edit Coupon" : "Create Coupon"}</h2>
                        <p className="text-sm text-slate-500">
                            {isEditing
                                ? "Edit and save changes to this coupon."
                                : "Create a new coupon — set name, code, value and limits."}
                        </p>
                    </div>

                    <div>
                        <Button onClick={() => navigate("/admin/coupons")} className={`bg-slate-100 text-slate-800 ${grayHoverClass}`}>
                            All Coupons
                        </Button>
                    </div>
                </div>

                {notification.open && (
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
                                <Button onClick={() => setNotification({ open: false, type: "info", title: "", message: "" })} className="bg-slate-100 text-slate-800 hover:bg-slate-200">Close</Button>
                            </div>
                        </div>
                    </div>
                )}

                {createdCoupon && (
                    <div className="mb-4 flex items-center justify-between gap-4 rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-md bg-emerald-100 flex items-center justify-center">
                                <svg className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-emerald-800">{isEditing ? "Coupon updated" : "Coupon created"}</div>
                                <div className="text-xs text-slate-600">Code: <span className="font-medium">{createdCoupon.code}</span></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={copyCode} className={`px-3 py-1 bg-slate-100 text-slate-800 ${grayHoverClass}`}>Copy</Button>
                            <Button onClick={() => navigate("/admin/coupons")} className={`bg-slate-100 text-slate-800 ${grayHoverClass}`}>Open</Button>
                        </div>
                    </div>
                )}

                {errorMessage && !notification.open && (
                    <div className="mb-4 rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-slate-600">Coupon name</label>
                            <input
                                ref={nameRef}
                                value={form.name}
                                onChange={(e) => onChange("name", e.target.value)}
                                className="mt-2 block w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-100 outline-none"
                                placeholder="Welcome discount"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-600">Code</label>
                            <input
                                ref={codeRef}
                                value={form.code}
                                onChange={(e) => onChange("code", e.target.value.toUpperCase())}
                                className="mt-2 block w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-100 outline-none"
                                placeholder="WELCOME50"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-600">Type</label>
                            <div className="mt-2">
                                <Select value={form.type} onValueChange={(v) => onChange("type", v)}>
                                    <SelectTrigger className="w-full rounded-lg border px-3 py-2">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">Fixed amount</SelectItem>
                                        <SelectItem value="percent">Percentage</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-600">Value</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.value}
                                onChange={(e) => onChange("value", e.target.value)}
                                className="mt-2 block w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-100 outline-none"
                                placeholder={form.type === "percent" ? "e.g. 10" : "e.g. 50"}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-600">Usage limit</label>
                            <input
                                type="number"
                                min="0"
                                value={form.usageLimit}
                                onChange={(e) => onChange("usageLimit", e.target.value)}
                                className="mt-2 block w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-100 outline-none"
                                placeholder="Empty = unlimited"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-600">Per-user limit</label>
                            <input
                                type="number"
                                min="1"
                                value={form.perUserLimit}
                                onChange={(e) => onChange("perUserLimit", e.target.value)}
                                className="mt-2 block w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-100 outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-600">Starts at</label>
                            <input
                                type="datetime-local"
                                value={form.startsAt}
                                onChange={(e) => onChange("startsAt", e.target.value)}
                                className="mt-2 block w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-100 outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-600">Ends at</label>
                            <input
                                type="datetime-local"
                                value={form.endsAt}
                                onChange={(e) => onChange("endsAt", e.target.value)}
                                className="mt-2 block w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-100 outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-3 mt-2">
                            <Checkbox
                                checked={!!form.active}
                                onCheckedChange={(v) => onChange("active", !!v)}
                                id="coupon-active"
                            />
                            <label htmlFor="coupon-active" className="text-sm text-slate-700">Active</label>
                        </div>

                        <div className="col-span-1 sm:col-span-2 mt-2">
                            <label className="text-xs font-medium text-slate-600">Applicable for</label>
                            <div className="mt-2 flex items-center gap-4">
                                <label className="inline-flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="appFor"
                                        checked={form.applicableFor === "all"}
                                        onChange={() => onChange("applicableFor", "all")}
                              
                                        className="accent-[#08665F]"
                                        style={{ accentColor: "#08665F" }}
                                    />
                                    <span>All products</span>
                                </label>

                                <label className="inline-flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="appFor"
                                        checked={form.applicableFor === "custom"}
                                        onChange={() => {
                                 
                                            setForm((prev) => {
                                                const allIds = (allProducts || []).map((p) => p._id || p.id || p.productId);
                                                return {
                                                    ...prev,
                                                    applicableFor: "custom",
                                                    applicableProducts: prev.applicableProducts && prev.applicableProducts.length ? prev.applicableProducts : allIds,
                                                };
                                            });
                                        }}
                                        className="accent-[#08665F]"
                                        style={{ accentColor: "#08665F" }}
                                    />
                                    <span>Custom (select products)</span>
                                </label>
                            </div>
                        </div>

                        {form.applicableFor === "custom" && (
                            <div className="col-span-1 sm:col-span-2 p-3 border rounded max-h-64 overflow-auto">
                                <div className="text-xs text-slate-600 mb-2">Select products this coupon applies to (new products will appear here automatically)</div>
                                {loadingProducts ? (
                                    <div>Loading products...</div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {(allProducts || []).map((p) => {
                                            const pid = String(p._id || p.id || p.productId);
                                            const checked = selectedSet.has(pid);
                                            return (
                                                <label key={pid} className="inline-flex items-center gap-2">
                                                    <Checkbox
                                                        id={`prod-${pid}`}
                                                        checked={checked}
                                                        onCheckedChange={() => toggleProductSelection(pid)}
                                                    />
                                                    <span className="text-sm">{p.name || p.title || `Product ${pid}`}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-2">
                            <div className="text-xs text-slate-500">Preview</div>
                            <div className="mt-2 p-3 rounded-md bg-slate-50 border">
                                <div className="text-sm font-semibold">{form.name || "Coupon name"}</div>
                                <div className="text-lg font-bold mt-1">{form.code || "CODEHERE"}</div>
                                <div className="text-sm text-slate-600 mt-1">{valuePreview()}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                        <Button type="submit" disabled={saving}>
                            {saving ? "Saving..." : isEditing ? "Save changes" : "Create coupon"}
                        </Button>

                        <Button type="button" className={`bg-slate-100 text-slate-800 ${grayHoverClass}`} onClick={resetForm}>
                            Reset
                        </Button>

                        <div className="ml-auto text-xs text-slate-400">
                            Tip: short codes convert to uppercase automatically.
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
