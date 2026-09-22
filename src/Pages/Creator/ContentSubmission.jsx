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
  Sparkles,
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
        return <CheckCircle size={15} />;

      case "changes_requested":
        return <AlertCircle size={15} />;

      case "rejected":
        return <X size={15} />;

      case "under_review":
        return <Clock size={15} />;

      default:
        return <Clock size={15} />;
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
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "changes_requested":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";

      case "under_review":
        return "bg-blue-50 text-blue-700 border-blue-200";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] p-6 md:p-8 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-[#FAF9F6] p-6 rounded-2xl border border-[#D7C9B8] shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE7DC] text-[#8B6F5A] text-xs font-bold border border-[#D7C9B8] mb-2">
            <Sparkles size={13} />
            DELIVERABLES & REVIEWS
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#2B241F] tracking-tight">
            Content Submission
          </h1>
          <p className="text-[#4A3A2E]/70 text-xs mt-1">
            Upload deliverables for brand approval, review client feedback, and manage live post links.
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={fetchSubmissions}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] hover:bg-[#EDE7DC]/40 text-[#2B241F] text-xs font-bold transition shadow-2xs"
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          <button
            onClick={() => openSubmissionModal()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white text-xs font-bold transition shadow-xs"
          >
            <Upload size={14} />
            Submit Deliverable
          </button>
        </div>
      </div>

      {/* CAMPAIGNS */}
      {campaigns.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-extrabold text-[#2B241F] mb-3 tracking-tight">
            Active Collaborations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign._id}
                className={`p-5 rounded-2xl border transition cursor-pointer shadow-xs ${
                  selectedCampaign?._id === campaign._id
                    ? "border-[#8B6F5A] bg-[#EDE7DC]/40 ring-2 ring-[#8B6F5A]/20"
                    : "border-[#D7C9B8] bg-[#FAF9F6] hover:border-[#8B6F5A]"
                }`}
                onClick={() => setSelectedCampaign(campaign)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Active Campaign
                  </span>
                  <span className="text-xs font-bold text-[#8B6F5A]">
                    {campaign.brandName || "Brand"}
                  </span>
                </div>

                <h3 className="font-extrabold text-[#2B241F] text-base mt-1">
                  {campaign.title}
                </h3>

                <p className="text-[#4A3A2E]/70 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                  {campaign.description}
                </p>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    openSubmissionModal(campaign);
                  }}
                  className="mt-4 w-full py-2.5 rounded-xl bg-[#EDE7DC] hover:bg-[#8B6F5A] text-[#8B6F5A] hover:text-white transition text-xs font-bold border border-[#D7C9B8] shadow-2xs"
                >
                  Submit for This Campaign
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMISSIONS LIST */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-[#2B241F] tracking-tight">
            My Submissions
          </h2>

          <span className="text-xs font-bold text-[#8B6F5A] bg-[#EDE7DC] px-3 py-1 rounded-full border border-[#D7C9B8]">
            {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#4A3A2E]/50 text-xs">
            Loading deliverables...
          </div>
        ) : submissions.length === 0 ? (
          <div className="border border-dashed border-[#D7C9B8] rounded-2xl bg-[#FAF9F6] py-16 text-center shadow-xs">
            <FileText size={40} className="mx-auto text-[#4A3A2E]/40 mb-3" />
            <h3 className="text-base font-extrabold text-[#2B241F]">
              No Content Submitted Yet
            </h3>
            <p className="text-[#4A3A2E]/70 text-xs mt-1 max-w-sm mx-auto">
              Submit your first campaign deliverable for brand approval and feedback.
            </p>

            <button
              onClick={() => openSubmissionModal()}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white text-xs font-bold transition shadow-xs"
            >
              Submit Deliverable
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission._id}
                className="border border-[#D7C9B8] rounded-2xl bg-[#FAF9F6] p-5 hover:border-[#8B6F5A] hover:shadow-xs transition"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] flex items-center justify-center text-[#8B6F5A] shrink-0">
                      <FileText size={22} />
                    </div>

                    <div>
                      <h3 className="font-extrabold text-[#2B241F] text-base">
                        {submission.title}
                      </h3>

                      <p className="text-[#4A3A2E]/70 text-xs mt-0.5 font-medium">
                        {submission.campaignId?.title || "Campaign"}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {submission.platform && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-[#EDE7DC]/50 border border-[#D7C9B8] text-[#4A3A2E] text-[11px] font-bold">
                            {submission.platform}
                          </span>
                        )}

                        {submission.contentType && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-[#EDE7DC]/50 border border-[#D7C9B8] text-[#4A3A2E] text-[11px] font-bold">
                            {submission.contentType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold self-start ${getStatusClass(
                      submission.status
                    )}`}
                  >
                    {getStatusIcon(submission.status)}
                    {getStatusText(submission.status)}
                  </div>
                </div>

                {/* FEEDBACK CALLOUT */}
                {submission.feedback && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                    <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                      <AlertCircle size={14} /> Brand Feedback
                    </p>
                    <p className="text-[#4A3A2E] text-xs mt-1 leading-relaxed">
                      {submission.feedback}
                    </p>
                  </div>
                )}

                {/* FILE / LIVE URL BUTTONS */}
                <div className="mt-4 flex flex-wrap gap-2.5 pt-3 border-t border-[#D7C9B8]/70">
                  {submission.fileUrl && (
                    <a
                      href={`http://localhost:5000${submission.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EDE7DC]/30 hover:bg-[#EDE7DC] border border-[#D7C9B8] text-[#2B241F] text-xs font-bold transition"
                    >
                      <FileText size={14} />
                      View Submitted File
                    </a>
                  )}

                  {submission.liveUrl && (
                    <a
                      href={submission.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EDE7DC]/30 hover:bg-[#EDE7DC] border border-[#D7C9B8] text-[#8B6F5A] text-xs font-bold transition"
                    >
                      <ExternalLink size={14} />
                      View Live Post
                    </a>
                  )}

                  {/* RESUBMISSION CTA */}
                  {submission.status === "changes_requested" && (
                    <button
                      onClick={() => {
                        const campaign = campaigns.find(
                          (item) =>
                            item._id === submission.campaignId?._id
                        );
                        openSubmissionModal(campaign);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition shadow-xs"
                    >
                      <RefreshCw size={13} />
                      Resubmit Content
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================
          SUBMISSION MODAL
      ========================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#2B241F]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FAF9F6] border border-[#D7C9B8] rounded-2xl shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#D7C9B8]/70 px-6 py-5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-extrabold text-[#2B241F] tracking-tight">
                  Submit Deliverable Content
                </h2>
                <p className="text-[#4A3A2E]/70 text-xs mt-0.5">
                  Send your media deliverable to the brand for review and approval.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-[#4A3A2E]/70 hover:text-[#2B241F] hover:bg-[#EDE7DC] transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* CAMPAIGN */}
              <div>
                <label className="block text-xs font-bold text-[#2B241F] mb-1.5">
                  Campaign
                </label>
                <select
                  name="campaignId"
                  value={formData.campaignId}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDE7DC]/30 border border-[#D7C9B8] text-xs font-medium text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:bg-[#FAF9F6]"
                >
                  <option value="">Select Campaign</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign._id} value={campaign._id}>
                      {campaign.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* TITLE */}
              <div>
                <label className="block text-xs font-bold text-[#2B241F] mb-1.5">
                  Content Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Summer Collection Reel - Draft 1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDE7DC]/30 border border-[#D7C9B8] text-xs font-medium text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:bg-[#FAF9F6]"
                />
              </div>

              {/* PLATFORM + TYPE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2B241F] mb-1.5">
                    Platform
                  </label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDE7DC]/30 border border-[#D7C9B8] text-xs font-medium text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:bg-[#FAF9F6]"
                  >
                    <option value="">Select Platform</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B241F] mb-1.5">
                    Content Type
                  </label>
                  <select
                    name="contentType"
                    value={formData.contentType}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDE7DC]/30 border border-[#D7C9B8] text-xs font-medium text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:bg-[#FAF9F6]"
                  >
                    <option value="">Select Type</option>
                    <option value="Reel">Reel</option>
                    <option value="Post">Post</option>
                    <option value="Story">Story</option>
                    <option value="Video">Video</option>
                    <option value="Image">Image</option>
                  </select>
                </div>
              </div>

              {/* FILE UPLOAD DROPZONE */}
              <div>
                <label className="block text-xs font-bold text-[#2B241F] mb-1.5">
                  Upload Media File
                </label>

                <label
                  htmlFor="content-file-input"
                  className="flex flex-col items-center justify-center w-full min-h-32 rounded-xl border-2 border-dashed border-[#D7C9B8] bg-[#EDE7DC]/30 hover:bg-[#EDE7DC]/60 hover:border-[#8B6F5A] cursor-pointer transition p-4 text-center"
                >
                  <Upload size={26} className="text-[#8B6F5A] mb-1.5" />

                  {selectedFile ? (
                    <>
                      <p className="text-[#2B241F] font-bold text-xs">
                        {selectedFile.name}
                      </p>
                      <p className="text-[#4A3A2E]/60 text-[11px] mt-0.5">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[#2B241F] text-xs font-bold">
                        Click or drag file to upload
                      </p>
                      <p className="text-[#4A3A2E]/60 text-[11px] mt-0.5">
                        Supports MP4, MOV, PNG, JPG, PDF (up to 50MB)
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
                <label className="block text-xs font-bold text-[#2B241F] mb-1.5">
                  Live Post URL <span className="text-[#4A3A2E]/60 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  name="liveUrl"
                  value={formData.liveUrl}
                  onChange={handleChange}
                  placeholder="https://instagram.com/p/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDE7DC]/30 border border-[#D7C9B8] text-xs font-medium text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:bg-[#FAF9F6]"
                />
              </div>

              {/* CAPTION */}
              <div>
                <label className="block text-xs font-bold text-[#2B241F] mb-1.5">
                  Caption / Hashtags
                </label>
                <textarea
                  name="caption"
                  value={formData.caption}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Paste the caption & tags intended for this post..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDE7DC]/30 border border-[#D7C9B8] text-xs font-medium text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:bg-[#FAF9F6] resize-none"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-xs font-bold text-[#2B241F] mb-1.5">
                  Notes for the Brand
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Any context or timeline notes for the brand team..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDE7DC]/30 border border-[#D7C9B8] text-xs font-medium text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:bg-[#FAF9F6] resize-none"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#D7C9B8]/70">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] hover:bg-[#EDE7DC] text-[#2B241F] text-xs font-bold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
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