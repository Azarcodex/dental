"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import { 
  Star, 
  Trash2, 
  Check, 
  X, 
  Loader2, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  Calendar,
  Search,
  MessageSquareWarning,
  MessageCircle,
  MessageSquareCode
} from "lucide-react";
import { cn } from "@/lib/utils";
import Table from "@/components/ui/Table";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function ReviewsManagementPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [reviewToDelete, setReviewToDelete] = useState<any>(null);

  // --- Queries ---
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/reviews");
      return data.data;
    },
    refetchInterval: 5000, // Auto-update dashboard with incoming reviews
    staleTime: 0,
  });


  // --- Mutations ---
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      return axiosInstance.patch(`/admin/reviews/${id}`, { status });
    },
    onSuccess: (_, variables) => {
      toast.success(`Review ${variables.status === "approved" ? "approved" : "rejected"} successfully`);
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update review status");
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      return axiosInstance.delete(`/admin/reviews/${id}`);
    },
    onSuccess: () => {
      toast.success("Review deleted permanently");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      setReviewToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete review");
    }
  });

  // --- Calculations & Filters ---
  const pendingCount = reviews.filter((r: any) => r.status === "pending").length;
  const approvedCount = reviews.filter((r: any) => r.status === "approved").length;
  const rejectedCount = reviews.filter((r: any) => r.status === "rejected").length;

  const filteredReviews = reviews
    .filter((r: any) => r.status === activeTab)
    .filter((r: any) => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Helper for rendering rating stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={14} 
            className={cn(
              i < rating ? "text-amber-500 fill-amber-500" : "text-slate-200"
            )} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="space-y-1">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Review Management</h1>
        <p className="text-slate-500 font-medium">Approve, reject, or delete patient reviews submitted from the public site.</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div 
          onClick={() => setActiveTab("pending")}
          className={cn(
            "bg-white border rounded-2xl p-5 flex items-center gap-4 shadow-sm cursor-pointer hover:border-amber-200 transition-all",
            activeTab === "pending" ? "border-amber-500 ring-2 ring-amber-500/10" : "border-slate-100"
          )}
        >
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
            <MessageSquareWarning size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</p>
            <p className="text-xl font-black text-slate-950">{pendingCount}</p>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab("approved")}
          className={cn(
            "bg-white border rounded-2xl p-5 flex items-center gap-4 shadow-sm cursor-pointer hover:border-emerald-200 transition-all",
            activeTab === "approved" ? "border-emerald-500 ring-2 ring-emerald-500/10" : "border-slate-100"
          )}
        >
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
            <ThumbsUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved</p>
            <p className="text-xl font-black text-slate-950">{approvedCount}</p>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab("rejected")}
          className={cn(
            "bg-white border rounded-2xl p-5 flex items-center gap-4 shadow-sm cursor-pointer hover:border-rose-200 transition-all",
            activeTab === "rejected" ? "border-rose-500 ring-2 ring-rose-500/10" : "border-slate-100"
          )}
        >
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
            <ThumbsDown size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rejected</p>
            <p className="text-xl font-black text-slate-950">{rejectedCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="bg-slate-100/80 p-1.5 rounded-2xl flex gap-1 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("pending")}
            className={cn(
              "flex-1 md:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
              activeTab === "pending"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={cn(
              "flex-1 md:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
              activeTab === "approved"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={cn(
              "flex-1 md:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
              activeTab === "rejected"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by reviewer name or text..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-slate-900/5 outline-none w-full transition-all text-sm font-bold text-slate-900 placeholder:text-slate-400 shadow-sm"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="relative">
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center bg-white border border-slate-100 rounded-3xl">
            <Loader2 className="animate-spin text-slate-900" size={32} />
          </div>
        ) : filteredReviews.length > 0 ? (
          <Table headers={["Reviewer", "Rating", "Review Message", "Submitted Date", "Status", "Actions"]}>
            {filteredReviews.map((review: any) => (
              <tr key={review.id} className="group hover:bg-slate-50/50 transition-all">
                {/* Reviewer Name */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-sm uppercase shadow-inner">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-none">{review.name}</p>
                    </div>
                  </div>
                </td>

                {/* Rating */}
                <td className="px-6 py-5">
                  {renderStars(review.rating)}
                </td>

                {/* Description */}
                <td className="px-6 py-5 max-w-[300px]">
                  <p className="text-xs font-semibold text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-line" title={review.description}>
                    {review.description}
                  </p>
                </td>

                {/* Created Date */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={14} />
                    <span className="text-xs font-bold">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                    </span>
                  </div>
                </td>

                {/* Status Badge */}
                <td className="px-6 py-5">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border",
                    review.status === "approved" && "bg-emerald-50 text-emerald-600 border-emerald-100",
                    review.status === "pending" && "bg-amber-50 text-amber-600 border-amber-100",
                    review.status === "rejected" && "bg-rose-50 text-rose-600 border-rose-100"
                  )}>
                    {review.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1.5">
                    {review.status !== "approved" && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: review.id, status: "approved" })}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-600 rounded-xl transition-all"
                        title="Approve Review"
                        disabled={updateStatusMutation.isPending}
                      >
                        <Check size={16} />
                      </button>
                    )}
                    
                    {review.status !== "rejected" && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: review.id, status: "rejected" })}
                        className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-100 text-amber-600 rounded-xl transition-all"
                        title="Reject Review"
                        disabled={updateStatusMutation.isPending}
                      >
                        <X size={16} />
                      </button>
                    )}

                    <button
                      onClick={() => setReviewToDelete(review)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-xl transition-all"
                      title="Permanently Delete"
                      disabled={deleteReviewMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center bg-white border border-slate-100 rounded-3xl text-center p-6 shadow-sm">
            <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No reviews found</h3>
            <p className="text-sm text-slate-500 max-w-xs">There are no {activeTab} reviews {searchTerm ? "matching your search term" : "at this time"}.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!reviewToDelete}
        onClose={() => setReviewToDelete(null)}
        onConfirm={() => deleteReviewMutation.mutate(reviewToDelete.id)}
        isLoading={deleteReviewMutation.isPending}
        title="Permanently Delete Review"
        description={`Are you sure you want to delete the review by ${reviewToDelete?.name}? This action is permanent and cannot be undone.`}
        confirmText="Delete"
        isDanger
      />
    </div>
  );
}
