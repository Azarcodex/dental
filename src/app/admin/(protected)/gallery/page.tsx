"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import { 
  Upload, 
  Trash2, 
  Loader2, 
  Image as ImageIcon,
  Plus,
  X,
  Eye,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function GalleryManagementPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [imageToDelete, setImageToDelete] = useState<any>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // --- Queries ---
  const { data: images = [], isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/gallery");
      return data.data;
    }
  });

  // --- Mutations ---
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return axiosInstance.post("/admin/gallery", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    },
    onSuccess: () => {
      toast.success("Images uploaded successfully!");
      setSelectedFiles([]);
      setPreviews([]);
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to upload images");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axiosInstance.delete(`/admin/gallery/${id}`);
    },
    onSuccess: () => {
      toast.success("Image deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      setImageToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete image");
    }
  });

  // --- Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter and validate files
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    files.forEach(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeSelectedFile = (index: number) => {
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(previews[index]);
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = () => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append("files", file);
    });

    uploadMutation.mutate(formData);
  };

  const clearSelection = () => {
    previews.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviews([]);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gallery Management</h1>
        <p className="text-slate-500 font-medium">Upload and manage images displayed in the public landing page scrolling gallery.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Panel */}
        <div className="lg:col-span-4 bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-950">Upload New Images</h3>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />

          {/* Drag & Drop Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed border-slate-200 hover:border-primary-green/40 bg-slate-50/50 hover:bg-slate-50 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3",
              selectedFiles.length > 0 ? "py-6" : "py-12"
            )}
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
              <Upload size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Select files to upload</p>
              <p className="text-xs text-slate-400 mt-1">Supports multiple image files up to 5MB each</p>
            </div>
          </div>

          {/* Previews Grid */}
          {previews.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                <span>Selected ({selectedFiles.length})</span>
                <button 
                  onClick={clearSelection}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden group bg-slate-100 border border-slate-100">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeSelectedFile(index)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleUploadSubmit}
                disabled={uploadMutation.isPending}
                className="w-full bg-primary-green text-white py-3 rounded-xl font-bold text-[13px] hover:bg-primary-green-light transition-all shadow-md shadow-primary-green/10 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Upload to Cloudinary</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-950 flex items-center gap-2.5">
              <span>All Images</span>
              <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold">
                {images.length}
              </span>
            </h3>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-video bg-white border border-slate-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-[32px] p-16 text-center shadow-sm space-y-4">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <ImageIcon size={28} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">No images uploaded</p>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">Upload clinic images using the panel on the left to start displaying them in your scrolling gallery.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {images.map((image: any) => (
                <div 
                  key={image.id} 
                  className="group relative aspect-[4/3] rounded-[24px] overflow-hidden bg-white border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200"
                >
                  <img 
                    src={image.imageUrl} 
                    alt="Gallery" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 z-10">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setViewingImage(image.imageUrl)}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition-colors"
                        title="View Fullscreen"
                      >
                        <Eye size={16} />
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-bold">
                        <Calendar size={12} />
                        <span>
                          {new Date(image.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      <button
                        onClick={() => setImageToDelete(image)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors shadow-lg shadow-red-900/30"
                        title="Delete Image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!imageToDelete}
        onClose={() => setImageToDelete(null)}
        onConfirm={() => deleteMutation.mutate(imageToDelete.id)}
        isLoading={deleteMutation.isPending}
        title="Delete Gallery Image"
        description="Are you sure you want to delete this gallery image? This action will permanently remove it from Cloudinary and your website gallery."
        confirmText="Delete"
        isDanger
      />

      {/* Lightbox / View Modal */}
      {viewingImage && (
        <div 
          onClick={() => setViewingImage(null)}
          className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button className="absolute top-6 right-6 text-white/60 hover:text-white p-2 transition-colors">
            <X size={28} />
          </button>
          <img 
            src={viewingImage} 
            alt="Expanded Gallery View" 
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
