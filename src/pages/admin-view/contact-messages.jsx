// client/src/pages/admin-view/contact-messages.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({ address: "", phone: "", email: "" });
  const [editing, setEditing] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/contact-messages/get");
      if (res.data?.success) {
        setMessages(res.data.data || []);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("[contact-messages.jsx] Error:", err);
      toast.error("Failed to load messages");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get("/api/common/site-settings/get");
      if (res.data?.success) {
        setSettings(res.data.data || { address: "", phone: "", email: "" });
      }
    } catch (err) {
      console.error("[contact-messages.jsx] Error:", err);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    try {
      const res = await api.put("/api/admin/site-settings/update", settings);
      if (res.data?.success) {
        toast.success("Saved");
        setEditing(false);
      } else {
        toast.error("Failed to save");
      }
    } catch (err) {
      console.error("[contact-messages.jsx] Error:", err);
      toast.error("Server error");
    }
  };

  function requestDelete(id) {
    const found = messages.find((m) => m._id === id);
    setMessageToDelete({ id, name: found?.name, snippet: (found?.message || "").slice(0, 120) });
    setConfirmOpen(true);
  }

  async function handleConfirmedDelete() {
    if (!messageToDelete?.id) return;
    try {
      setDeleteLoading(true);
      const res = await api.delete(`/api/admin/contact-messages/delete/${messageToDelete.id}`);
      if (res.data?.success) {
        setMessages((m) => m.filter((x) => x._id !== messageToDelete.id));
        toast.success("Deleted");
      } else {
        toast.error("Unable to delete");
      }
    } catch (err) {
      console.error("[contact-messages.jsx] Error:", err);
      toast.error("Server error");
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
      setMessageToDelete(null);
    }
  }

  const isToday = (dateStr) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    } catch (err) {
      console.error("[contact-messages.jsx] Error:", err);
      return false;
    }
  };

  async function toggleRead(id) {
    const idx = messages.findIndex((m) => m._id === id);
    if (idx === -1) return;
    const currentlyRead = !!messages[idx].read;
    const newRead = !currentlyRead;
    const updatedMessage = { ...messages[idx], read: newRead };

    if (newRead) {
      
      setMessages([updatedMessage]);
    } else {

      setMessages((prev) => prev.map((m) => (m._id === id ? updatedMessage : m)));
    }

    try {
      await api.put(`/api/admin/contact-messages/mark-read/${id}`, { read: newRead });
    } catch (err) {
      console.error("[contact-messages.jsx] Error:", err);

      toast.error("Failed to update read status");
      fetchAll();
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Contact Messages</h2>
          <div className="text-sm text-gray-500">Messages submitted via contact form</div>
        </div>

        <div>
          {editing ? (
            <>
              <Button onClick={saveSettings} className="mr-2">
                Save
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>Edit contact info</Button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="rounded border p-4 bg-white w-full">
          <div className="text-sm text-gray-500 mb-2">Contact info (site)</div>

          {editing ? (
            <>
              <div className="mb-3">
                <label className="text-xs text-gray-500">Address</label>
                <Textarea
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                />
              </div>
              <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Phone</label>
                  <Input
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <Input
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-xs text-gray-400">Address</div>
              <div className="font-medium whitespace-pre-line">{settings.address}</div>

              <div className="mt-3 text-xs text-gray-400">Phone</div>
              <div className="font-medium">{settings.phone}</div>

              <div className="mt-3 text-xs text-gray-400">Email</div>
              <div className="font-medium">{settings.email}</div>
            </>
          )}
        </div>
      </div>

      <div className="rounded border p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">All messages</div>
          <div className="text-xs text-gray-400">{messages.length} messages</div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-sm text-gray-500">No messages yet</div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => {
              const unread = !m.read;
              const today = isToday(m.createdAt);
      
              const highlight = unread || today;
              return (
                <div
                  key={m._id}
                  className={`border rounded p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3 ${
                    highlight ? "bg-yellow-50/30 border-yellow-200" : "bg-white"
                  }`}
                  aria-live="polite"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-gray-500">
                          {m.email} • {m.phone}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 ml-4">{new Date(m.createdAt).toLocaleString()}</div>
                    </div>

                    <div className="mt-3 text-sm text-gray-700 whitespace-pre-line">{m.message}</div>

                    {m.meta && typeof m.meta === "object" && (
                      <div className="mt-2 text-xs text-gray-400">Meta: {JSON.stringify(m.meta)}</div>
                    )}
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-2">

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => requestDelete(m._id)}
                      className="whitespace-nowrap"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete message"
        description={
          messageToDelete?.name
            ? `Delete message from "${messageToDelete.name}"? This will remove the message permanently.`
            : "Delete this message permanently? This action cannot be undone."
        }
        onConfirm={handleConfirmedDelete}
        onCancel={() => {
          if (!deleteLoading) {
            setConfirmOpen(false);
            setMessageToDelete(null);
          }
        }}
        loading={deleteLoading}
      />
    </div>
  );
}

function ConfirmDialog({ open, title, description, onConfirm, onCancel, loading = false }) {
  const cancelRef = useRef(null);
  const dialogRef = useRef(null);

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

      <div
        ref={dialogRef}
        className="relative z-10 max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden border overflow-auto"
      >
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
                {loading ? "Deleting..." : "Delete message"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
