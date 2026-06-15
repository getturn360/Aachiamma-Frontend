import React from "react";
import { Button } from "../ui/button";
import { Eye, EyeOff, Edit, Trash2 } from "lucide-react";

export default function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
  handleToggleAvailability,
  availabilityLoading = false,
}) {
  const isAvailable = product?.isAvailable !== false;

  return (
    <div className="flex flex-col gap-3 h-full justify-between">
      {/* Product Image Frame */}
      <div className="relative aspect-square w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shadow-inner group">
        <img
          src={product?.image}
          alt={product?.title}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            !isAvailable ? "grayscale opacity-60" : ""
          }`}
          loading="lazy"
        />
        {!isAvailable && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider shadow">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Button Layout Actions */}
      <div className="flex flex-col gap-2 w-full mt-auto">
        <Button
          type="button"
          variant="outline"
          disabled={availabilityLoading}
          onClick={() => handleToggleAvailability && handleToggleAvailability(product)}
          className={`w-full text-xs font-semibold py-1.5 h-9 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 ${
            isAvailable
              ? "border-amber-200 bg-amber-50/30 text-amber-800 hover:bg-amber-100/60 hover:border-amber-300"
              : "border-emerald-200 bg-emerald-50/30 text-emerald-800 hover:bg-emerald-100/60 hover:border-emerald-300"
          }`}
        >
          {availabilityLoading ? (
            <span className="animate-pulse">Updating...</span>
          ) : isAvailable ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Mark unavailable</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Mark available</span>
            </>
          )}
        </Button>

        <div className="flex items-center justify-between gap-2 w-full">
          <Button
            onClick={() => {
              setOpenCreateProductsDialog(true);
              setCurrentEditedId(product?._id);
              setFormData(product);
            }}
            className="flex-1 w-full !bg-[#08665F] !hover:!bg-[#064e49] !text-white flex items-center justify-center gap-1 h-9 rounded-lg text-xs"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Button>

          <Button
            onClick={() => handleDelete(product?._id)}
            className="flex-1 w-full !bg-red-600 !hover:!bg-red-700 !text-white flex items-center justify-center gap-1 h-9 rounded-lg text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
