import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  X,
  Send,
  Briefcase,
  Sparkles,
} from "lucide-react";

import authService from "../../services/authService";
import {
  getCurrencyFromCountry,
  formatCurrency,
  convertCurrency,
  getCurrencySymbol,
} from "../../services/currency";

const CAMPAIGN_API = "http://localhost:5000/api/campaigns";
const APPLICATION_API = "http://localhost:5000/api/applications";

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    message: "",
    portfolioLink: "",
    proposedRate: "",
  });

  const user = authService.getCurrentUser();
  const creatorCurrency = getCurrencyFromCountry(user?.country);
  const [convertedBudget, setConvertedBudget] = useState(null);

  // Fetch campaign
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${CAMPAIGN_API}/${id}`);
        setCampaign(response.data.campaign);
      } catch (err) {
        console.error("Campaign details error:", err);
        setError(
          err.response?.data?.message || "Failed to load campaign."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  // Convert campaign budget to creator's currency
  useEffect(() => {
    const convertBudget = async () => {
      if (!campaign?.budget) return;

      const sourceCurrency = campaign.currency || "INR";

      if (sourceCurrency === creatorCurrency.code) {
        setConvertedBudget(campaign.budget);
        return;
      }

      try {
        const result = await convertCurrency(
          campaign.budget,
          sourceCurrency,
          creatorCurrency.code
        );
        setConvertedBudget(result);
      } catch {
        setConvertedBudget(campaign.budget);
      }
    };

    convertBudget();
  }, [campaign, creatorCurrency.code]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleApply = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "creator") {
      setError("Only creators can apply for campaigns.");
      return;
    }

    if (!formData.message.trim()) {
      setError("Please write a message to the brand.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(APPLICATION_API, {
        campaignId: campaign._id,
        creatorId: user.id,
        message: formData.message,
        portfolioLink: formData.portfolioLink,
        proposedRate: Number(formData.proposedRate) || 0,
        proposedRateCurrency: creatorCurrency.code,
      });

      setSuccess(response.data.message);
      setFormData({
        message: "",
        portfolioLink: "",
        proposedRate: "",
      });

      setShowApplyForm(false);
    } catch (err) {
      console.error("Application error:", err);
      setError(
        err.response?.data?.message || "Failed to submit application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatBudget = () => {
    if (!campaign?.budget) return "Not specified";
    if (convertedBudget === null) return "Calculating...";
    return formatCurrency(convertedBudget, creatorCurrency.code);
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;

    const difference = new Date(deadline) - new Date();
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] text-[#2B241F] font-sans">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#D7C9B8] border-t-[#8B6F5A]" />
          <p className="text-xs font-semibold text-[#4A3A2E]/70">
            Loading campaign details...
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] px-6 py-12 text-[#2B241F] font-sans flex items-center justify-center">
        <div className="mx-auto max-w-md text-center bg-[#FAF9F6] p-8 rounded-2xl border border-[#D7C9B8] shadow-lg w-full">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-200">
            <X size={24} />
          </div>
          <p className="mb-4 text-xs font-bold text-red-700">{error}</p>
          <button
            onClick={() => navigate("/creator/discover-campaigns")}
            className="w-full rounded-xl bg-[#8B6F5A] px-5 py-2.5 font-bold text-white text-xs hover:bg-[#785D4A] shadow-xs"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  const daysLeft = getDaysLeft(campaign.applicationDeadline);
  const deadlinePassed = daysLeft !== null && daysLeft <= 0;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] font-sans">
      {/* Top bar */}
      <div className="border-b border-[#D7C9B8] bg-[#FAF9F6]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <button
            onClick={() => navigate("/creator/discover-campaigns")}
            className="flex items-center gap-2 text-xs font-bold text-[#4A3A2E] transition hover:text-[#8B6F5A]"
          >
            <ArrowLeft size={16} />
            Back to Discover Campaigns
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {/* Success Alert */}
        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-900">
            <CheckCircle size={18} className="shrink-0 text-emerald-700" />
            <span>{success}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && campaign && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
            <X size={18} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Campaign Header Card */}
        <div className="overflow-hidden rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] shadow-xs">
          <div className="bg-[#EDE7DC]/40 p-6 md:p-8 border-b border-[#D7C9B8]/70">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-4">
                {/* Brand logo */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#8B6F5A] text-lg font-black text-white shadow-xs">
                  {(campaign.brandName || "B").charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="text-xs font-bold text-[#8B6F5A]">
                    {campaign.brandName || "Brand"}
                  </p>

                  <h1 className="text-2xl md:text-3xl font-extrabold text-[#2B241F] tracking-tight mt-0.5">
                    {campaign.title}
                  </h1>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8] px-3 py-0.5 text-xs font-bold">
                      {campaign.category}
                    </span>

                    <span className="rounded-full bg-[#EDE7DC] text-[#A78B7F] border border-[#D7C9B8] px-3 py-0.5 text-xs font-bold">
                      {campaign.campaignType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Budget Badge */}
              <div className="rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] px-5 py-3 md:min-w-[170px] text-left md:text-right shadow-2xs">
                <p className="text-[10px] uppercase font-bold text-[#8B6F5A] tracking-wider">
                  Campaign Budget
                </p>
                <p className="mt-0.5 text-xl font-black text-[#2B241F]">
                  {formatBudget()}
                </p>
                <p className="text-[10px] text-[#4A3A2E]/50 mt-0.5">
                  in {creatorCurrency.code}
                </p>
              </div>
            </div>
          </div>

          {/* Quick info row */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 bg-[#EDE7DC]/20 divide-y sm:divide-y-0 sm:divide-x divide-[#D7C9B8]/70">
            <QuickInfo
              icon={<Users size={17} />}
              label="Creators Needed"
              value={campaign.creatorsNeeded}
            />

            <QuickInfo
              icon={<MapPin size={17} />}
              label="Location"
              value={campaign.location || "India"}
            />

            <QuickInfo
              icon={<Calendar size={17} />}
              label="Start Date"
              value={formatDate(campaign.startDate)}
            />

            <QuickInfo
              icon={<Clock size={17} />}
              label="Application Deadline"
              value={formatDate(campaign.applicationDeadline)}
            />
          </div>
        </div>

        {/* Two Column Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* About */}
            <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
              <h2 className="text-sm font-extrabold text-[#2B241F] mb-3 uppercase tracking-wider">
                About this Campaign
              </h2>
              <p className="whitespace-pre-line text-xs leading-relaxed text-[#4A3A2E]">
                {campaign.description}
              </p>
            </section>

            {/* Deliverables */}
            <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
              <h2 className="text-sm font-extrabold text-[#2B241F] mb-3 uppercase tracking-wider">
                Deliverables
              </h2>
              <p className="whitespace-pre-line text-xs leading-relaxed text-[#4A3A2E] bg-[#EDE7DC]/30 p-4 rounded-xl border border-[#D7C9B8]">
                {campaign.deliverables}
              </p>
            </section>

            {/* Requirements */}
            <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
              <h2 className="text-sm font-extrabold text-[#2B241F] mb-3 uppercase tracking-wider">
                Creator Requirements
              </h2>
              <p className="whitespace-pre-line text-xs leading-relaxed text-[#4A3A2E] bg-[#EDE7DC]/30 p-4 rounded-xl border border-[#D7C9B8]">
                {campaign.requirements}
              </p>
            </section>

            {/* Platforms */}
            <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
              <h2 className="text-sm font-extrabold text-[#2B241F] mb-3 uppercase tracking-wider">
                Required Platforms
              </h2>
              <div className="flex flex-wrap gap-2">
                {(campaign.platforms || []).map((item) => (
                  <span
                    key={item}
                    className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 px-3 py-1.5 text-xs font-bold text-[#2B241F]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column Action Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs space-y-5">
              {/* Deadline Callout */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <Clock size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Application Deadline
                  </span>
                </div>

                <p className="mt-1.5 text-xs font-extrabold text-[#2B241F]">
                  {formatDate(campaign.applicationDeadline)}
                </p>

                {!deadlinePassed && daysLeft !== null && (
                  <p className="mt-0.5 text-[11px] font-bold text-amber-700">
                    {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
                  </p>
                )}
              </div>

              {/* Campaign Breakdown Info */}
              <div className="space-y-3 pt-1">
                <SidebarItem
                  label={`Budget (${creatorCurrency.code})`}
                  value={formatBudget()}
                />
                <SidebarItem
                  label="Creators Needed"
                  value={campaign.creatorsNeeded}
                />
                <SidebarItem
                  label="Campaign Period"
                  value={`${formatDate(campaign.startDate)} - ${formatDate(
                    campaign.endDate
                  )}`}
                />
              </div>

              {/* Apply Action Button / Form */}
              {!showApplyForm ? (
                <button
                  disabled={
                    deadlinePassed || campaign.status !== "published"
                  }
                  onClick={() => {
                    setError("");
                    if (!user) {
                      navigate("/login");
                      return;
                    }
                    if (user.role !== "creator") {
                      setError("Only creators can apply for campaigns.");
                      return;
                    }
                    setShowApplyForm(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] px-5 py-3 font-bold text-white text-xs transition shadow-xs disabled:opacity-50"
                >
                  <Send size={15} />
                  {deadlinePassed ? "Applications Closed" : "Apply Now"}
                </button>
              ) : (
                <form onSubmit={handleApply} className="space-y-3.5 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#2B241F] uppercase tracking-wider">
                      Apply for Campaign
                    </h3>

                    <button
                      type="button"
                      onClick={() => setShowApplyForm(false)}
                      className="p-1 rounded-lg text-[#4A3A2E]/70 hover:bg-[#EDE7DC] hover:text-[#2B241F]"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#2B241F]">
                      Message to Brand *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Explain why your audience matches this brand campaign..."
                      className="w-full resize-none rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 p-3 text-xs text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:bg-[#FAF9F6]"
                    />
                  </div>

                  {/* Portfolio Link */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#2B241F]">
                      Portfolio Link
                    </label>
                    <input
                      type="url"
                      name="portfolioLink"
                      value={formData.portfolioLink}
                      onChange={handleChange}
                      placeholder="https://yourportfolio.com"
                      className="w-full rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 px-3.5 py-2 text-xs text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:bg-[#FAF9F6]"
                    />
                  </div>

                  {/* Proposed Rate */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#2B241F]">
                      Proposed Rate{" "}
                      <span className="ml-1 px-1.5 py-0.5 rounded-md bg-[#EDE7DC] text-[#8B6F5A] font-bold text-[10px] border border-[#D7C9B8]">
                        {creatorCurrency.code}
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A3A2E]/50 text-xs font-bold select-none">
                        {getCurrencySymbol(creatorCurrency.code)}
                      </span>
                      <input
                        type="number"
                        name="proposedRate"
                        value={formData.proposedRate}
                        onChange={handleChange}
                        min="0"
                        placeholder="Expected fee"
                        className="w-full rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 py-2 pl-9 pr-3.5 text-xs text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:bg-[#FAF9F6]"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-[#4A3A2E]/60">
                      Enter in {creatorCurrency.code} — brand will see it in their currency.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] px-5 py-2.5 font-bold text-white text-xs transition shadow-xs disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Submit Application
                      </>
                    )}
                  </button>
                </form>
              )}

              <p className="text-center text-[11px] text-[#4A3A2E]/60">
                Your application will be sent directly to the brand's review dashboard.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function QuickInfo({ icon, label, value }) {
  return (
    <div className="p-4 flex items-center gap-3">
      <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8] shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-[#4A3A2E]/60 tracking-wider">
          {label}
        </p>
        <p className="text-xs font-extrabold text-[#2B241F] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function SidebarItem({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#D7C9B8]/70 pb-2.5 last:border-0 last:pb-0 text-xs">
      <span className="text-[#4A3A2E]/60 font-medium">{label}</span>
      <span className="text-right font-bold text-[#2B241F]">{value}</span>
    </div>
  );
}