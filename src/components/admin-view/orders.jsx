import React, { useEffect, useRef, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Tooltip } from "../ui/tooltip";

import { Eye, Clipboard, Calendar, Trash2 } from "lucide-react";

import AdminOrderDetailsView from "./order-details";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
  deleteOrderForAdmin,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";
import api from "@/api/axios";

const INVOICE_SUFFIX_LENGTH = 5;


function statusVariant(status) {
  switch (status) {
    case "confirmed":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-rose-100 text-rose-800";
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "inProcess":
      return "bg-blue-100 text-blue-800";
    case "inShipping":
      return "bg-indigo-100 text-indigo-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

/* Date helpers (unchanged) */
const getNow = () => {
  try {
    if (typeof window !== "undefined" && window.SERVER_NOW_ISO) {
      const d = new Date(window.SERVER_NOW_ISO);
      if (!isNaN(d.getTime())) return d;
    }
  } catch {}
  return new Date();
};

const getTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
};

const formatDateYMD = (date, timeZone) => {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone,
    }).format(new Date(date));
  } catch {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
};

const isSameLocalDay = (dateA, dateB) => {
  if (!dateA || !dateB) return false;
  const tz = getTimeZone();
  const fa = formatDateYMD(dateA, tz);
  const fb = formatDateYMD(dateB, tz);
  return fa === fb;
};

const isToday = (dateStr) => {
  if (!dateStr) return false;
  const now = getNow();
  return isSameLocalDay(dateStr, now.toISOString());
};


const getInvoiceNumber = (order, invoiceSettings = {}) => {
  if (!order) return "";

  const stripSeparators = (s) => {
    if (s === null || s === undefined) return "";
    return String(s).replace(/[\s\-]+/g, "");
  };

  if (order.invoiceNo) return stripSeparators(order.invoiceNo);

  if (typeof order.invoiceNumber === "number" || (order.invoiceNumber && !isNaN(Number(order.invoiceNumber)))) {
    const digits = Number(invoiceSettings?.invoiceDigits ?? 5);
    const prefix = invoiceSettings?.invoicePrefix || order.invoicePrefix || "INV";
    const num = Number(order.invoiceNumber || 0);
    const padded = String(num).padStart(digits, "0");
    return `${stripSeparators(prefix)}${padded}`;
  }

  if (order.invoice_id) return stripSeparators(order.invoice_id);
  if (order.invoiceNumber) return stripSeparators(order.invoiceNumber);
  if (order.invoiceNo) return stripSeparators(order.invoiceNo);

  const prefix = stripSeparators(invoiceSettings?.invoicePrefix || order.invoicePrefix || "INV");
  const id = String(order._id || "");
  const suffix = id.slice(-6);
  return `${prefix}${suffix}`;
};


