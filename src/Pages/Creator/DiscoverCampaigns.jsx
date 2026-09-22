import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Calendar,
  Users,
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
  Sparkles,
  Wallet,
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

      let campaignData = campaignsResponse.data?.campaigns || [];

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

          const matches = matchResponse.data?.matches || [];

          const matchMap = new Map(
            matches.map((match) => [String(match.campaignId), match])
          );

          campaignData = campaignData.map((campaign) => {
            const match = matchMap.get(String(campaign._id));

            return {
              ...campaign,
              matchScore: match?.score ?? 0,
              matchLevel: match?.level || "Low Match",
              matchReasons: match?.reasons || [],
            };
          });

          campaignData.sort(
            (a, b) => (b.matchScore || 0) - (a.matchScore || 0)
          );
        } catch (matchErr) {
          console.error("Match score error:", matchErr);

          setMatchError("Smart matching is temporarily unavailable.");

          campaignData = campaignData.map((campaign) => ({
            ...campaign,
            matchScore: 0,
            matchLevel: "Low Match",
            matchReasons: [],
          }));
        } finally {
          setMatchLoading(false);
        }
      }

      setCampaigns(campaignData);
      await loadConvertedBudgets(campaignData);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
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
        campaign.title?.toLowerCase().includes(searchText) ||
        campaign.description?.toLowerCase().includes(searchText) ||
        campaign.brandName?.toLowerCase().includes(searchText) ||
        campaign.category?.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All" || campaign.category === category;

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
  }, [campaigns, search, category, campaignType, platform]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setCampaignType("All");
    setPlatform("All");
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatBudget = (campaign) => {
    if (!campaign?.budget) {
      return "Not specified";
    }

    const converted = convertedBudgets[campaign._id];

    if (converted === undefined) {
      return "Calculating...";
    }

    return formatCurrency(converted, creatorCurrency.code);
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;

    const today = new Date();
    const end = new Date(deadline);
    const difference = end - today;

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
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
    const currentUser = authService.getCurrentUser();

    if (!currentUser) {
      setApplicationError("Please login as a creator before applying.");
      return;
    }

    if (currentUser.role !== "creator") {
      setApplicationError("Only creator accounts can apply for campaigns.");
      return;
    }

    if (!selectedCampaign) {
      return;
    }

    const daysLeft = getDaysLeft(selectedCampaign.applicationDeadline);

    if (daysLeft !== null && daysLeft <= 0) {
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

    const currentUser = authService.getCurrentUser();

    if (!currentUser) {
      setApplicationError("Please login before applying for a campaign.");
      return;
    }

    if (currentUser.role !== "creator") {
      setApplicationError("Only creators can apply for campaigns.");
      return;
    }

    if (!selectedCampaign) {
      setApplicationError("No campaign selected.");
      return;
    }

    if (!applicationForm.message.trim()) {
      setApplicationError("Please write a message to the brand.");
      return;
    }

    if (applicationForm.message.trim().length < 20) {
      setApplicationError(
        "Your application message should be at least 20 characters."
      );
      return;
    }

    if (
      applicationForm.proposedRate !== "" &&
      Number(applicationForm.proposedRate) < 0
    ) {
      setApplicationError("Proposed rate cannot be negative.");
      return;
    }

    const daysLeft = getDaysLeft(selectedCampaign.applicationDeadline);

    if (daysLeft !== null && daysLeft <= 0) {
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
        message: applicationForm.message.trim(),
        portfolioLink: applicationForm.portfolioLink.trim(),
        proposedRate:
          applicationForm.proposedRate === ""
            ? 0
            : Number(applicationForm.proposedRate),
        proposedRateCurrency: creatorCurrency.code,
      };

      const response = await axios.post(
        APPLICATION_API_URL,
        applicationData
      );

      setApplicationSuccess(
        response.data.message || "Application submitted successfully!"
      );

      setApplicationForm({
        message: "",
        portfolioLink: "",
        proposedRate: "",
      });
    } catch (err) {
      console.error("Application submission error:", err);
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
    <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] font-sans">
      {/* HEADER */}
      <div className="border-b border-[#D7C9B8] bg-[#FAF9F6] shadow-2xs">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE7DC] text-[#8B6F5A] text-xs font-bold border border-[#D7C9B8] mb-2">
                <Sparkles size={13} />
                CREATOR MARKETPLACE
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-[#2B241F] md:text-4xl">
                Discover Campaigns
              </h1>

              <p className="mt-2 max-w-2xl text-[#4A3A2E]/70 text-sm">
                Find high-paying brand collaborations tailored to your niche, audience, and creative style.
              </p>
            </div>

            <button
              onClick={fetchCampaigns}
              className="flex w-fit items-center gap-2 rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] px-4 py-2.5 text-xs font-bold text-[#2B241F] shadow-2xs transition hover:border-[#8B6F5A] hover:text-[#8B6F5A] hover:bg-[#EDE7DC]/40"
            >
              <RefreshCw size={14} />
              Refresh Feed
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* SEARCH + FILTERS BAR */}
        <div className="mb-8 rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-5 shadow-xs">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal size={17} className="text-[#8B6F5A]" />
            <h2 className="font-extrabold text-[#2B241F] text-sm">
              Filter & Search Campaigns
            </h2>
          </div>

          <div className="grid gap-3 lg:grid-cols-4">
            <div className="relative lg:col-span-1">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A3A2E]/50"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, brand, keyword..."
                className="w-full rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 py-2.5 pl-10 pr-4 text-xs font-medium text-[#2B241F] outline-none transition placeholder:text-[#4A3A2E]/50 focus:border-[#8B6F5A] focus:bg-[#FAF9F6]"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 px-3.5 py-2.5 text-xs font-medium text-[#2B241F] outline-none transition focus:border-[#8B6F5A] focus:bg-[#FAF9F6]"
            >
              <option value="All">All Categories</option>
              <option value="Fashion">Fashion</option>
              <option value="Beauty">Beauty</option>
              <option value="Food">Food</option>
              <option value="Technology">Technology</option>
              <option value="Fitness">Fitness</option>
              <option value="Travel">Travel</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Gaming">Gaming</option>
              <option value="Education">Education</option>
            </select>

            <select
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
              className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 px-3.5 py-2.5 text-xs font-medium text-[#2B241F] outline-none transition focus:border-[#8B6F5A] focus:bg-[#FAF9F6]"
            >
              <option value="All">All Campaign Types</option>
              <option value="Paid Collaboration">Paid Collaboration</option>
              <option value="Barter Collaboration">Barter Collaboration</option>
              <option value="Affiliate">Affiliate</option>
              <option value="Ambassador">Ambassador</option>
            </select>

            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 px-3.5 py-2.5 text-xs font-medium text-[#2B241F] outline-none transition focus:border-[#8B6F5A] focus:bg-[#FAF9F6]"
            >
              <option value="All">All Platforms</option>
              <option value="Instagram">Instagram</option>
              <option value="YouTube">YouTube</option>
              <option value="TikTok">TikTok</option>
              <option value="Facebook">Facebook</option>
              <option value="LinkedIn">LinkedIn</option>
            </select>
          </div>

          {(search ||
            category !== "All" ||
            campaignType !== "All" ||
            platform !== "All") && (
            <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-[#D7C9B8]/70">
              <span className="text-xs text-[#4A3A2E]/60 font-medium">
                Active filters:
              </span>

              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 rounded-lg bg-[#EDE7DC] px-2.5 py-1 text-xs font-bold text-[#8B6F5A] border border-[#D7C9B8] transition hover:bg-[#D7C9B8]/40"
              >
                Clear all
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* STATUS & FEEDBACK ALERTS */}
        {!loading && !error && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs font-semibold text-[#4A3A2E]/70">
              Showing{" "}
              <span className="font-extrabold text-[#2B241F]">
                {filteredCampaigns.length}
              </span>{" "}
              available campaign{filteredCampaigns.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {!loading && matchError && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs font-semibold text-amber-800">
            {matchError}
          </div>
        )}

        {!loading && matchLoading && (
          <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-[#8B6F5A] bg-[#EDE7DC] p-3 rounded-2xl border border-[#D7C9B8]">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#D7C9B8] border-t-[#8B6F5A]" />
            Calculating smart creator matching scores...
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#D7C9B8] border-t-[#8B6F5A]" />
              <p className="text-xs font-medium text-[#4A3A2E]/70">
                Loading campaigns marketplace...
              </p>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-8 text-center">
            <p className="mb-4 text-sm font-semibold text-red-700">{error}</p>
            <button
              onClick={fetchCampaigns}
              className="rounded-xl bg-[#8B6F5A] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#785D4A] shadow-xs"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filteredCampaigns.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#D7C9B8] bg-[#FAF9F6] p-12 text-center shadow-xs">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
              <Briefcase size={26} />
            </div>

            <h3 className="mb-1 text-base font-extrabold text-[#2B241F]">
              No campaigns found
            </h3>

            <p className="mx-auto mb-5 max-w-sm text-xs text-[#4A3A2E]/70">
              Try adjusting your search query or removing category filters.
            </p>

            <button
              onClick={clearFilters}
              className="rounded-xl bg-[#8B6F5A] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#785D4A] shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* CAMPAIGN CARDS GRID */}
        {!loading && !error && filteredCampaigns.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCampaigns.map((campaign) => {
              const daysLeft = getDaysLeft(campaign.applicationDeadline);

              return (
                <div
                  key={campaign._id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] transition duration-300 hover:-translate-y-1 hover:border-[#8B6F5A] hover:shadow-md shadow-xs"
                >
                  <div>
                    {/* CARD HEADER */}
                    <div className="border-b border-[#D7C9B8]/70 bg-[#EDE7DC]/40 p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF9F6] border border-[#D7C9B8] text-sm font-black text-[#8B6F5A] shadow-2xs">
                          {(campaign.brandName || "B").charAt(0).toUpperCase()}
                        </div>

                        {campaign.campaignType && (
                          <span className="rounded-full border border-[#D7C9B8] bg-[#FAF9F6] px-2.5 py-0.5 text-[11px] font-bold text-[#8B6F5A]">
                            {campaign.campaignType}
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-[#8B6F5A]">
                        {campaign.brandName || "Brand"}
                      </p>

                      <h3 className="line-clamp-2 text-base font-extrabold text-[#2B241F] mt-0.5">
                        {campaign.title}
                      </h3>

                      <div className="mt-3">
                        <MatchScore
                          score={campaign.matchScore || 0}
                          level={campaign.matchLevel || "Match"}
                          reasons={campaign.matchReasons || []}
                          compact
                        />
                      </div>
                    </div>

                    {/* CARD BODY */}
                    <div className="p-5">
                      <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-[#4A3A2E]/80">
                        {campaign.description}
                      </p>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center gap-2.5 text-[#4A3A2E]">
                          <Wallet size={15} className="text-emerald-700" />
                          <span>
                            <span className="font-extrabold text-[#2B241F]">
                              {formatBudget(campaign)}
                            </span>{" "}
                            budget
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 text-[#4A3A2E]">
                          <Users size={15} className="text-[#8B6F5A]" />
                          <span>
                            {campaign.creatorsNeeded} creator
                            {campaign.creatorsNeeded !== 1 ? "s" : ""} needed
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 text-[#4A3A2E]">
                          <MapPin size={15} className="text-[#8B6F5A]" />
                          <span>{campaign.location || "India"}</span>
                        </div>

                        <div className="flex items-center gap-2.5 text-[#4A3A2E]">
                          <Calendar size={15} className="text-amber-700" />
                          <span>Starts {formatDate(campaign.startDate)}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {(campaign.platforms || []).map((item) => (
                          <span
                            key={item}
                            className="rounded-lg border border-[#D7C9B8] bg-[#EDE7DC]/30 px-2 py-0.5 text-[11px] font-semibold text-[#4A3A2E]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CARD FOOTER */}
                  <div className="p-5 pt-0">
                    <div className="flex items-center justify-between border-t border-[#D7C9B8]/70 pt-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <Clock size={14} className="text-[#4A3A2E]/50" />
                        {daysLeft !== null && daysLeft > 0 ? (
                          <span className="text-amber-800 font-bold">{daysLeft} days left</span>
                        ) : (
                          <span className="text-red-600 font-bold">Deadline passed</span>
                        )}
                      </div>

                      <button
                        onClick={() => openCampaignDetails(campaign)}
                        className="flex items-center gap-1.5 rounded-xl bg-[#8B6F5A] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#785D4A]"
                      >
                        View Details
                        <ArrowRight size={13} />
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B241F]/40 p-4 backdrop-blur-xs"
          onClick={closeCampaignModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="border-b border-[#D7C9B8]/70 bg-[#EDE7DC]/40 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {showApplicationForm && (
                    <button
                      onClick={backToCampaignDetails}
                      disabled={applicationLoading}
                      className="mt-1 rounded-xl p-2 text-[#4A3A2E] transition hover:bg-[#FAF9F6] hover:text-[#2B241F] disabled:opacity-50"
                    >
                      <ChevronLeft size={19} />
                    </button>
                  )}

                  <div>
                    <p className="text-xs font-bold text-[#8B6F5A]">
                      {selectedCampaign.brandName}
                    </p>

                    <h2 className="text-xl font-extrabold text-[#2B241F] mt-0.5">
                      {showApplicationForm
                        ? "Apply for Campaign"
                        : selectedCampaign.title}
                    </h2>

                    {!showApplicationForm && (
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8] px-2.5 py-0.5 text-xs font-bold">
                          {selectedCampaign.category}
                        </span>

                        <span className="rounded-full bg-[#EDE7DC] text-[#A78B7F] border border-[#D7C9B8] px-2.5 py-0.5 text-xs font-bold">
                          {selectedCampaign.campaignType}
                        </span>
                      </div>
                    )}

                    {showApplicationForm && (
                      <p className="mt-1 text-xs text-[#4A3A2E]/70">
                        Applying for:{" "}
                        <span className="font-bold text-[#2B241F]">
                          {selectedCampaign.title}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={closeCampaignModal}
                  disabled={applicationLoading}
                  className="rounded-xl p-2 text-[#4A3A2E]/70 transition hover:bg-[#FAF9F6] hover:text-[#2B241F] disabled:opacity-50"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            {/* APPLICATION FORM */}
            {showApplicationForm ? (
              <form onSubmit={handleApplicationSubmit} className="space-y-5 p-6">
                {/* Campaign Summary */}
                <div className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#4A3A2E]/60">
                        Campaign
                      </p>
                      <p className="mt-0.5 font-bold text-[#2B241F] text-sm">
                        {selectedCampaign.title}
                      </p>
                      <p className="text-xs font-semibold text-[#8B6F5A]">
                        {selectedCampaign.brandName}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#4A3A2E]/60">
                        Budget
                      </p>
                      <p className="mt-0.5 font-black text-emerald-700 text-base">
                        {formatBudget(selectedCampaign)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                {applicationSuccess && (
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4">
                    <CheckCircle size={19} className="mt-0.5 shrink-0 text-emerald-700" />
                    <div>
                      <p className="font-bold text-emerald-900 text-sm">
                        Application Submitted
                      </p>
                      <p className="mt-0.5 text-xs text-emerald-800">
                        {applicationSuccess}
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {applicationError && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                    <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-600" />
                    <p className="text-xs font-semibold text-red-700">{applicationError}</p>
                  </div>
                )}

                {/* Application Message */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#2B241F]">
                    Message / Pitch to Brand <span className="text-[#C98B6B]">*</span>
                  </label>

                  <textarea
                    name="message"
                    value={applicationForm.message}
                    onChange={handleApplicationChange}
                    rows={5}
                    placeholder="Describe your content ideas, relevant past work, and why you are the ideal creator for this brand campaign..."
                    disabled={applicationLoading || !!applicationSuccess}
                    className="w-full resize-none rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 p-3.5 text-xs leading-relaxed text-[#2B241F] outline-none transition placeholder:text-[#4A3A2E]/50 focus:border-[#8B6F5A] focus:bg-[#FAF9F6] disabled:opacity-60"
                  />

                  <div className="mt-1.5 flex justify-between text-[11px] text-[#4A3A2E]/60">
                    <span>Minimum 20 characters</span>
                    <span>{applicationForm.message.length} characters</span>
                  </div>
                </div>

                {/* Portfolio Link */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#2B241F]">
                    Portfolio Link <span className="text-[#4A3A2E]/60 font-normal">(Optional)</span>
                  </label>

                  <div className="relative">
                    <LinkIcon
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A3A2E]/50"
                    />
                    <input
                      type="url"
                      name="portfolioLink"
                      value={applicationForm.portfolioLink}
                      onChange={handleApplicationChange}
                      placeholder="https://instagram.com/yourhandle or portfolio URL"
                      disabled={applicationLoading || !!applicationSuccess}
                      className="w-full rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 py-2.5 pl-10 pr-4 text-xs text-[#2B241F] outline-none transition placeholder:text-[#4A3A2E]/50 focus:border-[#8B6F5A] focus:bg-[#FAF9F6] disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Proposed Rate */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#2B241F]">
                    Proposed Rate{" "}
                    <span className="ml-1 px-1.5 py-0.5 rounded-md bg-[#EDE7DC] text-[#8B6F5A] font-bold text-[10px] border border-[#D7C9B8]">
                      {creatorCurrency.code}
                    </span>{" "}
                    <span className="text-[#4A3A2E]/60 font-normal">(Optional)</span>
                  </label>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A3A2E]/50 text-xs font-bold select-none">
                      {creatorCurrency.symbol}
                    </span>
                    <input
                      type="number"
                      name="proposedRate"
                      value={applicationForm.proposedRate}
                      onChange={handleApplicationChange}
                      placeholder="Enter your expected rate"
                      min="0"
                      disabled={applicationLoading || !!applicationSuccess}
                      className="w-full rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 py-2.5 pl-10 pr-4 text-xs text-[#2B241F] outline-none transition placeholder:text-[#4A3A2E]/50 focus:border-[#8B6F5A] focus:bg-[#FAF9F6] disabled:opacity-60"
                    />
                  </div>

                  <p className="mt-1 text-[11px] text-[#4A3A2E]/60">
                    Campaign budget:{" "}
                    <span className="text-[#2B241F] font-semibold">
                      {formatBudget(selectedCampaign)}
                    </span>
                    {" — "}your rate in {creatorCurrency.code} will be shown to the brand in their currency.
                  </p>
                </div>

                {/* Deadline reminder */}
                <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                  <Clock size={17} className="shrink-0 text-amber-700" />
                  <div>
                    <p className="text-xs font-bold text-amber-800">
                      Application Deadline
                    </p>
                    <p className="text-[11px] text-amber-700">
                      {formatDate(selectedCampaign.applicationDeadline)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 border-t border-[#D7C9B8]/70 pt-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={backToCampaignDetails}
                    disabled={applicationLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] px-5 py-2.5 text-xs font-bold text-[#2B241F] transition hover:bg-[#EDE7DC] disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>

                  {!applicationSuccess && (
                    <button
                      type="submit"
                      disabled={applicationLoading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] px-5 py-2.5 text-xs font-bold text-white transition shadow-xs disabled:opacity-60"
                    >
                      {applicationLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          Submit Application
                        </>
                      )}
                    </button>
                  )}
                </div>

                {applicationSuccess && (
                  <button
                    type="button"
                    onClick={closeCampaignModal}
                    className="w-full rounded-xl border border-emerald-300 bg-emerald-100 px-5 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-200"
                  >
                    Done
                  </button>
                )}
              </form>
            ) : (
              /* CAMPAIGN DETAILS VIEW */
              <div className="space-y-6 p-6">
                {/* About Section */}
                <section>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8B6F5A]">
                    About the campaign
                  </h3>
                  <p className="text-xs leading-relaxed text-[#4A3A2E]">
                    {selectedCampaign.description}
                  </p>
                </section>

                {/* Campaign Key Details */}
                <section>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#8B6F5A]">
                    Campaign details
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoItem
                      icon={<Wallet size={16} />}
                      label="Budget"
                      value={formatBudget(selectedCampaign)}
                      accent="emerald"
                    />

                    <InfoItem
                      icon={<Users size={16} />}
                      label="Creators Needed"
                      value={selectedCampaign.creatorsNeeded}
                      accent="mocha"
                    />

                    <InfoItem
                      icon={<MapPin size={16} />}
                      label="Location"
                      value={selectedCampaign.location || "India"}
                      accent="latte"
                    />

                    <InfoItem
                      icon={<Calendar size={16} />}
                      label="Start Date"
                      value={formatDate(selectedCampaign.startDate)}
                      accent="amber"
                    />

                    <InfoItem
                      icon={<Calendar size={16} />}
                      label="End Date"
                      value={formatDate(selectedCampaign.endDate)}
                      accent="amber"
                    />

                    <InfoItem
                      icon={<Clock size={16} />}
                      label="Application Deadline"
                      value={formatDate(selectedCampaign.applicationDeadline)}
                      accent="terracotta"
                    />
                  </div>
                </section>

                {/* Target Platforms */}
                <section>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8B6F5A]">
                    Target Platforms
                  </h3>

                  <div className="flex flex-wrap gap-1.5">
                    {(selectedCampaign.platforms || []).map((item) => (
                      <span
                        key={item}
                        className="rounded-lg border border-[#D7C9B8] bg-[#EDE7DC]/30 px-3 py-1 text-xs font-bold text-[#2B241F]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Deliverables */}
                <section>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8B6F5A]">
                    Deliverables
                  </h3>
                  <p className="whitespace-pre-line text-xs leading-relaxed text-[#4A3A2E] bg-[#EDE7DC]/30 p-3.5 rounded-xl border border-[#D7C9B8]">
                    {selectedCampaign.deliverables}
                  </p>
                </section>

                {/* Requirements */}
                <section>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8B6F5A]">
                    Requirements
                  </h3>
                  <p className="whitespace-pre-line text-xs leading-relaxed text-[#4A3A2E] bg-[#EDE7DC]/30 p-3.5 rounded-xl border border-[#D7C9B8]">
                    {selectedCampaign.requirements}
                  </p>
                </section>

                {/* Apply CTA Section */}
                <div className="border-t border-[#D7C9B8]/70 pt-5">
                  <button
                    onClick={openApplicationForm}
                    disabled={
                      getDaysLeft(selectedCampaign.applicationDeadline) <= 0
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] px-5 py-3 text-xs font-bold text-white transition shadow-xs disabled:opacity-50"
                  >
                    {getDaysLeft(selectedCampaign.applicationDeadline) <= 0 ? (
                      <>
                        <Clock size={16} />
                        Application Deadline Passed
                      </>
                    ) : (
                      <>
                        Apply for Campaign
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>

                  <p className="mt-2 text-center text-[11px] text-[#4A3A2E]/60">
                    Submit your pitch directly to {selectedCampaign.brandName}.
                  </p>

                  {applicationError && (
                    <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                      <AlertCircle size={16} className="shrink-0 text-red-600" />
                      <p>{applicationError}</p>
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

function InfoItem({ icon, label, value, accent = "mocha" }) {
  const accentMap = {
    mocha: "text-[#8B6F5A] bg-[#EDE7DC] border-[#D7C9B8]",
    latte: "text-[#A78B7F] bg-[#EDE7DC] border-[#D7C9B8]",
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    terracotta: "text-[#C98B6B] bg-red-50 border-red-200",
  };

  return (
    <div className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 p-3.5 flex items-center gap-3">
      <div className={`p-2 rounded-xl border shrink-0 ${accentMap[accent] || accentMap.mocha}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-[#4A3A2E]/60 font-semibold">{label}</p>
        <p className="text-xs font-extrabold text-[#2B241F] mt-0.5">{value}</p>
      </div>
    </div>
  );
}