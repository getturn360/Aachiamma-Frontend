import React, { useEffect, useState, useRef } from "react";
import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { getFeatureImages } from "@/store/common-slice";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import PopupsManager from "@/components/admin-view/popups-manager"; 

const API_HOST = import.meta.env.VITE_API_BASE || "https://aachiamma-backend.fly.dev";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { featureImageList = [] } = useSelector((s) => s.commonFeature || {});

  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);

  const [logos, setLogos] = useState([]);
  const [logoFiles, setLogoFiles] = useState({ front: null, back: null });
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoMsg, setLogoMsg] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [logoToDeleteId, setLogoToDeleteId] = useState(null);
  const [logoConfirmOpen, setLogoConfirmOpen] = useState(false);
  const [logoDeleteLoading, setLogoDeleteLoading] = useState(false);

  useEffect(() => {
    dispatch(getFeatureImages());
    fetchLogos();
  }, [dispatch]);

  async function handleSaveFeatureImage() {
    if (!uploadedImageUrl) return toastAlert("Upload an image first");
    try {
      setImageLoadingState(true);
      await axios.post(`${API_HOST}/api/common/feature/add`, { image: uploadedImageUrl });
      setUploadedImageUrl("");
      setImageFile(null);
      dispatch(getFeatureImages());
      toastAlert("Feature image added", "success");
    } catch (e) {
      console.error(e);
      toastAlert("Error saving image", "error");
    } finally {
      setImageLoadingState(false);
    }
  }

  async function fetchLogos() {
    try {
      const res = await axios.get(`${API_HOST}/api/admin/site-media/get`);
      if (res.data && res.data.success) {
        setLogos(res.data.logos || []);
      } else {
        setLogos([]);
      }
    } catch (err) {
      console.warn("fetch logos err", err && err.message);
      setLogos([]);
    }
  }

  function handleLogoFileChange(e, variant) {
    const file = e.target.files && e.target.files[0];
    setLogoFiles((s) => ({ ...s, [variant]: file }));
  }

  async function uploadLogo(variant) {
    const file = logoFiles[variant];
    if (!file) {
      setLogoMsg("Please choose a file first.");
      setTimeout(() => setLogoMsg(""), 2500);
      return;
    }
    setLogoLoading(true);
    try {
      const fd = new FormData();
      fd.append("my_file", file);
      fd.append("variant", variant);

      const res = await axios.post(`${API_HOST}/api/admin/site-media/upload`, fd);
      if (res.data && res.data.success) {
        setLogoMsg("Logo uploaded");
        setLogoFiles((s) => ({ ...s, [variant]: null }));
        fetchLogos();
      } else {
        setLogoMsg(res.data.message || "Upload failed");
      }
    } catch (err) {
      console.error("upload err", err);
      setLogoMsg(err?.response?.data?.message || err.message || "Upload error");
    } finally {
      setLogoLoading(false);
      setTimeout(() => setLogoMsg(""), 3000);
    }
  }

  function requestDeleteLogo(id) {
    setLogoToDeleteId(id);
    setLogoConfirmOpen(true);
  }

  async function deleteLogoConfirmed() {
    if (!logoToDeleteId) return;
    try {
      setLogoDeleteLoading(true);
      await axios.delete(`${API_HOST}/api/admin/site-media/delete/${logoToDeleteId}`);
      setLogoMsg("Deleted");
      setLogoToDeleteId(null);
      setLogoConfirmOpen(false);
      fetchLogos();
    } catch (err) {
      console.error("delete logo err", err);
      setLogoMsg("Delete failed");
    } finally {
      setLogoDeleteLoading(false);
      setTimeout(() => setLogoMsg(""), 2500);
    }
  }

  function openConfirm(item) {
    setImageToDelete(item);
    setConfirmOpen(true);
  }

  function closeConfirm() {
    if (deleteLoading) return;
    setConfirmOpen(false);
    setImageToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!imageToDelete?._id) return;
    try {
      setDeleteLoading(true);
      await axios.delete(`${API_HOST}/api/common/feature/delete/${imageToDelete._id}`);
      dispatch(getFeatureImages());
      closeConfirm();
      toastAlert("Image deleted", "success");
    } catch (e) {
      console.error(e);
      toastAlert("Error deleting image", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  function toastAlert(message = "", type = "info") {
    console.log("TOAST::", type, message);
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent truncate">
            Feature Images
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl truncate">
            Manage site banners — upload, add to database and remove with confidence.
          </p>
        </div>
      </div>

      <div>
        <PopupsManager />
      </div>

      <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-lg border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold">Site Logos (Front / Back)</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload the front and back logo shown in the header. Upload replaces existing one for the same variant.
            </p>
          </div>

          <div className="w-full md:w-1/2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium">Logo Front</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoFileChange(e, "front")}
                  aria-label="Select front logo file"
                  className="w-full"
                />
          
                <div className="mt-2 p-2 border-2 border-dashed border-amber-400 bg-amber-50 text-sm text-amber-800 rounded">
                  <strong>Required size:</strong> 700 × 598 px — please upload logo at these exact dimensions.
                </div>

                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                  <Button
                    onClick={() => uploadLogo("front")}
                    disabled={logoLoading}
                    className="inline-flex items-center gap-2 w-full sm:w-auto"
                    aria-label="Upload front logo"
                  >
                    {logoLoading ? "Uploading..." : "Upload Front"}
                  </Button>
                  <Button
                    onClick={() => setLogoFiles((s) => ({ ...s, front: null }))}
                    variant={undefined}
                    className="px-3 py-2 w-full sm:w-auto"
                    aria-label="Reset front logo file"
                  >
                    Reset
                  </Button>
                </div>
              </div>

       
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium">Logo Back</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoFileChange(e, "back")}
                  aria-label="Select back logo file"
                  className="w-full"
                />
                <div className="mt-2 p-2 border-2 border-dashed border-amber-400 bg-amber-50 text-sm text-amber-800 rounded">
                  <strong>Required size:</strong> 700 × 598 px — please upload logo at these exact dimensions.
                </div>

                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                  <Button
                    onClick={() => uploadLogo("back")}
                    disabled={logoLoading}
                    className="inline-flex items-center gap-2 w-full sm:w-auto"
                    aria-label="Upload back logo"
                  >
                    {logoLoading ? "Uploading..." : "Upload Back"}
                  </Button>
                  <Button
                    onClick={() => setLogoFiles((s) => ({ ...s, back: null }))}
                    variant={undefined}
                    className="px-3 py-2 w-full sm:w-auto"
                    aria-label="Reset back logo file"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {logoMsg && (
              <div className="mt-3 text-sm text-center sm:text-left">
                {logoMsg}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Existing uploaded logos</h4>
          {logos.length === 0 && (
            <div className="text-sm text-muted-foreground">No logos uploaded yet.</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {logos.map((l) => (
              <div
                key={l._id}
                className="flex items-center gap-3 border rounded p-2 bg-white"
              >
                <div className="w-28 h-16 flex items-center justify-center overflow-hidden bg-slate-50 rounded">
                  <img
                    src={l.url}
                    alt={`${l.variant} logo`}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium capitalize truncate">{l.variant}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {l.createdAt ? new Date(l.createdAt).toLocaleString() : "-"}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <button
                    onClick={() => requestDeleteLogo(l._id)}
                    className="px-3 py-1 border rounded flex items-center gap-2 hover:bg-slate-50"
                    aria-label={`Delete ${l.variant} logo`}
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span className="hidden sm:inline text-sm text-rose-600">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-white/60 via-white/40 to-white/30 p-4 sm:p-6 shadow-lg border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold">Upload banner / feature image</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We recommend a 15:6 image for best presentation.
            </p>
          </div>

          <div className="w-full md:w-1/2">
            <ProductImageUpload
              imageFile={imageFile}
              setImageFile={setImageFile}
              imageLoadingState={imageLoadingState}
              uploadedImageUrl={uploadedImageUrl}
              setUploadedImageUrl={setUploadedImageUrl}
              setImageLoadingState={setImageLoadingState}
              isEditMode={false}
            />

            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleSaveFeatureImage}
                disabled={!uploadedImageUrl || imageLoadingState}
                className="inline-flex items-center gap-2 w-full sm:w-auto"
                aria-label="Save feature image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {imageLoadingState ? "Saving..." : "Add Feature Image"}
              </Button>

              <Button
                onClick={() => { setUploadedImageUrl(""); setImageFile(null); }}
                variant={undefined}
                className="px-3 py-2 w-full sm:w-auto"
                aria-label="Reset feature image"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Existing feature images</h3>
          <p className="text-sm text-muted-foreground">{featureImageList.length} images</p>
        </div>

        {featureImageList && featureImageList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featureImageList.map((it) => (
              <motion.article
                key={it._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="relative rounded-xl overflow-hidden shadow-md border hover:shadow-xl transition-shadow bg-slate-50"
              >
            
                <div className="group relative bg-gray-100">
                  <img
                    src={it.image}
                    alt={it.alt || `feature-${it._id}`}
                    className="w-full h-40 sm:h-44 md:h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    style={{ minHeight: 120 }}
                  />

               
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-3 w-full flex items-center justify-between">
                      <div className="text-xs text-white/90 truncate max-w-[70%]">{it._id}</div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openConfirm(it)}
                          aria-label="Delete image"
                          className="bg-white/90 rounded-full p-2 shadow hover:scale-105 transform transition-transform"
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

           
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium truncate">Feature image</div>
                    <div className="text-xs text-muted-foreground">Preview</div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No feature images yet. Upload one to get started.
          </div>
        )}
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete feature image"
        description="Are you sure you want to permanently delete this image? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deleteLoading}
      />

      <ConfirmDialog
        open={logoConfirmOpen}
        title="Delete logo"
        description="Delete this logo? This action will remove the logo from the site header."
        onConfirm={deleteLogoConfirmed}
        onCancel={() => { setLogoConfirmOpen(false); setLogoToDeleteId(null); }}
        loading={logoDeleteLoading}
      />
    </div>
  );
}

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

      <div className="relative z-10 max-w-lg sm:max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border">
        <div className="flex items-start gap-4 p-6 border-b">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
            <svg
              className="w-6 h-6 text-rose-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
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
