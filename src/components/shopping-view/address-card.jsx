import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";



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

      <div className="relative z-10 max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden border overflow-auto">
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
                {loading ? "Working..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddressCard({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
  showUse,
}) {
  const highlightColor = "#08665F";
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const normalizedSelectedId =
    selectedId && typeof selectedId === "object" ? selectedId._id || selectedId.id : selectedId;
  const isSelected = Boolean(
    normalizedSelectedId &&
      (String(normalizedSelectedId) === String(addressInfo?._id) ||
        String(normalizedSelectedId) === String(addressInfo?.id))
  );

  const openConfirmDelete = (e) => {
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();
    setConfirmDeleteOpen(true);
  };
  const closeConfirmDelete = () => setConfirmDeleteOpen(false);

  const doDelete = async () => {
    setDeleting(true);
    try {
      if (typeof handleDeleteAddress === "function") {
  
        const res = handleDeleteAddress(addressInfo);
        if (res && typeof res.then === "function") {
          await res;
        }
      }
    } catch (e) {
   
      console.error("delete handler error", e);
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  return (
    <>
      <Card
        style={{
          borderColor: isSelected ? highlightColor : undefined,
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          boxShadow: "none",
        }}
        className={`cursor-default rounded-xl border-2 ${
          isSelected ? "border-[4px]" : "border-gray-200"
        } bg-white`}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.01)";
          e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <CardContent className="grid gap-2 p-5">
          <Label className="font-semibold text-gray-700 text-lg">
            {addressInfo?.firstName
              ? `${addressInfo.firstName} ${addressInfo.lastName || ""}`
              : addressInfo?.streetAddress || addressInfo?.address}
            <span className="ml-2 text-sm text-gray-500">
              ({addressInfo?.addressType || "Home"})
            </span>
          </Label>

          {addressInfo?.company && (
            <div className="text-sm text-gray-600">{addressInfo.company}</div>
          )}

          <div className="flex flex-wrap gap-3 text-gray-500 text-sm">
            <span>{addressInfo?.streetAddress || addressInfo?.address}</span>
            {addressInfo?.apartment && <span>{addressInfo.apartment}</span>}
            <span>{addressInfo?.city}</span>
            <span>{addressInfo?.state}</span>
            <span>Pincode: {addressInfo?.postcode || addressInfo?.pincode}</span>
          </div>

          <div className="flex flex-wrap gap-3 text-gray-500 text-sm mt-2">
            <span>Phone: {addressInfo?.phone}</span>
            {addressInfo?.whatsapp && <span>WhatsApp: {addressInfo.whatsapp}</span>}
            {addressInfo?.email && <span>Email: {addressInfo.email}</span>}
            <span>Country: {addressInfo?.country || "India"}</span>
          </div>

          {addressInfo?.notes && (
            <p className="text-gray-400 italic text-sm mt-2">Notes: {addressInfo?.notes}</p>
          )}
        </CardContent>

        <CardFooter className="p-4 flex justify-end gap-3 border-t border-gray-100">
          {showUse && typeof setCurrentSelectedAddress === "function" && (
            <Button
              variant={isSelected ? "default" : "ghost"}
              className={
                isSelected
                  ? "bg-[#08665F] hover:bg-[#065046] text-white"
                  : "text-[#08665F] hover:bg-[#E0F0EE]"
              }
              onClick={(e) => {
                e.stopPropagation();
                if (isSelected) {
                  try {
                    setCurrentSelectedAddress(null);
                  } catch (err) {
      console.error("[address-card.jsx] Error:", err);
                    setCurrentSelectedAddress("");
                  }
                } else {
                  setCurrentSelectedAddress(addressInfo);
                }
              }}
            >
              {isSelected ? "Deselect" : "Use"}
            </Button>
          )}

          <Button
            variant="outline"
            className="text-[#08665F] border-[#08665F] hover:bg-[#E0F0EE]"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof handleEditAddress === "function") handleEditAddress(addressInfo);
            }}
          >
            Edit
          </Button>

          <Button
            variant="destructive"
            className="bg-[#dc2626] hover:bg-[#b91c1c] text-white"
            onClick={openConfirmDelete}
          >
            Delete
          </Button>
        </CardFooter>
      </Card>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete address?"
        description="Are you sure you want to delete this address? This action cannot be undone."
        onConfirm={doDelete}
        onCancel={closeConfirmDelete}
        loading={deleting}
      />
    </>
  );
}

export default AddressCard;
