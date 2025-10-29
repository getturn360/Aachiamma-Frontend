import React, { useState, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Trash2, ImagePlus, Star, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function SupportingImages({ images = [], setImages }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  // pending delete state: store both index and url for robust removal
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);
  const [pendingDeleteUrl, setPendingDeleteUrl] = useState(null);

  async function handleFiles(files) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fd = new FormData();
        fd.append("my_file", file);

        const base = (axios.defaults?.baseURL || "").replace(/\/+$/g, "");
        const baseEndsWithApi = base.toLowerCase().endsWith("/api");
        const uploadPath = baseEndsWithApi ? "/admin/products/upload-image" : "/api/admin/products/upload-image";

        const res = await axios.post(uploadPath, fd);
        if (res?.data?.success) {
          setImages((prev) => [...prev, res.data.result.url]);
        }
      }
    } catch (e) {
      console.error("Upload error", e);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onFileChange(e) {
    handleFiles(e.target.files);
  }

  // keep removeAt for direct programmatic use, but UI uses confirmation modal
  function removeAt(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function setAsMain(index) {
    setImages((prev) => {
      const arr = [...prev];
      const item = arr.splice(index, 1)[0];
      arr.unshift(item);
      return arr;
    });
  }

  // reorder helper
  function reorder(list, startIndex, endIndex) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  function onDragEnd(result) {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    const next = reorder(images, result.source.index, result.destination.index);
    setImages(next);
  }

  // show confirm modal
  function askDelete(index, url) {
    setPendingDeleteIndex(index);
    setPendingDeleteUrl(url);
  }

  // cancel
  function handleDeleteCancel() {
    setPendingDeleteIndex(null);
    setPendingDeleteUrl(null);
  }

  // confirmed delete
  function handleDeleteConfirmed() {
    const url = pendingDeleteUrl;
    const idx = pendingDeleteIndex;
    if (url == null && idx == null) {
      handleDeleteCancel();
      return;
    }

    setImages((prev) => {
      // prefer removing by stored index if the same item still at that index
      if (typeof idx === "number" && prev[idx] === url) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      // otherwise remove the first occurrence of the stored URL
      const found = prev.findIndex((u) => u === url);
      if (found !== -1) {
        const copy = [...prev];
        copy.splice(found, 1);
        return copy;
      }
      // fallback: if nothing matched, return prev unchanged
      return prev;
    });

    handleDeleteCancel();
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            multiple
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="sr-only"
            id="supporting-images-input"
          />

          <label htmlFor="supporting-images-input" className="inline-flex items-center gap-2">
            <Button
              onClick={() => inputRef.current && inputRef.current.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-md"
              aria-label="Add supporting images"
            >
              <ImagePlus className="w-4 h-4" />
              <span className="text-sm font-medium">Add images</span>
            </Button>
          </label>

          {uploading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-3 h-3 rounded-full animate-spin border-2 border-t-transparent border-gray-400" />
              <span className="italic">Uploading...</span>
            </div>
          )}
        </div>

        <div className="text-right text-xs text-gray-500">
          <div className="font-medium">Upload Images</div>
          <div className="mt-0.5">Up to 8 · Recommended = square</div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="supporting-images" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            >
              {images && images.length > 0 ? (
                images.map((img, idx) => (
                  <Draggable key={img + idx} draggableId={`${img}-${idx}`} index={idx}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className={`relative rounded-xl overflow-hidden border border-gray-100 transition-transform ${snapshot.isDragging ? "z-50 scale-105 shadow-2xl" : "bg-gray-50"}`}
                      >
                        <div className="aspect-square w-full relative bg-gray-100 min-h-[160px]">
                          <img src={img} alt={`supp-${idx}`} className="object-cover w-full h-full" />

                          {idx === 0 && (
                            <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow">
                              <Star className="w-3 h-3" />
                              <span>Main</span>
                            </div>
                          )}

                          <div className="absolute top-2 right-2 text-xs text-gray-700 bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded-md">
                            #{idx + 1}
                          </div>
                        </div>

                        <div className="p-4 flex items-center justify-between gap-2">
                          <div className="flex gap-1 items-center" role="group" aria-label={`Actions for image ${idx + 1}`}>
                            <button
                              {...dragProvided.dragHandleProps}
                              title="Drag to reorder"
                              aria-label={`Drag handle for image ${idx + 1}`}
                              className="px-2 py-1 rounded-md hover:bg-slate-50 focus:outline-none"
                            >
                              <GripVertical className="w-4 h-4 text-gray-600" />
                            </button>

                            <button
                              onClick={() => setAsMain(idx)}
                              title="Set as main"
                              aria-label={`Set image ${idx + 1} as main`}
                              className="px-2 py-1 rounded-md hover:bg-slate-50 focus:outline-none"
                            >
                              <Star className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>

                          <div>
                            {/* now ask for confirmation instead of deleting immediately */}
                            <button
                              onClick={() => askDelete(idx, img)}
                              title="Delete"
                              className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100"
                              aria-label={`Delete image ${idx + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))
              ) : (
                <div className="col-span-full p-6 border-2 border-dashed border-gray-100 rounded-lg text-center text-sm text-gray-500">
                  <div>No images added yet.</div>
                  <div className="mt-2 text-xs">Add multiple images to show product variants, closeups or packaging.</div>
                </div>
              )}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="mt-3 text-xs text-gray-500">Tip: drag the handle to reorder images. Click the <span className="font-semibold">Star</span> to set the primary image (it will be moved to the first position).</div>

      {/* Confirm modal - same style as your coupons modal */}
      {pendingDeleteUrl && (
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
                  <h3 className="text-lg font-semibold">Delete image?</h3>
                  <p className="text-sm text-slate-600 mt-2">Are you sure you want to delete this image? This action cannot be undone.</p>

                  {/* optional small preview */}
                  <div className="mt-4">
                    <div className="w-28 h-28 rounded-md overflow-hidden border bg-gray-50">
                      <img src={pendingDeleteUrl} alt="to delete preview" className="object-cover w-full h-full" />
                    </div>
                  </div>
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
