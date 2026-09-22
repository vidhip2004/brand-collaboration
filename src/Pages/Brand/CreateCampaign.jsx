import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  MapPin,
  Users,
  CheckCircle,
  Save,
  Send,
  Sparkles,
} from "lucide-react";

import authService from "../../services/authService";
import { getCurrencyFromCountry } from "../../services/currency";

const CreateCampaign = () => {
  const navigate = useNavigate();

  const user = authService.getCurrentUser();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Fashion",
    campaignType: "Paid Collaboration",
    platforms: [],
    budget: "",
    startDate: "",
    endDate: "",
    applicationDeadline: "",
    creatorsNeeded: "1",
    deliverables: "",
    requirements: "",
    location: user?.country || user?.location || "India",
  });

  // Dynamically derive currency from user's country or chosen location
  const activeCountry = formData.location || user?.country || user?.location || "India";
  const brandCurrency = getCurrencyFromCountry(activeCountry);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const platformOptions = [
    "Instagram",
    "YouTube",
    "TikTok",
    "Facebook",
  ];

  const categoryOptions = [
    "Fashion",
    "Beauty",
    "Lifestyle",
    "Travel",
    "Fitness",
    "Food",
    "Technology",
    "Gaming",
    "Finance",
    "Education",
    "Other",
  ];

  const campaignTypes = [
    "Paid Collaboration",
    "Product Exchange",
    "Affiliate",
    "Sponsored Content",
    "Long-Term Partnership",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handlePlatformChange = (platform) => {
    setFormData((prev) => {
      const alreadySelected = prev.platforms.includes(platform);

      return {
        ...prev,
        platforms: alreadySelected
          ? prev.platforms.filter((item) => item !== platform)
          : [...prev.platforms, platform],
      };
    });

    setError("");
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      return "Please enter a campaign title.";
    }

    if (!formData.description.trim()) {
      return "Please enter a campaign description.";
    }

    if (!formData.category) {
      return "Please select a campaign category.";
    }

    if (formData.platforms.length === 0) {
      return "Please select at least one social media platform.";
    }

    if (!formData.budget || Number(formData.budget) <= 0) {
      return "Please enter a valid campaign budget.";
    }

    if (!formData.startDate) {
      return "Please select a campaign start date.";
    }

    if (!formData.endDate) {
      return "Please select a campaign end date.";
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      return "End date cannot be before start date.";
    }

    if (!formData.applicationDeadline) {
      return "Please select an application deadline.";
    }

    if (
      new Date(formData.applicationDeadline) >
      new Date(formData.startDate)
    ) {
      return "Application deadline should be before the campaign start date.";
    }

    if (!formData.creatorsNeeded || Number(formData.creatorsNeeded) <= 0) {
      return "Please enter the number of creators needed.";
    }

    if (!formData.deliverables.trim()) {
      return "Please describe the required deliverables.";
    }

    if (!formData.requirements.trim()) {
      return "Please enter creator requirements.";
    }

    return "";
  };

  const handleSubmit = async (status) => {
    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const campaignData = {
        ...formData,
        status,
        brandId: user.id,
        brandName: user.companyName || user.name,
        budget: Number(formData.budget),
        currency: brandCurrency.code,
        creatorsNeeded: Number(formData.creatorsNeeded),
      };

      const response = await axios.post(
        "http://localhost:5000/api/campaigns",
        campaignData
      );

      setSuccess(response.data.message || "Campaign created successfully!");

      // Clear form after successful publish
      if (status === "published") {
        setFormData({
          title: "",
          description: "",
          category: "Fashion",
          campaignType: "Paid Collaboration",
          platforms: [],
          budget: "",
          startDate: "",
          endDate: "",
          applicationDeadline: "",
          creatorsNeeded: "1",
          deliverables: "",
          requirements: "",
          location: user?.country || user?.location || "India",
        });
      }
    } catch (error) {
      console.error("Campaign creation error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create campaign. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] flex items-center justify-center px-6">
        <div className="text-center max-w-sm bg-[#FAF9F6] p-8 rounded-2xl border border-[#D7C9B8] shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] flex items-center justify-center text-[#8B6F5A] text-2xl">
            🔒
          </div>

          <h1 className="text-2xl font-bold mt-5 text-[#2B241F]">
            Please Sign In
          </h1>

          <p className="text-[#4A3A2E]/75 text-sm mt-2">
            You need to login as a brand to create a campaign.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-6 w-full bg-[#8B6F5A] hover:bg-[#785D4A] text-white py-3 rounded-xl font-semibold shadow-xs transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F]">
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate("/brand/dashboard")}
          className="flex items-center gap-2 text-[#4A3A2E]/70 hover:text-[#2B241F] font-semibold text-sm transition mb-6"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] flex items-center justify-center text-[#8B6F5A] shadow-xs">
              <Briefcase size={22} />
            </div>

            <div>
              <h1 className="text-3xl font-black text-[#2B241F]">
                Create Campaign
              </h1>

              <p className="text-[#4A3A2E]/70 text-sm mt-0.5">
                Launch a new campaign and recruit targeted creator talent.
              </p>
            </div>
          </div>
        </div>

        {/* Brand Information Header Card */}
        <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 mb-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] flex items-center justify-center text-[#8B6F5A] text-lg font-black shadow-xs">
              {(user.companyName || user.name || "BR")
                .substring(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <p className="text-xs font-semibold text-[#4A3A2E]/70 uppercase tracking-wider">
                Creating Campaign As
              </p>

              <h2 className="text-lg font-bold text-[#2B241F]">
                {user.companyName || user.name}
              </h2>

              <p className="text-xs font-semibold text-[#8B6F5A] mt-0.5">
                {user.email}
              </p>
            </div>
          </div>
        </section>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#C98B6B]/15 border border-[#C98B6B]/40 text-[#C98B6B] text-sm font-semibold flex items-center gap-2">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] text-[#2B241F] text-sm font-semibold flex items-center gap-3">
            <CheckCircle size={20} className="text-[#8B6F5A] shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Campaign Form */}
        <div className="space-y-6">
          {/* Basic Information */}
          <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <FileText size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#2B241F]">
                  Campaign Information
                </h2>
                <p className="text-xs text-[#4A3A2E]/70">
                  Core details and category of your campaign
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Campaign Title */}
              <div>
                <label className="block text-xs font-bold text-[#4A3A2E] uppercase tracking-wider mb-2">
                  Campaign Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Summer Glow Skincare Launch 2026"
                  className="w-full bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl px-4 py-3 text-[#2B241F] placeholder:text-[#4A3A2E]/40 outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 transition text-sm font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#4A3A2E] uppercase tracking-wider mb-2">
                  Campaign Description *
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe your campaign goals, key selling points, and what creator content should highlight..."
                  className="w-full bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl px-4 py-3 text-[#2B241F] placeholder:text-[#4A3A2E]/40 outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 transition text-sm font-medium resize-none"
                />
              </div>

              {/* Category + Type */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#4A3A2E] uppercase tracking-wider mb-2">
                    Category *
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl px-4 py-3 text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 transition text-sm font-medium"
                  >
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3A2E] uppercase tracking-wider mb-2">
                    Campaign Type *
                  </label>

                  <select
                    name="campaignType"
                    value={formData.campaignType}
                    onChange={handleChange}
                    className="w-full bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl px-4 py-3 text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 transition text-sm font-medium"
                  >
                    {campaignTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Social Platforms */}
          <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <Sparkles size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#2B241F]">
                  Target Social Platforms *
                </h2>
                <p className="text-xs text-[#4A3A2E]/70">
                  Select platforms where creators will publish campaign content
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-4">
              {platformOptions.map((platform) => {
                const selected = formData.platforms.includes(platform);

                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => handlePlatformChange(platform)}
                    className={`p-4 rounded-xl border text-sm font-bold transition flex items-center justify-between ${
                      selected
                        ? "border-[#8B6F5A] bg-[#EDE7DC] text-[#2B241F] shadow-xs"
                        : "border-[#D7C9B8] bg-[#EDE7DC]/30 text-[#4A3A2E]/80 hover:border-[#8B6F5A] hover:bg-[#EDE7DC]"
                    }`}
                  >
                    <span>{platform}</span>
                    {selected && (
                      <CheckCircle size={17} className="text-[#8B6F5A] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Budget and Creators */}
          <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <DollarSign size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#2B241F]">
                  Budget & Creator Capacity
                </h2>
                <p className="text-xs text-[#4A3A2E]/70">
                  Set campaign compensation and creator headcount
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Budget */}
              <div>
                <label className="block text-xs font-bold text-[#4A3A2E] uppercase tracking-wider mb-2">
                  Total Budget ({brandCurrency.symbol}) *
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A3A2E]/60 font-bold text-sm">
                    {brandCurrency.symbol}
                  </span>

                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="50000"
                    min="1"
                    className="w-full bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl pl-9 pr-4 py-3 text-[#2B241F] placeholder:text-[#4A3A2E]/40 outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 transition text-sm font-medium"
                  />
                </div>
              </div>

              {/* Creators Needed */}
              <div>
                <label className="block text-xs font-bold text-[#4A3A2E] uppercase tracking-wider mb-2">
                  Number of Creators Needed *
                </label>

                <div className="relative">
                  <Users
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A3A2E]/60"
                  />

                  <input
                    type="number"
                    name="creatorsNeeded"
                    value={formData.creatorsNeeded}
                    onChange={handleChange}
                    min="1"
                    className="w-full bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl pl-11 pr-4 py-3 text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 transition text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Timeline Dates */}
          <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <Calendar size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#2B241F]">
                  Campaign Timeline
                </h2>
                <p className="text-xs text-[#4A3A2E]/70">
                  Important milestone and deadline dates
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#4A3A2E] uppercase tracking-wider mb-2">
                  Start Date *
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl px-4 py-3 text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 transition text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3A2E] uppercase tracking-wider mb-2">
                  End Date *
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl px-4 py-3 text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 transition text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3A2E] uppercase tracking-wider mb-2">
                  Application Deadline *
                </label>

                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  className="w-full bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl px-4 py-3 text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 transition text-sm font-medium"
                />
              </div>
            </div>
          </section>

          {/* Target Location */}
          <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <MapPin size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#2B241F]">
                  Target Geographic Location
                </h2>
                <p className="text-xs text-[#4A3A2E]/70">
                  Specify creator location or campaign target country
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A3A2E] uppercase tracking-wider mb-2">
                Target Country / Region
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder={`Example: ${user?.country || "India"}`}
                className="w-full bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl px-4 py-3 text-[#2B241F] placeholder:text-[#4A3A2E]/40 outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 transition text-sm font-medium"
              />
            </div>
          </section>

          {/* Deliverables */}
          <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <FileText size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#2B241F]">
                  Required Deliverables *
                </h2>
                <p className="text-xs text-[#4A3A2E]/70">
                  Specify exact content items and deliverables expected
                </p>
              </div>
            </div>

            <textarea
              name="deliverables"
              value={formData.deliverables}
              onChange={handleChange}
              rows="4"
              placeholder={`Example:
• 2 Instagram Reels (30-60s)
• 3 Instagram Stories with brand link
• Product tag in caption`}
              className="w-full bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl px-4 py-3 text-[#2B241F] placeholder:text-[#4A3A2E]/40 outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 transition text-sm font-medium resize-none"
            />
          </section>

          {/* Creator Requirements */}
          <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <Users size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#2B241F]">
                  Creator Qualifications & Requirements *
                </h2>
                <p className="text-xs text-[#4A3A2E]/70">
                  Outline creator criteria, niche, and follower expectations
                </p>
              </div>
            </div>

            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows="4"
              placeholder={`Example:
• Minimum 10K+ followers
• Active niche engagement in Beauty/Lifestyle
• High-quality authentic aesthetic
• Reliable turnaround time`}
              className="w-full bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl px-4 py-3 text-[#2B241F] placeholder:text-[#4A3A2E]/40 outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 transition text-sm font-medium resize-none"
            />
          </section>

          {/* Bottom Action Card */}
          <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 md:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <h3 className="font-bold text-[#2B241F] text-base">
                  Ready to Launch?
                </h3>

                <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                  Save as a draft or publish immediately to the creator marketplace.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => handleSubmit("draft")}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#D7C9B8] bg-[#EDE7DC] hover:bg-[#D7C9B8] text-[#2B241F] font-bold text-sm transition disabled:opacity-50"
                >
                  <Save size={17} />
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit("published")}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white font-bold text-sm shadow-xs transition disabled:opacity-50"
                >
                  <Send size={17} />
                  {saving ? "Publishing..." : "Publish Campaign"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CreateCampaign;