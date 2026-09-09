import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Upload,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Send,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import authService from "../../services/authService";

const API_URL = "http://localhost:5000/api/content-submissions";

export default function ContentSubmission() {
  const user = authService.getCurrentUser();

  const [submissions, setSubmissions] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    campaignId: "",
    title: "",
    platform: "",
    contentType: "",
    caption: "",
    description: "",
    liveUrl: "",
  });

  // =========================
  // FETCH CREATOR SUBMISSIONS
  // =========================
  const fetchSubmissions = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/creator/${user.id}`
      );

      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH ACCEPTED CAMPAIGNS
  // =========================
  const fetchCampaigns = async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/api/applications/creator/${user.id}`
      );

      const acceptedApplications = (
        response.data.applications || []
      ).filter((application) => application.status === "accepted");

      const campaignList = acceptedApplications
        .map((application) => {
          const campaign = application.campaignId;

          if (!campaign) return null;

          return {
            ...campaign,
            applicationId: application._id,
          };
        })
        .filter(Boolean);

      setCampaigns(campaignList);

      if (campaignList.length > 0) {
        setSelectedCampaign(campaignList[0]);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchSubmissions();
  }, []);

  // =========================
  // FORM HANDLER
  // =========================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // FILE HANDLER
  // =========================
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
  };

  // =========================
  // OPEN SUBMISSION MODAL
  // =========================
  const openSubmissionModal = (campaign = selectedCampaign) => {
    if (!campaign) {
      alert("No accepted campaign available.");
      return;
    }

    setFormData({
      campaignId: campaign._id,
      title: "",
      platform: "",
      contentType: "",
      caption: "",
      description: "",
      liveUrl: "",
    });

    setSelectedFile(null);
    setShowModal(true);
  };

  // =========================
  // SUBMIT CONTENT
  // =========================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.id) {
      alert("Please login again.");
      return;
    }

    if (!formData.campaignId) {
      alert("Please select a campaign.");
      return;
    }

    if (!formData.title.trim()) {
      alert("Please enter content title.");
      return;
    }

    if (!formData.platform) {
      alert("Please select a platform.");
      return;
    }

    if (!formData.contentType) {
      alert("Please select content type.");
      return;
    }

    if (!selectedFile && !formData.liveUrl.trim()) {
      alert("Please upload a file or provide a live content URL.");
      return;
    }

    try {
      setUploading(true);

      const campaign = campaigns.find(
        (item) => item._id === formData.campaignId
      );

      const data = new FormData();

      data.append("campaignId", formData.campaignId);
      data.append(
        "applicationId",
        campaign?.applicationId || ""
      );
      data.append("creatorId", user.id);
      data.append("title", formData.title);
      data.append("platform", formData.platform);
      data.append("contentType", formData.contentType);
      data.append("caption", formData.caption);
      data.append("description", formData.description);
      data.append("liveUrl", formData.liveUrl);

      if (selectedFile) {
        data.append("file", selectedFile);
      }

      const response = await axios.post(API_URL, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Content submitted successfully!");

      setShowModal(false);
      setSelectedFile(null);

      setFormData({
        campaignId: "",
        title: "",
        platform: "",
        contentType: "",
        caption: "",
        description: "",
        liveUrl: "",
      });

      setSubmissions((prev) => [
        response.data.submission,
        ...prev,
      ]);
    } catch (error) {
      console.error("Content submission error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to submit content."
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // STATUS UI
  // =========================
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={18} />;

      case "changes_requested":
        return <AlertCircle size={18} />;

      case "rejected":
        return <X size={18} />;

      case "under_review":
        return <Clock size={18} />;

      default:
        return <Clock size={18} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "draft":
        return "Draft";

      case "submitted":
        return "Submitted";

      case "under_review":
        return "Under Review";

      case "changes_requested":
        return "Changes Requested";

      case "approved":
        return "Approved";

      case "published":
        return "Published";

      case "rejected":
        return "Rejected";

      default:
        return "Pending";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
      case "published":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      case "changes_requested":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

      case "rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      case "under_review":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";

      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="min-h-screen bg-[#080812] text-white p-6 md:p-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-bold">
            Content Submission
          </h1>

          <p className="text-gray-400 mt-2">
            Submit campaign content and track brand reviews.
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={fetchSubmissions}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
            border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          <button
            onClick={() => openSubmissionModal()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl
            bg-violet-600 hover:bg-violet-500 transition font-medium"
          >
            <Upload size={18} />
            Submit Content
          </button>

        </div>
      </div>

      {/* CAMPAIGNS */}
      {campaigns.length > 0 && (
        <div className="mb-8">

          <h2 className="text-lg font-semibold mb-4">
            Active Collaborations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {campaigns.map((campaign) => (
              <div
                key={campaign._id}
                className={`p-5 rounded-2xl border transition cursor-pointer ${
                  selectedCampaign?._id === campaign._id
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                }`}
                onClick={() => setSelectedCampaign(campaign)}
              >

                <p className="text-sm text-violet-400 mb-2">
                  Active Campaign
                </p>

                <h3 className="font-semibold text-lg">
                  {campaign.title}
                </h3>

                <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                  {campaign.description}
                </p>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    openSubmissionModal(campaign);
                  }}
                  className="mt-4 w-full py-2 rounded-lg bg-white/5
                  hover:bg-violet-600 transition text-sm"
                >
                  Submit for This Campaign
                </button>

              </div>
            ))}

          </div>
        </div>
      )}

      {/* SUBMISSIONS */}
      <div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            My Submissions
          </h2>

          <span className="text-sm text-gray-500">
            {submissions.length} submission
            {submissions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            Loading submissions...
          </div>
        ) : submissions.length === 0 ? (

          <div className="border border-white/10 rounded-2xl
          bg-white/[0.03] py-16 text-center">

            <FileText
              size={45}
              className="mx-auto text-gray-600 mb-4"
            />

            <h3 className="text-lg font-semibold">
              No Content Submitted Yet
            </h3>

            <p className="text-gray-500 mt-2">
              Submit your first campaign deliverable.
            </p>

            <button
              onClick={() => openSubmissionModal()}
              className="mt-5 px-5 py-2.5 rounded-xl
              bg-violet-600 hover:bg-violet-500 transition"
            >
              Submit Content
            </button>

          </div>

        ) : (

          <div className="space-y-4">

            {submissions.map((submission) => (

              <div
                key={submission._id}
                className="border border-white/10 rounded-2xl
                bg-white/[0.03] p-5 hover:bg-white/[0.05] transition"
              >

                <div className="flex flex-col md:flex-row
                md:items-start md:justify-between gap-4">

                  <div className="flex gap-4">

                    <div className="w-12 h-12 rounded-xl
                    bg-violet-500/10 flex items-center justify-center
                    text-violet-400">
                      <FileText size={22} />
                    </div>

                    <div>

                      <h3 className="font-semibold text-lg">
                        {submission.title}
                      </h3>

                      <p className="text-gray-400 text-sm mt-1">
                        {submission.campaignId?.title ||
                          "Campaign"}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3">

                        {submission.platform && (
                          <span className="px-2.5 py-1 rounded-lg
                          bg-white/5 text-gray-300 text-xs">
                            {submission.platform}
                          </span>
                        )}

                        {submission.contentType && (
                          <span className="px-2.5 py-1 rounded-lg
                          bg-white/5 text-gray-300 text-xs">
                            {submission.contentType}
                          </span>
                        )}

                      </div>

                    </div>

                  </div>

                  <div
                    className={`flex items-center gap-2 px-3 py-2
                    rounded-lg border text-sm ${getStatusClass(
                      submission.status
                    )}`}
                  >
                    {getStatusIcon(submission.status)}
                    {getStatusText(submission.status)}
                  </div>

                </div>

                {/* FEEDBACK */}
                {submission.feedback && (
                  <div className="mt-5 p-4 rounded-xl
                  bg-yellow-500/5 border border-yellow-500/20">

                    <p className="text-sm font-medium text-yellow-400">
                      Brand Feedback
                    </p>

                    <p className="text-gray-300 text-sm mt-1">
                      {submission.feedback}
                    </p>

                  </div>
                )}

                {/* FILE / URL */}
                <div className="mt-5 flex flex-wrap gap-3">

                  {submission.fileUrl && (
                    <a
                      href={`http://localhost:5000${submission.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2
                      rounded-lg bg-white/5 hover:bg-white/10
                      text-sm"
                    >
                      <FileText size={16} />
                      View Submitted File
                    </a>
                  )}

                  {submission.liveUrl && (
                    <a
                      href={submission.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2
                      rounded-lg bg-cyan-500/10 text-cyan-400
                      hover:bg-cyan-500/20 text-sm"
                    >
                      <ExternalLink size={16} />
                      View Live Content
                    </a>
                  )}

                </div>

                {/* RESUBMIT */}
                {submission.status === "changes_requested" && (
                  <button
                    onClick={() => {
                      const campaign = campaigns.find(
                        (item) =>
                          item._id ===
                          submission.campaignId?._id
                      );

                      openSubmissionModal(campaign);
                    }}
                    className="mt-4 flex items-center gap-2
                    px-4 py-2 rounded-lg bg-yellow-500/10
                    text-yellow-400 hover:bg-yellow-500/20"
                  >
                    <RefreshCw size={16} />
                    Resubmit Content
                  </button>
                )}

              </div>

            ))}

          </div>
        )}

      </div>

      {/* =========================
          SUBMISSION MODAL
      ========================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70
        backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-2xl max-h-[90vh]
          overflow-y-auto bg-[#10101c] border border-white/10
          rounded-2xl shadow-2xl">

            {/* MODAL HEADER */}
            <div className="sticky top-0 bg-[#10101c]
            border-b border-white/10 px-6 py-5
            flex items-center justify-between">

              <div>
                <h2 className="text-xl font-semibold">
                  Submit Campaign Content
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Send your deliverable to the brand for review.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              {/* CAMPAIGN */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Campaign
                </label>

                <select
                  name="campaignId"
                  value={formData.campaignId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl
                  bg-white/5 border border-white/10
                  outline-none focus:border-violet-500"
                >
                  <option value="" className="bg-[#10101c]">
                    Select Campaign
                  </option>

                  {campaigns.map((campaign) => (
                    <option
                      key={campaign._id}
                      value={campaign._id}
                      className="bg-[#10101c]"
                    >
                      {campaign.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* TITLE */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Content Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Summer Collection Reel"
                  className="w-full px-4 py-3 rounded-xl
                  bg-white/5 border border-white/10
                  outline-none focus:border-violet-500"
                />
              </div>

              {/* PLATFORM + TYPE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Platform
                  </label>

                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl
                    bg-white/5 border border-white/10
                    outline-none focus:border-violet-500"
                  >
                    <option value="" className="bg-[#10101c]">
                      Select Platform
                    </option>
                    <option
                      value="Instagram"
                      className="bg-[#10101c]"
                    >
                      Instagram
                    </option>
                    <option
                      value="YouTube"
                      className="bg-[#10101c]"
                    >
                      YouTube
                    </option>
                    <option
                      value="TikTok"
                      className="bg-[#10101c]"
                    >
                      TikTok
                    </option>
                    <option
                      value="Facebook"
                      className="bg-[#10101c]"
                    >
                      Facebook
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Content Type
                  </label>

                  <select
                    name="contentType"
                    value={formData.contentType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl
                    bg-white/5 border border-white/10
                    outline-none focus:border-violet-500"
                  >
                    <option value="" className="bg-[#10101c]">
                      Select Type
                    </option>
                    <option
                      value="Reel"
                      className="bg-[#10101c]"
                    >
                      Reel
                    </option>
                    <option
                      value="Post"
                      className="bg-[#10101c]"
                    >
                      Post
                    </option>
                    <option
                      value="Story"
                      className="bg-[#10101c]"
                    >
                      Story
                    </option>
                    <option
                      value="Video"
                      className="bg-[#10101c]"
                    >
                      Video
                    </option>
                    <option
                      value="Image"
                      className="bg-[#10101c]"
                    >
                      Image
                    </option>
                  </select>
                </div>

              </div>

              {/* FILE */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Upload Content
                </label>

                <label
                  htmlFor="content-file-input"
                  className="flex flex-col items-center
                  justify-center w-full min-h-36 rounded-xl
                  border border-dashed border-white/20
                  bg-white/[0.02] hover:bg-white/[0.05]
                  cursor-pointer transition"
                >

                  <Upload
                    size={30}
                    className="text-violet-400 mb-2"
                  />

                  {selectedFile ? (
                    <>
                      <p className="text-white font-medium">
                        {selectedFile.name}
                      </p>

                      <p className="text-gray-500 text-xs mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(
                          2
                        )}{" "}
                        MB
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-300">
                        Click to select a file
                      </p>

                      <p className="text-gray-500 text-xs mt-1">
                        Images, videos, PDF or other campaign files
                      </p>
                    </>
                  )}

                </label>

                <input
                  type="file"
                  id="content-file-input"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* LIVE URL */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Live Content URL
                  <span className="text-gray-500 ml-1">
                    (optional)
                  </span>
                </label>

                <input
                  type="url"
                  name="liveUrl"
                  value={formData.liveUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl
                  bg-white/5 border border-white/10
                  outline-none focus:border-violet-500"
                />
              </div>

              {/* CAPTION */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Caption
                </label>

                <textarea
                  name="caption"
                  value={formData.caption}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Enter the caption for your content..."
                  className="w-full px-4 py-3 rounded-xl
                  bg-white/5 border border-white/10
                  outline-none focus:border-violet-500 resize-none"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Notes / Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Add any notes for the brand..."
                  className="w-full px-4 py-3 rounded-xl
                  bg-white/5 border border-white/10
                  outline-none focus:border-violet-500 resize-none"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl
                  bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 px-5 py-2.5
                  rounded-xl bg-violet-600
                  hover:bg-violet-500 disabled:opacity-50"
                >

                  {uploading ? (
                    <>
                      <RefreshCw
                        size={18}
                        className="animate-spin"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit for Review
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}