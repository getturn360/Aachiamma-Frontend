// aachiamma/client/src/pages/admin-view/topbar.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Trash2,
  Edit3,
  Truck,
  Percent,
  Tag,
  Gift,
  Star,
  HousePlug,
  ShoppingCart,
  UserCog,
  Heart,
  Calendar,
  Clock,
  Globe,
  CreditCard,
  Phone,
  ShoppingBag,
  Box,
  MapPin,
  GripVertical,
  ChevronDown,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

/**
 * AdminTopbar - manage top items shown in header marquee
 *
 * - Icon picker uses DropdownMenu (preview on right)
 * - Drag-to-reorder using @hello-pangea/dnd with a Grip handle (same theme as SupportingImages)
 * - Removed "Order" field — ordering determined by drag-and-drop
 * - Maximum 6 items enforced and highlighted above the form
 * - Delete uses ConfirmDialog (better UX)
 */

const ICON_OPTIONS = [
  "Truck",
  "Percent",
  "Tag",
  "Gift",
  "Star",
  "HousePlug",
  "ShoppingCart",
  "UserCog",
  "Heart",
  "Calendar",
  "Clock",
  "Globe",
  "CreditCard",
  "Phone",
  "ShoppingBag",
  "Box",
  "MapPin",
];

const IconPreview = ({ name, className = "w-4 h-4" }) => {
  const map = {
    Truck,
    Percent,
    Tag,
    Gift,
    Star,
    HousePlug,
    ShoppingCart,
    UserCog,
    Heart,
    Calendar,
    Clock,
    Globe,
    CreditCard,
    Phone,
    ShoppingBag,
    Box,
    MapPin,
  };
  const C = map[name] || Star;
  return <C className={className} />;
};

