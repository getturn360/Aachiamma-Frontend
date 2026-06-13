import React, { useEffect, useRef, useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, Edit, PlusCircle, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function reorder(list, startIndex, endIndex) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);


  const [formName, setFormName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formError, setFormError] = useState(null);


  const [deleteId, setDeleteId] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const nameRef = useRef(null);

  useEffect(() => {
    loadCategories();
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
   
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const url = "/api/admin/categories/get";
      const res = await api.get(url);
      if (res?.data?.success) {
        const data = Array.isArray(res.data.categories) ? res.data.categories : [];
        data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (e) {
      console.error("[categories.jsx] Error:", e);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormName("");
    setEditingId(null);
    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    setFormError(null);
    if (nameRef.current) nameRef.current.value = "";
  }

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) {
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!f.type.startsWith("image/")) {
      setFormError("Please select an image file.");
      return;
    }
    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setSelectedFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setFormError(null);
  };

  const createOrUpdate = async (e) => {
    e && e.preventDefault();
    setFormError(null);

    const rawName = formName ?? "";
    const refName = nameRef.current?.value ?? "";
    const nameVal = (rawName || refName || "").trim();

    if (!nameVal) {
      setFormError("Name required");
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("name", nameVal);
      if (selectedFile) fd.append("image", selectedFile);
      if (!editingId) fd.append("order", categories.length);

      let res;
      if (editingId) {
        const url = `/api/admin/categories/update/${editingId}`;
        res = await api.put(url, fd);
      } else {
        const url = "/api/admin/categories/create";
        res = await api.post(url, fd);
      }

      if (res?.data?.success) {
        resetForm();
        await loadCategories();
      } else {
        setFormError(res?.data?.message || "Operation failed");
      }
    } catch (err) {
      console.error("[categories.jsx] Error:", err);
      setFormError(err?.response?.data?.message || err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (cat) => {
    setEditingId(cat._id);
    setFormName(cat.name || "");
    if (nameRef.current) nameRef.current.value = cat.name || "";
    setSelectedFile(null);
    setPreviewUrl(cat.image || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setFormError(null);
  };

  const requestDelete = (id) => {
    setDeleteId(id);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteId) return;
    try {
      setConfirmLoading(true);
      const url = `/api/admin/categories/delete/${deleteId}`;
      const res = await api.delete(url);
      if (res?.data?.success) {
        setConfirmDeleteOpen(false);
        setDeleteId(null);
        await loadCategories();
      } else {
        alert(res?.data?.message || "Delete failed");
      }
    } catch (err) {
      console.error("[categories.jsx] Error:", err);
      alert("Delete failed");
    } finally {
      setConfirmLoading(false);
    }
  };


  async function onDragEnd(result) {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const next = reorder(categories, result.source.index, result.destination.index);
    const withOrder = next.map((it, idx) => ({ ...it, order: idx }));
    setCategories(withOrder);

    try {
      setLoading(true);
      await Promise.all(
        withOrder.map((it) => api.put(`/api/admin/categories/update/${it._id}`, { order: it.order }))
      );
    } catch (err) {
      console.error("[categories.jsx] Error:", err);
      setFormError("Failed to save new order. Re-loading categories.");
      await loadCategories();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <div className="text-sm text-gray-600">{categories.length} categories</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Category" : "Add Category"}</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={createOrUpdate} className="grid gap-4">
            <div className="grid md:grid-cols-3 gap-3 items-center">
              <div>
                <div className="text-sm font-medium">Name</div>
                <input
                  ref={nameRef}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Category name"
                  className="border p-2 rounded w-full"
                  autoComplete="off"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm font-medium">Image (optional)</div>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {previewUrl && (
                  <div className="w-20 h-12 rounded overflow-hidden border ml-2">
                    <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="hidden md:block" />
            </div>

            {formError && <div className="text-sm text-rose-600">{formError}</div>}

            <div className="flex gap-3 items-center">
              <Button type="submit" disabled={loading} className="inline-flex items-center gap-2">
                {editingId ? <Edit className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                {editingId ? (loading ? "Updating..." : "Update Category") : (loading ? "Creating..." : "Add Category")}
              </Button>

              {editingId && (
                <Button
                  type="button"
                  onClick={() => {
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              )}

              <div className="ml-auto text-sm text-gray-500">{editingId ? "Editing" : "Ready to add"}</div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="bg-white p-4 rounded shadow-sm">
        <h2 className="font-semibold mb-3">Existing Categories ({categories.length})</h2>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="categories-list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {loading && <div>Loading...</div>}

                {categories.length === 0 && !loading && <div className="text-sm text-gray-500">No categories yet.</div>}

                {categories
                  .slice()
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((c, idx) => (
                    <Draggable key={c._id} draggableId={String(c._id)} index={idx}>
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={`flex items-center justify-between border rounded p-2 bg-white ${snapshot.isDragging ? "z-50 scale-105 shadow-2xl" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              {...dragProvided.dragHandleProps}
                              title="Drag to reorder"
                              aria-label={`Drag handle for ${c.name}`}
                              className="p-2 rounded hover:bg-white/5 flex items-center"
                            >
                              <GripVertical className="w-5 h-5 text-gray-600" />
                            </button>

                            <div className="w-16 h-16 rounded overflow-hidden border flex items-center justify-center bg-gray-50">
                              {c.image ? (
                                <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-xs text-gray-500 px-2">No image</div>
                              )}
                            </div>

                            <div>
                              <div className="font-medium">{c.name}</div>
                              <div className="text-xs text-gray-500">
                                slug: {c.slug} • order: {c.order ?? "—"}
                              </div>
                              {c.description && <div className="text-sm text-gray-700 mt-1">{c.description}</div>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button onClick={() => onEdit(c)} className="px-3 py-1 border rounded flex items-center gap-2">
                              <Edit className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() => requestDelete(c._id)}
                              className="px-3 py-1 border rounded flex items-center gap-2 text-white bg-rose-600 hover:brightness-95"
                              title="Delete category"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
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
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title={"Delete category"}
        description={"This will permanently delete the selected category. This will also attempt to unset category on related products. Are you sure?"}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => {
          setConfirmDeleteOpen(false);
          setDeleteId(null);
        }}
        loading={confirmLoading}
      />
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => !loading && onCancel && onCancel()} />
      <div className="relative z-10 max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden border overflow-auto">
        <div className="flex items-start gap-4 p-6 border-b">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path></svg>
          </div>

          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-lg font-semibold truncate">{title}</h3>
            {description ? <p className="text-sm text-muted-foreground mt-1">{description}</p> : null}
            <div className="mt-6 flex items-center gap-3 justify-end">
              <button ref={cancelRef} onClick={() => !loading && onCancel && onCancel()} disabled={loading} className="px-4 py-2 rounded-md bg-white border hover:bg-slate-50">Cancel</button>
              <button onClick={() => !loading && onConfirm && onConfirm()} disabled={loading} className="px-4 py-2 rounded-md bg-rose-600 text-white">{loading ? "Working..." : "Confirm"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
