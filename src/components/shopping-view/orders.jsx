import React, { useEffect, useState } from "react";
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
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";
import { Badge } from "../ui/badge";

export default function ShoppingOrdersResponsive() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllOrdersByUserId(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  const handleOpenDetails = (id) => {
    setSelectedOrderId(id);
    dispatch(getOrderDetails(id));
  };

  const closeDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedOrderId(null);
    dispatch(resetOrderDetails());
  };

  const statusColor = (status) => {
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
  };

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-IN");
    } catch (e) {
      console.error("[orders.jsx] Error:", e);
      return iso.split("T")[0] || "-";
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm sm:text-base">Order History</CardTitle>
      </CardHeader>

      <CardContent className="p-2 sm:p-4">
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Order</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead className="text-right">Order Price</TableHead>
                  <TableHead>
                    <span className="sr-only">Details</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orderList && orderList.length > 0 ? (
                  orderList.map((orderItem) => (
                    <TableRow key={orderItem?._id} className="group">
                      <TableCell className="pl-4">
                        <div
                          className="w-full p-2 rounded-md bg-gray-50 transition-all duration-150 ease-out group-hover:shadow-md group-hover:bg-gray-100 group-hover:border-l-4 group-hover:border-[#08665F]"
                          style={{ willChange: "transform, box-shadow" }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-800 tracking-wide truncate max-w-[280px]">
                                {orderItem?._id}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 mt-1 sm:mt-0">
                              {orderItem?.paymentMethod ? orderItem.paymentMethod : "—"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="w-full p-2 rounded-md bg-gray-50 transition-all duration-150 ease-out group-hover:shadow-md group-hover:bg-gray-100">
                          <div className="text-sm text-slate-700">
                            {formatDate(orderItem?.orderDate)}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="w-full p-2 rounded-md bg-gray-50 transition-all duration-150 ease-out group-hover:shadow-md group-hover:bg-gray-100 flex items-center">
                          <Badge
                            className={`py-0.5 px-2 rounded-full ${statusColor(
                              orderItem?.orderStatus
                            )} inline-flex items-center text-xs`}
                          >
                            <span className="capitalize text-xs font-semibold">
                              {orderItem?.orderStatus || "unknown"}
                            </span>
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="w-full p-2 rounded-md bg-gray-50 transition-all duration-150 ease-out group-hover:shadow-md group-hover:bg-gray-100">
                          <div className="text-sm font-semibold text-slate-900">
                            ₹{orderItem?.totalAmount ?? "0"}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="pr-4">
                        <div className="w-full p-2 rounded-md bg-gray-50 flex justify-end transition-all duration-150 ease-out group-hover:shadow-md group-hover:bg-gray-100">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-sm px-2 py-1 transform transition-transform duration-150 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                            onClick={() => handleOpenDetails(orderItem?._id)}
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="md:hidden space-y-2">
          {orderList && orderList.length > 0 ? (
            orderList.map((orderItem) => (
              <div key={orderItem?._id} className="p-1">
                <div className="border rounded-md p-2 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-slate-800 truncate">{orderItem?._id}</h3>
                        <span className="text-xs text-slate-500 truncate">{orderItem?.paymentMethod ?? "—"}</span>
                      </div>

                      <div className="mt-1 text-xs text-slate-600">
                        <div>Placed: <span className="font-medium">{formatDate(orderItem?.orderDate)}</span></div>
                        <div className="mt-1">Total: <span className="font-semibold">₹{orderItem?.totalAmount ?? "0"}</span></div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge className={`py-0.5 px-2 rounded-full ${statusColor(orderItem?.orderStatus)} inline-flex items-center text-xs`}> 
                        <span className="capitalize font-semibold">{orderItem?.orderStatus || "unknown"}</span>
                      </Badge>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1"
                        onClick={() => handleOpenDetails(orderItem?._id)}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500">No orders found.</div>
          )}
        </div>

        <Dialog
          open={openDetailsDialog}
          onOpenChange={(open) => {
            if (!open) closeDialog();
            else setOpenDetailsDialog(true);
          }}
        >
          <ShoppingOrderDetailsView orderDetails={orderDetails} />
        </Dialog>
      </CardContent>
    </Card>
  );
}
