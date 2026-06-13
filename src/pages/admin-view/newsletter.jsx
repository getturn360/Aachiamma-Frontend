import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { SearchIcon } from "lucide-react";
import { useSelector } from "react-redux";
import api from "@/api/axios";


function IconSend(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20 1-7 7-13z" />
      <path d="M11 13l-7 1 7-1z" />
    </svg>
  );
}

const Header = ({ search, handleSearchChange }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 className=" ">Newsletter</h1>
      <p className="text-sm text-slate-500 mt-1">Manage subscribers and send newsletters — minimal, focused UI.</p>
    </div>

    <div className="flex items-center gap-3">
      <div className="sm:hidden w-full relative">
        <SearchIcon aria-hidden="true" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          aria-label="Search subscribers"
          className="pl-9 pr-3 py-2 rounded-md border w-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
          placeholder="Search email or name"
          value={search}
          onChange={handleSearchChange}
        />
      </div>
    </div>
  </div>
);

const TopNotification = ({ notification, setNotification }) => {
  if (!notification) return null;
  return (
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
  );
};

const SkeletonRows = ({ rows = 6 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid grid-cols-12 gap-2 items-center animate-pulse">
        <div className="col-span-4 h-6 bg-slate-200 rounded" />
        <div className="col-span-3 h-6 bg-slate-200 rounded" />
        <div className="col-span-2 h-6 bg-slate-200 rounded" />
        <div className="col-span-1 h-6 bg-slate-200 rounded" />
        <div className="col-span-2 h-6 bg-slate-200 rounded" />
      </div>
    ))}
  </div>
);

