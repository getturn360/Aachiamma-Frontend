// client/src/components/admin-view/ProductFormTabs.jsx
import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import VariantEditor from "./variant-editor";
import api from "@/api/axios";

/**
 * ProductFormTabs
 * - Uses VariantEditor for variations (per-variant stock)
 *
 * Props:
 * - initialData: {} (product when editing)
 * - onSaved: function(product)
 */
function ProductFormTabs({ initialData = {}, onSaved = () => {} }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [form, setForm] = useState({
    title: "",
    descriptionTitle: "",
    descriptionSections: [],
    description: "",
    howTo: "",
    category: "",
    brand: "",
    images: [],
    image: "",
    special: [],
    variations: [],
    specList: [],
    faqList: [],
    ingredients: "",
    hsn: "", // <-- new optional HSN field
  });
  const [saving, setSaving] = useState(false);

  // dynamic categories from server (array of { id, label })
  const [categoryOptions, setCategoryOptions] = useState([
    { id: "pickles", label: "Pickles" },
    { id: "snacks", label: "Snacks" },
    { id: "powders", label: "Powders" },
    { id: "spices", label: "Spices" },
    { id: "kondattam", label: "Kondattam" },
    { id: "combos", label: "Combos" },
    { id: "others", label: "Others" },
  ]);
  const [catsLoaded, setCatsLoaded] = useState(false);

  useEffect(() => {
    setForm({
      title: initialData.title || "",
      descriptionTitle: initialData.descriptionTitle || "",
      descriptionSections: Array.isArray(initialData.descriptionSections) ? initialData.descriptionSections : [],
      description: initialData.description || "",
      howTo: initialData.howTo || "",
      category: initialData.category || "",
      brand: initialData.brand || "",
      images: Array.isArray(initialData.images) ? initialData.images : [],
      image: initialData.image || "",
      special: Array.isArray(initialData.special) ? initialData.special : [],
      // keep whatever variations come from server (may contain _id)
      variations: Array.isArray(initialData.variations) ? initialData.variations : [],
      specList: Array.isArray(initialData.specList) ? initialData.specList : [],
      faqList: Array.isArray(initialData.faqList) ? initialData.faqList : [],
      ingredients: initialData.ingredients || "",
      hsn: initialData.hsn || "", // <-- initialize from initialData if present
    });
  }, [initialData]);

  // fetch categories from server on mount (non-blocking)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/api/common/categories/get");
        if (!mounted) return;
        if (res?.data?.success) {
          const raw = res.data.categories || res.data.data || [];
          const mapped = raw.map((c) => {
            // prefer slug, then _id, then name
            const id = c.slug || c._id || c.name;
            const label = c.name || c.slug || String(id);
            return { id, label };
          });
          if (mapped.length) {
            setCategoryOptions(mapped);
            setCatsLoaded(true);
            return;
          }
        }
      } catch (err) {
        // ignore: fallback already set
      } finally {
        setCatsLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  function setField(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function addDescSection() {
    setField("descriptionSections", [...(form.descriptionSections || []), { title: "", content: "" }]);
  }

  function addSpec() {
    setField("specList", [...(form.specList || []), { label: "", content: "" }]);
  }
  function addFaq() {
    setField("faqList", [...(form.faqList || []), { question: "", answer: "" }]);
  }

  // Validation: ensure variations present and each has label & price & totalStock >= 0
  function validateForm() {
    if (!form.title || !form.title.trim()) {
      alert("Title is required");
      return false;
    }
    if (!Array.isArray(form.variations) || form.variations.length === 0) {
      alert("At least one variation is required (per-variant stock required).");
      return false;
    }
    // normalize and check
    for (let i = 0; i < form.variations.length; i++) {
      const v = form.variations[i];
      if (!v || !v.label || String(v.label).trim() === "") {
        alert(`Variation #${i + 1} must have a label`);
        return false;
      }
      if (Number(v.price) <= 0) {
        alert(`Variation "${v.label || i + 1}" must have price > 0`);
        return false;
      }
      // allow zero stock but not null/undefined
      if (v.totalStock == null || isNaN(Number(v.totalStock))) {
        alert(`Variation "${v.label || i + 1}" has invalid stock`);
        return false;
      }
    }
    // ensure one default
    if (!form.variations.some((x) => x.isDefault)) {
      // set first as default (mutate local form copy)
      const vs = form.variations.map((x, idx) => ({ ...x, isDefault: idx === 0 }));
      setField("variations", vs);
    }
    return true;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      // prepare payload
      const mappedVariations = (form.variations || []).map((v) => ({
        // use server-friendly _id property if present
        ...(v._id ? { _id: v._id } : (v.id ? { _id: v.id } : {})),
        label: String(v.label || "").trim(),
        sku: v.sku || "",
        weight: v.weight || "",
        price: Number(v.price || 0),
        salePrice: Number(v.salePrice || 0),
        totalStock: Number(v.totalStock || 0),
        isDefault: !!v.isDefault,
        descriptionItems: Array.isArray(v.descriptionItems) ? v.descriptionItems : [],
      }));

      const payload = {
        ...initialData,
        title: form.title.trim(),
        descriptionTitle: form.descriptionTitle,
        descriptionSections: form.descriptionSections,
        description: form.description,
        howTo: form.howTo,
        category: form.category,
        brand: form.brand,
        images: form.images,
        image: form.image,
        special: form.special,
        variations: mappedVariations,
        specList: form.specList,
        faqList: form.faqList,
        ingredients: form.ingredients,
        hsn: form.hsn || "", // <-- include hsn in payload
      };

      // send to server via project's api instance
      const isUpdate = !!initialData?._id;
      const resp = isUpdate
        ? await api.put(`/api/admin/products/${initialData._id}`, payload)
        : await api.post(`/api/admin/products`, payload);

      const data = resp?.data ?? resp;
      if (data?.success || resp.status === 200 || resp.status === 201) {
        onSaved(data?.data ?? data);
        alert("Saved successfully");
      } else {
        console.error("Save failed", data);
        alert(data?.message || "Failed to save product");
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || "Error saving product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-4 space-y-4 max-w-5xl mx-auto">
      <div className="flex gap-2 overflow-auto">
        <button type="button" onClick={() => setActiveTab("basic")} className={`px-3 py-2 rounded ${activeTab === "basic" ? "bg-amber-100" : "bg-white/50"}`}>Basic</button>
        <button type="button" onClick={() => setActiveTab("media")} className={`px-3 py-2 rounded ${activeTab === "media" ? "bg-amber-100" : "bg-white/50"}`}>Media & Stock</button>
        <button type="button" onClick={() => setActiveTab("description")} className={`px-3 py-2 rounded ${activeTab === "description" ? "bg-amber-100" : "bg-white/50"}`}>Description</button>
        <button type="button" onClick={() => setActiveTab("variations")} className={`px-3 py-2 rounded ${activeTab === "variations" ? "bg-amber-100" : "bg-white/50"}`}>Variations</button>
        <button type="button" onClick={() => setActiveTab("specs")} className={`px-3 py-2 rounded ${activeTab === "specs" ? "bg-amber-100" : "bg-white/50"}`}>Specs & FAQ</button>
      </div>

      {activeTab === "basic" && (
        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setField("title", e.target.value)} />
          </div>

          <div>
            <Label>Category</Label>
            <Select onValueChange={(v) => setField("category", v)} value={form.category}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {!catsLoaded && <SelectItem value="__loading">Loading...</SelectItem>}
                <SelectItem value="">None</SelectItem>
                {categoryOptions.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-slate-500 mt-1">If your category is not listed, add it from Admin → Categories first.</div>
          </div>

          <div>
            <Label>Brand</Label>
            <Input value={form.brand} onChange={(e) => setField("brand", e.target.value)} />
          </div>

          <div>
            <Label>HSN Code (optional)</Label>
            <Input value={form.hsn || ""} onChange={(e) => setField("hsn", e.target.value)} placeholder="e.g. 22030090" />
            <div className="text-sm text-slate-500 mt-1">Optional: shown on invoice if provided and invoice settings allow.</div>
          </div>
        </div>
      )}

      {activeTab === "media" && (
        <div className="space-y-3">
          <div>
            <Label>Primary Image URL</Label>
            <Input value={form.image} onChange={(e) => setField("image", e.target.value)} placeholder="paste uploaded image URL or cloud link" />
            <div className="text-sm text-slate-500 mt-1">Image uploading page can remain separate; here accept URLs — mobile friendly.</div>
          </div>

          <div>
            <Label>Other images (comma separated URLs)</Label>
            <Input value={(form.images || []).join(",")} onChange={(e) => setField("images", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
          </div>

          <div>
            <Label>Special tags (comma separated)</Label>
            <Input value={(form.special || []).join(", ")} onChange={(e) => setField("special", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
          </div>
        </div>
      )}

      {activeTab === "description" && (
        <div className="space-y-3">
          <div>
            <Label>Description Title (optional)</Label>
            <Input value={form.descriptionTitle} onChange={(e) => setField("descriptionTitle", e.target.value)} />
          </div>

          <div>
            <Label>Legacy description (single block)</Label>
            <Textarea rows={4} value={form.description} onChange={(e) => setField("description", e.target.value)} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Description sections (multiple paragraphs)</Label>
              <Button type="button" onClick={addDescSection}>Add paragraph</Button>
            </div>

            <div className="space-y-3">
              {(form.descriptionSections || []).map((s, idx) => (
                <div key={idx} className="border p-3 rounded">
                  <Input placeholder="Optional title" value={s.title || ""} onChange={(e) => {
                    const arr = [...form.descriptionSections];
                    arr[idx] = { ...arr[idx], title: e.target.value };
                    setField("descriptionSections", arr);
                  }} />
                  <Textarea rows={3} placeholder="Paragraph content" value={s.content || ""} onChange={(e) => {
                    const arr = [...form.descriptionSections];
                    arr[idx] = { ...arr[idx], content: e.target.value };
                    setField("descriptionSections", arr);
                  }} />
                </div>
              ))}
              {(form.descriptionSections || []).length === 0 && <div className="text-sm text-slate-400">No paragraphs added yet.</div>}
            </div>

            <div className="mt-3">
              <Label>How to use (single paragraph)</Label>
              <Textarea rows={3} value={form.howTo} onChange={(e) => setField("howTo", e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "variations" && (
        <div className="space-y-3">
          <VariantEditor variations={form.variations} setVariations={(v) => setField("variations", v)} />
          <div className="text-sm text-slate-500">
            Note: Per-variation stock is authoritative. Do not rely on a top-level totalStock field.
          </div>
        </div>
      )}

      {activeTab === "specs" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Product Specifications</Label>
            <Button type="button" onClick={addSpec}>Add spec</Button>
          </div>
          <div className="space-y-2">
            {(form.specList || []).map((s, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder="Label (bold part)" value={s.label || ""} onChange={(e) => {
                  const arr = [...form.specList]; arr[i] = { ...arr[i], label: e.target.value }; setField("specList", arr);
                }} />
                <Input placeholder="Content" value={s.content || ""} onChange={(e) => {
                  const arr = [...form.specList]; arr[i] = { ...arr[i], content: e.target.value }; setField("specList", arr);
                }} />
                <Button type="button" variant="ghost" onClick={() => {
                  const arr = [...form.specList]; arr.splice(i,1); setField("specList", arr);
                }}>Remove</Button>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between">
              <Label>FAQ</Label>
              <Button type="button" onClick={addFaq}>Add Q&A</Button>
            </div>

            <div className="space-y-2">
              {(form.faqList || []).map((f, i) => (
                <div key={i} className="border p-3 rounded">
                  <Input placeholder="Question" value={f.question || ""} onChange={(e) => {
                    const arr = [...form.faqList]; arr[i] = { ...arr[i], question: e.target.value }; setField("faqList", arr);
                  }} />
                  <Textarea rows={2} placeholder="Answer" value={f.answer || ""} onChange={(e) => {
                    const arr = [...form.faqList]; arr[i] = { ...arr[i], answer: e.target.value }; setField("faqList", arr);
                  }} />
                  <Button type="button" variant="ghost" onClick={() => {
                    const arr = [...form.faqList]; arr.splice(i,1); setField("faqList", arr);
                  }}>Remove</Button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <Label>Ingredients (single block)</Label>
            <Textarea rows={3} value={form.ingredients} onChange={(e) => setField("ingredients", e.target.value)} />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save product"}</Button>
      </div>
    </form>
  );
}

export default ProductFormTabs;