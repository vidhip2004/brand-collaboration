import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Search,
  Users,
  Sparkles,
  MapPin,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import MatchScore from "../../Components/Common/MatchScore";

const CAMPAIGN_API_URL = "http://localhost:5000/api/campaigns";
const MATCH_API_URL = "http://localhost:5000/api/matches";

export default function FindCreators() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [creators, setCreators] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingCreators, setLoadingCreators] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // ==========================================
  // LOAD BRAND CAMPAIGNS
  // ==========================================
  const loadCampaigns = async () => {
    if (!user?.id || user.role !== "brand") {
      setError("Please login as a brand.");
      setLoadingCampaigns(false);
      return;
    }

    try {
      setLoadingCampaigns(true);
      setError("");

      const response = await axios.get(
        `${CAMPAIGN_API_URL}/brand/${user.id}`
      );

      const data = response.data?.campaigns || [];
      setCampaigns(Array.isArray(data) ? data : []);

      // Automatically select first published campaign
      if (data.length > 0) {
        const published = data.find(
          (campaign) => campaign.status === "published"
        );
        setSelectedCampaign(published?._id || data[0]._id);
      }
    } catch (err) {
      console.error("Load campaigns error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load campaigns."
      );
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // ==========================================
  // LOAD CREATOR MATCHES
  // ==========================================
  const loadCreatorMatches = async (campaignId) => {
    if (!campaignId) {
      setCreators([]);
      return;
    }

    try {
      setLoadingCreators(true);
      setError("");

      const response = await axios.get(
        `${MATCH_API_URL}/campaign/${campaignId}`
      );

      const matches = response.data?.matches || [];
      setCreators(Array.isArray(matches) ? matches : []);
    } catch (err) {
      console.error("Load creator matches error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to calculate creator matches."
      );
      setCreators([]);
    } finally {
      setLoadingCreators(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [user?.id]);

  useEffect(() => {
    if (selectedCampaign) {
      loadCreatorMatches(selectedCampaign);
    }
  }, [selectedCampaign]);

  // ==========================================
  // SEARCH FILTER
  // ==========================================
  const filteredCreators = creators.filter((creator) => {
    const text = search.trim().toLowerCase();
    if (!text) return true;

    return (
      creator.creatorName?.toLowerCase().includes(text) ||
      creator.niche?.toLowerCase().includes(text) ||
      creator.country?.toLowerCase().includes(text) ||
      creator.instagramHandle?.toLowerCase().includes(text)
    );
  });

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
            You need to login as a brand to discover creator talent.
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
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#D7C9B8] bg-[#FAF9F6]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/brand/dashboard")}
              className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC] p-2 text-[#2B241F] hover:bg-[#D7C9B8] transition"
              title="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-[#2B241F]">
                Find Creators
              </h1>
              <p className="text-xs text-[#4A3A2E]/70">
                Smart discovery and AI matchmaking for your campaigns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] font-bold text-[#8B6F5A] text-sm shadow-xs">
              {(user.companyName || user.name || "BR")
                .substring(0, 2)
                .toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-6 py-8 space-y-7">
        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-[#C98B6B]/40 bg-[#C98B6B]/15 p-4 text-sm font-semibold text-[#C98B6B]">
            ⚠️ {error}
          </div>
        )}

        {/* CAMPAIGN SELECTOR */}
        <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles size={17} className="text-[#8B6F5A]" />
                <label className="text-xs font-bold uppercase tracking-wider text-[#4A3A2E]">
                  Target Campaign For Matching
                </label>
              </div>

              {loadingCampaigns ? (
                <div className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 px-4 py-3 text-sm text-[#4A3A2E]/60">
                  Loading brand campaigns...
                </div>
              ) : (
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] px-4 py-3 text-sm font-semibold text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 transition"
                >
                  <option value="">Select a campaign to match creators</option>
                  {campaigns
                    .filter((c) => c.status === "published")
                    .map((campaign) => (
                      <option key={campaign._id} value={campaign._id}>
                        {campaign.title} ({campaign.category})
                      </option>
                    ))}
                </select>
              )}
            </div>

            <button
              onClick={() => loadCreatorMatches(selectedCampaign)}
              disabled={!selectedCampaign || loadingCreators}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] px-6 py-3 font-bold text-sm text-white shadow-xs transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loadingCreators ? "animate-spin" : ""}
              />
              Recalculate Matches
            </button>
          </div>
        </section>

        {/* SEARCH BAR */}
        <section>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A3A2E]/50"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search creator name, niche, country, or Instagram handle..."
              className="w-full rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] py-3.5 pl-11 pr-4 text-sm font-medium text-[#2B241F] outline-none placeholder:text-[#4A3A2E]/40 focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 shadow-xs transition"
            />
          </div>
        </section>

        {/* RESULTS HEADER */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-xl font-black text-[#2B241F]">
              Recommended Creators
            </h2>
            <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
              Creators ranked dynamically by Smart Match compatibility
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#EDE7DC] border border-[#D7C9B8] text-[#4A3A2E]">
            <Users size={15} />
            <span>{filteredCreators.length} creators</span>
          </div>
        </div>

        {/* RESULTS GRID */}
        {loadingCreators ? (
          <div className="py-20 text-center">
            <RefreshCw
              size={32}
              className="mx-auto animate-spin text-[#8B6F5A]"
            />
            <p className="mt-4 text-sm font-semibold text-[#4A3A2E]">
              Calculating AI creator match scores...
            </p>
          </div>
        ) : filteredCreators.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D7C9B8] bg-[#FAF9F6] p-14 text-center">
            <div className="w-14 h-14 mx-auto rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8] flex items-center justify-center mb-4">
              <Users size={28} />
            </div>
            <h3 className="text-base font-bold text-[#2B241F]">
              No matching creators found
            </h3>
            <p className="mt-1 text-xs text-[#4A3A2E]/70 max-w-sm mx-auto leading-relaxed">
              Try selecting another published campaign or adjusting your search keywords.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCreators.map((creator) => (
              <div
                key={creator.creatorId}
                className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs hover:border-[#8B6F5A] transition duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Creator Header */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] text-lg font-black text-[#8B6F5A] shadow-xs">
                      {(creator.creatorName || "CR")
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-[#2B241F] text-base">
                        {creator.creatorName || "Creator"}
                      </h3>

                      {creator.instagramHandle && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-[#8B6F5A] truncate">
                          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                          @{creator.instagramHandle.replace("@", "")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Creator Metadata */}
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {creator.niche && (
                      <span className="px-2.5 py-1 rounded-full bg-[#EDE7DC] border border-[#D7C9B8] text-[#4A3A2E] font-semibold">
                        {creator.niche}
                      </span>
                    )}

                    {creator.country && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EDE7DC] border border-[#D7C9B8] text-[#4A3A2E] font-medium">
                        <MapPin size={12} className="text-[#8B6F5A]" />
                        {creator.country}
                      </span>
                    )}
                  </div>

                  {/* Match Score Component */}
                  <div className="mt-5">
                    <MatchScore
                      score={creator.score || 0}
                      level={creator.level || "Match"}
                      reasons={creator.reasons || []}
                    />
                  </div>
                </div>

                {/* View Action */}
                <button
                  onClick={() => {
                    navigate(`/brand/creator/${creator.creatorId}`);
                  }}
                  className="mt-6 w-full rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/40 hover:bg-[#EDE7DC] hover:border-[#8B6F5A] py-3 text-xs font-bold text-[#2B241F] transition flex items-center justify-center gap-1.5"
                >
                  <span>View Creator Profile</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}