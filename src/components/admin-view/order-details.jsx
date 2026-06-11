import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const { user } = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
        });
      }
    });
  }

  async function handleDownloadInvoice() {
    try {
      const resp = await fetch(
        `/api/admin/invoice/download/${orderDetails?._id}`,
        { method: "GET" }
      );
      if (!resp.ok) {
        const err = await resp.json().catch(() => null);
        toast({
          title: "Download failed",
          description:
            err && err.message ? err.message : "Server error",
          variant: "destructive",
        });
        return;
      }
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${orderDetails?._id || "invoice"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast({
        title: "Download error",
        description: e?.message || "Unknown error",
        variant: "destructive",
      });
    }
  }

  const statusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-800";
      case "inProcess":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <DialogContent className="sm:max-w-[600px] p-0 bg-white rounded-xl shadow-lg">
      <div className="p-6 flex items-center justify-between border-b">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Order Information</h2>
          <div className="text-sm text-slate-500">Order #{orderDetails?._id}</div>
        </div>
        <div className="flex items-center gap-3">
          
        </div>
      </div>

      <div className="p-6 max-h-[70vh] overflow-y-auto">
        <div className="grid gap-6">
          <div className="grid gap-3">
            <div className="grid gap-2">
              {[
                { label: "Order ID", value: orderDetails?._id || "-" },
                {
                  label: "Order Date",
                  value: orderDetails?.orderDate
                    ? String(orderDetails.orderDate).split("T")[0]
                    : "-",
                },
                { label: "Order Price", value: orderDetails?.totalAmount ? `₹${orderDetails.totalAmount}` : "-" },
                { label: "Payment Method", value: orderDetails?.paymentMethod || "-" },
                { label: "Payment Status", value: orderDetails?.paymentStatus || "-" },
              ].map((field) => (
                <div key={field.label} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">{field.label}</span>
                  <Label className="text-sm text-slate-900">{field.value}</Label>
                </div>
              ))}

              <div className="flex justify-between items-center mt-4">
                <span className="text-sm font-medium text-slate-700">Order Status</span>
                <Badge className={`py-1 px-3 rounded-full ${statusColor(orderDetails?.orderStatus)}`}>
                  <span className="capitalize text-sm font-medium">
                    {orderDetails?.orderStatus || "N/A"}
                  </span>
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-3">
            <h3 className="text-md font-semibold text-slate-900">Order Details</h3>
            <ul className="grid gap-2">
              {orderDetails?.cartItems && orderDetails.cartItems.length > 0 ? (
                orderDetails.cartItems.map((item) => (
                  <li
                    key={item.productId || item._id}
                    className="flex justify-between items-center px-3 py-2 rounded-lg bg-slate-50 shadow-sm"
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium truncate">{item.title}</span>
                      {item.variantTitle && <div className="text-xs text-slate-500">{item.variantTitle}</div>}
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <span className="text-sm text-slate-700">Qty: {item.quantity}</span>
                      <span className="text-sm text-slate-900 font-medium">₹{item.price}</span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500">No items found in this order.</li>
              )}
            </ul>
          </div>

          <Separator />

          <div className="grid gap-3">
            <h3 className="text-md font-semibold text-slate-900">Shipping Info</h3>
            <div className="grid gap-1 text-sm text-slate-700">
              <span>
                {orderDetails?.addressInfo?.firstName
                  ? `${orderDetails.addressInfo.firstName} ${orderDetails.addressInfo.lastName || ""}`
                  : user?.userName || "-"}
              </span>
              {orderDetails?.addressInfo?.company && <span>{orderDetails.addressInfo.company}</span>}
              <span>{orderDetails?.addressInfo?.streetAddress || orderDetails?.addressInfo?.address || "-"}</span>
              {orderDetails?.addressInfo?.apartment && <span>{orderDetails.addressInfo.apartment}</span>}
              <span>
                {orderDetails?.addressInfo?.city || "-"}, {orderDetails?.addressInfo?.state || "-"}
              </span>
              <span>{orderDetails?.addressInfo?.postcode || orderDetails?.addressInfo?.pincode || "-"}</span>
              <span>Country: {orderDetails?.addressInfo?.country || "India"}</span>
              <span>Phone: {orderDetails?.addressInfo?.phone || "-"}</span>
              {orderDetails?.addressInfo?.whatsapp && <span>WhatsApp: {orderDetails.addressInfo.whatsapp}</span>}
              {orderDetails?.addressInfo?.email && <span>Email: {orderDetails.addressInfo.email}</span>}
              {orderDetails?.addressInfo?.addressType && <span>Type: {orderDetails.addressInfo.addressType}</span>}
              {orderDetails?.addressInfo?.notes && <span>Notes: {orderDetails.addressInfo.notes}</span>}
            </div>
          </div>

          <Separator />

          <div>
            <CommonForm
              formControls={[
                {
                  label: "Order Status",
                  name: "status",
                  componentType: "select",
                  options: [
                    {id:"confirmed", label: "Confirmed"},
                    { id: "inProcess", label: "In Process" },
                    { id: "shipped", label: "Shipped" },
                    
                    
                  ],
                },
              ]}
              formData={formData}
              setFormData={setFormData}
              buttonText={"Update Order Status"}
              onSubmit={handleUpdateStatus}
            />
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
