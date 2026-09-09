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

const API_URL =
  "http://localhost:5000/api/content-submissions";

const FILE_URL =
  "http://localhost:5000";

export default function BrandContentReview({
  applicationId,
  user,
}) {
  const [submissions, setSubmissions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedSubmission, setSelectedSubmission] =
    useState(null);

  const [feedback, setFeedback] = useState("");

  const [reviewLoading, setReviewLoading] =
    useState(false);

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

      setSubmissions(
        response.data.submissions || []
      );
    } catch (error) {
      console.error(
        "Unable to load submissions:",
        error
      );
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
          icon: (
            <CheckCircle
              size={15}
              className="text-green-400"
            />
          ),
          className:
            "bg-green-500/10 text-green-400 border-green-500/20",
        };

      case "changes_requested":
        return {
          label: "Changes Requested",
          icon: (
            <AlertCircle
              size={15}
              className="text-yellow-400"
            />
          ),
          className:
            "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        };

      case "rejected":
        return {
          label: "Rejected",
          icon: (
            <XCircle
              size={15}
              className="text-red-400"
            />
          ),
          className:
            "bg-red-500/10 text-red-400 border-red-500/20",
        };

      case "published":
        return {
          label: "Published",
          icon: (
            <CheckCircle
              size={15}
              className="text-cyan-400"
            />
          ),
          className:
            "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        };

      default:
        return {
          label: "Pending Review",
          icon: (
            <Clock
              size={15}
              className="text-violet-400"
            />
          ),
          className:
            "bg-violet-500/10 text-violet-400 border-violet-500/20",
        };
    }
  };

  /*
  =======================================================
  OPEN REVIEW
  =======================================================
  */

  const openReview = (submission) => {
    setSelectedSubmission(submission);

    setFeedback(
      submission.feedback || ""
    );
  };

  /*
  =======================================================
  CLOSE REVIEW
  =======================================================
  */

  const closeReview = () => {
    setSelectedSubmission(null);
    setFeedback("");
  };

  /*
  =======================================================
  APPROVE
  =======================================================
  */

  const approveContent = async () => {
    if (!selectedSubmission) {
      return;
    }

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

      const updated =
        response.data.submission;

      setSubmissions((prev) =>
        prev.map((item) =>
          item._id === updated._id
            ? updated
            : item
        )
      );

      closeReview();

      alert(
        "Content approved successfully."
      );
    } catch (error) {
      console.error(
        "Approval error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to approve content."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  /*
  =======================================================
  REQUEST CHANGES
  =======================================================
  */

  const requestChanges = async () => {
    if (!selectedSubmission) {
      return;
    }

    if (!feedback.trim()) {
      alert(
        "Please explain what changes the creator needs to make."
      );
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

      const updated =
        response.data.submission;

      setSubmissions((prev) =>
        prev.map((item) =>
          item._id === updated._id
            ? updated
            : item
        )
      );

      closeReview();

      alert(
        "Changes requested successfully."
      );
    } catch (error) {
      console.error(
        "Request changes error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to request changes."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  /*
  =======================================================
  REJECT
  =======================================================
  */

  const rejectContent = async () => {
    if (!selectedSubmission) {
      return;
    }

    if (!feedback.trim()) {
      alert(
        "Please provide a reason for rejection."
      );
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

      const updated =
        response.data.submission;

      setSubmissions((prev) =>
        prev.map((item) =>
          item._id === updated._id
            ? updated
            : item
        )
      );

      closeReview();

      alert(
        "Content rejected."
      );
    } catch (error) {
      console.error(
        "Reject error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to reject content."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  /*
  =======================================================
  LOADING
  =======================================================
  */

  if (loading) {
    return (
      <section className="bg-[#11111f] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <FileCheck
              size={20}
              className="text-violet-400"
            />

            <div>
              <h2 className="font-semibold">
                Content Review
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Review content submitted by the creator
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 text-center">
          <Loader2
            size={28}
            className="animate-spin mx-auto text-violet-400"
          />

          <p className="text-gray-500 text-sm mt-3">
            Loading submitted content...
          </p>
        </div>
      </section>
    );
  }

  /*
  =======================================================
  MAIN UI
  =======================================================
  */

  return (
    <>
      <section className="bg-[#11111f] border border-white/10 rounded-2xl overflow-hidden">
        {/* HEADER */}

        <div className="p-5 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <FileCheck
                size={20}
                className="text-violet-400"
              />
            </div>

            <div>
              <h2 className="font-semibold">
                Content Review
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Review campaign content submitted by the creator
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-400">
            {submissions.length}{" "}
            {submissions.length === 1
              ? "Submission"
              : "Submissions"}
          </div>
        </div>

        {/* CONTENT */}

        <div className="p-5">
          {submissions.length === 0 ? (
            <div className="py-10 text-center">
              <FileCheck
                size={40}
                className="mx-auto text-gray-700"
              />

              <h3 className="font-medium mt-4">
                No Content Submitted
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                The creator has not submitted campaign
                content yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => {
                const status =
                  getStatusConfig(
                    submission.status
                  );

                return (
                  <div
                    key={submission._id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* LEFT */}

                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                          <FileCheck
                            size={20}
                            className="text-violet-400"
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-semibold">
                            {submission.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-gray-400">
                              {submission.platform}
                            </span>

                            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-gray-400">
                              {submission.contentType}
                            </span>

                            <span
                              className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 ${status.className}`}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                            <User size={13} />

                            {submission.creatorId?.name ||
                              "Creator"}
                          </div>
                        </div>
                      </div>

                      {/* ACTION */}

                      <button
                        onClick={() =>
                          openReview(submission)
                        }
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-sm font-medium transition"
                      >
                        <Eye size={16} />

                        Review Content
                      </button>
                    </div>

                    {/* FEEDBACK */}

                    {submission.feedback && (
                      <div className="mt-4 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                        <p className="text-xs text-yellow-400 font-medium">
                          Previous Feedback
                        </p>

                        <p className="text-sm text-gray-400 mt-1">
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#10101c] border border-white/10 rounded-2xl shadow-2xl">
            {/* MODAL HEADER */}

            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Review Content
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {selectedSubmission.title}
                </p>
              </div>

              <button
                onClick={closeReview}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="p-5 space-y-5">
              {/* CREATOR */}

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center font-bold">
                    {(
                      selectedSubmission.creatorId
                        ?.name || "C"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <p className="font-medium">
                      {selectedSubmission.creatorId
                        ?.name || "Creator"}
                    </p>

                    <p className="text-xs text-gray-500">
                      {selectedSubmission.creatorId
                        ?.email || ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* DETAILS */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <p className="text-xs text-gray-500">
                    Platform
                  </p>

                  <p className="font-medium mt-1">
                    {selectedSubmission.platform}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <p className="text-xs text-gray-500">
                    Content Type
                  </p>

                  <p className="font-medium mt-1">
                    {selectedSubmission.contentType}
                  </p>
                </div>
              </div>

              {/* FILE */}

              {selectedSubmission.fileUrl && (
                <div>
                  <p className="text-sm font-medium mb-3">
                    Submitted File
                  </p>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <FileCheck
                          size={19}
                          className="text-violet-400"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-medium">
                          Campaign Content
                        </p>

                        <p className="text-xs text-gray-500">
                          Click to view submitted file
                        </p>
                      </div>
                    </div>

                    <a
                      href={`${FILE_URL}${selectedSubmission.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm transition"
                    >
                      <ExternalLink size={15} />
                      Open File
                    </a>
                  </div>
                </div>
              )}

              {/* LIVE URL */}

              {selectedSubmission.liveUrl && (
                <div>
                  <p className="text-sm font-medium mb-3">
                    Live Content URL
                  </p>

                  <a
                    href={selectedSubmission.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-cyan-400 hover:text-cyan-300 break-all"
                  >
                    <ExternalLink size={16} />

                    {selectedSubmission.liveUrl}
                  </a>
                </div>
              )}

              {/* CAPTION */}

              {selectedSubmission.caption && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Caption
                  </p>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-gray-400 whitespace-pre-wrap">
                    {selectedSubmission.caption}
                  </div>
                </div>
              )}

              {/* DESCRIPTION */}

              {selectedSubmission.description && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Description
                  </p>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-gray-400 whitespace-pre-wrap">
                    {selectedSubmission.description}
                  </div>
                </div>
              )}

              {/* FEEDBACK */}

              {["submitted", "under_review"].includes(
                selectedSubmission.status
              ) && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare
                      size={16}
                      className="text-violet-400"
                    />

                    <p className="text-sm font-medium">
                      Review Feedback
                    </p>
                  </div>

                  <textarea
                    value={feedback}
                    onChange={(e) =>
                      setFeedback(e.target.value)
                    }
                    rows={4}
                    placeholder="Tell the creator what needs to be changed..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none focus:border-violet-500"
                  />
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}

            {["submitted", "under_review"].includes(
              selectedSubmission.status
            ) && (
              <div className="p-5 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={rejectContent}
                  disabled={reviewLoading}
                  className="px-4 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition"
                >
                  <span className="flex items-center gap-2">
                    <XCircle size={16} />
                    Reject
                  </span>
                </button>

                <button
                  onClick={requestChanges}
                  disabled={reviewLoading}
                  className="px-4 py-2.5 rounded-xl border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10 disabled:opacity-50 transition"
                >
                  <span className="flex items-center gap-2">
                    <AlertCircle size={16} />
                    Request Changes
                  </span>
                </button>

                <button
                  onClick={approveContent}
                  disabled={reviewLoading}
                  className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 transition font-medium"
                >
                  <span className="flex items-center gap-2">
                    {reviewLoading ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <CheckCircle size={16} />
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