import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import api from "@/api/axios";
import { Eye } from "lucide-react";
import { useSelector } from "react-redux";
import ConfirmDialog from "@/components/ui/confirm-dialog";

function shortText(txt, len = 80) {
  if (!txt) return "";
  return txt.length > len ? txt.slice(0, len) + "..." : txt;
}

const isTodayLocal = (dateStr) => {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  } catch {
    return false;
  }
};

export default function AdminReviewsView() {
  const { user } = useSelector((s) => s.auth || {});
  const isAdmin = Boolean(user?.role === 'admin' || user?.role === 'superadmin' || user?.isAdmin);


  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);


  const [viewOpen, setViewOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);


  const [replyText, setReplyText] = useState("");
  const [replySaving, setReplySaving] = useState(false);


  const [showTodayOnly, setShowTodayOnly] = useState(true);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchReviews({ today: showTodayOnly });

  }, [showTodayOnly]);

  async function fetchReviews(opts = {}) {
    try {
      setIsLoading(true);
      setError(null);
      const params = {};
      if (opts.today) params.today = true;
      if (opts.date) params.date = opts.date;
      const resp = await api.get("api/admin/reviews/get", { params });
      if (resp?.data?.success) {
        setReviews(resp.data.data || []);
      } else {
        setReviews([]);
        setError(resp?.data?.message || "Failed to load reviews");
      }
    } catch (e) {
      console.error("fetchReviews error:", e);
      setError("Failed to fetch reviews");
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }


  function openViewDialog(review) {
    setViewTarget(review);
    setReplyText(""); 
    setViewOpen(true);
  }

  function closeViewDialog() {
    setViewOpen(false);
    setViewTarget(null);
    setReplyText("");
    setReplySaving(false);
  }

  async function createReply() {
    if (!viewTarget) return;
    if (!replyText.trim()) {
      alert("Reply cannot be empty");
      return;
    }
    try {
      setReplySaving(true);
      const resp = await api.post(`api/admin/reviews/${viewTarget._id}/reply`, { replyText: replyText.trim() });
      if (!resp?.data?.success) {
        console.error("create reply failed", resp?.data);
        alert("Failed to create reply");
      } else {
        const updated = resp.data.data;
        setReviews((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
        setViewTarget(updated);
        setReplyText("");
      }
    } catch (e) {
      console.error("createReply error", e);
      alert("Error creating reply");
    } finally {
      setReplySaving(false);
    }
  }

  async function deleteReply() {
    if (!viewTarget || !viewTarget._id) return;
    try {
      const resp = await api.delete(`api/admin/reviews/${viewTarget._id}/reply`);
      if (!resp?.data?.success) {
        console.error("delete failed", resp?.data);
        alert("Failed to delete reply");
      } else {
        const updated = resp.data.data;
  
        setReviews((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
  
        setViewTarget((prev) => (prev ? { ...prev, adminReply: undefined } : prev));
        setReplyText("");
      }
    } catch (e) {
      console.error("deleteReply error", e);
      alert("Failed to delete reply");
    }
  }

  function handleAll() {
    setDateFilter("");
    setShowTodayOnly(false);
  }
  function handleToday() {
    setDateFilter("");
    setShowTodayOnly(true);
  }
  function handleDateChange(e) {
    const d = e.target.value;
    setDateFilter(d);
    if (d) {
      setShowTodayOnly(false);
      fetchReviews({ date: d });
    } else {
      fetchReviews({ today: showTodayOnly });
    }
  }

  const displayCount = reviews?.length ?? 0;

  return (
    <Card className="w-full">
      <CardHeader className="flex items-start justify-between gap-4">
        <div>
          <CardTitle className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Product Reviews</CardTitle>
          <div className="text-sm text-slate-500">Newest reviews — click View to manage reply</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-sm text-slate-500">
            {showTodayOnly ? "Showing: Today" : "Showing: All"} • {displayCount}
          </div>

          <div className="inline-flex rounded-md border overflow-hidden">
            <button
              onClick={handleToday}
              className={`px-3 py-1 text-sm font-medium transition ${showTodayOnly ? "bg-[#08665F] text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              Today
            </button>
            <button
              onClick={handleAll}
              className={`px-3 py-1 text-sm font-medium transition ${!showTodayOnly ? "bg-[#08665F] text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              All
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="bg-white/50">
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`sk-${i}`} className="animate-pulse">
                    <TableCell><div className="h-4 w-36 rounded bg-slate-200" /></TableCell>
                    <TableCell><div className="h-4 w-48 rounded bg-slate-200" /></TableCell>
                    <TableCell><div className="h-8 w-24 rounded bg-slate-200" /></TableCell>
                    <TableCell><div className="h-4 w-12 rounded bg-slate-200" /></TableCell>
                    <TableCell><div className="h-4 w-72 rounded bg-slate-200" /></TableCell>
                    <TableCell><div className="h-8 w-24 rounded bg-slate-200" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-rose-600">{error}</TableCell>
                </TableRow>
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No reviews found</TableCell>
                </TableRow>
              ) : (
                reviews.map((r) => {
                  const today = isTodayLocal(r.createdAt);
                  const replied = Boolean(r?.adminReply?.text);

                  return (
                    <TableRow key={r._id} className={`group transition-colors duration-300 ${today ? "bg-amber-50 hover:bg-amber-50" : ""}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{new Date(r.createdAt).toLocaleString()}</span>
                          {today && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Today</span>}
                        </div>
                      </TableCell>

                      <TableCell className="text-sm flex items-center gap-2">
                        {r.product?.title || "—"}
                        {replied ? <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Replied</span> : null}
                      </TableCell>

                      <TableCell className="text-sm">{r.userName || r.userId || "Anonymous"}</TableCell>
                      <TableCell className="text-sm">{r.reviewValue ?? "—"}</TableCell>

                      <TableCell>
                        <div className="max-w-[320px] truncate text-sm" title={r.reviewMessage}>
                          {shortText(r.reviewMessage || "", 140)}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Button size="sm" onClick={() => openViewDialog(r)} aria-label={`View review ${r._id}`}>
                            <Eye size={14} /> View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={viewOpen} onOpenChange={(open) => { if (!open) closeViewDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review details</DialogTitle>
          </DialogHeader>

          {viewTarget ? (
            <div className="p-4 space-y-4">
              <div className="text-sm text-slate-500"><strong>Date:</strong> {new Date(viewTarget.createdAt).toLocaleString()}</div>
              <div className="text-sm"><strong>Product:</strong> {viewTarget.product?.title || `— (id: ${viewTarget.productId})`}</div>
              <div className="text-sm"><strong>User:</strong> {viewTarget.userName || viewTarget.userId || '—'}</div>
              <div className="text-sm"><strong>Rating:</strong> {viewTarget.reviewValue ?? '—'}</div>

              <div>
                <strong>Message:</strong>
                <div className="mt-2 whitespace-pre-wrap p-3 border rounded bg-white/5">{viewTarget.reviewMessage || '—'}</div>
              </div>

              <div>
                <strong>Admin reply:</strong>
                {viewTarget.adminReply?.text ? (
                  <div className="mt-2 p-3 rounded bg-slate-50 border">
                    <div className="text-sm text-slate-800">{viewTarget.adminReply.text}</div>
                    <div className="text-xs text-slate-500 mt-2">
                      Replied by: {viewTarget.adminReply.repliedBy || 'admin'} — {viewTarget.adminReply.repliedAt ? new Date(viewTarget.adminReply.repliedAt).toLocaleString() : ''}
                      {viewTarget.adminReply.editedAt ? ` (edited: ${new Date(viewTarget.adminReply.editedAt).toLocaleString()})` : ''}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-slate-500">No admin reply yet.</div>
                )}
              </div>

              {isAdmin && (
                <div className="mt-3 space-y-2">
                  {viewTarget.adminReply?.text ? (

                    <div className="flex gap-2 justify-end">
                      <Button variant="destructive" onClick={deleteReply} disabled={replySaving}>Delete Replay</Button>
                      <Button variant="outline" onClick={closeViewDialog}>Close</Button>
                    </div>
                  ) : (
        
                    <>
                      <label className="block text-sm font-medium">Write reply</label>
                      <textarea
                        className="w-full p-3 border rounded"
                        rows={5}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply here..."
                        aria-label="Admin reply textarea"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => setReplyText("")} disabled={replySaving}>Clear</Button>
                        <Button onClick={createReply} disabled={replySaving}>{replySaving ? "Sending..." : "Send Reply"}</Button>
                        <Button variant="outline" onClick={closeViewDialog}>Close</Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">Loading...</div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
