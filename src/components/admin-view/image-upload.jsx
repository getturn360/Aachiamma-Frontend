import { FileIcon, UploadCloudIcon, XIcon, Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import api from "@/api/axios";

function ProductImageUpload({
  imageFile,
  setImageFile,
  imageLoadingState,
  uploadedImageUrl,
  setUploadedImageUrl,
  setImageLoadingState,
  isEditMode,
  isCustomStyling = false,
}) {
  const inputRef = useRef(null);

  function handleImageFileChange(event) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) setImageFile(selectedFile);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) setImageFile(droppedFile);
  }

  function handleRemoveImage() {
    setImageFile(null);
    if (inputRef.current) inputRef.current.value = "";
    setUploadedImageUrl("");
  }

  async function uploadImageToCloudinary() {
    if (!imageFile) return;
    setImageLoadingState(true);

    const data = new FormData();
    data.append("my_file", imageFile);

    try {
      const response = await api.post("/api/admin/products/upload-image", data, {
        headers: {
        },
      });

      if (response?.data?.success) {
        setUploadedImageUrl(response.data.result.url);
      } else {
    
        console.error("Upload response:", response?.data);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setImageLoadingState(false);
    }
  }

  useEffect(() => {
    if (imageFile !== null) uploadImageToCloudinary();
   
  }, [imageFile]);

  return (
    <div className={`w-full mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 hover:border-primary hover:shadow-lg bg-white/30 backdrop-blur-md`}
      >
    
        <Input
          id="image-upload"
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
        />

      
        {imageLoadingState ? (
          <motion.div className="flex flex-col items-center justify-center h-40">
            <motion.div
              className="mb-3 w-8 h-8"
              animate={{ rotate: 360 }}
              transition={{ loop: Infinity, duration: 1 }}
            >
              <Loader2 className="w-full h-full" />
            </motion.div>
            <motion.span
              className="text-sm font-medium text-primary"
              initial={{ y: -5 }}
              animate={{ y: 0 }}
              transition={{ repeat: Infinity, repeatType: "mirror", duration: 0.8 }}
            >
              Uploading...
            </motion.span>
          </motion.div>
        ) : (
          <>
            {uploadedImageUrl && !imageFile ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 shadow-sm">
                <div className="flex items-center gap-4">
                  <img
                    src={uploadedImageUrl}
                    alt="product"
                    className="w-28 h-28 object-cover rounded-md"
                  />
                  <div className="flex flex-col">
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="image-upload" className="cursor-pointer">
                  </Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={handleRemoveImage}
                  >
                    <XIcon className="w-4 h-4" />
                    <span className="sr-only">Remove File</span>
                  </Button>
                </div>
              </div>
            ) : imageFile ? (
              <motion.div
                className="flex items-center justify-between p-3 border rounded-lg bg-white/50 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <FileIcon className="w-8 h-8 text-primary mr-3" />
                  <p className="text-sm font-medium">Image selected</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={handleRemoveImage}
                >
                  <XIcon className="w-4 h-4" />
                  <span className="sr-only">Remove File</span>
                </Button>
              </motion.div>
            ) : (
  
              <Label
                htmlFor="image-upload"
                className={`flex flex-col items-center justify-center h-40 cursor-pointer transition-transform hover:scale-105`}
              >
                <motion.div
                  className="mb-3"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                >
                  <UploadCloudIcon className="w-12 h-12 text-muted-foreground" />
                </motion.div>
                <span className="text-sm font-medium text-muted-foreground text-center">
                  Drag & drop or click to upload
                </span>
              </Label>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProductImageUpload;
