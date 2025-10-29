// client/src/components/admin-view/popups-manager.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Trash2, UploadCloud } from "lucide-react";
import { fetchAdminPopups } from "@/store/popup-slice";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

/**
 * PopupsManager
 * - UI matches dashboard "Existing feature images" theme (cards, overlay, motion)
 * - Uses an inline styled message banner instead of window.alert()
 * - Uses a confirm modal for delete instead of confirm()
 */
export default function PopupsManager() {
  const dispatch = useDispatch();
  const { adminList = [] } = useSelector((s) => s.popup || {});
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // message banner
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info"); // info | success | error

  // delete confirm
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminPopups());
  }, [dispatch]);

  const onFileChange = (e) => setFile(e.target.files?.[0] || null);

  const clearMsg = (after = 3000) => {
    setTimeout(() => {
      setMsg("");
      setMsgType("info");
    }, after);
  };

  const upload = async () => {
    if (!file) {
      setMsg("Please choose a file first.");
      setMsgType("error");
      clearMsg(2500);
      return;
    }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("my_file", file);
      fd.append("title", file.name);
      const res = await axios.post(`${API}/api/admin/popups/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data && res.data.success) {
        setFile(null);
        dispatch(fetchAdminPopups());
        setMsg("Uploaded popup image.");
        setMsgType("success");
        clearMsg(2500);
      } else {
        setMsg(res.data?.message || "Upload failed");
        setMsgType("error");
        clearMsg(4000);
      }
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || err.message || "Upload error");
      setMsgType("error");
      clearMsg(4000);
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleteLoading(true);
      const res = await axios.delete(`${API}/api/admin/popups/delete/${deleteId}`);
      if (res.data && res.data.success) {
        setMsg("Popup deleted");
        setMsgType("success");
        dispatch(fetchAdminPopups());
      } else {
        setMsg(res.data?.message || "Delete failed");
        setMsgType("error");
      }
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || err.message || "Delete error");
      setMsgType("error");
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
      setDeleteId(null);
      clearMsg(3000);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-lg border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Popups</h3>
          <p className="text-sm text-muted-foreground">Upload modal popups that appear on storefront.</p>
        </div>

        <div className="text-sm text-muted-foreground">{adminList.length} items</div>
      </div>

      {/* message banner */}
      {msg && (
        <div
          className={`mb-4 rounded-md px-3 py-2 text-sm ${
            msgType === "success"
              ? "bg-green-50 text-green-800 border border-green-100"
              : msgType === "error"
              ? "bg-rose-50 text-rose-800 border border-rose-100"
              : "bg-slate-50 text-slate-800 border border-slate-100"
          }`}
          role="status"
        >
          {msg}
        </div>
      )}

      {/* upload row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="w-full sm:w-auto"
          aria-label="Choose popup image"
        />
        <div className="flex gap-2">
          <Button onClick={upload} disabled={loading} className="inline-flex items-center gap-2">
            <UploadCloud className="mr-1" />
            {loading ? "Uploading..." : "Upload"}
          </Button>
          <Button
            onClick={() => setFile(null)}
            variant={undefined}
            className="px-3"
            aria-label="Reset upload"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* grid */}
      <div>
        {adminList && adminList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {adminList.map((p) => (
              <motion.article
                key={p._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-xl overflow-hidden shadow-sm border hover:shadow-md bg-slate-50"
              >
                <div className="group relative bg-gray-100">
                  <img
                    src={p.url}
                    alt={p.title || `popup-${p._id}`}
                    className="w-full h-28 object-cover transform group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    style={{ minHeight: 112 }}
                  />

                  {/* overlay with delete btn */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex items-start justify-end p-2">
                    <button
                      onClick={() => requestDelete(p._id)}
                      aria-label="Delete popup"
                      className="rounded-full bg-white/95 p-2 shadow hover:scale-105 transition-transform"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium truncate">{p.title || "Popup image"}</div>
                    <div className="text-xs text-muted-foreground">{p.active ? "Active" : "Inactive"}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 truncate">
                    {p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="p-4 text-sm text-muted-foreground">No popups uploaded yet.</div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby="popup-confirm-title"
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => !deleteLoading && setConfirmOpen(false)} />

          <div className="relative z-10 max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border">
            <div className="flex items-start gap-4 p-6 border-b">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h3 id="popup-confirm-title" className="text-lg font-semibold">Delete popup</h3>
                <p className="text-sm text-muted-foreground mt-1">Are you sure you want to delete this popup image? This action cannot be undone.</p>

                <div className="mt-6 flex items-center gap-3 justify-end">
                  <button
                    onClick={() => !deleteLoading && setConfirmOpen(false)}
                    disabled={deleteLoading}
                    className="px-4 py-2 rounded-md bg-white border hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleteLoading}
                    className="px-4 py-2 rounded-md bg-rose-600 text-white shadow hover:brightness-95"
                  >
                    {deleteLoading ? "Working..." : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