export default function AdminOrdersView() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { orderList, orderDetails, invoiceSettings, totalPages, currentPage } = useSelector((state) => state.adminOrder);
  const [page, setPage] = useState(1);
  const { user } = useSelector((state) => state.auth || {});
  const isSuperAdmin = user?.role !== "admin";

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [copySuccess, setCopySuccess] = useState(null);


  const [showTodayOnly, setShowTodayOnly] = useState(true);

  const prefetchedIds = useRef(new Set());

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [invoiceFromSuffix, setInvoiceFromSuffix] = useState("");
  const [invoiceToSuffix, setInvoiceToSuffix] = useState("");
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);

  const [downloadingIds, setDownloadingIds] = useState([]); 

  useEffect(() => {
    dispatch(getAllOrdersForAdmin({ page, limit: 20 }));
  }, [dispatch, page]);

  useEffect(() => {
    if (
      orderDetails !== null &&
      selectedOrderId &&
      (String(orderDetails?._id || orderDetails?.id) === String(selectedOrderId))
    ) {
      setOpenDetailsDialog(true);
    }
  }, [orderDetails, selectedOrderId]);

  function handleFetchOrderDetails(id) {
    if (!id) return;
    setSelectedOrderId(id);
    dispatch(getOrderDetailsForAdmin(id));
  }

  function closeDialog() {
    setOpenDetailsDialog(false);
    setSelectedOrderId(null);
    dispatch(resetOrderDetails());
  }

  async function copyInvoiceNumberToClipboard(invNumber, id) {
    if (!invNumber) return;
    try {
      await navigator.clipboard.writeText(invNumber);
      setSelectedOrderId(id);
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(null), 1500);
    } catch {
      setSelectedOrderId(id);
      setCopySuccess("Failed");
      setTimeout(() => setCopySuccess(null), 1500);
    }
  }

  const isLoading = !orderList;

  const handlePrefetchOnHover = (id) => {
    if (!id) return;
    if (prefetchedIds.current.has(String(id))) return;
    prefetchedIds.current.add(String(id));
    dispatch(getOrderDetailsForAdmin(id)).catch(() => {});
  };

  const sortedOrders = useMemo(() => {
    if (!orderList || !Array.isArray(orderList)) return [];
    return [...orderList].sort((a, b) => {
      const da = a?.orderDate ? new Date(a.orderDate).getTime() : 0;
      const db = b?.orderDate ? new Date(b.orderDate).getTime() : 0;
      if (da !== db) return db - da;
      const ida = String(a?._id ?? "");
      const idb = String(b?._id ?? "");
      if (ida < idb) return 1;
      if (ida > idb) return -1;
      return 0;
    });
  }, [orderList]);

  const displayOrders = useMemo(() => {
    if (!sortedOrders) return [];
    return showTodayOnly ? sortedOrders.filter((o) => isToday(o?.orderDate)) : sortedOrders;
  }, [sortedOrders, showTodayOnly]);

  const exportTodayAsCSV = async () => {
    try {
      const resp = await fetch("/api/admin/orders/export?today=true", {
        method: "GET",
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => null);
        toast({
          title: "Export failed",
          description: err?.message || "No orders to export today.",
          variant: "destructive",
        });
        return;
      }

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(new Blob([blob], { type: "text/csv;charset=utf-8;" }));
      const a = document.createElement("a");
      a.href = url;

      let filename = `orders_today.csv`;
      const cd = resp.headers.get("content-disposition");
      if (cd) {
        const m = cd.match(/filename="?(.+?)"?($|;)/);
        if (m && m[1]) filename = m[1];
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: "Today's orders have been exported.",
      });
    } catch (err) {
      console.error("Export today error:", err);
      toast({
        title: "Export error",
        description: err?.message || "Something went wrong while exporting.",
        variant: "destructive",
      });
    }
  };

  const exportRangeAsCSV = async () => {
    if (!fromDate || !toDate) {
      toast({
        title: "Validation Error",
        description: "Please select both From and To dates.",
        variant: "destructive",
      });
      return;
    }
    const from = new Date(`${fromDate}T00:00:00`);
    const to = new Date(`${toDate}T23:59:59.999`);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      toast({
        title: "Validation Error",
        description: "Invalid date range.",
        variant: "destructive",
      });
      return;
    }
    if (from > to) {
      toast({
        title: "Validation Error",
        description: "From date cannot be after To date.",
        variant: "destructive",
      });
      return;
    }

    try {
      const resp = await fetch(`/api/admin/orders/export?fromDate=${fromDate}&toDate=${toDate}`, {
        method: "GET",
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => null);
        toast({
          title: "Export failed",
          description: err?.message || "No orders found in this date range.",
          variant: "destructive",
        });
        return;
      }

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(new Blob([blob], { type: "text/csv;charset=utf-8;" }));
      const a = document.createElement("a");
      a.href = url;

      let filename = `orders_${fromDate}_to_${toDate}.csv`;
      const cd = resp.headers.get("content-disposition");
      if (cd) {
        const m = cd.match(/filename="?(.+?)"?($|;)/);
        if (m && m[1]) filename = m[1];
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Orders from ${fromDate} to ${toDate} have been exported.`,
      });
    } catch (err) {
      console.error("Export range error:", err);
      toast({
        title: "Export error",
        description: err?.message || "Something went wrong while exporting.",
        variant: "destructive",
      });
    }
  };

  const countOrdersInRange = useMemo(() => {
    if (!fromDate || !toDate || !Array.isArray(sortedOrders)) return 0;
    const from = new Date(`${fromDate}T00:00:00`);
    const to = new Date(`${toDate}T23:59:59.999`);
    if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) return 0;
    return sortedOrders.reduce((acc, o) => {
      if (!o?.orderDate) return acc;
      const d = new Date(o.orderDate);
      if (d.getTime() >= from.getTime() && d.getTime() <= to.getTime()) return acc + 1;
      return acc;
    }, 0);
  }, [fromDate, toDate, sortedOrders]);

  const isDownloading = (orderId) => downloadingIds.includes(String(orderId));

  const startDownloading = (orderId) => {
    setDownloadingIds((prev) => {
      const s = Array.from(new Set([...prev, String(orderId)]));
      return s;
    });
  };

  const finishDownloading = (orderId) => {
    setDownloadingIds((prev) => prev.filter((i) => i !== String(orderId)));
  };

  const handleDownloadInvoice = async (orderId) => {
    if (!orderId) return;
    startDownloading(orderId);
    try {
      const response = await api.get(`/api/admin/invoice/download/${orderId}`, {
        responseType: "blob",
        skipGlobalLoader: true,
      });

      const contentType = response?.headers?.["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = await response.data.text();
        let message = "Unable to download invoice";
        try {
          message = JSON.parse(text)?.message || message;
        } catch (_) {}
        toast({ title: "Download failed", description: message, variant: "destructive" });
        return;
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      let filename = `invoice_${orderId}.pdf`;
      const cd = response.headers?.["content-disposition"];
      if (cd) {
        const m = String(cd).match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
        if (m && m[1]) filename = decodeURIComponent(m[1]);
      }

      const urlObj = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlObj;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlObj);
    } catch (err) {
      console.error("download invoice error", err);
      let description = "Failed to download invoice. Please try again.";
      try {
        if (err?.response?.data instanceof Blob) {
          const text = await err.response.data.text();
          const data = JSON.parse(text);
          if (data?.message) description = data.message;
        } else if (err?.response?.data?.message) {
          description = err.response.data.message;
        }
      } catch (_) {
        // keep default
      }
      toast({
        title: "Download failed",
        description,
        variant: "destructive",
      });
    } finally {
      finishDownloading(orderId);
    }
  };

  const invoiceSuffixForOrder = (order) => {
    try {
      const displayInvoice = getInvoiceNumber(order, invoiceSettings) || "";
      const normalized = String(displayInvoice).replace(/[^0-9A-Za-z]+/g, "");
      return normalized.slice(-INVOICE_SUFFIX_LENGTH);
    } catch {
      return "";
    }
  };

  const findOrdersByInvoiceSuffixRange = (fromSuffix, toSuffix) => {
    if (!Array.isArray(sortedOrders) || !fromSuffix || !toSuffix) return [];
    const f = String(fromSuffix).replace(/[^0-9A-Za-z]+/g, "").toUpperCase();
    const t = String(toSuffix).replace(/[^0-9A-Za-z]+/g, "").toUpperCase();
    if (!f || !t) return [];
    const low = f <= t ? f : t;
    const high = f <= t ? t : f;
    return sortedOrders.filter((o) => {
      const s = (invoiceSuffixForOrder(o) || "").toUpperCase();
      return s >= low && s <= high;
    });
  };

  const downloadMergedInvoicesForSuffixRange = async () => {
    if (!invoiceFromSuffix || !invoiceToSuffix) {
      toast({
        title: "Validation Error",
        description: `Please enter both Invoice From and Invoice To (last ${INVOICE_SUFFIX_LENGTH} chars).`,
        variant: "destructive",
      });
      return;
    }

    const matches = findOrdersByInvoiceSuffixRange(invoiceFromSuffix, invoiceToSuffix);
    if (!matches.length) {
      toast({
        title: "No matches found",
        description: "No orders found for the provided invoice suffix range.",
        variant: "destructive",
      });
      return;
    }

    const orderIds = matches.map((o) => String(o._id));
    setIsBulkDownloading(true);
    try {
      const res = await api.post(
        "/api/admin/invoice/bulk-download",
        { orderIds, singlePdf: true },
        { responseType: "blob", skipGlobalLoader: true }
      );

      const blob = new Blob([res.data], { type: res.headers?.["content-type"] || "application/pdf" });
      let filename = `invoices_${invoiceFromSuffix}_to_${invoiceToSuffix}.pdf`;
      const cd = res.headers?.["content-disposition"];
      if (cd) {
        const m = String(cd).match(/filename="?(.+?)"?($|;)/);
        if (m && m[1]) filename = m[1];
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("download merged invoices error", err);
      toast({
        title: "Download error",
        description: "Failed to download merged invoices. See console for details.",
        variant: "destructive",
      });
    } finally {
      setIsBulkDownloading(false);
    }
  };

  return (
    <Card className="w-full">

      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-xl md:text-2xl font-semibold truncate">
            All Orders
          </CardTitle>

          <div className="mt-1 text-sm text-slate-500 block md:hidden">
            {showTodayOnly ? "Showing: Today" : "Showing: All"} • {displayOrders.length}
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-3 items-stretch md:items-center">
    
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto shrink-0">
            <div className="inline-flex h-9 rounded-md border border-slate-200 overflow-hidden w-full md:w-auto shrink-0 shadow-sm">
              <button
                onClick={() => setShowTodayOnly(true)}
                className={`flex-1 md:flex-none h-full px-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${showTodayOnly ? "bg-[#08665F] text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}
                aria-pressed={showTodayOnly}
                title="Show only today's orders"
              >
                Today
              </button>
              <button
                onClick={() => setShowTodayOnly(false)}
                className={`flex-1 md:flex-none h-full px-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${!showTodayOnly ? "bg-[#08665F] text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}
                aria-pressed={!showTodayOnly}
                title="Show all orders"
              >
                All
              </button>
            </div>

            <div className="hidden md:block text-sm text-slate-500 whitespace-nowrap">
              {showTodayOnly ? "Showing: Today" : "Showing: All"} • {displayOrders.length}
            </div>
          </div>

          <div className="flex gap-2 md:gap-3 items-center w-full md:w-auto flex-wrap md:bg-slate-50 md:rounded-lg md:px-3 md:py-1.5 md:border md:border-slate-100 md:shadow-sm">
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-9 border border-slate-200 rounded-md bg-white px-3 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08665F]/50 disabled:cursor-not-allowed disabled:opacity-50 w-full md:w-36 transition-colors duration-200 hover:border-slate-300"
                aria-label="Export from date"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-9 border border-slate-200 rounded-md bg-white px-3 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08665F]/50 disabled:cursor-not-allowed disabled:opacity-50 w-full md:w-36 transition-colors duration-200 hover:border-slate-300"
                aria-label="Export to date"
              />
            </div>

            <Button
              size="sm"
              onClick={exportRangeAsCSV}
              disabled={!fromDate || !toDate || new Date(fromDate) > new Date(toDate)}
              className="w-full md:w-auto"
              aria-label="Export selected date range to CSV"
            >
              Export Range
            </Button>

            <div className="hidden md:block text-xs text-muted-foreground ml-2">
              {fromDate && toDate ? `${countOrdersInRange} orders` : ""}
            </div>
          </div>


          <div className="flex gap-2 md:gap-3 items-center w-full md:w-auto flex-wrap md:bg-slate-50 md:rounded-lg md:px-3 md:py-1.5 md:border md:border-slate-100 md:shadow-sm">
            <div className="flex gap-2 w-full md:w-auto items-center">
              <input
                type="text"
                value={invoiceFromSuffix}
                onChange={(e) => setInvoiceFromSuffix(e.target.value.trim().slice(0, INVOICE_SUFFIX_LENGTH))}
                placeholder={`From (last ${INVOICE_SUFFIX_LENGTH})`}
                className="h-9 border border-slate-200 rounded-md bg-white px-3 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08665F]/50 disabled:cursor-not-allowed disabled:opacity-50 w-28 md:w-28 transition-colors duration-200 hover:border-slate-300"
                aria-label={`Invoice from suffix (last ${INVOICE_SUFFIX_LENGTH})`}
                maxLength={INVOICE_SUFFIX_LENGTH}
              />
              <input
                type="text"
                value={invoiceToSuffix}
                onChange={(e) => setInvoiceToSuffix(e.target.value.trim().slice(0, INVOICE_SUFFIX_LENGTH))}
                placeholder={`To (last ${INVOICE_SUFFIX_LENGTH})`}
                className="h-9 border border-slate-200 rounded-md bg-white px-3 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08665F]/50 disabled:cursor-not-allowed disabled:opacity-50 w-28 md:w-28 transition-colors duration-200 hover:border-slate-300"
                aria-label={`Invoice to suffix (last ${INVOICE_SUFFIX_LENGTH})`}
                maxLength={INVOICE_SUFFIX_LENGTH}
              />
            </div>

            <Button
              size="sm"
              onClick={downloadMergedInvoicesForSuffixRange}
              disabled={!invoiceFromSuffix || !invoiceToSuffix || isBulkDownloading}
              className="w-full md:w-auto"
            >
              {isBulkDownloading ? "Preparing..." : "Print Invoices (Range)"}
            </Button>

            <Button size="sm" onClick={exportTodayAsCSV} className="w-full md:w-auto">
              Export Today's Orders
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-full sm:min-w-[760px]">
            <TableHeader>
              <TableRow className="bg-white/50">
                <TableHead>Invoice #</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead className="text-right">Order Price</TableHead>
                <TableHead>
                  <span className="sr-only">Details</span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`} className="animate-pulse">
                    <TableCell>
                      <div className="h-4 w-36 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-24 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-20 rounded bg-slate-200 ml-auto" />
                    </TableCell>
                    <TableCell>
                      <div className="h-8 w-24 rounded bg-slate-200" />
                    </TableCell>
                  </TableRow>
                ))
              ) : displayOrders && displayOrders.length > 0 ? (
                displayOrders.map((orderItem) => {
                  const id = orderItem?._id;
                  const invoiceNumber = getInvoiceNumber(orderItem, invoiceSettings);
                  const date = orderItem?.orderDate
                    ? new Date(orderItem.orderDate).toLocaleDateString()
                    : "-";
                  const price =
                    typeof orderItem?.totalAmount === "number"
                      ? orderItem.totalAmount.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 2,
                      })
                      : `₹${orderItem?.totalAmount ?? "-"}`;

                  const today = isToday(orderItem?.orderDate);
                  const downloading = isDownloading(id);

                  return (
                    <motion.tr
                      layout
                      key={id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`group transition-colors duration-300 ${today ? "bg-amber-50 border-l-4 border-amber-300" : "hover:bg-[#F2F2F2]"}`}
                    >
                      <TableCell className="flex items-center gap-3 min-w-0">
                        <div className="truncate max-w-[220px]">
                          <span className="block text-sm font-medium truncate">{invoiceNumber}</span>
                        </div>

                        <div className="ml-2 flex items-center gap-1 shrink-0">
                          <Tooltip text="Copy Invoice #">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Copy invoice ${invoiceNumber}`}
                              onClick={() => copyInvoiceNumberToClipboard(invoiceNumber, id)}
                              className="opacity-60 group-hover:opacity-100"
                            >
                              <Clipboard size={14} />
                            </Button>
                          </Tooltip>

                          {copySuccess && selectedOrderId === id && (
                            <span className="text-xs text-emerald-500">
                              {copySuccess}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span className="text-sm">{date}</span>
                          {today && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Today</span>}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div
                          onMouseEnter={() => handlePrefetchOnHover(id)}
                          onClick={() => handleFetchOrderDetails(id)}
                          role="button"
                          aria-label={`Open details for ${invoiceNumber}`}
                          className="inline-block"
                        >
                          <Tooltip text="Click to view / edit order">
                            <Badge
                              className={`py-1 px-3 rounded-full cursor-pointer ${statusVariant(
                                orderItem?.orderStatus
                              )}`}
                            >
                              <span className="capitalize text-sm">
                                {orderItem?.orderStatus ?? "-"}
                              </span>
                            </Badge>
                          </Tooltip>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-medium">{price}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <Button
                            onClick={() => { handleFetchOrderDetails(id); setOpenDetailsDialog(true); }}
                            size="sm"
                            className="inline-flex items-center gap-2"
                            aria-label={`View details for order ${invoiceNumber}`}
                          >
                            <Eye size={14} />
                            View
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleDownloadInvoice(id)}
                            className="inline-flex items-center gap-2"
                            aria-label={`Download invoice for ${invoiceNumber}`}
                            disabled={downloading || isBulkDownloading}
                          >
                            {downloading ? (
                              <>
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"></circle>
                                  <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                                </svg>
                                <span>Downloading…</span>
                              </>
                            ) : (
                              <>Download Invoice</>
                            )}
                          </Button>

                          {isSuperAdmin && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
                                try {
                                  await dispatch(deleteOrderForAdmin(id)).unwrap();
                                  toast({
                                    title: "Order deleted",
                                    description: "The order has been permanently deleted.",
                                  });
                                } catch (err) {
                                  console.error("Delete order failed", err);
                                  toast({
                                    title: "Delete failed",
                                    description: "Failed to delete order. See console.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="inline-flex items-center gap-2 text-rose-600"
                              aria-label={`Delete order ${invoiceNumber}`}
                            >
                              <Trash2 size={14} />
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>


        <div className="md:hidden space-y-3 px-3 py-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`mob-skel-${i}`}
                className="border rounded-lg p-3 animate-pulse bg-white/5"
              >
                <div className="h-4 w-3/4 rounded bg-slate-200 mb-2" />
                <div className="h-3 w-1/2 rounded bg-slate-200 mb-3" />
                <div className="h-8 w-full rounded bg-slate-200" />
              </div>
            ))
            : displayOrders && displayOrders.length > 0
              ? displayOrders.map((orderItem) => {
                const id = orderItem?._id;
                const invoiceNumber = getInvoiceNumber(orderItem, invoiceSettings);
                const date = orderItem?.orderDate
                  ? new Date(orderItem.orderDate).toLocaleDateString()
                  : "-";
                const price =
                  typeof orderItem?.totalAmount === "number"
                    ? orderItem.totalAmount.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 2,
                    })
                    : `₹${orderItem?.totalAmount ?? "-"}`;

                const today = isToday(orderItem?.orderDate);
                const downloading = isDownloading(id);

                return (
                  <div
                    key={`card-${id}`}
                    className={`border rounded-lg p-3 flex flex-col gap-3 ${today ? "bg-amber-50 border-l-4 border-amber-300" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate min-w-0">
                        <div className="text-sm font-medium truncate">{invoiceNumber}</div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <div className="text-sm font-semibold">{price}</div>
                        <span className="text-xs text-muted-foreground">{date}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div
                        onMouseEnter={() => handlePrefetchOnHover(id)}
                        onClick={() => handleFetchOrderDetails(id)}
                        role="button"
                        className="inline-block"
                        aria-label={`Open details for ${invoiceNumber}`}
                      >
                        <Badge className={`py-1 px-3 rounded-full cursor-pointer ${statusVariant(orderItem?.orderStatus)}`}>
                          <span className="capitalize text-sm">{orderItem?.orderStatus ?? "-"}</span>
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Tooltip text="Copy Invoice #">
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Copy invoice ${invoiceNumber}`}
                            onClick={() => copyInvoiceNumberToClipboard(invoiceNumber, id)}
                          >
                            <Clipboard size={14} />
                          </Button>
                        </Tooltip>

                        {copySuccess && selectedOrderId === id && (
                          <span className="text-xs text-emerald-500">{copySuccess}</span>
                        )}

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => { handleFetchOrderDetails(id); setOpenDetailsDialog(true); }}
                            size="sm"
                            className="inline-flex items-center gap-2"
                            aria-label={`View details for order ${invoiceNumber}`}
                          >
                            <Eye size={14} />
                            View
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleDownloadInvoice(id)}
                            disabled={downloading || isBulkDownloading}
                          >
                            {downloading ? (
                              <>
                                <svg className="h-4 w-4 animate-spin inline-block mr-2" viewBox="0 0 24 24" fill="none" aria-hidden>
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"></circle>
                                  <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                                </svg>
                                <span>Downloading…</span>
                              </>
                            ) : (
                              "Download Invoice"
                            )}
                          </Button>

                          {isSuperAdmin && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
                                try {
                                  await dispatch(deleteOrderForAdmin(id)).unwrap();
                                  toast({
                                    title: "Order deleted",
                                    description: "The order has been permanently deleted.",
                                  });
                                } catch (err) {
                                  console.error("Delete order failed", err);
                                  toast({
                                    title: "Delete failed",
                                    description: "Failed to delete order. See console.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
              : (
                <div className="py-6 text-center text-sm text-muted-foreground">No orders found.</div>
              )}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between p-4 bg-white/50 border-t border-slate-100">
          <div className="text-sm text-slate-500">
            Page {currentPage} of {totalPages || 1}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>

        <Dialog
          open={openDetailsDialog}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
        >
          <AdminOrderDetailsView
            orderDetails={orderDetails}
            selectedOrderId={selectedOrderId}
          />
        </Dialog>
      </CardContent>
    </Card>
  );
}
  