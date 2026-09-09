import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  ArrowLeft,
  Search,
  Users,
  Sparkles,
  MapPin,
  RefreshCw,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import authService from "../../services/authService";

import MatchScore from "../../Components/Common/MatchScore";


const CAMPAIGN_API_URL =
  "http://localhost:5000/api/campaigns";

const MATCH_API_URL =
  "http://localhost:5000/api/matches";


export default function FindCreators() {

  const navigate =
    useNavigate();

  const user =
    authService.getCurrentUser();


  const [
    campaigns,
    setCampaigns,
  ] = useState([]);


  const [
    selectedCampaign,
    setSelectedCampaign,
  ] = useState("");


  const [
    creators,
    setCreators,
  ] = useState([]);


  const [
    loadingCampaigns,
    setLoadingCampaigns,
  ] = useState(true);


  const [
    loadingCreators,
    setLoadingCreators,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    search,
    setSearch,
  ] = useState("");


  // ==========================================
  // LOAD BRAND CAMPAIGNS
  // ==========================================

  const loadCampaigns =
    async () => {

      if (
        !user?.id ||
        user.role !== "brand"
      ) {
        setError(
          "Please login as a brand."
        );

        setLoadingCampaigns(false);

        return;
      }


      try {

        setLoadingCampaigns(true);
        setError("");


        const response =
          await axios.get(
            `${CAMPAIGN_API_URL}/brand/${user.id}`
          );


        const data =
          response.data?.campaigns ||
          [];


        setCampaigns(
          Array.isArray(data)
            ? data
            : []
        );


        // Automatically select first
        // campaign

        if (
          data.length > 0
        ) {

          const published =
            data.find(
              (campaign) =>
                campaign.status ===
                "published"
            );


          setSelectedCampaign(
            published?._id ||
              data[0]._id
          );
        }

      } catch (err) {

        console.error(
          "Load campaigns error:",
          err
        );

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

  const loadCreatorMatches =
    async (campaignId) => {

      if (!campaignId) {
        setCreators([]);
        return;
      }


      try {

        setLoadingCreators(true);
        setError("");


        const response =
          await axios.get(
            `${MATCH_API_URL}/campaign/${campaignId}`
          );


        const matches =
          response.data?.matches ||
          [];


        setCreators(
          Array.isArray(matches)
            ? matches
            : []
        );

      } catch (err) {

        console.error(
          "Load creator matches error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to calculate creator matches."
        );

        setCreators([]);

      } finally {

        setLoadingCreators(false);
      }
    };


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {

    loadCampaigns();

  }, [user?.id]);


  // ==========================================
  // LOAD MATCHES WHEN CAMPAIGN CHANGES
  // ==========================================

  useEffect(() => {

    if (
      selectedCampaign
    ) {

      loadCreatorMatches(
        selectedCampaign
      );

    }

  }, [selectedCampaign]);


  // ==========================================
  // SEARCH
  // ==========================================

  const filteredCreators =
    creators.filter(
      (creator) => {

        const text =
          search
            .trim()
            .toLowerCase();

        if (!text) {
          return true;
        }

        return (
          creator.creatorName
            ?.toLowerCase()
            .includes(text) ||

          creator.niche
            ?.toLowerCase()
            .includes(text) ||

          creator.country
            ?.toLowerCase()
            .includes(text) ||

          creator.instagramHandle
            ?.toLowerCase()
            .includes(text)
        );
      }
    );


  // ==========================================
  // LOGIN CHECK
  // ==========================================

  if (!user) {

    return (
      <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center px-6">

        <div className="text-center">

          <div className="text-5xl mb-5">
            🔒
          </div>

          <h1 className="text-2xl font-bold">
            Please Login
          </h1>

          <p className="mt-2 text-gray-400">
            You need to login as a brand.
          </p>

          <button
            onClick={() =>
              navigate("/login")
            }
            className="mt-6 rounded-xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-700"
          >
            Go to Login
          </button>

        </div>

      </div>
    );
  }


  return (

    <div className="min-h-screen bg-[#070b14] text-white">

      {/* =====================================
          HEADER
      ====================================== */}

      <header className="border-b border-white/10 bg-[#090d18]">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-4">

            <button
              onClick={() =>
                navigate(
                  "/brand/dashboard"
                )
              }
              className="rounded-xl border border-white/10 p-2 text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft size={19} />
            </button>

            <div>

              <h1 className="text-2xl font-bold">
                Find Creators
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Discover creators who best match your campaigns.
              </p>

            </div>

          </div>


          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 font-bold">
            {(user.companyName ||
              user.name ||
              "BR")
              .substring(0, 2)
              .toUpperCase()}
          </div>

        </div>

      </header>


      {/* =====================================
          MAIN
      ====================================== */}

      <main className="mx-auto max-w-7xl px-6 py-8">


        {/* ===================================
            ERROR
        ==================================== */}

        {error && (

          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">

            {error}

          </div>

        )}


        {/* ===================================
            CAMPAIGN SELECTOR
        ==================================== */}

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div className="flex-1">

              <div className="mb-2 flex items-center gap-2">

                <Sparkles
                  size={18}
                  className="text-violet-400"
                />

                <label className="text-sm font-medium text-gray-300">
                  Select Campaign
                </label>

              </div>


              {loadingCampaigns ? (

                <div className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-gray-500">
                  Loading campaigns...
                </div>

              ) : (

                <select
                  value={selectedCampaign}
                  onChange={(e) =>
                    setSelectedCampaign(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-violet-500"
                >

                  <option value="">
                    Select a campaign
                  </option>

                  {campaigns
                    .filter(
                      (campaign) =>
                        campaign.status ===
                        "published"
                    )
                    .map(
                      (campaign) => (

                        <option
                          key={
                            campaign._id
                          }
                          value={
                            campaign._id
                          }
                        >
                          {campaign.title}
                        </option>

                      )
                    )}

                </select>

              )}

            </div>


            <button
              onClick={() =>
                loadCreatorMatches(
                  selectedCampaign
                )
              }
              disabled={
                !selectedCampaign ||
                loadingCreators
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <RefreshCw
                size={17}
                className={
                  loadingCreators
                    ? "animate-spin"
                    : ""
                }
              />

              Recalculate Matches

            </button>

          </div>

        </section>


        {/* ===================================
            SEARCH
        ==================================== */}

        <section className="mt-6">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search creator, niche, country or Instagram..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-white outline-none placeholder:text-gray-600 focus:border-violet-500"
            />

          </div>

        </section>


        {/* ===================================
            TITLE
        ==================================== */}

        <div className="mt-8 flex items-center justify-between">

          <div>

            <h2 className="text-xl font-semibold">
              Recommended Creators
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Creators are ranked according to Smart Match Score.
            </p>

          </div>


          <div className="flex items-center gap-2 text-sm text-gray-500">

            <Users size={17} />

            {filteredCreators.length} creators

          </div>

        </div>


        {/* ===================================
            LOADING
        ==================================== */}

        {loadingCreators ? (

          <div className="py-20 text-center">

            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-violet-400"
            />

            <p className="mt-4 text-sm text-gray-500">
              Finding the best creators...
            </p>

          </div>

        ) : filteredCreators.length === 0 ? (

          <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-12 text-center">

            <Users
              size={40}
              className="mx-auto text-gray-600"
            />

            <h3 className="mt-4 font-semibold">
              No creators found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Try another campaign or search term.
            </p>

          </div>

        ) : (

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {filteredCreators.map(
              (creator) => (

                <div
                  key={
                    creator.creatorId
                  }
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-violet-500/30"
                >

                  {/* CREATOR HEADER */}

                  <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-lg font-bold">

                      {(
                        creator.creatorName ||
                        "CR"
                      )
                        .substring(0, 2)
                        .toUpperCase()}

                    </div>


                    <div className="min-w-0">

                      <h3 className="truncate font-semibold">
                        {creator.creatorName ||
                          "Creator"}
                      </h3>

                      {creator.instagramHandle && (

                        <p className="mt-1 flex items-center gap-1 text-xs text-pink-400">

                          <span className="text-sm font-semibold">
  ◎
</span>

@{creator.instagramHandle.replace("@", "")}

                        </p>

                      )}

                    </div>

                  </div>


                  {/* CREATOR INFO */}

                  <div className="mt-4 space-y-2">

                    {creator.niche && (

                      <div className="text-sm text-gray-400">

                        <span className="text-gray-600">
                          Niche:
                        </span>{" "}

                        {creator.niche}

                      </div>

                    )}


                    {creator.country && (

                      <div className="flex items-center gap-2 text-sm text-gray-400">

                        <MapPin
                          size={14}
                        />

                        {creator.country}

                      </div>

                    )}

                  </div>


                  {/* MATCH SCORE */}

                  <div className="mt-5">

                    <MatchScore
                      score={
                        creator.score ||
                        0
                      }
                      level={
                        creator.level ||
                        "Match"
                      }
                      reasons={
                        creator.reasons ||
                        []
                      }
                    />

                  </div>


                  {/* ACTION */}

                  <button
                    onClick={() => { navigate(`/brand/creator/${creator.creatorId}`);
                      console.log(
                        "Selected creator:",
                        creator
                      );
                    }}
                    className="mt-4 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
                  >
                    View Creator
                  </button>

                </div>

              )
            )}

          </div>

        )}

      </main>

    </div>
  );
}