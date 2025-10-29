import React, { useEffect, useState } from "react";

/**
 * Clear, table-like variant editor so "Stock (units)" is always visible.
 *
 * Props:
 * - variations: array
 * - setVariations: function(updatedArray)
 */
export default function VariantEditor({ variations = [], setVariations = () => {} }) {
  const [bulkStock, setBulkStock] = useState("");

  // Normalize incoming variations on mount / when prop changes
  useEffect(() => {
    const normalized = (variations || []).map((v) => normalize(v));
    if (normalized.length > 0 && !normalized.some((x) => x.isDefault)) {
      normalized[0].isDefault = true;
    }
    try {
      const incomingJson = JSON.stringify((variations || []).map((v) => normalize(v)));
      const normalizedJson = JSON.stringify(normalized);
      if (incomingJson !== normalizedJson) {
        setVariations(normalized);
      }
    } catch (err) {
      const needsFix = (variations || []).some((v) => v == null || v.totalStock == null || v.price == null);
      if (needsFix) setVariations(normalized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(variations || [])]);

  function normalize(v) {
    return {
      // Keep both id/_id as provided (parent may send _id)
      id: v?.id ?? v?._id ?? null,
      label: String(v?.label ?? "").trim(),
      sku: v?.sku ?? "",
      weight: v?.weight ?? "",
      price: Number(v?.price ?? 0),
      salePrice: v?.salePrice != null ? Number(v.salePrice) : 0,
      totalStock: Math.max(0, Number(v?.totalStock ?? 0)),
      isDefault: !!v?.isDefault,
      descriptionItems: Array.isArray(v?.descriptionItems) ? v.descriptionItems : [],
    };
  }

  const updateAt = (idx, key, value) => {
    const copy = (variations || []).map((v) => ({ ...v }));
    if (!copy[idx]) return;
    if (key === "price" || key === "salePrice") {
      copy[idx][key] = Number(value || 0);
    } else if (key === "totalStock") {
      // ensure integer >= 0
      const nv = Number(value || 0);
      copy[idx][key] = Math.max(0, isNaN(nv) ? 0 : Math.floor(nv));
    } else if (key === "isDefault") {
      copy.forEach((c, i) => (c.isDefault = i === idx));
    } else {
      copy[idx][key] = value;
    }
    setVariations(copy);
  };

  const addVariant = () => {
    const next = [
      ...(variations || []),
      {
        id: null,
        label: "",
        sku: "",
        weight: "",
        price: 0,
        salePrice: 0,
        totalStock: 0,
        isDefault: (variations || []).length === 0,
        descriptionItems: [],
      },
    ];
    if (!next.some((x) => x.isDefault) && next.length > 0) next[0].isDefault = true;
    setVariations(next);
  };

  const removeVariant = (i) => {
    const next = (variations || []).filter((_, idx) => idx !== i).map((v) => ({ ...v }));
    if (!next.some((x) => x.isDefault) && next.length > 0) next[0].isDefault = true;
    setVariations(next);
  };

  const moveUp = (i) => {
    if (i <= 0) return;
    const copy = (variations || []).map((v) => ({ ...v }));
    const tmp = copy[i - 1];
    copy[i - 1] = copy[i];
    copy[i] = tmp;
    setVariations(copy);
  };
  const moveDown = (i) => {
    const copy = (variations || []).map((v) => ({ ...v }));
    if (i >= copy.length - 1) return;
    const tmp = copy[i + 1];
    copy[i + 1] = copy[i];
    copy[i] = tmp;
    setVariations(copy);
  };

  const addDescriptionItem = (variantIdx) => {
    const next = (variations || []).map((v) => ({ ...v }));
    next[variantIdx].descriptionItems = next[variantIdx].descriptionItems || [];
    next[variantIdx].descriptionItems.push({ title: "", content: "" });
    setVariations(next);
  };
  const updateDescriptionItem = (variantIdx, itemIdx, key, value) => {
    const next = (variations || []).map((v) => ({ ...v }));
    next[variantIdx].descriptionItems = next[variantIdx].descriptionItems || [];
    next[variantIdx].descriptionItems[itemIdx] = {
      ...(next[variantIdx].descriptionItems[itemIdx] || {}),
      [key]: value,
    };
    setVariations(next);
  };
  const removeDescriptionItem = (variantIdx, itemIdx) => {
    const next = (variations || []).map((v) => ({ ...v }));
    next[variantIdx].descriptionItems = next[variantIdx].descriptionItems || [];
    next[variantIdx].descriptionItems.splice(itemIdx, 1);
    setVariations(next);
  };

  const adjustStock = (idx, delta) => {
    const current = Number((variations || [])[idx]?.totalStock ?? 0);
    const nextVal = Math.max(0, Math.floor(current + delta));
    updateAt(idx, "totalStock", nextVal);
  };

  const setAllStock = () => {
    const nv = Math.max(0, Math.floor(Number(bulkStock || 0)));
    const next = (variations || []).map((v) => ({ ...v, totalStock: nv }));
    setVariations(next);
    setBulkStock("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-lg">Variations</h4>
        <div className="flex items-center gap-2">
          
          <button type="button" onClick={addVariant} className="px-3 py-1 rounded bg-amber-500 text-white">+ Add variation</button>
        </div>
      </div>

      {/* Table header */}
      <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-semibold text-slate-600 px-3 py-2 border-b">
        <div className="col-span-3">Label</div>
        <div className="col-span-2">SKU</div>
        <div className="col-span-2">Price (₹)</div>
        <div className="col-span-2">Sale Price (₹)</div>
        <div className="col-span-2">Stock (units)</div>
        <div className="col-span-1 text-center">Default</div>
      </div>

      {(variations || []).length === 0 && (
        <div className="text-sm text-slate-500 px-3 py-2">No variations yet. Click "Add variation" to create one.</div>
      )}

      {(variations || []).map((v, i) => (
        <div key={v.id ?? v._id ?? i} className="grid grid-cols-12 gap-2 items-start p-3 border rounded bg-white">
          {/* Label */}
          <div className="col-span-12 md:col-span-3">
            <label className="text-xs block text-slate-600">Label</label>
            <input
              value={v.label ?? ""}
              onChange={(e) => updateAt(i, "label", e.target.value)}
              placeholder="e.g. 100g"
              className="w-full border rounded px-2 py-1"
              data-testid={`variant-label-${i}`}
            />
          </div>

          {/* SKU */}
          <div className="col-span-6 md:col-span-2">
            <label className="text-xs block text-slate-600">SKU</label>
            <input
              value={v.sku ?? ""}
              onChange={(e) => updateAt(i, "sku", e.target.value)}
              className="w-full border rounded px-2 py-1"
              data-testid={`variant-sku-${i}`}
            />
          </div>

          {/* Price */}
          <div className="col-span-6 md:col-span-2">
            <label className="text-xs block text-slate-600">Price (₹)</label>
            <input
              type="number"
              min={0}
              value={v.price ?? 0}
              onChange={(e) => updateAt(i, "price", e.target.value)}
              className="w-full border rounded px-2 py-1"
              data-testid={`variant-price-${i}`}
            />
          </div>

          {/* Sale Price */}
          <div className="col-span-6 md:col-span-2">
            <label className="text-xs block text-slate-600">Sale Price (optional)</label>
            <input
              type="number"
              min={0}
              value={v.salePrice ?? 0}
              onChange={(e) => updateAt(i, "salePrice", e.target.value)}
              className="w-full border rounded px-2 py-1"
              data-testid={`variant-sale-${i}`}
            />
          </div>

          {/* Stock (prominent) with stepper */}
          <div className="col-span-6 md:col-span-2">
            <label className="text-xs block text-slate-600">Stock (units)</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => adjustStock(i, -1)} className="px-2 py-1 rounded border" data-testid={`variant-stock-dec-${i}`}>
                −
              </button>
              <input
                type="number"
                min={0}
                step={1}
                value={v.totalStock ?? 0}
                onChange={(e) => updateAt(i, "totalStock", e.target.value)}
                className="w-full border rounded px-2 py-1 bg-amber-50"
                data-testid={`variant-stock-${i}`}
              />
              <button type="button" onClick={() => adjustStock(i, 1)} className="px-2 py-1 rounded border" data-testid={`variant-stock-inc-${i}`}>
                +
              </button>
            </div>
            <div className="text-xs text-slate-400 mt-1">Enter available units for this variant.</div>
          </div>

          {/* Default + actions */}
          <div className="col-span-12 md:col-span-1 flex flex-col items-end gap-2">
            <label className="text-xs inline-flex items-center gap-2">
              <input
                type="radio"
                name="default-variant"
                checked={!!v.isDefault}
                onChange={() => updateAt(i, "isDefault", true)}
                data-testid={`variant-default-${i}`}
              />
              <span className="text-xs">Default</span>
            </label>

            <div className="flex items-center gap-2 mt-2">
              <button type="button" onClick={() => moveUp(i)} className="px-2 py-1 rounded border text-sm">↑</button>
              <button type="button" onClick={() => moveDown(i)} className="px-2 py-1 rounded border text-sm">↓</button>
              <button type="button" onClick={() => removeVariant(i)} className="px-2 py-1 rounded border text-red-600 text-sm">Remove</button>
            </div>
          </div>

          {/* Description items area */}
          <div className="col-span-12 mt-3 border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Description items (optional)</div>
              <button type="button" onClick={() => addDescriptionItem(i)} className="px-2 py-1 rounded bg-slate-100 text-sm">Add item</button>
            </div>

            {(v.descriptionItems || []).length === 0 && <div className="text-sm text-slate-400">No items</div>}

            {(v.descriptionItems || []).map((di, j) => (
              <div key={j} className="border rounded p-2 mb-2">
                <input
                  placeholder="Title (optional)"
                  value={di.title || ""}
                  onChange={(e) => updateDescriptionItem(i, j, "title", e.target.value)}
                  className="w-full border rounded px-2 py-1 mb-2"
                />
                <textarea
                  placeholder="Content (optional)"
                  rows={2}
                  value={di.content || ""}
                  onChange={(e) => updateDescriptionItem(i, j, "content", e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
                <div className="text-right mt-2">
                  <button type="button" onClick={() => removeDescriptionItem(i, j)} className="px-2 py-1 rounded border text-red-600">Remove item</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
