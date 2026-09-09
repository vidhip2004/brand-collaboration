import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Clock,
  ArrowRight,
  X,
  RefreshCw,
  Briefcase,
  Send,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";

import authService from "../../services/authService";
import MatchScore from "../../Components/Common/MatchScore";
import {
  getCurrencyFromCountry,
  formatCurrency,
  convertCurrency,
} from "../../services/currency";

const API_URL = "http://localhost:5000/api/campaigns";
const APPLICATION_API_URL = "http://localhost:5000/api/applications";

export default function DiscoverCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [campaignType, setCampaignType] = useState("All");
  const [platform, setPlatform] = useState("All");

  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [applicationError, setApplicationError] = useState("");
  const [applicationSuccess, setApplicationSuccess] = useState("");

  const [applicationForm, setApplicationForm] = useState({
    message: "",
    portfolioLink: "",
    proposedRate: "",
  });

  const user = authService.getCurrentUser();

  const creatorCurrency = getCurrencyFromCountry(user?.country);

  const [convertedBudgets, setConvertedBudgets] = useState({});

  const loadConvertedBudgets = async (campaignList) => {
    try {
      const results = {};

      for (const campaign of campaignList) {
        if (!campaign?.budget) {
          continue;
        }

        const sourceCurrency = campaign.currency || "INR";

        const converted = await convertCurrency(
          campaign.budget,
          sourceCurrency,
          creatorCurrency.code
        );

        results[campaign._id] = converted;
      }

      setConvertedBudgets(results);
    } catch (error) {
      console.error(
        "Discover campaign currency conversion error:",
        error
      );
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    setError("");
    setMatchError("");

    try {
      const currentUser = authService.getCurrentUser();

      const campaignsResponse = await axios.get(API_URL);

      let campaignData =
        campaignsResponse.data?.campaigns || [];

      if (!Array.isArray(campaignData)) {
        campaignData = [];
      }

      if (
        currentUser &&
        currentUser.role === "creator" &&
        currentUser.id
      ) {
        setMatchLoading(true);

        try {
          const matchResponse = await axios.get(
            `http://localhost:5000/api/matches/creator/${currentUser.id}`
          );

          const matches =
            matchResponse.data?.matches || [];

          const matchMap = new Map(
            matches.map((match) => [
              String(match.campaignId),
              match,
            ])
          );

          campaignData = campaignData.map((campaign) => {
            const match = matchMap.get(
              String(campaign._id)
            );

            return {
              ...campaign,
              matchScore: match?.score ?? 0,
              matchLevel:
                match?.level || "Low Match",
              matchReasons:
                match?.reasons || [],
            };
          });

          campaignData.sort(
            (a, b) =>
              (b.matchScore || 0) -
              (a.matchScore || 0)
          );
        } catch (matchErr) {
          console.error(
            "Match score error:",
            matchErr
          );

          setMatchError(
            "Smart matching is temporarily unavailable."
          );

          campaignData = campaignData.map(
            (campaign) => ({
              ...campaign,
              matchScore: 0,
              matchLevel: "Low Match",
              matchReasons: [],
            })
          );
        } finally {
          setMatchLoading(false);
        }
      }

      setCampaigns(campaignData);

      await loadConvertedBudgets(campaignData);
    } catch (err) {
      console.error(
        "Error fetching campaigns:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load campaigns. Please try again."
      );

      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        campaign.title
          ?.toLowerCase()
          .includes(searchText) ||
        campaign.description
          ?.toLowerCase()
          .includes(searchText) ||
        campaign.brandName
          ?.toLowerCase()
          .includes(searchText) ||
        campaign.category
          ?.toLowerCase()
          .includes(searchText);

      const matchesCategory =
        category === "All" ||
        campaign.category === category;

      const matchesType =
        campaignType === "All" ||
        campaign.campaignType === campaignType;

      const matchesPlatform =
        platform === "All" ||
        campaign.platforms?.includes(platform);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesPlatform
      );
    });
  }, [
    campaigns,
    search,
    category,
    campaignType,
    platform,
  ]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setCampaignType("All");
    setPlatform("All");
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatBudget = (campaign) => {
    if (!campaign?.budget) {
      return "Not specified";
    }

    const converted =
      convertedBudgets[campaign._id];

    if (converted === undefined) {
      return "Calculating...";
    }

    return formatCurrency(
      converted,
      creatorCurrency.code
    );
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;

    const today = new Date();
    const end = new Date(deadline);

    const difference = end - today;

    const days = Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );

    return days;
  };

  const openCampaignDetails = (campaign) => {
    setSelectedCampaign(campaign);
    setShowApplicationForm(false);
    setApplicationError("");
    setApplicationSuccess("");

    setApplicationForm({
      message: "",
      portfolioLink: "",
      proposedRate: "",
    });
  };

  const closeCampaignModal = () => {
    if (applicationLoading) {
      return;
    }

    setSelectedCampaign(null);
    setShowApplicationForm(false);
    setApplicationError("");
    setApplicationSuccess("");

    setApplicationForm({
      message: "",
      portfolioLink: "",
      proposedRate: "",
    });
  };

  const openApplicationForm = () => {
    const currentUser =
      authService.getCurrentUser();

    if (!currentUser) {
      setApplicationError(
        "Please login as a creator before applying."
      );
      return;
    }

    if (currentUser.role !== "creator") {
      setApplicationError(
        "Only creator accounts can apply for campaigns."
      );
      return;
    }

    if (!selectedCampaign) {
      return;
    }

    const daysLeft = getDaysLeft(
      selectedCampaign.applicationDeadline
    );

    if (
      daysLeft !== null &&
      daysLeft <= 0
    ) {
      setApplicationError(
        "The application deadline for this campaign has passed."
      );
      return;
    }

    setApplicationError("");
    setApplicationSuccess("");
    setShowApplicationForm(true);
  };

  const handleApplicationChange = (e) => {
    const { name, value } = e.target;

    setApplicationForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setApplicationError("");
    setApplicationSuccess("");
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();

    setApplicationError("");
    setApplicationSuccess("");

    const currentUser =
      authService.getCurrentUser();

    if (!currentUser) {
      setApplicationError(
        "Please login before applying for a campaign."
      );
      return;
    }

    if (currentUser.role !== "creator") {
      setApplicationError(
        "Only creators can apply for campaigns."
      );
      return;
    }

    if (!selectedCampaign) {
      setApplicationError(
        "No campaign selected."
      );
      return;
    }

    if (!applicationForm.message.trim()) {
      setApplicationError(
        "Please write a message to the brand."
      );
      return;
    }

    if (
      applicationForm.message.trim().length < 20
    ) {
      setApplicationError(
        "Your application message should be at least 20 characters."
      );
      return;
    }

    if (
      applicationForm.proposedRate !== "" &&
      Number(applicationForm.proposedRate) < 0
    ) {
      setApplicationError(
        "Proposed rate cannot be negative."
      );
      return;
    }

    const daysLeft = getDaysLeft(
      selectedCampaign.applicationDeadline
    );

    if (
      daysLeft !== null &&
      daysLeft <= 0
    ) {
      setApplicationError(
        "The application deadline for this campaign has passed."
      );
      return;
    }

    setApplicationLoading(true);

    try {
      const applicationData = {
        campaignId: selectedCampaign._id,
        creatorId: currentUser.id,
        message:
          applicationForm.message.trim(),
        portfolioLink:
          applicationForm.portfolioLink.trim(),
        proposedRate:
          applicationForm.proposedRate === ""
            ? 0
            : Number(
                applicationForm.proposedRate
              ),
      };

      console.log(
        "Submitting application:",
        applicationData
      );

      const response = await axios.post(
        APPLICATION_API_URL,
        applicationData
      );

      console.log(
        "Application submitted:",
        response.data
      );

      setApplicationSuccess(
        response.data.message ||
          "Application submitted successfully!"
      );

      setApplicationForm({
        message: "",
        portfolioLink: "",
        proposedRate: "",
      });
    } catch (err) {
      console.error(
        "Application submission error:",
        err
      );

      setApplicationError(
        err.response?.data?.message ||
          "Failed to submit application. Please try again."
      );
    } finally {
      setApplicationLoading(false);
    }
  };

  const backToCampaignDetails = () => {
    if (applicationLoading) {
      return;
    }

    setShowApplicationForm(false);
    setApplicationError("");
    setApplicationSuccess("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <div className="border-b border-slate-800 bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-violet-400">
                CREATOR MARKETPLACE
              </p>

              <h1 className="text-3xl font-bold md:text-4xl">
                Discover Campaigns
              </h1>

              <p className="mt-2 max-w-2xl text-slate-400">
                Find brand collaborations that match your
                niche, platform, audience, and creative style.
              </p>
            </div>

            <button
              onClick={fetchCampaigns}
              className="flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-violet-500 hover:bg-slate-800"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* SEARCH + FILTERS */}
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal
              size={18}
              className="text-violet-400"
            />

            <h2 className="font-semibold">
              Find the right campaign
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            <div className="relative lg:col-span-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search campaigns..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-500"
              />
            </div>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-500"
            >
              <option value="All">
                All Categories
              </option>
              <option value="Fashion">
                Fashion
              </option>
              <option value="Beauty">
                Beauty
              </option>
              <option value="Food">
                Food
              </option>
              <option value="Technology">
                Technology
              </option>
              <option value="Fitness">
                Fitness
              </option>
              <option value="Travel">
                Travel
              </option>
              <option value="Lifestyle">
                Lifestyle
              </option>
              <option value="Gaming">
                Gaming
              </option>
              <option value="Education">
                Education
              </option>
            </select>

            <select
              value={campaignType}
              onChange={(e) =>
                setCampaignType(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-500"
            >
              <option value="All">
                All Campaign Types
              </option>
              <option value="Paid Collaboration">
                Paid Collaboration
              </option>
              <option value="Barter Collaboration">
                Barter Collaboration
              </option>
              <option value="Affiliate">
                Affiliate
              </option>
              <option value="Ambassador">
                Ambassador
              </option>
            </select>

            <select
              value={platform}
              onChange={(e) =>
                setPlatform(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-500"
            >
              <option value="All">
                All Platforms
              </option>
              <option value="Instagram">
                Instagram
              </option>
              <option value="YouTube">
                YouTube
              </option>
              <option value="TikTok">
                TikTok
              </option>
              <option value="Facebook">
                Facebook
              </option>
              <option value="LinkedIn">
                LinkedIn
              </option>
            </select>
          </div>

          {(search ||
            category !== "All" ||
            campaignType !== "All" ||
            platform !== "All") && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-500">
                Filters applied
              </span>

              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 transition hover:bg-violet-500/20"
              >
                Clear all
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {/* RESULT COUNT */}
        {!loading && !error && (
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing{" "}
              <span className="font-semibold text-white">
                {filteredCampaigns.length}
              </span>{" "}
              campaign
              {filteredCampaigns.length !== 1
                ? "s"
                : ""}
            </p>
          </div>
        )}

        {/* MATCH ERROR */}
        {!loading && matchError && (
          <div className="mb-5 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-300">
            {matchError}
          </div>
        )}

        {/* MATCH LOADING */}
        {!loading && matchLoading && (
          <div className="mb-5 flex items-center gap-2 text-sm text-violet-300">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
            Calculating smart matches...
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-violet-500" />

              <p className="text-slate-400">
                Loading campaigns...
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <p className="mb-4 text-red-300">
              {error}
            </p>

            <button
              onClick={fetchCampaigns}
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium transition hover:bg-violet-500"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          filteredCampaigns.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
                <Briefcase
                  size={28}
                  className="text-violet-400"
                />
              </div>

              <h3 className="mb-2 text-xl font-semibold">
                No campaigns found
              </h3>

              <p className="mx-auto mb-6 max-w-md text-sm text-slate-400">
                Try changing your search or filters. New brand
                campaigns will appear here when they are published.
              </p>

              <button
                onClick={clearFilters}
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-violet-500"
              >
                Clear Filters
              </button>
            </div>
          )}

        {/* CAMPAIGN CARDS */}
        {!loading &&
          !error &&
          filteredCampaigns.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredCampaigns.map((campaign) => {
                const daysLeft = getDaysLeft(
                  campaign.applicationDeadline
                );

                return (
                  <div
                    key={campaign._id}
                    className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition duration-300 hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/5"
                  >
                    <div className="border-b border-slate-800 bg-gradient-to-br from-violet-500/10 via-slate-900 to-cyan-500/5 p-5">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-lg font-bold text-violet-300">
                          {(campaign.brandName || "B")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        {campaign.campaignType && (
                          <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                            {campaign.campaignType}
                          </span>
                        )}
                      </div>

                      <p className="mb-1 text-sm font-medium text-cyan-400">
                        {campaign.brandName || "Brand"}
                      </p>

                      <h3 className="line-clamp-2 text-xl font-bold text-white">
                        {campaign.title}
                      </h3>

                      <div className="mt-4">
                        <MatchScore
                          score={campaign.matchScore || 0}
                          level={
                            campaign.matchLevel ||
                            "Match"
                          }
                          reasons={
                            campaign.matchReasons ||
                            []
                          }
                          compact
                        />
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="mb-5 line-clamp-3 text-sm leading-6 text-slate-400">
                        {campaign.description}
                      </p>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-slate-300">
                          <IndianRupee
                            size={16}
                            className="text-emerald-400"
                          />

                          <span>
                            <span className="font-semibold text-white">
                              {formatBudget(campaign)}
                            </span>{" "}
                            budget
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-slate-300">
                          <Users
                            size={16}
                            className="text-violet-400"
                          />

                          <span>
                            {campaign.creatorsNeeded} creator
                            {campaign.creatorsNeeded !==
                            1
                              ? "s"
                              : ""}{" "}
                            needed
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-slate-300">
                          <MapPin
                            size={16}
                            className="text-cyan-400"
                          />

                          <span>
                            {campaign.location ||
                              "India"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-slate-300">
                          <Calendar
                            size={16}
                            className="text-orange-400"
                          />

                          <span>
                            Starts{" "}
                            {formatDate(
                              campaign.startDate
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {(campaign.platforms || []).map(
                          (item) => (
                            <span
                              key={item}
                              className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-300"
                            >
                              {item}
                            </span>
                          )
                        )}
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
                        <div className="flex items-center gap-2 text-xs">
                          <Clock size={14} />

                          {daysLeft !== null &&
                          daysLeft > 0 ? (
                            <span className="text-orange-300">
                              {daysLeft} days left
                            </span>
                          ) : (
                            <span className="text-red-400">
                              Deadline passed
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() =>
                            openCampaignDetails(
                              campaign
                            )
                          }
                          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold transition hover:bg-violet-500"
                        >
                          View Details
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </main>

      {/* CAMPAIGN DETAILS / APPLICATION MODAL */}
      {selectedCampaign && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={closeCampaignModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <div className="border-b border-slate-800 bg-gradient-to-r from-violet-500/10 to-cyan-500/5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {showApplicationForm && (
                    <button
                      onClick={backToCampaignDetails}
                      disabled={applicationLoading}
                      className="mt-1 rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}

                  <div>
                    <p className="mb-1 text-sm font-medium text-cyan-400">
                      {selectedCampaign.brandName}
                    </p>

                    <h2 className="text-2xl font-bold">
                      {showApplicationForm
                        ? "Apply for Campaign"
                        : selectedCampaign.title}
                    </h2>

                    {!showApplicationForm && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                          {selectedCampaign.category}
                        </span>

                        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                          {selectedCampaign.campaignType}
                        </span>
                      </div>
                    )}

                    {showApplicationForm && (
                      <p className="mt-1 text-sm text-slate-400">
                        Applying for:{" "}
                        <span className="font-medium text-white">
                          {selectedCampaign.title}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={closeCampaignModal}
                  disabled={applicationLoading}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* APPLICATION FORM */}
            {showApplicationForm ? (
              <form
                onSubmit={handleApplicationSubmit}
                className="space-y-6 p-6"
              >
                {/* Campaign Summary */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Campaign
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {selectedCampaign.title}
                      </p>

                      <p className="mt-1 text-sm text-cyan-400">
                        {selectedCampaign.brandName}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Budget
                      </p>

                      <p className="mt-1 font-semibold text-emerald-400">
                        {formatBudget(
                          selectedCampaign
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                {applicationSuccess && (
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <CheckCircle
                      size={20}
                      className="mt-0.5 shrink-0 text-emerald-400"
                    />

                    <div>
                      <p className="font-medium text-emerald-300">
                        Application Submitted
                      </p>

                      <p className="mt-1 text-sm text-emerald-200/80">
                        {applicationSuccess}
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {applicationError && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                    <AlertCircle
                      size={20}
                      className="mt-0.5 shrink-0 text-red-400"
                    />

                    <p className="text-sm text-red-300">
                      {applicationError}
                    </p>
                  </div>
                )}

                {/* Application Message */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Message to Brand{" "}
                    <span className="text-red-400">
                      *
                    </span>
                  </label>

                  <textarea
                    name="message"
                    value={applicationForm.message}
                    onChange={
                      handleApplicationChange
                    }
                    rows={6}
                    placeholder="Tell the brand why you are a good fit for this campaign..."
                    disabled={
                      applicationLoading ||
                      !!applicationSuccess
                    }
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <div className="mt-2 flex justify-between text-xs text-slate-500">
                    <span>
                      Minimum 20 characters
                    </span>

                    <span>
                      {applicationForm.message.length}{" "}
                      characters
                    </span>
                  </div>
                </div>

                {/* Portfolio Link */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Portfolio Link
                    <span className="ml-1 text-slate-500">
                      (Optional)
                    </span>
                  </label>

                  <div className="relative">
                    <LinkIcon
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      type="url"
                      name="portfolioLink"
                      value={
                        applicationForm.portfolioLink
                      }
                      onChange={
                        handleApplicationChange
                      }
                      placeholder="https://yourportfolio.com"
                      disabled={
                        applicationLoading ||
                        !!applicationSuccess
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Proposed Rate */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Proposed Rate
                    <span className="ml-1 text-slate-500">
                      (Optional)
                    </span>
                  </label>

                  <div className="relative">
                    <IndianRupee
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      type="number"
                      name="proposedRate"
                      value={
                        applicationForm.proposedRate
                      }
                      onChange={
                        handleApplicationChange
                      }
                      placeholder="Enter your expected rate"
                      min="0"
                      disabled={
                        applicationLoading ||
                        !!applicationSuccess
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Campaign budget:{" "}
                    <span className="text-slate-300">
                      {formatBudget(
                        selectedCampaign
                      )}
                    </span>
                  </p>
                </div>

                {/* Deadline */}
                <div className="flex items-center gap-3 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
                  <Clock
                    size={18}
                    className="shrink-0 text-orange-400"
                  />

                  <div>
                    <p className="text-sm font-medium text-orange-300">
                      Application Deadline
                    </p>

                    <p className="mt-1 text-xs text-orange-200/70">
                      {formatDate(
                        selectedCampaign.applicationDeadline
                      )}
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3 border-t border-slate-800 pt-6 sm:flex-row">
                  <button
                    type="button"
                    onClick={
                      backToCampaignDetails
                    }
                    disabled={applicationLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-5 py-3.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft size={17} />
                    Back
                  </button>

                  {!applicationSuccess && (
                    <button
                      type="submit"
                      disabled={applicationLoading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-3.5 font-semibold transition hover:from-violet-500 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {applicationLoading ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Submit Application
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Success Close */}
                {applicationSuccess && (
                  <button
                    type="button"
                    onClick={closeCampaignModal}
                    className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                  >
                    Close
                  </button>
                )}
              </form>
            ) : (
              /* CAMPAIGN DETAILS */
              <div className="space-y-7 p-6">
                {/* About */}
                <section>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-violet-400">
                    About the campaign
                  </h3>

                  <p className="leading-7 text-slate-300">
                    {selectedCampaign.description}
                  </p>
                </section>

                {/* Campaign Details */}
                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-violet-400">
                    Campaign details
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoItem
                      icon={
                        <IndianRupee size={17} />
                      }
                      label="Budget"
                      value={formatBudget(
                        selectedCampaign
                      )}
                    />

                    <InfoItem
                      icon={<Users size={17} />}
                      label="Creators Needed"
                      value={
                        selectedCampaign.creatorsNeeded
                      }
                    />

                    <InfoItem
                      icon={<MapPin size={17} />}
                      label="Location"
                      value={
                        selectedCampaign.location ||
                        "India"
                      }
                    />

                    <InfoItem
                      icon={
                        <Calendar size={17} />
                      }
                      label="Start Date"
                      value={formatDate(
                        selectedCampaign.startDate
                      )}
                    />

                    <InfoItem
                      icon={
                        <Calendar size={17} />
                      }
                      label="End Date"
                      value={formatDate(
                        selectedCampaign.endDate
                      )}
                    />

                    <InfoItem
                      icon={<Clock size={17} />}
                      label="Application Deadline"
                      value={formatDate(
                        selectedCampaign.applicationDeadline
                      )}
                    />
                  </div>
                </section>

                {/* Platforms */}
                <section>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-violet-400">
                    Platforms
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {(
                      selectedCampaign.platforms ||
                      []
                    ).map((item) => (
                      <span
                        key={item}
                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Deliverables */}
                <section>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-violet-400">
                    Deliverables
                  </h3>

                  <p className="whitespace-pre-line leading-7 text-slate-300">
                    {selectedCampaign.deliverables}
                  </p>
                </section>

                {/* Requirements */}
                <section>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-violet-400">
                    Requirements
                  </h3>

                  <p className="whitespace-pre-line leading-7 text-slate-300">
                    {selectedCampaign.requirements}
                  </p>
                </section>

                {/* APPLY */}
                <div className="border-t border-slate-800 pt-6">
                  <button
                    onClick={openApplicationForm}
                    disabled={
                      getDaysLeft(
                        selectedCampaign.applicationDeadline
                      ) <= 0
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-3.5 font-semibold transition hover:from-violet-500 hover:to-violet-400 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500"
                  >
                    {getDaysLeft(
                      selectedCampaign.applicationDeadline
                    ) <= 0 ? (
                      <>
                        <Clock size={18} />
                        Application Deadline Passed
                      </>
                    ) : (
                      <>
                        Apply for Campaign
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <p className="mt-3 text-center text-xs text-slate-500">
                    Submit your profile and proposal directly
                    to the brand.
                  </p>

                  {applicationError && (
                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0 text-red-400"
                      />

                      <p className="text-sm text-red-300">
                        {applicationError}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="font-medium text-white">
        {value}
      </p>
    </div>
  );
}