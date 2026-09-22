import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  FileCheck,
  CheckCircle,
  AlertCircle,
  XCircle,
  ExternalLink,
  MessageSquare,
  Clock,
  User,
  Eye,
  X,
  Loader2,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/content-submissions";
const FILE_URL = "http://localhost:5000";

export default function BrandContentReview({ applicationId, user }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  /*
  =======================================================
  LOAD SUBMISSIONS
  =======================================================
  */
  const loadSubmissions = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/workspace/${applicationId}`
      );

      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error("Unable to load submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      loadSubmissions();
    }
  }, [applicationId]);

  /*
  =======================================================
  STATUS CONFIG
  =======================================================
  */
  const getStatusConfig = (status) => {
    switch (status) {
      case "approved":
        return {
          label: "Approved",
          icon: <CheckCircle size={13} className="text-[#8B6F5A]" />,
          className: "bg-[#EDE7DC] text-[#2B241F] border-[#D7C9B8]",
        };

      case "changes_requested":
        return {
          label: "Changes Requested",
          icon: <AlertCircle size={13} className="text-[#C98B6B]" />,
          className: "bg-[#EDE7DC] text-[#C98B6B] border-[#D7C9B8]",
        };

      case "rejected":
        return {
          label: "Rejected",
          icon: <XCircle size={13} className="text-[#C98B6B]" />,
          className: "bg-[#C98B6B]/15 text-[#C98B6B] border-[#C98B6B]/30",
        };

      case "published":
        return {
          label: "Published",
          icon: <CheckCircle size={13} className="text-[#8B6F5A]" />,
          className: "bg-[#EDE7DC] text-[#2B241F] border-[#D7C9B8]",
        };

      default:
        return {
          label: "Pending Review",
          icon: <Clock size={13} className="text-[#8B6F5A]" />,
          className: "bg-[#EDE7DC] text-[#4A3A2E] border-[#D7C9B8]",
        };
    }
  };

  const openReview = (submission) => {
    setSelectedSubmission(submission);
    setFeedback(submission.feedback || "");
  };

  const closeReview = () => {
    setSelectedSubmission(null);
    setFeedback("");
  };

  const approveContent = async () => {
    if (!selectedSubmission) return;

    try {
      setReviewLoading(true);

      const response = await axios.put(
        `${API_URL}/${selectedSubmission._id}/status`,
        {
          brandId: user.id,
          status: "approved",
          feedback: "",
        }
      );

      const updated = response.data.submission;

      setSubmissions((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      );

      closeReview();
      alert("Content approved successfully.");
    } catch (error) {
      console.error("Approval error:", error);
      alert(error.response?.data?.message || "Unable to approve content.");
    } finally {
      setReviewLoading(false);
    }
  };

  const requestChanges = async () => {
    if (!selectedSubmission) return;

    if (!feedback.trim()) {
      alert("Please explain what changes the creator needs to make.");
      return;
    }

    try {
      setReviewLoading(true);

      const response = await axios.put(
        `${API_URL}/${selectedSubmission._id}/status`,
        {
          brandId: user.id,
          status: "changes_requested",
          feedback: feedback.trim(),
        }
      );

      const updated = response.data.submission;

      setSubmissions((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      );

      closeReview();
      alert("Changes requested successfully.");
    } catch (error) {
      console.error("Request changes error:", error);
      alert(error.response?.data?.message || "Unable to request changes.");
    } finally {
      setReviewLoading(false);
    }
  };

  const rejectContent = async () => {
    if (!selectedSubmission) return;

    if (!feedback.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    try {
      setReviewLoading(true);

      const response = await axios.put(
        `${API_URL}/${selectedSubmission._id}/status`,
        {
          brandId: user.id,
          status: "rejected",
          feedback: feedback.trim(),
        }
      );

      const updated = response.data.submission;

      setSubmissions((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      );

      closeReview();
      alert("Content rejected.");
    } catch (error) {
      console.error("Reject error:", error);
      alert(error.response?.data?.message || "Unable to reject content.");
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-[#FAF9F6] border border-[#D7C9B8] rounded-2xl overflow-hidden shadow-xs font-sans">
        <div className="p-5 border-b border-[#D7C9B8]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
              <FileCheck size={18} />
            </div>
            <div>
              <h2 className="font-extrabold text-[#2B241F] text-sm">
                Content Review
              </h2>
              <p className="text-[11px] text-[#4A3A2E]/70 mt-0.5">
                Review deliverables submitted by the creator
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 text-center">
          <Loader2 size={24} className="animate-spin mx-auto text-[#8B6F5A]" />
          <p className="text-[#4A3A2E]/70 text-xs mt-2 font-medium">
            Loading submitted content...
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-[#FAF9F6] border border-[#D7C9B8] rounded-2xl overflow-hidden shadow-xs font-sans">
        {/* HEADER */}
        <div className="p-5 border-b border-[#D7C9B8] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8] flex items-center justify-center">
              <FileCheck size={18} />
            </div>

            <div>
              <h2 className="font-extrabold text-[#2B241F] text-base">
                Content Review
              </h2>
              <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                Review campaign deliverables submitted by the creator
              </p>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-[#EDE7DC] border border-[#D7C9B8] text-xs font-bold text-[#4A3A2E]">
            {submissions.length} {submissions.length === 1 ? "Submission" : "Submissions"}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {submissions.length === 0 ? (
            <div className="py-12 text-center bg-[#EDE7DC]/20 rounded-xl border border-dashed border-[#D7C9B8]">
              <FileCheck size={36} className="mx-auto text-[#4A3A2E]/40" />
              <h3 className="font-bold text-xs text-[#2B241F] mt-2">
                No Content Submitted Yet
              </h3>
              <p className="text-[11px] text-[#4A3A2E]/70 mt-0.5">
                The creator has not submitted campaign content yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {submissions.map((submission) => {
                const status = getStatusConfig(submission.status);

                return (
                  <div
                    key={submission._id}
                    className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 p-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* LEFT */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] text-[#8B6F5A] border border-[#D7C9B8] flex items-center justify-center shrink-0">
                          <FileCheck size={18} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-xs text-[#2B241F]">
                            {submission.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span className="px-2 py-0.5 rounded-lg bg-[#FAF9F6] border border-[#D7C9B8] text-[10px] font-bold text-[#4A3A2E]">
                              {submission.platform}
                            </span>

                            <span className="px-2 py-0.5 rounded-lg bg-[#FAF9F6] border border-[#D7C9B8] text-[10px] font-bold text-[#4A3A2E]">
                              {submission.contentType}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1 ${status.className}`}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#4A3A2E]/70 font-medium">
                            <User size={12} />
                            {submission.creatorId?.name || "Creator"}
                          </div>
                        </div>
                      </div>

                      {/* ACTION */}
                      <button
                        onClick={() => openReview(submission)}
                        className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white text-xs font-bold transition shadow-xs shrink-0"
                      >
                        <Eye size={13} />
                        Review Content
                      </button>
                    </div>

                    {/* FEEDBACK */}
                    {submission.feedback && (
                      <div className="mt-3 p-3 rounded-xl bg-[#EDE7DC] border border-[#D7C9B8]">
                        <p className="text-[11px] text-[#2B241F] font-bold">
                          Previous Feedback
                        </p>
                        <p className="text-xs text-[#4A3A2E] mt-0.5">
                          {submission.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =================================================
          REVIEW MODAL
      ================================================= */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-[#2B241F]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FAF9F6] border border-[#D7C9B8] rounded-2xl shadow-xl">
            {/* MODAL HEADER */}
            <div className="p-5 border-b border-[#D7C9B8] flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#2B241F]">
                  Review Deliverable
                </h2>
                <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                  {selectedSubmission.title}
                </p>
              </div>

              <button
                onClick={closeReview}
                className="p-1.5 rounded-xl text-[#4A3A2E]/60 hover:bg-[#EDE7DC] hover:text-[#2B241F]"
              >
                <X size={16} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 space-y-4 text-xs">
              {/* CREATOR */}
              <div className="p-3.5 rounded-xl bg-[#EDE7DC]/30 border border-[#D7C9B8]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] text-[#8B6F5A] flex items-center justify-center font-bold text-xs shadow-xs">
                    {(selectedSubmission.creatorId?.name || "C")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <p className="font-bold text-[#2B241F]">
                      {selectedSubmission.creatorId?.name || "Creator"}
                    </p>
                    <p className="text-[11px] text-[#4A3A2E]/70">
                      {selectedSubmission.creatorId?.email || ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* DETAILS */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#EDE7DC]/30 border border-[#D7C9B8]">
                  <p className="text-[10px] font-bold text-[#4A3A2E]/70 uppercase">Platform</p>
                  <p className="font-bold text-[#2B241F] mt-0.5">
                    {selectedSubmission.platform}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#EDE7DC]/30 border border-[#D7C9B8]">
                  <p className="text-[10px] font-bold text-[#4A3A2E]/70 uppercase">Content Type</p>
                  <p className="font-bold text-[#2B241F] mt-0.5">
                    {selectedSubmission.contentType}
                  </p>
                </div>
              </div>

              {/* FILE */}
              {selectedSubmission.fileUrl && (
                <div>
                  <p className="font-bold text-[#4A3A2E] mb-1.5">Submitted Media</p>
                  <div className="p-3.5 rounded-xl bg-[#EDE7DC]/30 border border-[#D7C9B8] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF9F6] text-[#8B6F5A] border border-[#D7C9B8] flex items-center justify-center">
                        <FileCheck size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#2B241F]">Campaign Content File</p>
                        <p className="text-[10px] text-[#4A3A2E]/70">Click to view original media</p>
                      </div>
                    </div>

                    <a
                      href={`${FILE_URL}${selectedSubmission.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF9F6] border border-[#D7C9B8] text-[#2B241F] text-xs font-bold hover:bg-[#EDE7DC] shadow-xs"
                    >
                      <ExternalLink size={12} />
                      Open Asset
                    </a>
                  </div>
                </div>
              )}

              {/* LIVE URL */}
              {selectedSubmission.liveUrl && (
                <div>
                  <p className="font-bold text-[#4A3A2E] mb-1">Live Content URL</p>
                  <a
                    href={selectedSubmission.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 p-3 rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] text-[#2B241F] font-bold break-all hover:underline"
                  >
                    <ExternalLink size={13} className="shrink-0 text-[#8B6F5A]" />
                    {selectedSubmission.liveUrl}
                  </a>
                </div>
              )}

              {/* CAPTION */}
              {selectedSubmission.caption && (
                <div>
                  <p className="font-bold text-[#4A3A2E] mb-1">Caption</p>
                  <div className="p-3 rounded-xl bg-[#EDE7DC]/30 border border-[#D7C9B8] text-[#2B241F] whitespace-pre-wrap">
                    {selectedSubmission.caption}
                  </div>
                </div>
              )}

              {/* FEEDBACK INPUT */}
              {["submitted", "under_review"].includes(selectedSubmission.status) && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1 text-[#4A3A2E]">
                    <MessageSquare size={14} className="text-[#8B6F5A]" />
                    <label className="font-bold">Review Feedback</label>
                  </div>

                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    placeholder="Tell the creator what needs to be adjusted..."
                    className="w-full bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl p-3 text-xs text-[#2B241F] placeholder:text-[#4A3A2E]/40 outline-none focus:border-[#8B6F5A] focus:ring-1 focus:ring-[#8B6F5A] resize-none"
                  />
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            {["submitted", "under_review"].includes(selectedSubmission.status) && (
              <div className="p-4 border-t border-[#D7C9B8] flex justify-end gap-2">
                <button
                  onClick={rejectContent}
                  disabled={reviewLoading}
                  className="px-3.5 py-2 rounded-xl border border-[#C98B6B]/40 bg-[#C98B6B]/10 text-[#C98B6B] hover:bg-[#C98B6B]/20 text-xs font-bold disabled:opacity-50"
                >
                  <span className="flex items-center gap-1.5">
                    <XCircle size={13} />
                    Reject
                  </span>
                </button>

                <button
                  onClick={requestChanges}
                  disabled={reviewLoading}
                  className="px-3.5 py-2 rounded-xl border border-[#D7C9B8] bg-[#EDE7DC] text-[#2B241F] hover:bg-[#D7C9B8] text-xs font-bold disabled:opacity-50"
                >
                  <span className="flex items-center gap-1.5">
                    <AlertCircle size={13} />
                    Request Changes
                  </span>
                </button>

                <button
                  onClick={approveContent}
                  disabled={reviewLoading}
                  className="px-4 py-2 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white text-xs font-bold disabled:opacity-50 shadow-xs"
                >
                  <span className="flex items-center gap-1.5">
                    {reviewLoading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <CheckCircle size={13} />
                    )}
                    Approve Content
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}