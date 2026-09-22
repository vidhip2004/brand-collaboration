import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Send,
  Plus,
  CheckCircle,
  Clock,
  Upload,
  FileText,
  MessageCircle,
  Users,
  Calendar,
  X,
  ExternalLink,
  FileCheck,
  Eye,
  Check,
  RotateCcw,
  XCircle,
  Image as ImageIcon,
  Video,
  CreditCard,
  Wallet,
  Sparkles,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../services/authService";
import {
  getCurrencyFromCountry,
  formatCurrency,
  convertCurrency,
} from "../../services/currency";

const WORKSPACE_API = "http://localhost:5000/api/workspaces";
const CONTENT_API = "http://localhost:5000/api/content-submissions";

const statusStyles = {
  todo: "bg-[#EDE7DC]/40 text-[#4A3A2E] border-[#D7C9B8]",
  "in-progress": "bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]",
  completed: "bg-[#FAF9F6] text-[#8B6F5A] border-[#8B6F5A]",
};

const contentStatusStyles = {
  submitted: "bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]",
  under_review: "bg-[#EDE7DC] text-[#C98B6B] border-[#D7C9B8]",
  changes_requested: "bg-[#EDE7DC] text-[#C98B6B] border-[#D7C9B8]",
  approved: "bg-[#FAF9F6] text-[#8B6F5A] border-[#8B6F5A]",
  published: "bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]",
  rejected: "bg-rose-50 text-rose-700 border-rose-300",
};

const contentStatusLabels = {
  submitted: "Submitted",
  under_review: "Under Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  published: "Published",
  rejected: "Rejected",
};

