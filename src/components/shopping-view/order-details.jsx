import React, { useState } from "react";
import { useSelector } from "react-redux";
import { DialogContent, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import api from "@/api/axios";


function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth || {});
  const [isDownloading, setIsDownloading] = useState(false);

  const statusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "rejected":
        return "bg-rose-100 text-rose-800 border border-rose-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "inProcess":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "inShipping":
        return "bg-indigo-100 text-indigo-800 border border-indigo-200";
      case "delivered":
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-slate-100 text-slate-800 border border-slate-200";
    }
  };

  const fmtDate = (d) => (d ? d.split("T")[0] : "-");
  const fmtPrice = (p) => (p !== undefined && p !== null ? `₹${p}` : "₹0");

  async function handleDownloadInvoice() {
    if (!orderDetails?._id) return;
    setIsDownloading(true);
    try {
      const response = await api.get(`/api/invoices/download/${orderDetails._id}`, {
        responseType: "blob",
        skipGlobalLoader: true,
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const headerBytes = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
      const headerStr = String.fromCharCode(...headerBytes);
      if (!headerStr.startsWith("%PDF")) {
        console.error("Downloaded file does not look like a valid PDF (magic bytes):", headerStr);
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${orderDetails._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);
    } catch (e) {
      console.error("Download invoice error", e);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <DialogContent className="sm:max-w-[980px] bg-white rounded-2xl shadow-xl p-4 sm:p-6 max-h-[80vh] sm:max-h-none overflow-auto sm:overflow-visible">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="min-w-0">
          <DialogTitle className="text-base sm:text-lg font-semibold text-slate-900 truncate">Order #{orderDetails?._id || "-"}</DialogTitle>
          <p className="text-xs text-slate-500 mt-1">Placed on {fmtDate(orderDetails?.orderDate)}</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none flex items-center gap-2 justify-end">
            <Button
              onClick={handleDownloadInvoice}
              disabled={isDownloading || !orderDetails?._id}
              className="px-3 py-1.5 text-sm"
            >
              {isDownloading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"></circle>
                    <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                  </svg>
                  Downloading…
                </span>
              ) : (
                <span>Download Invoice</span>
              )}
            </Button>

            <span className={`inline-flex items-center py-1 px-3 rounded-full text-sm ${statusColor(orderDetails?.orderStatus)}`}>
              <span className="font-medium capitalize truncate">{orderDetails?.orderStatus || "unknown"}</span>
            </span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
    
        <aside className="md:col-span-1 order-1">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-slate-500">Order Info</div>
            <div className="mt-3 space-y-2 text-sm text-slate-800 break-words">
              <div>
                <span className="font-medium">Order ID:</span>
                <span className="ml-2 text-sm break-all">{orderDetails?._id || "-"}</span>
              </div>
              <div>
                <span className="font-medium">Date:</span>
                <span className="ml-2 text-sm">{fmtDate(orderDetails?.orderDate)}</span>
              </div>
              <div>
                <span className="font-medium">Payment:</span>
                <span className="ml-2 text-sm">{orderDetails?.paymentMethod || "-"}</span>
              </div>
              <div>
                <span className="font-medium">Payment Status:</span>
                <span className="ml-2 text-sm">{orderDetails?.paymentStatus || "-"}</span>
              </div>
              <div>
                <span className="font-medium">Items:</span>
                <span className="ml-2 text-sm">{orderDetails?.cartItems?.length ?? 0}</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="md:col-span-1 order-2">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Items</h3>

          <div className="space-y-3 max-h-[40vh] md:max-h-[60vh] overflow-auto pr-2">
            {orderDetails?.cartItems && orderDetails.cartItems.length > 0 ? (
              orderDetails.cartItems.map((item, idx) => (
                <article
                  key={item.productId || item._id || idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 hover:bg-white hover:shadow-sm transition-shadow duration-150"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-14 h-14 rounded-md object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-md bg-slate-200 flex items-center justify-center text-slate-500 text-xs">No Image</div>
                    )}

                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{item.title}</div>
                      <div className="text-xs text-slate-500 mt-1">SKU: {item.sku || "-"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-2">
                    <div className="text-sm text-slate-700">Qty <span className="font-medium text-slate-900 ml-1">{item.quantity}</span></div>
                    <div className="text-sm font-semibold text-slate-900">{fmtPrice(item.price)}</div>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-sm text-slate-500 p-3 bg-gray-50 rounded-md">No items in this order.</div>
            )}
          </div>
        </section>

        <aside className="md:col-span-1 order-3">
          <div className="p-3 rounded-lg bg-gray-50">
            <div className="text-xs text-slate-500">Shipping To</div>
            <div className="mt-2 text-sm text-slate-900 font-medium truncate">
              {orderDetails?.addressInfo?.firstName
                ? `${orderDetails.addressInfo.firstName} ${orderDetails.addressInfo.lastName || ""}`
                : user?.userName || "-"}
            </div>
            <div className="text-sm text-slate-700 mt-1 break-words">{orderDetails?.addressInfo?.streetAddress || orderDetails?.addressInfo?.address || "-"}</div>
            <div className="text-xs text-slate-500 mt-2">
              {orderDetails?.addressInfo?.city || "-"}, {orderDetails?.addressInfo?.state || "-"} {orderDetails?.addressInfo?.pincode || orderDetails?.addressInfo?.postcode || ""}
            </div>
            <div className="text-xs text-slate-500 mt-2">Phone: <span className="ml-1">{orderDetails?.addressInfo?.phone || "-"}</span></div>

            <Separator className="my-3" />

           
            <div className="text-sm text-slate-500">Subtotal</div>
            <div className="text-lg font-semibold text-slate-900 mt-1">{fmtPrice(orderDetails?.subtotal ?? orderDetails?.totalAmount)}</div>

            {orderDetails?.shippingAmount !== undefined && (
              <div className="flex justify-between text-sm mt-2">
                <span className="text-slate-500">Shipping</span>
                <span className="text-slate-900">{fmtPrice(orderDetails.shippingAmount)}</span>
              </div>
            )}
            {orderDetails?.discountAmount !== undefined && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-500">Discount</span>
                <span className="text-slate-900">-{fmtPrice(orderDetails.discountAmount)}</span>
              </div>
            )}

            <Separator className="my-3" />

            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">Total</div>
              <div className="text-xl font-bold text-slate-900">{fmtPrice(orderDetails?.totalAmount)}</div>
            </div>
          </div>
        </aside>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
