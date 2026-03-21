import React, { Fragment, useEffect, useState, useRef, useMemo } from "react";
import ProductImageUpload from "@/components/admin-view/image-upload";
import SupportingImages from "@/components/admin-view/supporting-images";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, SearchIcon } from "lucide-react";

import api from "@/api/axios";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  subtitle: "",
  shortDescription: "",
  category: "",
  special: [],
 
  variations: [],
  specList: [],
  ingredients: "",
  descriptionSections: [],
  faqList: [],
  hsn: "", 
};

export default function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [supportingImages, setSupportingImages] = useState([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); 
  const [activeCategories, setActiveCategories] = useState([]); 
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const [categoriesList, setCategoriesList] = useState([]);

  const { productList = [] } = useSelector((state) => state.adminProducts || {});
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        
        const res = await api.get("/api/common/categories/get");
        if (!mounted) return;
        if (res?.data?.success) {
     
          const cats = (res.data.categories || res.data.data || []).map((c) => {
            
            const id = c.slug || c._id || c.name;
            const name = c.name || c.slug || String(id);
            return { id, name };
          });
          setCategoriesList(cats);
          return;
        }
      } catch (err) {
    
        console.warn("fetch categories err", err && err.message);
      }
  
    })();
    return () => { mounted = false; };
  }, []);

  
  useEffect(() => {
    if (currentEditedId !== null) {
      setUploadedImageUrl(formData?.image || "");

      if (Array.isArray(formData?.images) && formData.images.length) {
        setSupportingImages(formData.images);
      } else if (formData?.images) {
        setSupportingImages([formData.images]);
      } else {
        setSupportingImages([]);
      }
    }
  }, [currentEditedId, formData?.image, formData?.images]);


  const categories = useMemo(() => {
    if (Array.isArray(categoriesList) && categoriesList.length > 0) {
      return categoriesList; 
    }

    const setIds = new Map();
    (productList || []).forEach((p) => {
      if (p?.category) {
        const id = p.category;
        if (!setIds.has(id)) setIds.set(id, { id, name: id });
      }
    });
    return Array.from(setIds.values()).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [categoriesList, productList]);

  function getDefaultPrice(product) {
    try {
      const variations = Array.isArray(product?.variations) ? product.variations : [];
      if (!variations.length) return null;

      const defaultVar = variations.find((v) => v?.isDefault) || variations[0];
     
      const price = defaultVar?.price ?? defaultVar?.mrp ?? defaultVar?.salePrice ?? null;
      return price;
    } catch (err) {
      return null;
    }
  }

  const filteredProducts = useMemo(() => {
    let list = Array.isArray(productList) ? [...productList] : [];

    if (query && query.trim().length) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => {
        return (
          (p?.title && p.title.toLowerCase().includes(q)) ||
          (p?.subtitle && p.subtitle.toLowerCase().includes(q)) ||
          (p?.shortDescription && p.shortDescription.toLowerCase().includes(q))
        );
      });
    }

    if (activeCategories.length) {
      list = list.filter((p) => activeCategories.includes(p?.category));
    } else if (selectedCategory) {
      list = list.filter((p) => p?.category === selectedCategory);
    }


    if (sortBy === "newest") {

      list.sort((a, b) => {
        const ta = new Date(a?.createdAt || (a?._id?.slice(0, 8) ? parseInt(String(a._id).slice(0, 8), 16) * 1000 : 0));
        const tb = new Date(b?.createdAt || (b?._id?.slice(0, 8) ? parseInt(String(b._id).slice(0, 8), 16) * 1000 : 0));
        return tb - ta;
      });
    } else if (sortBy === "alpha") {
      list.sort((a, b) => (a?.title || "").localeCompare(b?.title || ""));
    } else if (sortBy === "price-asc") {
      list.sort((a, b) => {
        const pa = Number(getDefaultPrice(a) ?? Infinity);
        const pb = Number(getDefaultPrice(b) ?? Infinity);
        return pa - pb;
      });
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => {
        const pa = Number(getDefaultPrice(a) ?? -Infinity);
        const pb = Number(getDefaultPrice(b) ?? -Infinity);
        return pb - pa;
      });
    }

    return list;
  }, [productList, query, activeCategories, selectedCategory, sortBy]);

  const totalPages = 1;
  useEffect(() => {
    if (page > totalPages) setPage(1);

  }, [totalPages]);

  
  const paginatedProducts = useMemo(() => {
    return filteredProducts;
  }, [filteredProducts]);

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllOnPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      paginatedProducts.forEach((p) => {
        if (p?._id) next.add(p._id);
      });
      return next;
    });
  }

  function deselectAllOnPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      paginatedProducts.forEach((p) => {
        if (p?._id) next.delete(p._id);
      });
      return next;
    });
  }

  function isAllSelectedOnPage() {
    if (!paginatedProducts.length) return false;
    return paginatedProducts.every((p) => selectedIds.has(p._id));
  }

  function resetFormAndClose() {
    setFormData(initialFormData);
    setImageFile(null);
    setUploadedImageUrl("");
    setCurrentEditedId(null);
    setOpenCreateProductsDialog(false);
    setSupportingImages([]);
  }

  async function onSubmit(event) {
    event.preventDefault();

    const payload = {
      ...formData,
      image:
        uploadedImageUrl || formData.image || (supportingImages && supportingImages[0]) || "",
      images: supportingImages || [],
      special: Array.isArray(formData.special) ? formData.special : [],
      hsn: formData.hsn || "", 
    };

    if (currentEditedId !== null) {
      dispatch(
        editProduct({
          id: currentEditedId,
          formData: payload,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          resetFormAndClose();
          toast({ title: "Product updated" });
        } else {
          toast({ title: "Could not update product", variant: "destructive" });
        }
      });
      return;
    }

    dispatch(addNewProduct(payload)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
        resetFormAndClose();
        toast({ title: "Product added successfully" });
      } else {
        toast({ title: "Could not add product", variant: "destructive" });
      }
    });
  }

  function requestDelete(productId) {
    const found = productList.find((p) => p._id === productId);
    setProductToDelete({ id: productId, title: found?.title || "" });
    setConfirmOpen(true);
  }

  async function handleConfirmedDelete() {
    if (!productToDelete?.id) return;
    try {
      setDeleteLoading(true);
      const res = await dispatch(deleteProduct(productToDelete.id));
      if (res?.payload?.success) {
        dispatch(fetchAllProducts());
        toast({ title: "Product deleted" });
      } else {
        toast({ title: "Could not delete", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
      setProductToDelete(null);

      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (productToDelete?.id) next.delete(productToDelete.id);
        return next;
      });
    }
  }

  async function handleConfirmedBulkDelete() {
    if (!selectedIds || selectedIds.size === 0) return;
    try {
      setBulkDeleteLoading(true);
      const ids = Array.from(selectedIds);
      const results = await Promise.allSettled(ids.map((id) => dispatch(deleteProduct(id))));

      const successCount = results.filter((r) => r.status === "fulfilled" && r.value?.payload?.success).length;
      const failCount = ids.length - successCount;
      dispatch(fetchAllProducts());
      if (successCount > 0) {
        toast({ title: `${successCount} product(s) deleted` });
      }
      if (failCount > 0) {
        toast({ title: `${failCount} product(s) failed to delete`, variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Bulk delete failed", variant: "destructive" });
    } finally {
      setBulkDeleteLoading(false);
      setBulkConfirmOpen(false);
      setSelectedIds(new Set());
    }
  }

  function isFormValid() {
    const skipKeys = ["image", "images"];
    const hasTitle = !!formData.title;
    const hasVariations = Array.isArray(formData.variations) && formData.variations.length > 0;
    return hasTitle && hasVariations;
  }

  const sortLabel = useMemo(() => {
    if (sortBy === "newest") return "Newest";
    if (sortBy === "alpha") return "A → Z";
    if (sortBy === "price-asc") return "Price low → high";
    if (sortBy === "price-desc") return "Price high → low";
    return "Sort";
  }, [sortBy]);

  return (
    <Fragment>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">
            Manage your catalog — add, edit or remove products. Use filters, search and bulk actions below.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => {
              setCurrentEditedId(null);
              setFormData(initialFormData);
              setUploadedImageUrl("");
              setSupportingImages([]);
              setOpenCreateProductsDialog(true);
            }}
            className="inline-flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add New Product
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
   
            <div className="relative w-full sm:w-64">
              <SearchIcon
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search products..."
                className="w-full px-3 py-2 pl-9 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>


            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-2 border rounded-md focus:outline-none inline-flex items-center gap-2" aria-label="Sort products">
                  <span>{sortLabel}</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('alpha')}>A → Z</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('price-asc')}>Price low → high</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('price-desc')}>Price high → low</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm text-muted-foreground">Category:</label>


            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-2 border rounded-md focus:outline-none inline-flex items-center gap-2" aria-label="Select category">
                  
                  <span>
                    {selectedCategory
                      ? (categories.find((c) => c.id === selectedCategory)?.name || selectedCategory)
                      : "All"}
                  </span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => { setSelectedCategory(''); setActiveCategories([]); setPage(1); }}>All</DropdownMenuItem>
                {categories.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onClick={() => {
                      setSelectedCategory(c.id);
                      setActiveCategories([]);
                      setPage(1);
                    }}
                  >
                    {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => {
   
                setSelectedCategory("");
                setActiveCategories([]);
                setPage(1);
              }}
              className="px-2 py-1 text-sm border rounded-md"
              title="Clear category filters"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
   
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                if (isAllSelectedOnPage()) deselectAllOnPage();
                else selectAllOnPage();
              }}
              className="px-3 py-2"
            >
              {isAllSelectedOnPage() ? "Deselect page" : "Select page"}
            </Button>

            <Button
              onClick={() => {
                if (selectedIds.size === 0) {
                  toast({ title: "No products selected", variant: "destructive" });
                  return;
                }
                setBulkConfirmOpen(true);
              }}
              className="px-3 py-2 bg-rose-600 text-white"
            >
              Delete selected ({selectedIds.size})
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        {categories.map((c) => {
          const active = activeCategories.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => {
                setPage(1);
                setSelectedCategory("");
                setActiveCategories((prev) => {
                  if (prev.includes(c.id)) return prev.filter((x) => x !== c.id);
                  return [...prev, c.id];
                });
              }}
              className={`px-3 py-1 rounded-full text-sm border ${active ? "bg-[#08665F] text-white" : "bg-white text-slate-800"
                }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        {paginatedProducts && paginatedProducts.length > 0 ? (
          paginatedProducts.map((productItem) => (
            <motion.div
              key={productItem._id}
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl bg-white shadow-sm border overflow-hidden transform-gpu transition hover:shadow-lg relative"
            >
       
              <div className="absolute right-3 top-3 z-10">
                <Checkbox
                  checked={selectedIds.has(productItem._id)}
                  onCheckedChange={() => toggleSelect(productItem._id)}
                  aria-label={`Select ${productItem.title}`}
                />
              </div>


              <div className="p-4 flex items-stretch gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{productItem.title}</div>
                      <div className="text-xs text-slate-500 mt-1 line-clamp-2">{productItem.shortDescription || productItem.subtitle}</div>
              
                    </div>
                  </div>

                  <div className="mt-4">
                    <AdminProductTile
                      setFormData={setFormData}
                      setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                      setCurrentEditedId={setCurrentEditedId}
                      product={productItem}
                      handleDelete={requestDelete}
                      compact
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No products found. Try clearing filters or add your first product.
          </div>
        )}
      </motion.div>

      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={(val) => {
          if (!val) {
            resetFormAndClose();
            return;
          }
          setOpenCreateProductsDialog(true);
        }}
      >
        <SheetContent
          side="right"
          className="overflow-hidden w-full max-w-full md:max-w-[760px] lg:max-w-[860px] p-0 z-[100]"
        >
          <div className="h-full flex flex-col">
            <SheetHeader className="flex items-center justify-between border-b py-4 px-6 flex-shrink-0">
              <SheetTitle className="text-lg font-semibold">
                {currentEditedId !== null ? "Edit Product" : "Add New Product"}
              </SheetTitle>
            </SheetHeader>

            <div className="p-6 space-y-6 overflow-auto flex-1 min-h-0">
              <div className="rounded-lg border bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <SupportingImages images={supportingImages} setImages={setSupportingImages} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-white p-4 shadow-sm">
                <CommonForm
                  onSubmit={onSubmit}
                  formData={formData}
                  setFormData={setFormData}
                  buttonText={currentEditedId !== null ? "Save changes" : "Add product"}
                  formControls={addProductFormElements}
                  isBtnDisabled={!isFormValid()}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button onClick={() => resetFormAndClose()} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete product"
        description={
          productToDelete?.title
            ? `Delete "${productToDelete.title}" permanently? This action cannot be undone.`
            : "Delete this product permanently? This action cannot be undone."
        }
        onConfirm={handleConfirmedDelete}
        onCancel={() => {
          if (!deleteLoading) {
            setConfirmOpen(false);
            setProductToDelete(null);
          }
        }}
        loading={deleteLoading}
      />

      <ConfirmDialog
        open={bulkConfirmOpen}
        title="Delete selected products"
        description={`Delete ${selectedIds.size} selected product(s) permanently? This action cannot be undone.`}
        onConfirm={handleConfirmedBulkDelete}
        onCancel={() => {
          if (!bulkDeleteLoading) {
            setBulkConfirmOpen(false);
          }
        }}
        loading={bulkDeleteLoading}
      />
    </Fragment>
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
                {loading ? "Deleting..." : "Delete product"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