export default function CollaborationWorkspace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const applicationId = searchParams.get("applicationId");
  const campaignIdFromUrl = searchParams.get("campaignId");
  const tabFromUrl = searchParams.get("tab");

  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [displayBudget, setDisplayBudget] = useState(null);

  const [activeTab, setActiveTab] = useState(tabFromUrl || "overview");
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Messages
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Tasks
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  // Shared files
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Content review
  const [contentSubmissions, setContentSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const isBrand = user?.role === "brand";
  const isCreator = user?.role === "creator";
  const viewerCurrency = getCurrencyFromCountry(user?.country);

  const campaign = workspace?.campaignId;
  const brand = workspace?.brandId;
  const creator = workspace?.creatorId;

  useEffect(() => {
    const loadWorkspaceBudget = async () => {
      if (!campaign?.budget || !campaign?.currency || !user?.country) {
        return;
      }

      try {
        const converted = await convertCurrency(
          campaign.budget,
          campaign.currency,
          viewerCurrency.code
        );

        setDisplayBudget(converted);
      } catch (error) {
        console.error("Workspace budget conversion error:", error);
        setDisplayBudget(campaign.budget);
      }
    };

    loadWorkspaceBudget();
  }, [
    campaign?._id,
    campaign?.budget,
    campaign?.currency,
    user?.country,
    viewerCurrency.code,
  ]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    setUser(currentUser);
  }, [navigate]);

  const loadWorkspace = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError("");

      if (!applicationId) {
        setError("Application ID is missing.");
        return;
      }

      const response = await axios.get(
        `${WORKSPACE_API}/application/${applicationId}`
      );

      setWorkspace(response.data.workspace);
    } catch (err) {
      console.error("Workspace loading error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load collaboration workspace."
      );
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const loadContentSubmissions = async () => {
    if (!applicationId || !isBrand) return;

    try {
      setLoadingSubmissions(true);

      const response = await axios.get(
        `${CONTENT_API}/workspace/${applicationId}`
      );

      setContentSubmissions(response.data.submissions || []);
    } catch (err) {
      console.error("Content submissions loading error:", err);
      alert(
        err.response?.data?.message ||
          "Unable to load creator content submissions."
      );
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (applicationId && user) {
      loadWorkspace();
    }
  }, [applicationId, user]);

  useEffect(() => {
    if (applicationId && isBrand) {
      loadContentSubmissions();
    }
  }, [applicationId, isBrand]);

  const collaboratorName = isBrand
    ? creator?.name || "Creator"
    : brand?.companyName || brand?.name || "Brand";

  const tasks = workspace?.tasks || [];
  const messages = workspace?.messages || [];
  const files = workspace?.files || [];
  const activity = workspace?.activity || [];

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const progress =
    tasks.length > 0
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

  const pendingReviews = useMemo(
    () =>
      contentSubmissions.filter((item) =>
        ["submitted", "under_review"].includes(item.status)
      ).length,
    [contentSubmissions]
  );

  const getFileUrl = (url) => {
    if (!url) return "#";

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    return `http://localhost:5000${
      url.startsWith("/") ? url : `/${url}`
    }`;
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getSubmissionIcon = (submission) => {
    const type = String(submission?.contentType || "").toLowerCase();

    if (
      type.includes("video") ||
      type.includes("reel") ||
      type.includes("short")
    ) {
      return Video;
    }

    return ImageIcon;
  };

  const sendMessage = async () => {
    if (!message.trim() || !workspace?._id || !user?.id) return;

    try {
      setSendingMessage(true);

      const response = await axios.post(
        `${WORKSPACE_API}/${workspace._id}/messages`,
        {
          senderId: user.id,
          message: message.trim(),
        }
      );

      setWorkspace(response.data.workspace);
      setMessage("");
    } catch (err) {
      console.error("Send message error:", err);
      alert(err.response?.data?.message || "Unable to send message.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleMessageKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const addTask = async () => {
    if (!taskTitle.trim()) {
      alert("Please enter a task title.");
      return;
    }

    if (!workspace?._id || !user?.id) return;

    try {
      setAddingTask(true);

      const response = await axios.post(
        `${WORKSPACE_API}/${workspace._id}/tasks`,
        {
          userId: user.id,
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          dueDate: taskDueDate || null,
        }
      );

      setWorkspace(response.data.workspace);
      setTaskTitle("");
      setTaskDescription("");
      setTaskDueDate("");
      setShowTaskModal(false);
    } catch (err) {
      console.error("Add task error:", err);
      alert(err.response?.data?.message || "Unable to create task.");
    } finally {
      setAddingTask(false);
    }
  };

  const updateTask = async (taskId, status) => {
    if (!workspace?._id || !user?.id) return;

    try {
      const response = await axios.put(
        `${WORKSPACE_API}/${workspace._id}/tasks/${taskId}`,
        {
          userId: user.id,
          status,
        }
      );

      setWorkspace(response.data.workspace);
    } catch (err) {
      console.error("Update task error:", err);
      alert(err.response?.data?.message || "Unable to update task.");
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length > 10) {
      alert("You can select a maximum of 10 files.");
      return;
    }

    setSelectedFiles(files);
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);

    const input = document.getElementById("workspace-file-input");
    if (input) {
      input.value = "";
    }
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one file.");
      return;
    }

    try {
      setUploadingFile(true);

      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      formData.append("userId", user.id);

      const response = await axios.post(
        `${WORKSPACE_API}/${workspace._id}/files`,
        formData
      );

      setWorkspace(response.data.workspace);
      clearSelectedFiles();
    } catch (err) {
      console.error("File upload error:", err);
      alert(err.response?.data?.message || "Unable to upload files.");
    } finally {
      setUploadingFile(false);
    }
  };

  const openContentReview = (submission) => {
    setSelectedSubmission(submission);
    setReviewFeedback(submission.feedback || "");
  };

  const closeContentReview = () => {
    if (reviewLoading) return;

    setSelectedSubmission(null);
    setReviewFeedback("");
  };

  const reviewSubmission = async (status) => {
    if (!selectedSubmission?._id || !user?.id) return;

    if (
      ["changes_requested", "rejected"].includes(status) &&
      !reviewFeedback.trim()
    ) {
      alert(
        status === "changes_requested"
          ? "Please explain what changes the creator needs to make."
          : "Please provide a reason for rejecting the content."
      );
      return;
    }

    try {
      setReviewLoading(true);

      const response = await axios.put(
        `${CONTENT_API}/${selectedSubmission._id}/status`,
        {
          brandId: user.id,
          status,
          feedback: reviewFeedback.trim(),
        }
      );

      const updatedSubmission = response.data.submission;

      setContentSubmissions((prev) =>
        prev.map((item) =>
          item._id === updatedSubmission._id ? updatedSubmission : item
        )
      );

      setSelectedSubmission(updatedSubmission);
      setReviewFeedback(updatedSubmission.feedback || "");

      await loadWorkspace(false);

      if (status === "approved") {
        alert("Content approved successfully.");
      } else if (status === "changes_requested") {
        alert("Changes requested from the creator.");
      } else {
        alert("Content rejected.");
      }
    } catch (err) {
      console.error("Content review error:", err);
      alert(err.response?.data?.message || "Unable to update content status.");
    } finally {
      setReviewLoading(false);
    }
  };

  const openCreatorSubmission = () => {
    navigate(
      `/creator/content-submission?campaignId=${
        campaign?._id || campaignIdFromUrl || ""
      }&applicationId=${applicationId || ""}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#8B6F5A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-[#4A3A2E]/70">
            Loading collaboration workspace...
          </p>
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] flex items-center justify-center px-6 font-sans">
        <div className="text-center max-w-sm bg-[#FAF9F6] p-8 rounded-3xl border border-red-300 shadow-xs w-full">
          <div className="text-rose-700 text-sm font-bold mb-4">
            {error || "Workspace not found"}
          </div>

          <button
            onClick={() => navigate(-1)}
            className="w-full px-5 py-2.5 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-[#FAF9F6] text-xs font-bold shadow-xs transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] font-sans">
      {/* TOP HEADER */}
      <header className="border-b border-[#D7C9B8]/50 bg-[#FAF9F6]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] hover:bg-[#EDE7DC] text-[#4A3A2E] hover:text-[#2B241F] shrink-0 shadow-2xs transition"
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="min-w-0">
              <h1 className="text-lg font-extrabold text-[#2B241F] tracking-tight truncate">
                {campaign?.title || "Collaboration Workspace"}
              </h1>

              <p className="text-xs text-[#4A3A2E]/70 truncate">
                Working with <span className="font-bold text-[#8B6F5A]">{collaboratorName}</span>
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE7DC] border border-[#D7C9B8] text-[#8B6F5A] text-xs font-bold shrink-0">
            <CheckCircle size={14} />
            Collaboration Active
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* COLLABORATION SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 bg-[#FAF9F6] border border-[#D7C9B8] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <Users size={18} />
              </div>
              <h2 className="font-extrabold text-[#2B241F] text-sm tracking-tight">
                Collaboration Partners
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#EDE7DC]/40 border border-[#D7C9B8]/60">
                <p className="text-[10px] uppercase font-bold text-[#4A3A2E]/60 tracking-wider mb-0.5">
                  Brand
                </p>
                <p className="font-bold text-[#2B241F] text-sm">
                  {brand?.companyName || brand?.name || "Brand"}
                </p>
                <p className="text-xs text-[#4A3A2E]/70 mt-0.5 truncate">
                  {brand?.email || "No email"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#EDE7DC]/40 border border-[#D7C9B8]/60">
                <p className="text-[10px] uppercase font-bold text-[#4A3A2E]/60 tracking-wider mb-0.5">
                  Creator
                </p>
                <p className="font-bold text-[#2B241F] text-sm">
                  {creator?.name || "Creator"}
                </p>
                <p className="text-xs text-[#4A3A2E]/70 mt-0.5 truncate">
                  {creator?.email || "No email"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF9F6] border border-[#D7C9B8] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#4A3A2E]/60 tracking-wider mb-1">
                Campaign Budget
              </p>

              <p className="text-2xl font-black text-[#2B241F]">
                {displayBudget === null
                  ? "Calculating..."
                  : formatCurrency(displayBudget, viewerCurrency.code)}
              </p>

              <p className="text-[11px] text-[#4A3A2E]/60 mt-0.5">
                Original:{" "}
                {formatCurrency(campaign?.budget, campaign?.currency || "INR")}
              </p>

              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EDE7DC] text-[#8B6F5A] text-xs font-bold border border-[#D7C9B8] mt-3">
                {campaign?.campaignType || "Collaboration"}
              </span>
            </div>

            {campaign?.startDate && campaign?.endDate && (
              <div className="flex items-center gap-1.5 text-xs text-[#4A3A2E]/60 font-medium pt-3 mt-3 border-t border-[#D7C9B8]/40">
                <Calendar size={13} className="text-[#8B6F5A]" />
                {formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}
              </div>
            )}
          </div>
        </div>

        {/* WORKSPACE TABS */}
        <div className="flex gap-2 overflow-x-auto border-b border-[#D7C9B8]/50 pb-px">
          {[
            ["overview", "Overview"],
            ["tasks", "Tasks & Deliverables"],
            ...(isBrand ? [["content-review", "Content Review"]] : []),
            ["files", "Files"],
            ["messages", "Messages"],
            ["activity", "Activity"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`whitespace-nowrap pb-3 px-3.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
                activeTab === id
                  ? "border-[#8B6F5A] text-[#8B6F5A]"
                  : "border-transparent text-[#4A3A2E]/70 hover:text-[#2B241F]"
              }`}
            >
              <span>{label}</span>

              {id === "messages" && messages.length > 0 && (
                <span className="rounded-full bg-[#EDE7DC] px-1.5 py-0.2 text-[10px] font-extrabold text-[#8B6F5A]">
                  {messages.length}
                </span>
              )}

              {id === "content-review" && pendingReviews > 0 && (
                <span className="rounded-full bg-[#EDE7DC] px-1.5 py-0.2 text-[10px] font-extrabold text-[#C98B6B]">
                  {pendingReviews}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* =====================================================
            TAB 1: OVERVIEW
        ===================================================== */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-6">
              {/* Campaign Progress */}
              <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-[#2B241F] tracking-tight">
                      Campaign Deliverable Progress
                    </h2>
                    <p className="mt-0.5 text-xs text-[#4A3A2E]/70">
                      {completedTasks} of {tasks.length} tasks completed
                    </p>
                  </div>

                  <span className="text-xl font-black text-[#8B6F5A]">
                    {progress}%
                  </span>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#EDE7DC]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8B6F5A] to-[#C98B6B] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </section>

              {/* Content Workflow Card */}
              <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                    <FileCheck size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-[#2B241F] tracking-tight">
                      Content Workflow
                    </h2>
                    <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                      {isBrand
                        ? `${contentSubmissions.length} deliverable submission${
                            contentSubmissions.length !== 1 ? "s" : ""
                          } received`
                        : "Submit campaign content for brand review & approval."}
                    </p>
                  </div>
                </div>

                {isBrand ? (
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => setActiveTab("content-review")}
                      className="w-full rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] px-4 py-2.5 text-xs font-bold text-[#FAF9F6] shadow-xs transition"
                    >
                      Review Creator Deliverables
                    </button>

                    {contentSubmissions.some((s) =>
                      ["approved", "published"].includes(s.status)
                    ) && (
                      <button
                        onClick={() => navigate("/brand/payments")}
                        className="w-full rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] px-4 py-2.5 text-xs font-bold text-[#FAF9F6] flex items-center justify-center gap-2 shadow-xs transition"
                      >
                        <CreditCard size={15} />
                        Pay Creator (Payments)
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={openCreatorSubmission}
                    className="w-full rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] px-4 py-2.5 text-xs font-bold text-[#FAF9F6] shadow-xs transition"
                  >
                    Submit Deliverable Content
                  </button>
                )}
              </section>
            </div>

            {/* Campaign Details Right Card */}
            <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs space-y-4">
              <h2 className="text-base font-extrabold text-[#2B241F] tracking-tight">
                Campaign Brief
              </h2>

              <div className="space-y-3.5 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#4A3A2E]/60">
                    Category
                  </p>
                  <p className="font-semibold text-[#2B241F] mt-0.5">
                    {campaign?.category || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#4A3A2E]/60">
                    Target Platforms
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {(campaign?.platforms || []).length > 0 ? (
                      campaign.platforms.map((plat) => (
                        <span
                          key={plat}
                          className="rounded-lg bg-[#EDE7DC] border border-[#D7C9B8] px-2.5 py-0.5 text-xs font-bold text-[#2B241F]"
                        >
                          {plat}
                        </span>
                      ))
                    ) : (
                      <span className="text-[#4A3A2E]/60">—</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#4A3A2E]/60">
                    Deliverables
                  </p>
                  <p className="text-[#4A3A2E] mt-1 whitespace-pre-wrap leading-relaxed bg-[#EDE7DC]/40 p-3 rounded-xl border border-[#D7C9B8]/50">
                    {campaign?.deliverables || "—"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =====================================================
            TAB 2: TASKS & DELIVERABLES
        ===================================================== */}
        {activeTab === "tasks" && (
          <section className="bg-[#FAF9F6] border border-[#D7C9B8] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#D7C9B8]/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                  <CheckCircle size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#2B241F] tracking-tight">
                    Tasks & Deliverables Checklist
                  </h2>
                  <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                    Manage project milestones and action items.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#8B6F5A] hover:bg-[#785D4A] text-[#FAF9F6] rounded-xl text-xs font-bold shadow-xs transition"
              >
                <Plus size={14} />
                Add Task
              </button>
            </div>

            <div className="p-6">
              {tasks.length === 0 ? (
                <div className="text-center py-12 bg-[#EDE7DC]/30 rounded-2xl border border-dashed border-[#D7C9B8]">
                  <CheckCircle size={36} className="mx-auto mb-2 text-[#4A3A2E]/40" />
                  <p className="text-xs font-bold text-[#2B241F]">No tasks created yet</p>
                  <p className="text-[11px] text-[#4A3A2E]/60 mt-0.5">
                    Click "Add Task" to list collaboration deliverables.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      className="p-4 rounded-xl bg-[#EDE7DC]/30 border border-[#D7C9B8]/70 flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <h3
                          className={`font-bold text-xs ${
                            task.status === "completed"
                              ? "line-through text-[#4A3A2E]/40"
                              : "text-[#2B241F]"
                          }`}
                        >
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className="text-xs text-[#4A3A2E]/70 mt-1 whitespace-pre-wrap">
                            {task.description}
                          </p>
                        )}

                        {task.dueDate && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#4A3A2E]/60 mt-2 font-medium">
                            <Calendar size={12} className="text-[#8B6F5A]" />
                            Due {formatDate(task.dueDate)}
                          </div>
                        )}
                      </div>

                      <select
                        value={task.status || "todo"}
                        onChange={(event) =>
                          updateTask(task._id, event.target.value)
                        }
                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold shrink-0 outline-none ${
                          statusStyles[task.status || "todo"] ||
                          statusStyles.todo
                        }`}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* =====================================================
            TAB 3: BRAND CONTENT REVIEW
        ===================================================== */}
        {activeTab === "content-review" && isBrand && (
          <section className="bg-[#FAF9F6] border border-[#D7C9B8] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#D7C9B8]/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                  <FileCheck size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#2B241F] tracking-tight">
                    Creator Deliverables Review
                  </h2>
                  <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                    Review and approve submitted content from {collaboratorName}.
                  </p>
                </div>
              </div>

              <button
                onClick={loadContentSubmissions}
                disabled={loadingSubmissions}
                className="rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] hover:bg-[#EDE7DC] text-[#2B241F] px-3.5 py-1.5 text-xs font-bold shadow-2xs disabled:opacity-50"
              >
                {loadingSubmissions ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className="p-6">
              {loadingSubmissions ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-2 border-[#8B6F5A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-[#4A3A2E]/60">Loading submissions...</p>
                </div>
              ) : contentSubmissions.length === 0 ? (
                <div className="py-14 text-center bg-[#EDE7DC]/30 rounded-2xl border border-dashed border-[#D7C9B8]">
                  <FileCheck size={40} className="mx-auto mb-2 text-[#4A3A2E]/40" />
                  <h3 className="font-bold text-xs text-[#2B241F]">
                    No deliverables submitted yet
                  </h3>
                  <p className="text-[11px] text-[#4A3A2E]/60 mt-0.5">
                    The creator's campaign content will appear here once uploaded.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contentSubmissions.map((submission) => {
                    const Icon = getSubmissionIcon(submission);
                    const status = submission.status || "submitted";

                    return (
                      <div
                        key={submission._id}
                        className="rounded-xl border border-[#D7C9B8]/70 bg-[#EDE7DC]/20 p-5"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-[#FAF9F6] border border-[#D7C9B8] flex items-center justify-center text-[#8B6F5A] shrink-0 shadow-2xs">
                              <Icon size={20} />
                            </div>

                            <div className="min-w-0">
                              <h3 className="font-bold text-[#2B241F] text-sm truncate">
                                {submission.title || "Content Submission"}
                              </h3>

                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <span className="text-xs font-bold text-[#4A3A2E]">
                                  {submission.platform || "Platform"}
                                </span>
                                <span className="text-[#D7C9B8]">•</span>
                                <span className="text-xs text-[#4A3A2E]/70">
                                  {submission.contentType || "Content"}
                                </span>
                                <span
                                  className={`rounded-full border px-2 py-0.2 text-[10px] font-bold ${
                                    contentStatusStyles[status] ||
                                    contentStatusStyles.submitted
                                  }`}
                                >
                                  {contentStatusLabels[status] || status}
                                </span>
                              </div>

                              <p className="text-[11px] text-[#4A3A2E]/50 mt-1">
                                Submitted {formatDateTime(submission.submittedAt || submission.createdAt)}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => openContentReview(submission)}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-[#FAF9F6] px-4 py-2 text-xs font-bold shadow-xs shrink-0"
                          >
                            <Eye size={14} />
                            Review Content
                          </button>
                        </div>

                        {submission.feedback && (
                          <div className="mt-3.5 rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/50 p-3.5">
                            <p className="text-xs font-bold text-[#2B241F]">
                              Review Feedback / History
                            </p>
                            <p className="text-xs text-[#4A3A2E] mt-1 whitespace-pre-wrap">
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
        )}

        {/* =====================================================
            TAB 4: SHARED FILES
        ===================================================== */}
        {activeTab === "files" && (
          <section className="bg-[#FAF9F6] border border-[#D7C9B8] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#D7C9B8]/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#2B241F] tracking-tight">
                    Shared Files & Briefs
                  </h2>
                  <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                    Campaign briefs, creative guidelines, and assets.
                  </p>
                </div>
              </div>

              <div>
                <input
                  type="file"
                  id="workspace-file-input"
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleFileSelect}
                />
                <label
                  htmlFor="workspace-file-input"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#8B6F5A] hover:bg-[#785D4A] text-[#FAF9F6] rounded-xl text-xs font-bold cursor-pointer shadow-xs transition"
                >
                  <Upload size={14} />
                  Upload File
                </label>
              </div>
            </div>

            <div className="p-6">
              {selectedFiles.length > 0 && (
                <div className="mb-5 p-4 rounded-2xl bg-[#EDE7DC]/40 border border-[#D7C9B8]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold text-[#2B241F]">
                        Selected Files
                      </p>
                      <p className="text-[11px] text-[#4A3A2E]/60">
                        {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
                      </p>
                    </div>

                    <button
                      onClick={clearSelectedFiles}
                      className="p-1 rounded-lg text-[#4A3A2E]/50 hover:bg-[#EDE7DC]"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-52 overflow-y-auto">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={`${file.name}-${idx}`}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#FAF9F6] border border-[#D7C9B8]/50"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText size={16} className="text-[#8B6F5A] shrink-0" />
                          <p className="text-xs font-semibold text-[#2B241F] truncate">
                            {file.name}
                          </p>
                        </div>
                        <p className="text-[11px] text-[#4A3A2E]/60 shrink-0">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={uploadFiles}
                    disabled={uploadingFile}
                    className="w-full mt-3 py-2 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-[#FAF9F6] text-xs font-bold disabled:opacity-50 shadow-xs"
                  >
                    {uploadingFile ? "Uploading..." : `Confirm Upload (${selectedFiles.length})`}
                  </button>
                </div>
              )}

              {files.length === 0 ? (
                <div className="text-center py-12 bg-[#EDE7DC]/30 rounded-2xl border border-dashed border-[#D7C9B8]">
                  <FileText size={36} className="mx-auto mb-2 text-[#4A3A2E]/40" />
                  <p className="text-xs font-bold text-[#2B241F]">No shared files yet</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {files.map((file) => (
                    <a
                      key={file._id}
                      href={getFileUrl(file.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[#EDE7DC]/30 hover:bg-[#EDE7DC]/60 border border-[#D7C9B8]/70 hover:border-[#8B6F5A]/40 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] flex items-center justify-center shrink-0 border border-[#D7C9B8]">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-[#2B241F] truncate">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-[#4A3A2E]/60 mt-0.5">
                            Uploaded by {file.uploadedByName || "User"} • {formatDate(file.createdAt)}
                          </p>
                        </div>
                      </div>

                      <ExternalLink size={14} className="text-[#4A3A2E]/60 shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* =====================================================
            TAB 5: MESSAGES
        ===================================================== */}
        {activeTab === "messages" && (
          <section className="bg-[#FAF9F6] border border-[#D7C9B8] rounded-2xl overflow-hidden shadow-xs flex flex-col h-[600px]">
            <div className="p-4 px-6 border-b border-[#D7C9B8]/40 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <MessageCircle size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#2B241F] tracking-tight">
                  Direct Messages
                </h2>
                <p className="text-xs text-[#4A3A2E]/60">
                  Chatting with {collaboratorName}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#EDE7DC]/20">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-[#4A3A2E]/60 text-xs">
                  <div>
                    <MessageCircle size={36} className="mx-auto mb-2 text-[#4A3A2E]/30" />
                    <p className="font-bold text-[#2B241F]">No messages yet</p>
                    <p className="text-[11px] text-[#4A3A2E]/60 mt-0.5">
                      Say hello to {collaboratorName} to start collaborating.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const mine = String(msg.senderId) === String(user.id);

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs ${
                          mine
                            ? "bg-[#8B6F5A] text-[#FAF9F6] rounded-br-xs shadow-xs"
                            : "bg-[#FAF9F6] text-[#2B241F] border border-[#D7C9B8] rounded-bl-xs shadow-2xs"
                        }`}
                      >
                        <p className={`text-[10px] font-bold mb-0.5 ${mine ? "text-[#EDE7DC]" : "text-[#8B6F5A]"}`}>
                          {mine ? "You" : msg.senderName || "Partner"}
                        </p>

                        <p className="whitespace-pre-wrap break-words leading-relaxed">
                          {msg.message}
                        </p>

                        {msg.createdAt && (
                          <p className={`text-[9px] mt-1 text-right ${mine ? "text-[#EDE7DC]/80" : "text-[#4A3A2E]/50"}`}>
                            {formatDateTime(msg.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3.5 border-t border-[#D7C9B8]/40 bg-[#FAF9F6] flex gap-2">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleMessageKeyDown}
                rows={1}
                placeholder="Type your message..."
                className="flex-1 resize-none bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl px-4 py-2.5 text-xs text-[#2B241F] placeholder:text-[#4A3A2E]/40 outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15"
              />

              <button
                onClick={sendMessage}
                disabled={sendingMessage || !message.trim()}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-[#FAF9F6] disabled:opacity-40 shadow-xs"
              >
                <Send size={15} />
              </button>
            </div>
          </section>
        )}

        {/* =====================================================
            TAB 6: ACTIVITY
        ===================================================== */}
        {activeTab === "activity" && (
          <section className="bg-[#FAF9F6] border border-[#D7C9B8] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#D7C9B8]/40 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <Clock size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#2B241F] tracking-tight">
                  Collaboration Activity Timeline
                </h2>
                <p className="text-xs text-[#4A3A2E]/60">
                  Recent workspace events and updates.
                </p>
              </div>
            </div>

            <div className="p-6">
              {activity.length === 0 ? (
                <p className="text-center text-[#4A3A2E]/60 text-xs py-10">
                  No activity events recorded yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {activity
                    .slice()
                    .reverse()
                    .map((item) => (
                      <div key={item._id} className="flex gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-[#8B6F5A] mt-1.5 shrink-0" />
                        <div>
                          <p className="font-medium text-[#2B241F]">{item.text}</p>
                          {item.createdAt && (
                            <p className="text-[10px] text-[#4A3A2E]/50 mt-0.5">
                              {formatDateTime(item.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* =====================================================
          ADD TASK MODAL
      ===================================================== */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-[#2B241F]/40 backdrop-blur-xs flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-[#FAF9F6] border border-[#D7C9B8] rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-extrabold text-[#2B241F]">
                  Create Collaboration Task
                </h2>
                <p className="text-xs text-[#4A3A2E]/60 mt-0.5">
                  Add a milestone or action item for this campaign.
                </p>
              </div>

              <button
                onClick={() => setShowTaskModal(false)}
                className="p-1.5 rounded-xl text-[#4A3A2E]/60 hover:bg-[#EDE7DC] hover:text-[#2B241F]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#2B241F] block mb-1">
                  Task Title *
                </label>
                <input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#8B6F5A] text-xs text-[#2B241F]"
                  placeholder="e.g. Draft Instagram Reel script"
                />
              </div>

              <div>
                <label className="font-bold text-[#2B241F] block mb-1">
                  Description
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl p-3 outline-none focus:border-[#8B6F5A] text-xs text-[#2B241F] resize-none"
                  placeholder="Task details and deliverables notes..."
                />
              </div>

              <div>
                <label className="font-bold text-[#2B241F] block mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl px-3.5 py-2 outline-none focus:border-[#8B6F5A] text-xs text-[#2B241F]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D7C9B8]/40">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#D7C9B8] text-[#4A3A2E] font-bold hover:bg-[#EDE7DC]"
                >
                  Cancel
                </button>

                <button
                  onClick={addTask}
                  disabled={addingTask}
                  className="px-5 py-2 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-[#FAF9F6] font-bold disabled:opacity-50 shadow-xs"
                >
                  {addingTask ? "Creating..." : "Create Task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          BRAND CONTENT REVIEW MODAL
      ===================================================== */}
      {selectedSubmission && isBrand && (
        <div className="fixed inset-0 z-[60] bg-[#2B241F]/40 backdrop-blur-xs flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FAF9F6] border border-[#D7C9B8] rounded-3xl shadow-xl">
            <div className="sticky top-0 z-10 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#D7C9B8]/40 px-6 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-base font-extrabold text-[#2B241F] truncate">
                  {selectedSubmission.title || "Content Review"}
                </h2>
                <p className="text-xs text-[#4A3A2E]/60 mt-0.5">
                  Review deliverable submission and confirm approval.
                </p>
              </div>

              <button
                onClick={closeContentReview}
                disabled={reviewLoading}
                className="p-1.5 rounded-xl text-[#4A3A2E]/60 hover:bg-[#EDE7DC] hover:text-[#2B241F]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid sm:grid-cols-3 gap-2.5">
                <div className="rounded-xl bg-[#EDE7DC]/40 border border-[#D7C9B8] p-3">
                  <p className="text-[10px] uppercase font-bold text-[#4A3A2E]/60">Platform</p>
                  <p className="text-xs font-bold text-[#2B241F] mt-0.5">
                    {selectedSubmission.platform || "—"}
                  </p>
                </div>

                <div className="rounded-xl bg-[#EDE7DC]/40 border border-[#D7C9B8] p-3">
                  <p className="text-[10px] uppercase font-bold text-[#4A3A2E]/60">Content Type</p>
                  <p className="text-xs font-bold text-[#2B241F] mt-0.5">
                    {selectedSubmission.contentType || "—"}
                  </p>
                </div>

                <div className="rounded-xl bg-[#EDE7DC]/40 border border-[#D7C9B8] p-3">
                  <p className="text-[10px] uppercase font-bold text-[#4A3A2E]/60">Status</p>
                  <span
                    className={`inline-flex mt-1 rounded-full border px-2 py-0.2 text-[10px] font-bold ${
                      contentStatusStyles[selectedSubmission.status] ||
                      contentStatusStyles.submitted
                    }`}
                  >
                    {contentStatusLabels[selectedSubmission.status] ||
                      selectedSubmission.status ||
                      "Submitted"}
                  </span>
                </div>
              </div>

              {selectedSubmission.fileUrl && (
                <div className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/20 p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[#8B6F5A]" />
                      <h3 className="font-bold text-xs text-[#2B241F]">Submitted Media</h3>
                    </div>

                    <a
                      href={getFileUrl(selectedSubmission.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-[#8B6F5A] font-bold hover:underline"
                    >
                      Open Full Asset <ExternalLink size={12} />
                    </a>
                  </div>

                  <div className="rounded-xl overflow-hidden bg-[#FAF9F6] border border-[#D7C9B8] p-2">
                    {String(selectedSubmission.fileUrl).match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={getFileUrl(selectedSubmission.fileUrl)}
                        alt={selectedSubmission.title || "Submitted content"}
                        className="max-h-[300px] w-full object-contain mx-auto rounded-lg"
                      />
                    ) : (
                      <div className="py-8 text-center">
                        <FileText size={36} className="mx-auto mb-2 text-[#4A3A2E]/40" />
                        <p className="text-xs text-[#4A3A2E]/70">File uploaded for review</p>
                        <a
                          href={getFileUrl(selectedSubmission.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 mt-3 rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] px-3.5 py-1.5 text-xs font-bold text-[#2B241F] hover:bg-[#D7C9B8]"
                        >
                          View File <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedSubmission.liveUrl && (
                <div className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/40 p-3.5">
                  <p className="text-xs text-[#2B241F] font-bold">Live Post URL</p>
                  <a
                    href={selectedSubmission.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 flex items-center gap-1.5 text-xs text-[#8B6F5A] break-all font-semibold hover:underline"
                  >
                    {selectedSubmission.liveUrl}
                    <ExternalLink size={12} className="shrink-0" />
                  </a>
                </div>
              )}

              {selectedSubmission.caption && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#4A3A2E]/60">Caption</p>
                  <p className="text-xs text-[#4A3A2E] mt-1 whitespace-pre-wrap bg-[#EDE7DC]/30 p-3 rounded-xl border border-[#D7C9B8]/50">
                    {selectedSubmission.caption}
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-[#2B241F] block mb-1">
                  Brand Review Feedback
                </label>
                <textarea
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  rows={4}
                  placeholder="Provide constructive feedback for the creator..."
                  disabled={
                    reviewLoading ||
                    !["submitted", "under_review"].includes(selectedSubmission.status)
                  }
                  className="w-full resize-none bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl p-3 text-xs text-[#2B241F] placeholder:text-[#4A3A2E]/40 outline-none focus:border-[#8B6F5A] disabled:opacity-50"
                />
              </div>

              {["submitted", "under_review"].includes(selectedSubmission.status) ? (
                <div className="grid sm:grid-cols-3 gap-2.5 pt-2">
                  <button
                    onClick={() => reviewSubmission("approved")}
                    disabled={reviewLoading}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] disabled:opacity-50 px-3.5 py-2.5 text-xs font-bold text-[#FAF9F6] shadow-xs"
                  >
                    <Check size={14} />
                    Approve Content
                  </button>

                  <button
                    onClick={() => reviewSubmission("changes_requested")}
                    disabled={reviewLoading}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#C98B6B] hover:bg-[#B3785A] disabled:opacity-50 px-3.5 py-2.5 text-xs font-bold text-[#FAF9F6] shadow-xs"
                  >
                    <RotateCcw size={14} />
                    Request Changes
                  </button>

                  <button
                    onClick={() => reviewSubmission("rejected")}
                    disabled={reviewLoading}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 px-3.5 py-2.5 text-xs font-bold text-white shadow-xs"
                  >
                    <XCircle size={14} />
                    Reject
                  </button>
                </div>
              ) : (
                <div className="rounded-xl bg-[#EDE7DC]/40 border border-[#D7C9B8] p-3 text-center text-xs text-[#4A3A2E] font-semibold">
                  This deliverable submission has already been reviewed.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