export default function AdminNewsletter() {
  const { toast } = useToast();


  const token = useSelector((s) => (s.auth ? s.auth.token : null));

  const [subscribers, setSubscribers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("<p>Hi there! This is an offer from Aachiamma Foods.</p>");
  const [sending, setSending] = useState(false);

  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [notification, setNotification] = useState(null);

  const [pendingUnsubscribe, setPendingUnsubscribe] = useState(null);
  const confirmCancelRef = useRef(null);
  const confirmPrimaryRef = useRef(null);

  const searchDebounceRef = useRef(null);

  useEffect(() => {
    fetchSubscribers();
 
  }, [page]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4500);
    return () => clearTimeout(t);
  }, [notification]);


  const ensureAuth = () => {
    if (!token) {
      setNotification({ type: "error", title: "Not authenticated", message: "Please login as admin/superadmin to access this page." });
      return false;
    }
    return true;
  };

  async function fetchSubscribers(searchParam) {
    if (!ensureAuth()) return;
    setLoading(true);
    try {
      const q = typeof searchParam !== "undefined" ? searchParam : search;
      const res = await api.get("/api/admin/newsletter", {
        params: { search: q, page, limit },
        skipGlobalLoader: true,
        validateStatus: (status) => status < 500,
      });

      if (res.status === 401 || res.status === 403) {
        setNotification({ type: "error", title: "Unauthorized", message: "You are not authorized — please login." });
        setSubscribers([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      const data = res.data;

      if (data?.success) {
        const items = (data.data && data.data.items) || [];
        const totalCount = (data.data && data.data.total) || 0;
        setSubscribers(items);
        setTotal(totalCount);
      } else {
        setNotification({ type: "error", title: "Could not fetch subscribers", message: data?.message || "Server returned an error." });
      }
    } catch (e) {
      console.error("[newsletter.jsx] Error:", e);
      setNotification({ type: "error", title: "Network error while fetching", message: e?.message || String(e) });
    } finally {
      setLoading(false);
    }
  }

  function handleSearchChange(e) {
    const v = e.target.value;
    setSearch(v);
    setPage(1);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchSubscribers(v);
      searchDebounceRef.current = null;
    }, 200);
  }

  async function handleSend({ testEmail, recipientsAll } = {}) {
    if (!ensureAuth()) return;
    setSending(true);
    try {
      const body = {
        subject,
        html,
        recipients: testEmail && testEmail.length ? testEmail : undefined,
        recipientsAll: !!recipientsAll,
      };

      const res = await api.post("/api/admin/newsletter/send", body, {
        skipGlobalLoader: true,
        validateStatus: (status) => status < 500,
      });

      if (res.status === 401 || res.status === 403) {
        setNotification({ type: "error", title: "Unauthorized", message: "You are not authorized — please login." });
        return;
      }

      const data = res.data;
      if (data?.success) {
        setNotification({ type: "success", title: "Sent", message: data.message || "Newsletter sent." });
      } else {
        setNotification({ type: "error", title: "Send failed", message: data?.message || "Failed to send newsletter." });
      }
    } catch (err) {
      console.error("[newsletter.jsx] Error:", err);
      setNotification({ type: "error", title: "Network error while sending", message: String(err) });
    } finally {
      setSending(false);
    }
  }

  function openUnsubscribeModal(sub) {
    setPendingUnsubscribe(sub);
  }

  function closeUnsubscribeModal() {
    setPendingUnsubscribe(null);
  }

  useEffect(() => {
    if (pendingUnsubscribe) {
      setTimeout(() => {
        if (confirmCancelRef.current) confirmCancelRef.current.focus();
      }, 30);
    }
  }, [pendingUnsubscribe]);

  async function confirmUnsubscribe() {
    if (!ensureAuth()) return;
    const sub = pendingUnsubscribe;
    if (!sub) return;
    setActionLoadingId(sub._id);
    try {
      const res = await api.patch(`/api/admin/newsletter/${sub._id}/unsubscribe`, null, {
        skipGlobalLoader: true,
        validateStatus: (status) => status < 500,
      });

      if (res.status === 401 || res.status === 403) {
        setNotification({ type: "error", title: "Unauthorized", message: "You are not authorized — please login." });
        setActionLoadingId(null);
        closeUnsubscribeModal();
        return;
      }

      const data = res.data;
      if (data?.success) {
        setNotification({ type: "success", title: "Unsubscribed", message: data.message || `${sub.email} was unsubscribed.` });
        fetchSubscribers();
      } else {
        setNotification({ type: "error", title: "Unsubscribe failed", message: data?.message || "Server returned an error." });
      }
    } catch (err) {
      console.error("[newsletter.jsx] Error:", err);
      setNotification({ type: "error", title: "Network error", message: String(err) });
    } finally {
      setActionLoadingId(null);
      closeUnsubscribeModal();
    }
  }

  async function handleActivate(sub) {
    if (!ensureAuth()) return;
    if (!window.confirm(`Re-activate ${sub.email}?`)) return;
    setActionLoadingId(sub._id);
    try {
      const res = await api.patch(`/api/admin/newsletter/${sub._id}/activate`, null, {
        skipGlobalLoader: true,
        validateStatus: (status) => status < 500,
      });

      if (res.status === 401 || res.status === 403) {
        setNotification({ type: "error", title: "Unauthorized", message: "You are not authorized — please login." });
        setActionLoadingId(null);
        return;
      }

      const data = res.data;
      if (data?.success) {
        setNotification({ type: "success", title: "Activated", message: data.message || `${sub.email} re-activated.` });
        fetchSubscribers();
      } else {
        setNotification({ type: "error", title: "Activate failed", message: data?.message || "Server returned an error." });
      }
    } catch (err) {
      console.error("[newsletter.jsx] Error:", err);
      setNotification({ type: "error", title: "Network error", message: String(err) });
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="p-4">
      <Header search={search} handleSearchChange={handleSearchChange} />

      <TopNotification notification={notification} setNotification={setNotification} />

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-12 gap-2 text-sm font-medium border-b pb-2 mb-3 text-slate-600">
          <div className="col-span-4">Email</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Subscribed At</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        {loading ? (
          <SkeletonRows />
        ) : subscribers.length === 0 ? (
          <div className="py-8 text-center text-slate-500">No subscribers yet.</div>
        ) : (
          <div className="divide-y">
            {subscribers.map((s) => (
              <div
                key={s._id}
                className="grid grid-cols-12 gap-2 items-center py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="col-span-4 break-all">{s.email}</div>
                <div className="col-span-3 text-sm text-slate-700">{s.name || "—"}</div>
                <div className="col-span-2 text-sm text-slate-600">
                  {s.subscribedAt ? new Date(s.subscribedAt).toLocaleString() : "—"}
                </div>
                <div className="col-span-1 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.unsubscribed ? "bg-rose-100 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {s.unsubscribed ? "Unsubscribed" : "Subscribed"}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-center gap-2">
                  {!s.unsubscribed ? (
                    <Button
                      variant="destructive"
                      onClick={() => openUnsubscribeModal(s)}
                      disabled={actionLoadingId === s._id}
                      className="px-3 py-1"
                    >
                      {actionLoadingId === s._id ? "..." : "Unsubscribe"}
                    </Button>

                  ) : (
                    <Button
                      onClick={() => handleActivate(s)}
                      disabled={actionLoadingId === s._id}
                      className="px-3 py-1 bg-slate-50 text-slate-800 hover:bg-slate-100"
                    >
                      {actionLoadingId === s._id ? "..." : "Activate"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-600">{`Showing ${subscribers.length} of ${total || 0}`}</div>
          <div className="flex items-center gap-2">
            <Button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
            <div className="px-3 text-sm">Page {page}</div>
            <Button disabled={subscribers.length < limit} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </div>

      {/* send card */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Send Newsletter</h3>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleSend({ recipientsAll: true })}
              disabled={sending}
              className="flex items-center gap-2"
              aria-busy={sending}
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
                    <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>Sending…</span>
                </span>
              ) : (
                <>
                  <IconSend /> <span>Send to All</span>
                </>
              )}
            </Button>

          </div>
        </div>

        <div className="space-y-3">
          <input
            className="w-full border rounded-md px-3 py-2"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea
            className="w-full border rounded-md px-3 py-2 min-h-[140px]"
            rows={6}
            value={html}
            onChange={(e) => setHtml(e.target.value)}
          />
          <div className="text-xs text-slate-500">Sending uses server SMTP. For large lists, batch sends.</div>
        </div>
      </div>

      {pendingUnsubscribe && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="unsubscribe-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
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
                  <h3 id="unsubscribe-title" className="text-lg font-semibold">Unsubscribe user?</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    Are you sure you want to unsubscribe <span className="font-medium">{pendingUnsubscribe.email}</span>? They will be marked as unsubscribed and won't receive future newsletters.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 flex items-center justify-end gap-3">
              <Button
                ref={confirmCancelRef}
                onClick={closeUnsubscribeModal}
                className="bg-white text-slate-800 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                ref={confirmPrimaryRef}
                onClick={confirmUnsubscribe}
                className="bg-rose-600 text-white hover:bg-rose-700"
                disabled={actionLoadingId === (pendingUnsubscribe && pendingUnsubscribe._id)}
              >
                {actionLoadingId === (pendingUnsubscribe && pendingUnsubscribe._id) ? "..." : "Unsubscribe"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
