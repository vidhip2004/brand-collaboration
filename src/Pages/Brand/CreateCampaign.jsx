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
//   Instagram,
  CheckCircle,
  Save,
  Send,
} from "lucide-react";

import authService from "../../services/authService";

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
    location: "India",
  });

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
      creatorsNeeded: Number(formData.creatorsNeeded),
    };

    console.log("Sending campaign:", campaignData);

    const response = await axios.post(
      "http://localhost:5000/api/campaigns",
      campaignData
    );

    console.log(
      "Campaign created:",
      response.data
    );

    setSuccess(response.data.message);

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
        location: "India",
      });
    }
  } catch (error) {
    console.error(
      "Campaign creation error:",
      error
    );

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
      <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-5">🔒</div>

          <h1 className="text-2xl font-bold">
            Please Login
          </h1>

          <p className="text-gray-400 mt-2">
            You need to login as a brand to create a campaign.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-6 bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-xl font-semibold transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Back Button */}
        <button
          onClick={() => navigate("/brand/dashboard")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Briefcase
                size={24}
                className="text-violet-400"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Create Campaign
              </h1>

              <p className="text-gray-400 mt-1">
                Find the perfect creators for your brand.
              </p>
            </div>
          </div>
        </div>

        {/* Brand Information */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-6">
          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-xl font-bold">
              {(user.companyName || user.name || "BR")
                .substring(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Creating campaign for
              </p>

              <h2 className="text-lg font-semibold">
                {user.companyName || user.name}
              </h2>

              <p className="text-sm text-violet-400">
                {user.email}
              </p>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 flex items-center gap-3">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        {/* Campaign Form */}
        <div className="space-y-6">

          {/* Basic Information */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center gap-3 mb-6">
              <FileText
                size={21}
                className="text-violet-400"
              />

              <h2 className="text-xl font-semibold">
                Campaign Information
              </h2>
            </div>

            <div className="space-y-5">

              {/* Campaign Title */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Campaign Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Example: Summer Fashion Collection"
                  className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500 transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Campaign Description *
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe your campaign, goals and what you want creators to promote..."
                  className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500 transition resize-none"
                />
              </div>

              {/* Category + Type */}
              <div className="grid md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Category *
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500"
                  >
                    {categoryOptions.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Campaign Type *
                  </label>

                  <select
                    name="campaignType"
                    value={formData.campaignType}
                    onChange={handleChange}
                    className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500"
                  >
                    {campaignTypes.map((type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

            </div>
          </section>

          {/* Social Platforms */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center gap-3 mb-6">
             <div className="w-5 h-5 rounded-md border border-violet-400 text-violet-400 flex items-center justify-center text-xs font-bold">
  @
</div>

              <h2 className="text-xl font-semibold">
                Social Media Platforms
              </h2>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              Select the platforms where creators will publish content.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {platformOptions.map((platform) => {
                const selected =
                  formData.platforms.includes(platform);

                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() =>
                      handlePlatformChange(platform)
                    }
                    className={`p-4 rounded-xl border transition ${
                      selected
                        ? "border-violet-500 bg-violet-500/10 text-violet-300"
                        : "border-white/10 bg-[#111827] text-gray-400 hover:border-violet-500/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{platform}</span>

                      {selected && (
                        <CheckCircle size={17} />
                      )}
                    </div>
                  </button>
                );
              })}

            </div>
          </section>

          {/* Budget and Creators */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center gap-3 mb-6">
              <DollarSign
                size={21}
                className="text-violet-400"
              />

              <h2 className="text-xl font-semibold">
                Budget & Creators
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-5">

              {/* Budget */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Total Budget (₹) *
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="50000"
                    min="1"
                    className="w-full bg-[#111827] border border-white/10 rounded-xl px-10 py-3 text-white outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Creators Needed */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Number of Creators Needed *
                </label>

                <div className="relative">
                  <Users
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="number"
                    name="creatorsNeeded"
                    value={formData.creatorsNeeded}
                    onChange={handleChange}
                    min="1"
                    className="w-full bg-[#111827] border border-white/10 rounded-xl px-11 py-3 text-white outline-none focus:border-violet-500"
                  />
                </div>
              </div>

            </div>
          </section>

          {/* Dates */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center gap-3 mb-6">
              <Calendar
                size={21}
                className="text-violet-400"
              />

              <h2 className="text-xl font-semibold">
                Campaign Timeline
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Start Date *
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  End Date *
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Application Deadline *
                </label>

                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500"
                />
              </div>

            </div>
          </section>

          {/* Location */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center gap-3 mb-6">
              <MapPin
                size={21}
                className="text-violet-400"
              />

              <h2 className="text-xl font-semibold">
                Location
              </h2>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Target Location
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Example: India"
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500"
              />
            </div>

          </section>

          {/* Deliverables */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center gap-3 mb-6">
              <FileText
                size={21}
                className="text-violet-400"
              />

              <h2 className="text-xl font-semibold">
                Deliverables
              </h2>
            </div>

            <label className="block text-sm text-gray-300 mb-2">
              What should creators deliver? *
            </label>

            <textarea
              name="deliverables"
              value={formData.deliverables}
              onChange={handleChange}
              rows="5"
              placeholder={`Example:
• 2 Instagram Reels
• 3 Instagram Stories
• 1 Instagram Post
• Product mention in caption`}
              className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500 resize-none"
            />

          </section>

          {/* Requirements */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center gap-3 mb-6">
              <Users
                size={21}
                className="text-violet-400"
              />

              <h2 className="text-xl font-semibold">
                Creator Requirements
              </h2>
            </div>

            <label className="block text-sm text-gray-300 mb-2">
              What are you looking for in creators? *
            </label>

            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows="5"
              placeholder={`Example:
• Minimum 10K followers
• Fashion or lifestyle niche
• Good engagement rate
• Based in India
• Professional content quality`}
              className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500 resize-none"
            />

          </section>

          {/* Bottom Actions */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div>
                <h3 className="font-semibold">
                  Ready to launch?
                </h3>

                <p className="text-sm text-gray-400 mt-1">
                  Save your campaign as a draft or publish it
                  for creators.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">

                <button
                  type="button"
                  onClick={() => handleSubmit("draft")}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition disabled:opacity-50"
                >
                  <Save size={18} />
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit("published")}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 font-semibold transition disabled:opacity-50"
                >
                  <Send size={18} />

                  {saving
                    ? "Saving..."
                    : "Publish Campaign"}
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