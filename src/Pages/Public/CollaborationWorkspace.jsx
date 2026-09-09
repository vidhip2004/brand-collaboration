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
  todo: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  "in-progress": "bg-amber-500/10 text-amber-300 border-amber-500/20",
  completed: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
};

const contentStatusStyles = {
  submitted: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  under_review: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  changes_requested: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  approved: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  published: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  rejected: "bg-red-500/10 text-red-300 border-red-500/20",
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

  const [displayBudget, setDisplayBudget] =
  useState(null);

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
  const viewerCurrency =
  getCurrencyFromCountry(
    user?.country
  );

  useEffect(() => {
  const loadWorkspaceBudget =
    async () => {
      if (
        !campaign?.budget ||
        !campaign?.currency ||
        !user?.country
      ) {
        return;
      }

      try {
        const converted =
          await convertCurrency(
            campaign.budget,
            campaign.currency,
            viewerCurrency.code
          );

        setDisplayBudget(
          converted
        );
      } catch (error) {
        console.error(
          "Workspace budget conversion error:",
          error
        );

        setDisplayBudget(
          campaign.budget
        );
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

  const campaign = workspace?.campaignId;
  const brand = workspace?.brandId;
  const creator = workspace?.creatorId;

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

    return `http://localhost:5000${url.startsWith("/") ? url : `/${url}`
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
    const type = String(
      submission?.contentType || ""
    ).toLowerCase();

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
      alert(
        err.response?.data?.message ||
        "Unable to send message."
      );
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
      alert(
        err.response?.data?.message ||
        "Unable to create task."
      );
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
      alert(
        err.response?.data?.message ||
        "Unable to update task."
      );
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

  const input = document.getElementById(
    "workspace-file-input"
  );

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

    console.log("FILES UPLOADED:", response.data);

    setWorkspace(response.data.workspace);
    clearSelectedFiles();

  } catch (err) {
    console.error("File upload error:", err);
    console.error("Server response:", err.response?.data);

    alert(
      err.response?.data?.message ||
        "Unable to upload files."
    );
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
          item._id === updatedSubmission._id
            ? updatedSubmission
            : item
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
      alert(
        err.response?.data?.message ||
        "Unable to update content status."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const openCreatorSubmission = () => {
    navigate(
      `/creator/content-submission?campaignId=${campaign?._id || campaignIdFromUrl || ""
      }&applicationId=${applicationId || ""}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080812] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">
            Loading workspace...
          </p>
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="min-h-screen bg-[#080812] text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-lg mb-4">
            {error || "Workspace not found"}
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080812] text-white">
      <header className="border-b border-white/10 bg-[#0d0d1a] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-white/10 shrink-0"
              title="Go back"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">
                {campaign?.title || "Collaboration Workspace"}
              </h1>

              <p className="text-sm text-gray-400 truncate">
                Working with {collaboratorName}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 shrink-0">
            <CheckCircle size={16} />
            Collaboration Active
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Collaboration summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="md:col-span-2 bg-[#11111f] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <Users
                size={20}
                className="text-violet-400"
              />
              <h2 className="font-semibold">
                Collaboration
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-xs text-gray-500 mb-1">
                  Brand
                </p>
                <p className="font-medium">
                  {brand?.companyName ||
                    brand?.name ||
                    "Brand"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {brand?.email || "No email"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-xs text-gray-500 mb-1">
                  Creator
                </p>
                <p className="font-medium">
                  {creator?.name || "Creator"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {creator?.email || "No email"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#11111f] border border-white/10 rounded-2xl p-5">
            <p className="text-xs text-gray-500 mb-2">
              Campaign Budget
            </p>

            <p className="text-2xl font-bold text-violet-400">
  {displayBudget === null
    ? "Calculating..."
    : formatCurrency(
        displayBudget,
        viewerCurrency.code
      )}
</p>

<p className="text-xs text-gray-500 mt-1">
  Original:{" "}
  {formatCurrency(
    campaign?.budget,
    campaign?.currency || "INR"
  )}
</p>

            <p className="text-sm text-gray-400 mt-2">
              {campaign?.campaignType || "Campaign"}
            </p>

            {campaign?.startDate && campaign?.endDate && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                <Calendar size={14} />
                {formatDate(campaign.startDate)} —{" "}
                {formatDate(campaign.endDate)}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-white/10">
          {[
            ["overview", "Overview"],
            ["tasks", "Tasks & Deliverables"],
            ...(isBrand
              ? [["content-review", "Content Review"]]
              : []),
            ["files", "Files"],
            ["messages", "Messages"],
            ["activity", "Activity"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === id
                  ? "border-violet-400 text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
            >
              {label}

              {id === "messages" && (
                <span className="ml-2 rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[10px] text-violet-300">
                  {messages.length}
                </span>
              )}

              {id === "content-review" && pendingReviews > 0 && (
                <span className="ml-2 rounded-full bg-orange-500/20 px-1.5 py-0.5 text-[10px] text-orange-300">
                  {pendingReviews}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="mt-7 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Campaign Progress
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {completedTasks} of {tasks.length} tasks
                      completed
                    </p>
                  </div>

                  <span className="text-2xl font-bold text-violet-300">
                    {progress}%
                  </span>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <div className="flex items-center gap-3">
                  <FileCheck
                    size={20}
                    className="text-cyan-400"
                  />
                  <div>
                    <h2 className="font-semibold">
                      Content Workflow
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {isBrand
                        ? `${contentSubmissions.length} content submission${contentSubmissions.length !== 1
                          ? "s"
                          : ""
                        } received`
                        : "Submit campaign content for brand review."}
                    </p>
                  </div>
                </div>

                {isBrand ? (
                  <button
                    onClick={() =>
                      setActiveTab("content-review")
                    }
                    className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold hover:bg-violet-500"
                  >
                    Review Creator Content
                  </button>
                ) : (
                  <button
                    onClick={openCreatorSubmission}
                    className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold hover:bg-violet-500"
                  >
                    Submit Content
                  </button>
                )}
              </section>
            </div>

            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <h2 className="font-semibold">
                Campaign Details
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs text-slate-500">
                    Category
                  </p>
                  <p className="text-sm mt-1">
                    {campaign?.category || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Platforms
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(campaign?.platforms || []).length > 0 ? (
                      campaign.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-xs text-slate-300"
                        >
                          {platform}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">
                        —
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Deliverables
                  </p>
                  <p className="text-sm text-slate-300 mt-1 whitespace-pre-wrap">
                    {campaign?.deliverables || "—"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tasks */}
        {activeTab === "tasks" && (
          <section className="mt-7 bg-[#11111f] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle
                  size={20}
                  className="text-violet-400"
                />
                <div>
                  <h2 className="font-semibold">
                    Tasks & Deliverables
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Shared tasks for this collaboration.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm shrink-0"
              >
                <Plus size={16} />
                Add Task
              </button>
            </div>

            <div className="p-5">
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle
                    size={38}
                    className="mx-auto mb-3 text-gray-600"
                  />
                  <p className="text-gray-500">
                    No tasks yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      className="p-4 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3
                            className={`font-medium ${task.status === "completed"
                                ? "line-through text-slate-500"
                                : ""
                              }`}
                          >
                            {task.title}
                          </h3>

                          {task.description && (
                            <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">
                              {task.description}
                            </p>
                          )}

                          {task.dueDate && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
                              <Calendar size={14} />
                              Due {formatDate(task.dueDate)}
                            </div>
                          )}
                        </div>

                        <select
                          value={task.status || "todo"}
                          onChange={(event) =>
                            updateTask(
                              task._id,
                              event.target.value
                            )
                          }
                          className={`rounded-lg border px-3 py-2 text-sm shrink-0 outline-none ${statusStyles[
                            task.status || "todo"
                            ] || statusStyles.todo
                            } bg-[#181827]`}
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">
                            In Progress
                          </option>
                          <option value="completed">
                            Completed
                          </option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Brand Content Review */}
        {activeTab === "content-review" && isBrand && (
          <section className="mt-7 bg-[#11111f] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileCheck
                  size={21}
                  className="text-violet-400"
                />
                <div>
                  <h2 className="font-semibold">
                    Creator Content Review
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Review content submitted for this campaign.
                  </p>
                </div>
              </div>

              <button
                onClick={loadContentSubmissions}
                disabled={loadingSubmissions}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
              >
                {loadingSubmissions
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>

            <div className="p-5">
              {loadingSubmissions ? (
                <div className="py-12 text-center">
                  <div className="w-9 h-9 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-500">
                    Loading submissions...
                  </p>
                </div>
              ) : contentSubmissions.length === 0 ? (
                <div className="py-14 text-center">
                  <FileCheck
                    size={44}
                    className="mx-auto mb-4 text-slate-600"
                  />
                  <h3 className="font-medium text-slate-300">
                    No content submitted yet
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    The creator's campaign content will appear
                    here after submission.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contentSubmissions.map((submission) => {
                    const Icon = getSubmissionIcon(submission);
                    const status =
                      submission.status || "submitted";

                    return (
                      <div
                        key={submission._id}
                        className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                              <Icon
                                size={22}
                                className="text-violet-400"
                              />
                            </div>

                            <div className="min-w-0">
                              <h3 className="font-semibold truncate">
                                {submission.title ||
                                  "Content Submission"}
                              </h3>

                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-xs text-slate-400">
                                  {submission.platform || "Platform"}
                                </span>

                                <span className="text-slate-700">
                                  •
                                </span>

                                <span className="text-xs text-slate-400">
                                  {submission.contentType ||
                                    "Content"}
                                </span>

                                <span
                                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${contentStatusStyles[
                                    status
                                    ] ||
                                    contentStatusStyles.submitted
                                    }`}
                                >
                                  {contentStatusLabels[status] ||
                                    status}
                                </span>
                              </div>

                              <p className="text-xs text-slate-500 mt-2">
                                Submitted{" "}
                                {formatDateTime(
                                  submission.submittedAt ||
                                  submission.createdAt
                                )}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              openContentReview(submission)
                            }
                            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2.5 text-sm font-semibold shrink-0"
                          >
                            <Eye size={16} />
                            Review Content
                          </button>
                        </div>

                        {submission.feedback && (
                          <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
                            <p className="text-xs font-medium text-orange-300">
                              Creator feedback/history
                            </p>
                            <p className="text-sm text-slate-300 mt-1 whitespace-pre-wrap">
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

        {/* Files */}
        {activeTab === "files" && (
          <section className="mt-7 bg-[#11111f] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText
                  size={20}
                  className="text-cyan-400"
                />
                <div>
                  <h2 className="font-semibold">
                    Shared Files
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Campaign briefs and collaboration assets.
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
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-sm cursor-pointer"
                >
                  <Upload size={16} />
                  Add File
                </label>
              </div>
            </div>

            <div className="p-5">
              {selectedFiles.length > 0 && (
                <div className="mb-5 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Selected Files
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {selectedFiles.length} file
                        {selectedFiles.length !== 1 ? "s" : ""} selected
                      </p>
                    </div>

                    <button
                      onClick={clearSelectedFiles}
                      className="p-2 rounded-lg hover:bg-white/10"
                      title="Remove all"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/5"
                      >
                        <div className="flex items-center gap-3 min-w-0">

                          <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                            <FileText
                              size={17}
                              className="text-violet-400"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm text-white truncate">
                              {file.name}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={uploadFiles}
                    disabled={uploadingFile}
                    className="w-full mt-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {uploadingFile
                      ? `Uploading ${selectedFiles.length} file${selectedFiles.length !== 1 ? "s" : ""
                      }...`
                      : `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? "s" : ""
                      }`}
                  </button>

                </div>
              )}

              {files.length === 0 ? (
                <div className="text-center py-12">
                  <FileText
                    size={40}
                    className="mx-auto mb-3 text-gray-600"
                  />
                  <p className="text-gray-500">
                    No shared files yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {files.map((file) => (
                    <a
                      key={file._id}
                      href={getFileUrl(file.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                          <FileText
                            size={19}
                            className="text-cyan-400"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {file.name}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded by{" "}
                            {file.uploadedByName || "User"}
                          </p>

                          {file.createdAt && (
                            <p className="text-xs text-gray-600 mt-1">
                              {formatDateTime(file.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>

                      <ExternalLink
                        size={17}
                        className="text-gray-500 shrink-0"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Messages */}
        {activeTab === "messages" && (
          <section className="mt-7 bg-[#11111f] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center gap-3">
              <MessageCircle
                size={20}
                className="text-violet-400"
              />
              <div>
                <h2 className="font-semibold">Messages</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Communicate with your collaboration partner.
                </p>
              </div>
            </div>

            <div className="h-[600px] flex flex-col">
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-gray-500">
                    <div>
                      <MessageCircle
                        size={40}
                        className="mx-auto mb-3 opacity-40"
                      />
                      <p>No messages yet.</p>
                      <p className="text-xs mt-1">
                        Start the conversation.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const mine =
                      String(msg.senderId) ===
                      String(user.id);

                    return (
                      <div
                        key={msg._id}
                        className={`flex ${mine
                            ? "justify-end"
                            : "justify-start"
                          }`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-3 rounded-2xl ${mine
                              ? "bg-violet-600 rounded-br-md"
                              : "bg-white/10 rounded-bl-md"
                            }`}
                        >
                          <p className="text-xs opacity-70 mb-1">
                            {mine ? "You" : msg.senderName || "Partner"}
                          </p>

                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.message}
                          </p>

                          {msg.createdAt && (
                            <p className="text-[10px] opacity-50 mt-2">
                              {formatDateTime(msg.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t border-white/10 flex gap-2">
                <textarea
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  onKeyDown={handleMessageKeyDown}
                  rows={2}
                  placeholder="Type a message..."
                  className="flex-1 resize-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500"
                />

                <button
                  onClick={sendMessage}
                  disabled={
                    sendingMessage || !message.trim()
                  }
                  className="w-12 h-12 self-end flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Activity */}
        {activeTab === "activity" && (
          <section className="mt-7 bg-[#11111f] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center gap-3">
              <Clock
                size={20}
                className="text-cyan-400"
              />
              <div>
                <h2 className="font-semibold">
                  Collaboration Activity
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Recent workspace events.
                </p>
              </div>
            </div>

            <div className="p-5">
              {activity.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-10">
                  No activity yet.
                </p>
              ) : (
                <div className="space-y-5">
                  {activity
                    .slice()
                    .reverse()
                    .map((item) => (
                      <div
                        key={item._id}
                        className="flex gap-4"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />

                        <div>
                          <p className="text-sm text-gray-300">
                            {item.text}
                          </p>

                          {item.createdAt && (
                            <p className="text-xs text-gray-600 mt-1">
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

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-[#11111f] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">
                  Add Task
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Create a shared collaboration task.
                </p>
              </div>

              <button
                onClick={() => setShowTaskModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">
                  Task title
                </label>
                <input
                  value={taskTitle}
                  onChange={(event) =>
                    setTaskTitle(event.target.value)
                  }
                  className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                  placeholder="Example: Create campaign reel"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">
                  Description
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(event) =>
                    setTaskDescription(event.target.value)
                  }
                  rows={4}
                  className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500 resize-none"
                  placeholder="Enter task details..."
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">
                  Due date
                </label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(event) =>
                    setTaskDueDate(event.target.value)
                  }
                  className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                />
              </div>

              <button
                onClick={addTask}
                disabled={addingTask}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 font-medium transition"
              >
                {addingTask
                  ? "Creating..."
                  : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Content Review Modal */}
      {selectedSubmission && isBrand && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#11111f] border border-white/10 rounded-2xl shadow-2xl">
            <div className="sticky top-0 z-10 bg-[#11111f] border-b border-white/10 px-6 py-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold truncate">
                  {selectedSubmission.title ||
                    "Content Review"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Review creator submission and confirm whether
                  it is ready.
                </p>
              </div>

              <button
                onClick={closeContentReview}
                disabled={reviewLoading}
                className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-40"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <p className="text-xs text-slate-500">
                    Platform
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {selectedSubmission.platform || "—"}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <p className="text-xs text-slate-500">
                    Content Type
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {selectedSubmission.contentType || "—"}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <p className="text-xs text-slate-500">
                    Status
                  </p>
                  <span
                    className={`inline-flex mt-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${contentStatusStyles[
                      selectedSubmission.status
                      ] || contentStatusStyles.submitted
                      }`}
                  >
                    {contentStatusLabels[
                      selectedSubmission.status
                    ] ||
                      selectedSubmission.status ||
                      "Submitted"}
                  </span>
                </div>
              </div>

              {selectedSubmission.fileUrl && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText
                        size={18}
                        className="text-cyan-400"
                      />
                      <h3 className="font-medium">
                        Submitted File
                      </h3>
                    </div>

                    <a
                      href={getFileUrl(
                        selectedSubmission.fileUrl
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
                    >
                      Open Full File
                      <ExternalLink size={15} />
                    </a>
                  </div>

                  <div className="rounded-xl overflow-hidden bg-black/30 border border-white/5">
                    {String(
                      selectedSubmission.fileUrl
                    ).match(
                      /\.(jpg|jpeg|png|gif|webp)$/i
                    ) ? (
                      <img
                        src={getFileUrl(
                          selectedSubmission.fileUrl
                        )}
                        alt={
                          selectedSubmission.title ||
                          "Submitted content"
                        }
                        className="max-h-[420px] w-full object-contain"
                      />
                    ) : (
                      <div className="py-12 text-center">
                        <FileText
                          size={45}
                          className="mx-auto mb-3 text-slate-600"
                        />
                        <p className="text-sm text-slate-400">
                          File submitted for review
                        </p>
                        <a
                          href={getFileUrl(
                            selectedSubmission.fileUrl
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 mt-4 rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
                        >
                          View File
                          <ExternalLink size={15} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedSubmission.liveUrl && (
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <p className="text-xs text-cyan-300 font-medium">
                    Live Content URL
                  </p>
                  <a
                    href={selectedSubmission.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 flex items-center gap-2 text-sm text-cyan-200 break-all hover:underline"
                  >
                    {selectedSubmission.liveUrl}
                    <ExternalLink
                      size={14}
                      className="shrink-0"
                    />
                  </a>
                </div>
              )}

              {selectedSubmission.caption && (
                <div>
                  <p className="text-xs text-slate-500">
                    Caption
                  </p>
                  <p className="text-sm text-slate-300 mt-2 whitespace-pre-wrap">
                    {selectedSubmission.caption}
                  </p>
                </div>
              )}

              {selectedSubmission.description && (
                <div>
                  <p className="text-xs text-slate-500">
                    Creator Description
                  </p>
                  <p className="text-sm text-slate-300 mt-2 whitespace-pre-wrap">
                    {selectedSubmission.description}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm text-slate-400">
                  Brand Feedback
                </label>

                <textarea
                  value={reviewFeedback}
                  onChange={(event) =>
                    setReviewFeedback(event.target.value)
                  }
                  rows={5}
                  placeholder="Write feedback for the creator. Required when requesting changes or rejecting."
                  disabled={
                    reviewLoading ||
                    !["submitted", "under_review"].includes(
                      selectedSubmission.status
                    )
                  }
                  className="w-full mt-2 resize-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 disabled:opacity-50"
                />
              </div>

              {selectedSubmission.feedback &&
                !["submitted", "under_review"].includes(
                  selectedSubmission.status
                ) && (
                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
                    <p className="text-xs font-medium text-orange-300">
                      Review Feedback
                    </p>
                    <p className="text-sm text-slate-300 mt-2 whitespace-pre-wrap">
                      {selectedSubmission.feedback}
                    </p>
                  </div>
                )}

              {["submitted", "under_review"].includes(
                selectedSubmission.status
              ) ? (
                <div className="grid sm:grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={() =>
                      reviewSubmission("approved")
                    }
                    disabled={reviewLoading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-3 text-sm font-semibold"
                  >
                    <Check size={17} />
                    Approve Content
                  </button>

                  <button
                    onClick={() =>
                      reviewSubmission("changes_requested")
                    }
                    disabled={reviewLoading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 px-4 py-3 text-sm font-semibold"
                  >
                    <RotateCcw size={17} />
                    Request Changes
                  </button>

                  <button
                    onClick={() =>
                      reviewSubmission("rejected")
                    }
                    disabled={reviewLoading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 px-4 py-3 text-sm font-semibold"
                  >
                    <XCircle size={17} />
                    Reject
                  </button>
                </div>
              ) : (
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                  <p className="text-sm text-slate-400">
                    This submission has already been reviewed.
                  </p>
                </div>
              )}

              {reviewLoading && (
                <p className="text-center text-xs text-slate-500">
                  Updating submission...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
