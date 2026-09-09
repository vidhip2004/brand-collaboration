import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  IndianRupee,
  MapPin,
  Users,
  CheckCircle,
  X,
  Send,
  Briefcase,
} from "lucide-react";

import authService from "../../services/authService";

const CAMPAIGN_API =
  "http://localhost:5000/api/campaigns";

const APPLICATION_API =
  "http://localhost:5000/api/applications";

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showApplyForm, setShowApplyForm] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    message: "",
    portfolioLink: "",
    proposedRate: "",
  });

  const user = authService.getCurrentUser();

  // Fetch campaign
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${CAMPAIGN_API}/${id}`
        );

        setCampaign(response.data.campaign);
      } catch (err) {
        console.error(
          "Campaign details error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load campaign."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

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
      setError(
        "Only creators can apply for campaigns."
      );
      return;
    }

    if (!formData.message.trim()) {
      setError(
        "Please write a message to the brand."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        APPLICATION_API,
        {
          campaignId: campaign._id,
          creatorId: user.id,

          message: formData.message,

          portfolioLink:
            formData.portfolioLink,

          proposedRate:
            Number(formData.proposedRate) || 0,
        }
      );

      setSuccess(response.data.message);

      setFormData({
        message: "",
        portfolioLink: "",
        proposedRate: "",
      });

      setShowApplyForm(false);
    } catch (err) {
      console.error(
        "Application error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to submit application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatBudget = (budget) => {
    if (!budget) return "Not specified";

    return `₹${Number(budget).toLocaleString(
      "en-IN"
    )}`;
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;

    const difference =
      new Date(deadline) - new Date();

    return Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );
  };

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-violet-500" />

          <p className="text-slate-400">
            Loading campaign...
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8">
            <p className="mb-5 text-red-300">
              {error}
            </p>

            <button
              onClick={() =>
                navigate(
                  "/creator/discover-campaigns"
                )
              }
              className="rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500"
            >
              Back to Campaigns
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  const daysLeft = getDaysLeft(
    campaign.applicationDeadline
  );

  const deadlinePassed =
    daysLeft !== null && daysLeft <= 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <div className="border-b border-slate-800 bg-slate-950/90">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <button
            onClick={() =>
              navigate(
                "/creator/discover-campaigns"
              )
            }
            className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Discover Campaigns
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Success */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300">
            <CheckCircle size={20} />

            <span>{success}</span>
          </div>
        )}

        {/* Error */}
        {error && campaign && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            <X size={20} />

            <span>{error}</span>
          </div>
        )}

        {/* Campaign Header */}
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
          <div className="bg-gradient-to-br from-violet-500/15 via-slate-900 to-cyan-500/10 p-8 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-5">
                {/* Brand logo */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl font-bold text-violet-300">
                  {(campaign.brandName || "B")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-cyan-400">
                    {campaign.brandName ||
                      "Brand"}
                  </p>

                  <h1 className="text-3xl font-bold md:text-4xl">
                    {campaign.title}
                  </h1>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300">
                      {campaign.category}
                    </span>

                    <span className="rounded-full bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300">
                      {campaign.campaignType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 md:min-w-[180px]">
                <p className="text-xs text-emerald-300">
                  Campaign Budget
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {formatBudget(
                    campaign.budget
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Quick info */}
          <div className="grid border-t border-slate-800 sm:grid-cols-2 lg:grid-cols-4">
            <QuickInfo
              icon={<Users size={19} />}
              label="Creators Needed"
              value={campaign.creatorsNeeded}
            />

            <QuickInfo
              icon={<MapPin size={19} />}
              label="Location"
              value={
                campaign.location || "India"
              }
            />

            <QuickInfo
              icon={<Calendar size={19} />}
              label="Start Date"
              value={formatDate(
                campaign.startDate
              )}
            />

            <QuickInfo
              icon={<Clock size={19} />}
              label="Application Deadline"
              value={formatDate(
                campaign.applicationDeadline
              )}
            />
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Left */}
          <div className="space-y-6 lg:col-span-2">
            {/* About */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-4 text-xl font-semibold">
                About this Campaign
              </h2>

              <p className="whitespace-pre-line leading-7 text-slate-300">
                {campaign.description}
              </p>
            </section>

            {/* Deliverables */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-4 text-xl font-semibold">
                Deliverables
              </h2>

              <p className="whitespace-pre-line leading-7 text-slate-300">
                {campaign.deliverables}
              </p>
            </section>

            {/* Requirements */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-4 text-xl font-semibold">
                Creator Requirements
              </h2>

              <p className="whitespace-pre-line leading-7 text-slate-300">
                {campaign.requirements}
              </p>
            </section>

            {/* Platforms */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-4 text-xl font-semibold">
                Required Platforms
              </h2>

              <div className="flex flex-wrap gap-3">
                {(campaign.platforms || []).map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-300"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </section>
          </div>

          {/* Right */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              {/* Deadline */}
              <div className="mb-6 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
                <div className="flex items-center gap-2 text-orange-300">
                  <Clock size={18} />

                  <span className="text-sm font-medium">
                    Application Deadline
                  </span>
                </div>

                <p className="mt-2 font-semibold text-white">
                  {formatDate(
                    campaign.applicationDeadline
                  )}
                </p>

                {!deadlinePassed &&
                  daysLeft !== null && (
                    <p className="mt-1 text-xs text-orange-300">
                      {daysLeft} day
                      {daysLeft !== 1
                        ? "s"
                        : ""}{" "}
                      remaining
                    </p>
                  )}
              </div>

              {/* Campaign info */}
              <div className="mb-6 space-y-4">
                <SidebarItem
                  label="Budget"
                  value={formatBudget(
                    campaign.budget
                  )}
                />

                <SidebarItem
                  label="Creators Needed"
                  value={
                    campaign.creatorsNeeded
                  }
                />

                <SidebarItem
                  label="Campaign Period"
                  value={`${formatDate(
                    campaign.startDate
                  )} - ${formatDate(
                    campaign.endDate
                  )}`}
                />
              </div>

              {/* Apply button */}
              {!showApplyForm ? (
                <button
                  disabled={
                    deadlinePassed ||
                    campaign.status !==
                      "published"
                  }
                  onClick={() => {
                    setError("");

                    if (!user) {
                      navigate("/login");
                      return;
                    }

                    if (user.role !== "creator") {
                      setError(
                        "Only creators can apply for campaigns."
                      );
                      return;
                    }

                    setShowApplyForm(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-3.5 font-semibold transition hover:from-violet-500 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={18} />
                  {deadlinePassed
                    ? "Applications Closed"
                    : "Apply Now"}
                </button>
              ) : (
                <form
                  onSubmit={handleApply}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      Apply for Campaign
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        setShowApplyForm(false)
                      }
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Message to Brand *
                    </label>

                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell the brand why you are a good fit for this campaign..."
                      className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
                    />
                  </div>

                  {/* Portfolio */}
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Portfolio Link
                    </label>

                    <input
                      type="url"
                      name="portfolioLink"
                      value={
                        formData.portfolioLink
                      }
                      onChange={handleChange}
                      placeholder="https://yourportfolio.com"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
                    />
                  </div>

                  {/* Rate */}
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Proposed Rate
                    </label>

                    <div className="relative">
                      <IndianRupee
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        type="number"
                        name="proposedRate"
                        value={
                          formData.proposedRate
                        }
                        onChange={handleChange}
                        min="0"
                        placeholder="Enter your expected rate"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        Submit Application
                      </>
                    )}
                  </button>
                </form>
              )}

              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                Your application will be reviewed by
                the brand.
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
    <div className="border-b border-slate-800 p-5 sm:border-r lg:border-b-0">
      <div className="mb-2 flex items-center gap-2 text-violet-400">
        {icon}

        <span className="text-xs text-slate-500">
          {label}
        </span>
      </div>

      <p className="text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function SidebarItem({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-white">
        {value}
      </span>
    </div>
  );
}