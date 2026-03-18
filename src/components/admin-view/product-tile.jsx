import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";

export default function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  return (
    <Card className="relative w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-gray-200">
      <div className="h-full flex flex-col bg-white">
        <div className="relative aspect-square w-full bg-gray-100">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <CardFooter className="bottom-4 left-4 right-4 p-2 flex items-center justify-between gap-3">
       
          <Button
            onClick={() => {
              setOpenCreateProductsDialog(true);
              setCurrentEditedId(product?._id);
              setFormData(product);
            }}
            className="basis-2/3 w-full"
          >
            Edit
          </Button>

       
          <Button
            onClick={() => handleDelete(product?._id)}
            className="basis-1/3 w-full !bg-red-600 !hover:!bg-red-700 !text-white"
          >
            Delete
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
