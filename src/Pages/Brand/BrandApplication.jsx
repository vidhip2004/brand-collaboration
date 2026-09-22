import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MessageCircle,
  Search,
  X,
  XCircle,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import {
  getCurrencyFromCountry,
  formatCurrency,
  convertCurrency,
} from "../../services/currency";

const API_URL = "http://localhost:5000/api/applications";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase() || "CR";

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

export default function BrandApplications() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  // Brand's own currency — based on their country profile
  const brandCurrency = getCurrencyFromCountry(user?.country);

  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Map of applicationId → proposed rate converted to brand's currency
  const [convertedRates, setConvertedRates] = useState({});

  // ==========================================
  // LOAD BRAND APPLICATIONS
  // ==========================================
  const loadApplications = async () => {
    if (!user?.id || user.role !== "brand") {
      setError("Please log in as a brand to view creator applications.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/brand/${user.id}`
      );

      const apps = response.data?.applications || [];
      setApplications(apps);

      // Convert each creator's proposed rate to brand's currency
      convertProposedRates(apps);
    } catch (err) {
      console.error("Brand applications error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load creator applications."
      );
    } finally {
      setLoading(false);
    }
  };

  // Convert all creator proposed rates to brand's currency
  const convertProposedRates = async (apps) => {
    const results = {};

    for (const app of apps) {
      if (!app.proposedRate || app.proposedRate <= 0) {
        results[app._id] = 0;
        continue;
      }

      const fromCurrency = app.proposedRateCurrency || "INR";

      if (fromCurrency === brandCurrency.code) {
        results[app._id] = app.proposedRate;
        continue;
      }

      try {
        const converted = await convertCurrency(
          app.proposedRate,
          fromCurrency,
          brandCurrency.code
        );
        results[app._id] = converted;
      } catch {
        // Fallback to raw value if conversion fails
        results[app._id] = app.proposedRate;
      }
    }

    setConvertedRates(results);
  };

  useEffect(() => {
    loadApplications();
  }, [user?.id, user?.role]);

  // ==========================================
  // FILTER APPLICATIONS
  // ==========================================
  const filteredApplications = useMemo(() => {
    const term = search.trim().toLowerCase();

    return applications.filter((app) => {
      const creator =
        app.creatorName ||
        app.creatorId?.name ||
        "";

      const campaign =
        app.campaignId?.title ||
        "";

      const email =
        app.creatorEmail ||
        app.creatorId?.email ||
        "";

      const matchesSearch =
        !term ||
        creator.toLowerCase().includes(term) ||
        campaign.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ||
        app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  // ==========================================
  // APPLICATION COUNTS
  // ==========================================
  const counts = {
    all: applications.length,
    pending: applications.filter((x) => x.status === "pending").length,
    accepted: applications.filter((x) => x.status === "accepted").length,
    rejected: applications.filter((x) => x.status === "rejected").length,
  };

  // ==========================================
  // ACCEPT / REJECT APPLICATION
  // ==========================================
  const updateStatus = async (applicationId, status) => {
    if (!user?.id) return;

    try {
      setActionLoading(true);

      const response = await axios.put(
        `${API_URL}/${applicationId}/status`,
        {
          status,
          brandId: user.id,
        }
      );

      const updated = response.data?.application;

      if (updated) {
        setApplications((prev) =>
          prev.map((item) =>
            item._id === applicationId ? updated : item
          )
        );

        setSelected(updated);
      }
    } catch (err) {
      console.error("Update application status error:", err);
      alert(
        err.response?.data?.message ||
          "Unable to update application status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // OPEN COLLABORATION WORKSPACE
  // ==========================================
  const openWorkspace = (application) => {
    const campaignId =
      application.campaignId?._id ||
      application.campaignId;

    navigate(
      `/collaboration-workspace?campaignId=${campaignId}&applicationId=${application._id}`
    );
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
            You need to be logged in to view creator applications.
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
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/brand/dashboard")}
              className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC] p-2.5 text-[#2B241F] hover:bg-[#D7C9B8] transition shadow-xs"
              title="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-[#2B241F]">
                Creator Applications
              </h1>
              <p className="text-xs text-[#4A3A2E]/70">
                Review pitches and recruit creators for your brand
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] font-bold text-[#8B6F5A] text-sm shadow-xs">
              {getInitials(user?.companyName || user?.name || "Brand")}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8 space-y-7">
        {/* STAT TABS */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            ["all", "Total Applications", FileText],
            ["pending", "Pending Review", Clock],
            ["accepted", "Accepted Partners", CheckCircle2],
            ["rejected", "Declined", XCircle],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setStatusFilter(id)}
              className={`rounded-2xl border p-5 text-left transition duration-200 ${
                statusFilter === id
                  ? "border-[#8B6F5A] bg-[#EDE7DC] shadow-xs"
                  : "border-[#D7C9B8] bg-[#FAF9F6] hover:bg-[#EDE7DC]/50 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A3A2E]/70 uppercase tracking-wider">
                  {label}
                </span>
                <Icon
                  size={19}
                  className={
                    statusFilter === id ? "text-[#8B6F5A]" : "text-[#4A3A2E]/50"
                  }
                />
              </div>

              <p className="mt-3 text-3xl font-black text-[#2B241F]">
                {counts[id]}
              </p>
            </button>
          ))}
        </div>

        {/* SEARCH + FILTER CONTROLS */}
        <div className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-5 shadow-xs">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A3A2E]/50"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by creator name, email, or campaign title..."
                className="w-full rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] py-3 pl-11 pr-4 text-sm font-medium text-[#2B241F] outline-none placeholder:text-[#4A3A2E]/40 focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 transition"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] px-4 py-3 text-sm font-semibold text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 transition"
            >
              <option value="all">All Application Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* APPLICATION LIST */}
        {loading ? (
          <div className="py-20 text-center text-sm font-semibold text-[#4A3A2E]/70">
            Loading creator applications...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#C98B6B]/40 bg-[#C98B6B]/15 p-8 text-center text-sm font-semibold text-[#C98B6B]">
            {error}
            <button
              onClick={loadApplications}
              className="ml-3 px-3 py-1.5 rounded-lg bg-[#C98B6B]/20 hover:bg-[#C98B6B]/30 font-bold"
            >
              Retry
            </button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D7C9B8] bg-[#FAF9F6] p-14 text-center">
            <div className="w-14 h-14 mx-auto rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8] flex items-center justify-center mb-4">
              <MessageCircle size={28} />
            </div>
            <p className="text-base font-bold text-[#2B241F]">
              No creator applications found
            </p>
            <p className="text-xs text-[#4A3A2E]/70 mt-1">
              Applications from creators will appear here once submitted.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const creator =
                app.creatorName ||
                app.creatorId?.name ||
                "Creator";

              const creatorEmail =
                app.creatorEmail ||
                app.creatorId?.email ||
                "";

              const campaign = app.campaignId || {};

              return (
                <div
                  key={app._id}
                  className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs hover:border-[#8B6F5A] transition duration-200"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    {/* Creator Info */}
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] font-bold text-[#8B6F5A] text-base shadow-xs">
                        {getInitials(creator)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate text-base font-bold text-[#2B241F]">
                            {creator}
                          </h2>
                          {app.proposedRate > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EDE7DC] text-[#4A3A2E] border border-[#D7C9B8]">
                              Proposed: {
                                convertedRates[app._id] !== undefined
                                  ? formatCurrency(convertedRates[app._id], brandCurrency.code)
                                  : "Converting..."
                              }
                              {app.proposedRateCurrency && app.proposedRateCurrency !== brandCurrency.code && (
                                <span className="ml-1 text-[#8B6F5A] font-normal text-[10px]">
                                  (from {app.proposedRateCurrency})
                                </span>
                              )}
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 truncate text-xs font-semibold text-[#8B6F5A]">
                          {creatorEmail}
                        </p>

                        <p className="mt-1.5 text-xs text-[#4A3A2E]/70">
                          Applied for{" "}
                          <span className="font-bold text-[#2B241F]">
                            {campaign.title || "Campaign"}
                          </span>{" "}
                          • {formatDate(app.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Status pill */}
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                          app.status === "accepted"
                            ? "border-[#D7C9B8] bg-[#EDE7DC] text-[#2B241F]"
                            : app.status === "rejected"
                            ? "border-[#C98B6B]/40 bg-[#C98B6B]/15 text-[#C98B6B]"
                            : "border-[#D7C9B8] bg-[#EDE7DC] text-[#4A3A2E]"
                        }`}
                      >
                        {app.status}
                      </span>

                      {/* View Details Modal Button */}
                      <button
                        onClick={() => setSelected(app)}
                        className="flex items-center gap-1.5 rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/50 hover:bg-[#EDE7DC] px-3.5 py-2 text-xs font-bold text-[#2B241F] transition"
                      >
                        <Eye size={15} />
                        View Pitch
                      </button>

                      {/* Pending Action Buttons */}
                      {app.status === "pending" && (
                        <>
                          <button
                            disabled={actionLoading}
                            onClick={() => updateStatus(app._id, "rejected")}
                            className="rounded-xl border border-[#C98B6B]/40 bg-[#C98B6B]/15 px-3.5 py-2 text-xs font-bold text-[#C98B6B] hover:bg-[#C98B6B]/25 disabled:opacity-50 transition"
                            title="Decline application"
                          >
                            <X size={15} />
                          </button>

                          <button
                            disabled={actionLoading}
                            onClick={() => updateStatus(app._id, "accepted")}
                            className="flex items-center gap-1.5 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] px-4 py-2 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition"
                          >
                            <Check size={15} />
                            Accept Creator
                          </button>
                        </>
                      )}

                      {/* Open Workspace Button */}
                      {app.status === "accepted" && (
                        <button
                          onClick={() => openWorkspace(app)}
                          className="flex items-center gap-1.5 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] px-4 py-2 text-xs font-bold text-white shadow-xs transition"
                        >
                          <span>Open Workspace</span>
                          <ArrowUpRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* APPLICATION DETAILS MODAL */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B241F]/40 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 sm:p-8 shadow-xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#8B6F5A]">
                  Creator Application Details
                </p>

                <h2 className="mt-1 text-2xl font-black text-[#2B241F]">
                  {selected.creatorName ||
                    selected.creatorId?.name ||
                    "Creator"}
                </h2>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-xl p-2 text-[#4A3A2E]/60 hover:bg-[#EDE7DC] hover:text-[#2B241F] transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoBox
                label="Campaign"
                value={selected.campaignId?.title || "-"}
              />

              <InfoBox
                label="Email"
                value={
                  selected.creatorEmail ||
                  selected.creatorId?.email ||
                  "-"
                }
              />

              <InfoBox
                label="Portfolio Link"
                value={selected.portfolioLink || "Not provided"}
                isLink={Boolean(selected.portfolioLink)}
              />

              <InfoBox
                label={`Proposed Rate (${brandCurrency.code})`}
                value={
                  selected.proposedRate > 0
                    ? (() => {
                        const converted = convertedRates[selected._id];
                        const fromCurrency = selected.proposedRateCurrency || "INR";
                        const baseText = converted !== undefined
                          ? formatCurrency(converted, brandCurrency.code)
                          : "Converting...";
                        return fromCurrency !== brandCurrency.code
                          ? `${baseText} (from ${formatCurrency(selected.proposedRate, fromCurrency)})`
                          : baseText;
                      })()
                    : "Standard Campaign Budget"
                }
              />

              <InfoBox
                label="Applied On"
                value={formatDate(selected.createdAt)}
              />

              <InfoBox
                label="Application Status"
                value={selected.status}
                isCapitalized
              />
            </div>

            {/* Creator Message */}
            <div className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A3A2E]">
                Creator Pitch / Message
              </h3>

              <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-[#2B241F] font-medium">
                {selected.message || "No message provided."}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap justify-end gap-3 pt-2">
              {selected.status === "pending" && (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={() => updateStatus(selected._id, "rejected")}
                    className="rounded-xl border border-[#C98B6B]/40 bg-[#C98B6B]/15 px-5 py-2.5 text-xs font-bold text-[#C98B6B] hover:bg-[#C98B6B]/25 disabled:opacity-50 transition"
                  >
                    Reject Application
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() => updateStatus(selected._id, "accepted")}
                    className="rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] px-6 py-2.5 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition"
                  >
                    Accept Creator & Start Collab
                  </button>
                </>
              )}

              {selected.status === "accepted" && (
                <button
                  onClick={() => openWorkspace(selected)}
                  className="rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition"
                >
                  Open Collaboration Workspace
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value, isLink, isCapitalized }) {
  return (
    <div className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#4A3A2E]/70">
        {label}
      </p>

      {isLink && value !== "Not provided" ? (
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block truncate text-sm font-bold text-[#8B6F5A] hover:underline"
        >
          {value}
        </a>
      ) : (
        <p
          className={`mt-1 break-words text-sm font-bold text-[#2B241F] ${
            isCapitalized ? "capitalize" : ""
          }`}
        >
          {value}
        </p>
      )}
    </div>
  );
}