export default function AdminTopbar() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // form state
  const [text, setText] = useState("");
  const [icon, setIcon] = useState("Truck");
  const [link, setLink] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  // delete confirm
  const [deleteId, setDeleteId] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // constants
  const MAX_ITEMS = 6;

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/api/common/topitems/get");
      if (res?.data?.success) {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setItems(data);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error("load topitems", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setText("");
    setIcon("Truck");
    setLink("");
    setEditingId(null);
    setError(null);
  }

  function startEdit(item) {
    setEditingId(item._id);
    setText(item.text || "");
    setIcon(item.icon || "Truck");
    setLink(item.link || "");
  }

  async function handleAddOrUpdate(e) {
    e && e.preventDefault();
    setError(null);
    if (!text || !icon) return setError("Text and icon required");
    try {
      setLoading(true);
      if (editingId) {
        const res = await api.put(`/api/common/topitems/update/${editingId}`, { text, icon, link });
        if (res?.data?.success) {
          const updated = res.data.data;
          setItems((s) => s.map((it) => (it._id === updated._id ? updated : it)));
          resetForm();
        }
      } else {
        if (items.length >= MAX_ITEMS) {
          setError(`Maximum ${MAX_ITEMS} items allowed`);
          return;
        }
        const nextOrder = items.length;
        const res = await api.post("/api/common/topitems/add", { text, icon, link, order: nextOrder });
        if (res?.data?.success) {
          setItems((s) => {
            const n = [...s, res.data.data];
            n.sort((a, b) => (a.order || 0) - (b.order || 0));
            return n;
          });
          resetForm();
        }
      }
    } catch (e) {
      console.error("add/update topitem", e);
      setError(e?.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  function requestDelete(id) {
    setDeleteId(id);
    setConfirmDeleteOpen(true);
  }

  async function handleDeleteConfirmed() {
    const id = deleteId;
    setConfirmDeleteOpen(false);
    setDeleteId(null);
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.delete(`/api/common/topitems/delete/${id}`);
      if (res?.data?.success) {
        setItems((s) => s.filter((i) => i._id !== id));
      } else {
        alert("Delete failed");
      }
    } catch (e) {
      console.error("delete topitem", e);
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  }

  // reorder handler for react-beautiful-dnd style (@hello-pangea/dnd)
  function reorder(list, startIndex, endIndex) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  async function onDragEnd(res) {
    if (!res.destination) return;
    if (res.destination.index === res.source.index) return;

    const next = reorder(items, res.source.index, res.destination.index);
    // assign order indices
    const withOrder = next.map((it, idx) => ({ ...it, order: idx }));
    setItems(withOrder);

    // persist orders (one request per item)
    try {
      setLoading(true);
      await Promise.all(
        withOrder.map((it) =>
          api
            .put(`/api/common/topitems/update/${it._id}`, { order: it.order })
            .catch((err) => {
              console.error("persist order for", it._id, err);
              throw err;
            })
        )
      );
    } catch (err) {
      console.error("persisting order failed, reloading", err);
      setError("Failed to save new order. Re-loading items.");
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Topbar (Top Items)</h2>

      {/* MAX ITEMS HIGHLIGHT */}
      <div className={`mb-4 p-3 rounded-md border ${items.length >= MAX_ITEMS ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-medium">
            {items.length >= MAX_ITEMS
              ? `Maximum ${MAX_ITEMS} items allowed — ${items.length}/${MAX_ITEMS} used`
              : `You can add up to ${MAX_ITEMS} topbar items — ${items.length}/${MAX_ITEMS} used`}
          </div>
          {items.length >= MAX_ITEMS ? (
            <div className="text-xs font-semibold px-2 py-1 rounded bg-rose-100 text-rose-800">Limit reached</div>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit top item" : "Add new top item"}</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleAddOrUpdate} className="grid gap-3">
            <div className="grid md:grid-cols-3 gap-2 items-center">
              <div className="text-sm font-medium">Text</div>
              <div className="col-span-2">
                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder='E.g. Free shipping on orders over ₹999' />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-2 items-center">
              <div className="text-sm font-medium">Icon</div>
              <div className="col-span-2 flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="px-3 py-2 border rounded inline-flex items-center gap-2"
                      aria-label="Select icon"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4"><IconPreview name={icon} /></div>
                        <span className="text-sm">{icon}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start" className="w-44 max-h-64 overflow-auto">
                    {ICON_OPTIONS.map((opt) => (
                      <DropdownMenuItem key={opt} onSelect={() => setIcon(opt)} className="flex justify-between items-center">
                        <span className="capitalize">{opt}</span>
                        <div className="ml-2"><IconPreview name={opt} /></div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="p-1 rounded bg-white/5">
                  <IconPreview name={icon} />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-2 items-center">
              <div className="text-sm font-medium">Link (optional)</div>
              <div className="col-span-2">
                <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/shop/listing?category=foo or https://..." />
              </div>
            </div>

            {error && <div className="text-sm text-red-500">{error}</div>}

            <div className="flex gap-2 items-center">
              <Button type="submit" disabled={loading || items.length >= MAX_ITEMS}>{editingId ? "Update" : "Add"}</Button>
              <Button variant="ghost" onClick={resetForm}>Reset</Button>
              <div className="ml-auto text-sm text-muted">
                {items.length}/{MAX_ITEMS} used
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h3 className="font-medium mb-2">Existing items ({items.length})</h3>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="topbar-items">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="grid gap-2">
                {items.length === 0 && <div className="text-sm text-muted">No top items yet.</div>}

                {items
                  .slice()
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((it, idx) => (
                    <Draggable key={it._id} draggableId={String(it._id)} index={idx}>
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={`flex items-center justify-between p-3 border rounded bg-white/2 ${snapshot.isDragging ? "z-50 scale-105 shadow-2xl" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded flex items-center justify-center bg-white/5">
                              <IconPreview name={it.icon} />
                            </div>
                            <div>
                              <div className="font-medium">{it.text}</div>
                              {/* link should be clearly visible (dark text) */}
                              <div className="text-xs text-muted-foreground">{it.link || "—"}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* drag handle */}
                            <button
                              {...dragProvided.dragHandleProps}
                              title="Drag to reorder"
                              aria-label={`Drag handle for ${it.text}`}
                              className="p-2 rounded hover:bg-white/5 focus:outline-none"
                            >
                              <GripVertical className="w-4 h-4 text-gray-600" />
                            </button>

                            <button title="Edit" onClick={() => startEdit(it)} className="p-2 rounded hover:bg-white/5">
                              <Edit3 size={16} />
                            </button>

                            <button title="Delete" onClick={() => requestDelete(it._id)} className="p-2 rounded hover:bg-white/5 text-rose-500">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="mt-3 text-xs text-muted-foreground">
          Tip: Drag the Grip icon to reorder items. New items are appended to the end.
        </div>
      </div>

      {/* Confirm dialog used for deleting an item */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        title={"Delete top item"}
        description={"This will permanently delete the selected topbar item. Are you sure?"}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => { setConfirmDeleteOpen(false); setDeleteId(null); }}
      />
    </div>
  );
}

// Reusable ConfirmDialog component (same design as AdminShipping)
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
