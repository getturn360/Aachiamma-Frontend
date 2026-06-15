import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import api from "@/api/axios";


function CommonForm({
  formControls = [],
  formData = {},
  setFormData = () => {},
  onSubmit = () => {},
  buttonText = "Save",
  isBtnDisabled = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [openVariationIndexes, setOpenVariationIndexes] = useState([]);

  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/api/common/categories/get");
        if (!mounted) return;
        if (res?.data?.success) {
          const cats = (res.data.categories || res.data.data || []).map((c) => {
            const id = c.slug || c._id || c.name;
            const name = c.name || c.slug || String(id);
            return { id, label: name };
          });
          setCategoriesList(cats);
          return;
        }
      } catch (err) {
      console.error("[form.jsx] Error:", err);
    }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function setField(name, value) {
    setFormData({ ...(formData || {}), [name]: value });
  }

  useEffect(() => {
    const vs = Array.isArray(formData?.variations) ? formData.variations : [];
    if (vs.length === 0) {
      setOpenVariationIndexes([]);
      return;
    }

    const idx = vs.findIndex((v) => v && v.isDefault);
    const defaultIndex = idx === -1 ? 0 : idx;

    setOpenVariationIndexes((prev) => {
      const prevArr = Array.isArray(prev) ? prev : [];
 
      const merged = vs.map((_, i) => Boolean(prevArr[i]) || i === defaultIndex);
      return merged;
    });

  }, [formData?.variations]);

  function toggleVariationOpen(idx) {
    setOpenVariationIndexes((prev) => {
      const next = [...(Array.isArray(prev) ? prev : [])];
      next[idx] = !next[idx];
      return next;
    });
  }

  function renderInputsByComponentType(getControlItem) {
    const value = formData[getControlItem.name] ?? "";
    let element = null;

    switch (getControlItem.componentType) {
      case "input":
        if (getControlItem.type === "password") {
          element = (
            <div className="relative">
              <Input
                name={getControlItem.name}
                placeholder={getControlItem.placeholder || ""}
                id={getControlItem.name}
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={(e) => setField(getControlItem.name, e.target.value)}
                className="rounded-xl p-3"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label="toggle password"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          );
        } else {
          element = (
            <Input
              name={getControlItem.name}
              placeholder={getControlItem.placeholder || ""}
              id={getControlItem.name}
              type={getControlItem.type || "text"}
              value={value}
              onChange={(e) => setField(getControlItem.name, e.target.value)}
              className="rounded-xl p-3"
            />
          );
        }
        break;

      case "select": {

        const controlOptions = Array.isArray(getControlItem.options) && getControlItem.options.length
          ? getControlItem.options
          : [];
        const optionsToRender = (controlOptions.length ? controlOptions : (getControlItem.name === 'category' ? categoriesList : []));

        // Radix Select: value must not be "" — use undefined for “no selection”.
        // SelectItem value must not be "" (throws at runtime and can blank the whole app).
        const selectValue =
          value === "" || value === null || value === undefined ? undefined : String(value);

        const NONE = "__none__";

        element = (
          <Select
            onValueChange={(val) => setField(getControlItem.name, val === NONE ? "" : val)}
            value={selectValue}
          >
            <SelectTrigger
              className="w-full rounded-xl p-2"
            >
              <SelectValue placeholder={getControlItem.placeholder || getControlItem.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>None</SelectItem>
              {optionsToRender.length ? (
                optionsToRender.map((optionItem) => {
                  const raw = optionItem.id ?? optionItem.value ?? optionItem.label;
                  const optVal = raw === "" || raw === null || raw === undefined ? NONE : String(raw);
                  return (
                    <SelectItem key={optVal} value={optVal}>
                      {optionItem.label ?? optionItem.name ?? optionItem}
                    </SelectItem>
                  );
                })
              ) : (
                <SelectItem value="__empty_list__" disabled>
                  No categories loaded yet
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        );
        break;
      }

      case "checkboxgroup":
        element = (
          <div className="flex gap-3 flex-wrap">
            {getControlItem.options?.map((opt) => {
              const checked = Array.isArray(formData[getControlItem.name]) && formData[getControlItem.name].includes(opt.id);
              const toggle = () => {
                const cur = Array.isArray(formData[getControlItem.name]) ? [...formData[getControlItem.name]] : [];
                if (cur.includes(opt.id)) {
                  setField(getControlItem.name, cur.filter((x) => x !== opt.id));
                } else {
                  cur.push(opt.id);
                  setField(getControlItem.name, cur);
                }
              };
              return (
                <label
                  key={opt.id}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${checked ? "bg-emerald-600 text-white border-emerald-600" : "bg-transparent text-slate-700"}`}
                >
                  <input type="checkbox" checked={checked} onChange={toggle} className="hidden" aria-hidden />
                  <span className="text-sm">{opt.label}</span>
                </label>
              );
            })}
          </div>
        );
        break;

      case "textarea":
        element = (
          <Textarea
            name={getControlItem.name}
            placeholder={getControlItem.placeholder || ""}
            id={getControlItem.name}
            value={value}
            onChange={(e) => setField(getControlItem.name, e.target.value)}
            className="rounded-xl p-3"
            rows={4}
          />
        );
        break;

      case "variations": {
        const arr = Array.isArray(value) ? value : [];
        element = (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Variations (weights)</div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    const newArr = [
                      ...arr,
                      {
                        label: "100g",
                        price: "",
                        salePrice: "",
                        isDefault: arr.length === 0,
                        descriptionItems: [],
                      },
                    ];
                    setField(getControlItem.name, newArr);
                    setOpenVariationIndexes((prev) => [...(Array.isArray(prev) ? prev : []), true]);
                  }}
                >
                  Add Variation
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {arr.map((it, idx) => {
                const isOpen = !!openVariationIndexes[idx];

                const parts = [];
                if (it.price !== undefined && it.price !== "" && !Number.isNaN(Number(it.price)) && Number(it.price) !== 0) {
                  parts.push(`Price: ₹${Number(it.price).toLocaleString("en-IN")}`);
                }
                if (it.salePrice !== undefined && it.salePrice !== "" && !Number.isNaN(Number(it.salePrice)) && Number(it.salePrice) !== 0) {
                  parts.push(`Offer: ₹${Number(it.salePrice).toLocaleString("en-IN")}`);
                }

                return (
                  <div key={idx} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-start gap-3">
  
                      <div className="mt-1">
                        <input
                          type="radio"
                          name={`${getControlItem.name}-default`}
                          checked={!!it.isDefault}
                          onChange={() => {
                            const newArr = arr.map((x, i) => ({ ...x, isDefault: i === idx }));
                            setField(getControlItem.name, newArr);
            
                            setOpenVariationIndexes((prev) => (Array.isArray(prev) ? prev.map((v, i) => i === idx) : prev));
                          }}
                          className="accent-amber-600 w-5 h-5"
                          title="Mark as default"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="font-medium">{it.label || `Variation ${idx + 1}`}</div>
                            <div className="text-sm text-slate-500">{parts.length ? parts.join(" · ") : ""}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleVariationOpen(idx)}
                              className="p-1 rounded hover:bg-slate-50"
                              aria-label={isOpen ? "Collapse" : "Expand"}
                            >
                              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            <Button
                              variant="ghost"
                              onClick={() => {
                                const newArr = [...arr];
                                newArr.splice(idx, 1);
                                setField(getControlItem.name, newArr);
                                setOpenVariationIndexes((prev) => {
                                  const next = [...(Array.isArray(prev) ? prev : [])];
                                  next.splice(idx, 1);
                                  if (next.length > 0 && !next.some(Boolean)) next[0] = true;
                                  return next;
                                });
                              }}
                              size="icon"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="mt-3 space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                              <Input
                                placeholder="Label (e.g. 100g) *"
                                value={it.label || ""}
                                onChange={(e) => {
                                  const newArr = [...arr];
                                  newArr[idx] = { ...newArr[idx], label: e.target.value };
                                  setField(getControlItem.name, newArr);
                                }}
                                className="rounded-xl p-2"
                              />
                              <Input
                                placeholder="Price (required) *"
                                type="number"
                                value={it.price ?? ""}
                                onChange={(e) => {
                                  const newArr = [...arr];
                                  newArr[idx] = { ...newArr[idx], price: e.target.value === "" ? "" : Number(e.target.value) };
                                  setField(getControlItem.name, newArr);
                                }}
                                className="rounded-xl p-2"
                              />
                              <Input
                                placeholder="Offer Price (optional)"
                                type="number"
                                value={it.salePrice ?? ""}
                                onChange={(e) => {
                                  const newArr = [...arr];
                                  newArr[idx] = { ...newArr[idx], salePrice: e.target.value === "" ? "" : Number(e.target.value) };
                                  setField(getControlItem.name, newArr);
                                }}
                                className="rounded-xl p-2"
                              />
                            </div>

            
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium">Description items (optional)</div>
                                <Button
                                  type="button"
                                  onClick={() => {
                                    const newArr = [...arr];
                                    newArr[idx] = {
                                      ...(newArr[idx] || {}),
                                      descriptionItems: Array.isArray(newArr[idx]?.descriptionItems)
                                        ? [...newArr[idx].descriptionItems, { title: "", content: "" }]
                                        : [{ title: "", content: "" }],
                                    };
                                    setField(getControlItem.name, newArr);
                                  }}
                                >
                                  Add Item
                                </Button>
                              </div>

                              <div className="space-y-2">
                                {(it.descriptionItems || []).map((di, didx) => (
                                  <div key={didx} className="border p-3 rounded-md bg-white">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="text-sm font-semibold">Item {didx + 1}</div>
                                      <Button
                                        variant="ghost"
                                        onClick={() => {
                                          const newArr = [...arr];
                                          newArr[idx].descriptionItems = [...newArr[idx].descriptionItems];
                                          newArr[idx].descriptionItems.splice(didx, 1);
                                          setField(getControlItem.name, newArr);
                                        }}
                                        size="icon"
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                    <Input
                                      placeholder="Bold title (optional)"
                                      value={di.title || ""}
                                      onChange={(e) => {
                                        const newArr = [...arr];
                                        newArr[idx] = { ...newArr[idx], descriptionItems: [...newArr[idx].descriptionItems] };
                                        newArr[idx].descriptionItems[didx] = { ...newArr[idx].descriptionItems[didx], title: e.target.value };
                                        setField(getControlItem.name, newArr);
                                      }}
                                      className="rounded-xl p-2 mb-2"
                                    />
                                    <Textarea
                                      placeholder="Paragraph content"
                                      value={di.content || ""}
                                      onChange={(e) => {
                                        const newArr = [...arr];
                                        newArr[idx] = { ...newArr[idx], descriptionItems: [...newArr[idx].descriptionItems] };
                                        newArr[idx].descriptionItems[didx] = { ...newArr[idx].descriptionItems[didx], content: e.target.value };
                                        setField(getControlItem.name, newArr);
                                      }}
                                      rows={3}
                                      className="rounded-xl p-2"
                                    />
                                  </div>
                                ))}
                                {(it.descriptionItems || []).length === 0 && <div className="text-sm text-slate-400">No description items for this variation.</div>}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-slate-500">
              Each variation requires label & price. Default variation (radio) is the displayed rate on the product tile & product detail page.
            </div>
          </div>
        );
        break;
      }

      case "specList": {
        const arr = Array.isArray(value) ? value : [];
        element = (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{getControlItem.label}</div>
              <Button
                type="button"
                onClick={() => {
                  const newArr = [...arr, { label: "", content: "" }];
                  setField(getControlItem.name, newArr);
                }}
              >
                Add Point
              </Button>
            </div>

            <div className="space-y-2">
              {arr.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="mt-2">•</div>
                  <div className="flex-1">
                    <Input
                      placeholder="Label (bold part, e.g. Available packs)"
                      value={it.label || ""}
                      onChange={(e) => {
                        const newArr = [...arr];
                        newArr[idx] = { ...newArr[idx], label: e.target.value };
                        setField(getControlItem.name, newArr);
                      }}
                      className="rounded-xl p-2 mb-2"
                    />
                    <Textarea
                      placeholder="Content (e.g. 100g, 200g)"
                      value={it.content || ""}
                      onChange={(e) => {
                        const newArr = [...arr];
                        newArr[idx] = { ...newArr[idx], content: e.target.value };
                        setField(getControlItem.name, newArr);
                      }}
                      rows={2}
                      className="rounded-xl p-2"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const newArr = [...arr];
                      newArr.splice(idx, 1);
                      setField(getControlItem.name, newArr);
                    }}
                    size="icon"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {arr.length === 0 && <div className="text-sm text-slate-400">No specifications added yet.</div>}
            </div>
          </div>
        );
        break;
      }

      case "sections": {
        const arr = Array.isArray(value) ? value : [];
        element = (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{getControlItem.label}</div>
              <Button
                type="button"
                onClick={() => {
                  const newArr = [...arr, { title: "", content: "" }];
                  setField(getControlItem.name, newArr);
                }}
              >
                Add Section
              </Button>
            </div>

            <div className="space-y-2">
              {arr.map((it, idx) => (
                <div key={idx} className="space-y-2 border p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Section {idx + 1}</div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const newArr = [...arr];
                          newArr.splice(idx, 1);
                          setField(getControlItem.name, newArr);
                        }}
                        size="icon"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  <Input
                    placeholder="Bold title (optional)"
                    value={it.title || ""}
                    onChange={(e) => {
                      const newArr = [...arr];
                      newArr[idx] = { ...newArr[idx], title: e.target.value };
                      setField(getControlItem.name, newArr);
                    }}
                    className="rounded-xl p-2"
                  />
                  <Textarea
                    placeholder="Paragraph / content (plain text)."
                    value={it.content || ""}
                    onChange={(e) => {
                      const newArr = [...arr];
                      newArr[idx] = { ...newArr[idx], content: e.target.value };
                      setField(getControlItem.name, newArr);
                    }}
                    rows={4}
                    className="rounded-xl p-2"
                  />
                </div>
              ))}
              {arr.length === 0 && <div className="text-sm text-slate-400">No sections added yet.</div>}
            </div>
          </div>
        );
        break;
      }



      default:
        element = (
          <Input
            name={getControlItem.name}
            placeholder={getControlItem.placeholder || ""}
            id={getControlItem.name}
            type={getControlItem.type || "text"}
            value={value}
            onChange={(e) => setField(getControlItem.name, e.target.value)}
            className="rounded-xl p-3"
          />
        );
    }

    return element;
  }


  const nameControls = formControls.filter((c) => c.name === "firstName" || c.name === "lastName");
  const cityBlockNames = ["city", "state", "postcode", "pincode"];
  const cityControls = formControls.filter((c) => cityBlockNames.includes(c.name));
  const suppressOuterLabelTypes = ["variations", "specList", "sections"];
  const otherControls = formControls.filter((c) => !nameControls.includes(c) && !cityControls.includes(c));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();


        const variationsControl = formControls.find((c) => c.componentType === "variations");
        if (variationsControl) {
          const vs = Array.isArray(formData[variationsControl.name]) ? formData[variationsControl.name] : [];
          if (!Array.isArray(vs) || vs.length === 0) {
            alert("Please add at least one variation (weight) with label and price.");
            return;
          }

          const normalized = vs.map((v) => {
            const entry = {
              label: v.label,
              price: v.price,
              salePrice: v.salePrice ?? "",
              isDefault: !!v.isDefault,
              descriptionItems: Array.isArray(v.descriptionItems) ? v.descriptionItems : [],
            };
            if (v._id) entry._id = v._id;
            else if (v.id) entry.id = v.id;
            return entry;
          });

          setField(variationsControl.name, normalized);

          for (let i = 0; i < normalized.length; i++) {
            const v = normalized[i];
            if (!v.label || String(v.label).trim() === "") {
              alert(`Variation ${i + 1} requires a label.`);
              return;
            }
            if (v.price === "" || v.price === undefined || v.price === null || Number.isNaN(Number(v.price))) {
              alert(`Variation ${i + 1} requires a valid price.`);
              return;
            }
          }


          if (!normalized.some((x) => x.isDefault)) {
            const newArr = normalized.map((x, i) => ({ ...x, isDefault: i === 0 }));
            setField(variationsControl.name, newArr);
          } else {

            const def = normalized.find((x) => x.isDefault);
            if (!def || def.price === "" || def.price === undefined || Number.isNaN(Number(def.price))) {
              alert("Default variation must have a valid price.");
              return;
            }
          }
        }

        onSubmit(e);
      }}
      className="space-y-4"
    >

      {nameControls.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {nameControls.map((ctrl) => (
            <div key={ctrl.name} className="flex flex-col gap-1">
              <Label className="text-sm font-medium text-slate-600">{ctrl.label}</Label>
              {renderInputsByComponentType(ctrl)}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {otherControls.map((ctrl) => (
          <div key={ctrl.name} className="flex flex-col gap-1">
            {!suppressOuterLabelTypes.includes(ctrl.componentType) && (
              <Label className="text-sm font-medium text-slate-600">{ctrl.label}</Label>
            )}
            {renderInputsByComponentType(ctrl)}
          </div>
        ))}
      </div>

      {cityControls.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cityControls.map((ctrl) => (
            <div key={ctrl.name} className="flex flex-col gap-1">
              <Label className="text-sm font-medium text-slate-600">{ctrl.label}</Label>
              {renderInputsByComponentType(ctrl)}
            </div>
          ))}
        </div>
      )}

      <div className="pt-2">
        <Button disabled={isBtnDisabled} type="submit" className="w-full rounded-xl py-3">
          {buttonText || "Submit"}
        </Button>
      </div>
    </form>
  );
}

export default CommonForm;
