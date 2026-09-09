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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";

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

  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

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

      setApplications(response.data?.applications || []);
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

    pending: applications.filter(
      (x) => x.status === "pending"
    ).length,

    accepted: applications.filter(
      (x) => x.status === "accepted"
    ).length,

    rejected: applications.filter(
      (x) => x.status === "rejected"
    ).length,
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
            item._id === applicationId
              ? updated
              : item
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

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-[#070711] text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090914]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 lg:px-8">

          <div className="flex items-center gap-4">

            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <div className="text-xl font-bold">
                Brand
                <span className="text-violet-400">
                  Verse
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Creator Applications
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <Bell
              size={19}
              className="text-slate-400"
            />

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-bold">
              {getInitials(
                user?.companyName ||
                  user?.name ||
                  "Brand"
              )}
            </div>

          </div>

        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-[1500px] px-6 py-8 lg:px-8">

        {/* PAGE TITLE */}
        <div className="mb-7">
          <h1 className="text-3xl font-bold">
            Creator Applications
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review creators who applied to your campaigns
            and choose who to collaborate with.
          </p>
        </div>

        {/* STAT CARDS */}
        <div className="grid gap-4 sm:grid-cols-4">

          {[
            [
              "all",
              "Total Applications",
              FileText,
            ],
            [
              "pending",
              "Pending",
              Clock,
            ],
            [
              "accepted",
              "Accepted",
              CheckCircle2,
            ],
            [
              "rejected",
              "Rejected",
              XCircle,
            ],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setStatusFilter(id)}
              className={`rounded-2xl border p-5 text-left transition ${
                statusFilter === id
                  ? "border-violet-500/40 bg-violet-500/10"
                  : "border-white/10 bg-white/[0.025] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-400">
                  {label}
                </span>

                <Icon
                  size={19}
                  className="text-violet-400"
                />

              </div>

              <p className="mt-3 text-2xl font-bold">
                {counts[id]}
              </p>
            </button>
          ))}

        </div>

        {/* SEARCH + FILTER */}
        <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.025] p-5">

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div className="relative flex-1">

              <Search
                size={17}
                className="absolute left-4 top-3.5 text-slate-600"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search creator, email or campaign..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm outline-none placeholder:text-slate-600 focus:border-violet-500/50"
              />

            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-xl border border-white/10 bg-[#11111d] px-4 py-3 text-sm text-slate-300 outline-none"
            >
              <option value="all">
                All Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="accepted">
                Accepted
              </option>

              <option value="rejected">
                Rejected
              </option>
            </select>

          </div>

        </div>

        {/* APPLICATION LIST */}
        {loading ? (

          <div className="py-20 text-center text-sm text-slate-500">
            Loading applications...
          </div>

        ) : error ? (

          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-8 text-center text-sm text-red-300">

            {error}

            <button
              onClick={loadApplications}
              className="ml-3 rounded-lg bg-red-500/10 px-3 py-2"
            >
              Retry
            </button>

          </div>

        ) : filteredApplications.length === 0 ? (

          <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-12 text-center">

            <UsersIcon />

            <p className="mt-4 text-sm text-slate-400">
              No creator applications found.
            </p>

          </div>

        ) : (

          <div className="mt-6 space-y-4">

            {filteredApplications.map((app) => {

              const creator =
                app.creatorName ||
                app.creatorId?.name ||
                "Creator";

              const creatorEmail =
                app.creatorEmail ||
                app.creatorId?.email ||
                "";

              const campaign =
                app.campaignId || {};

              return (
                <div
                  key={app._id}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-violet-500/30"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* CREATOR INFO */}
                    <div className="flex min-w-0 items-center gap-4">

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 font-bold">
                        {getInitials(creator)}
                      </div>

                      <div className="min-w-0">

                        <h2 className="truncate text-base font-semibold">
                          {creator}
                        </h2>

                        <p className="mt-1 truncate text-xs text-violet-400">
                          {creatorEmail}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          Applied for{" "}
                          <span className="text-slate-300">
                            {campaign.title ||
                              "Campaign"}
                          </span>{" "}
                          · {formatDate(app.createdAt)}
                        </p>

                      </div>

                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-wrap items-center gap-2">

                      {/* STATUS */}
                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                          app.status === "accepted"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : app.status === "rejected"
                            ? "border-red-500/20 bg-red-500/10 text-red-400"
                            : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {app.status}
                      </span>

                      {/* VIEW */}
                      <button
                        onClick={() =>
                          setSelected(app)
                        }
                        className="flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2.5 text-sm text-slate-300 hover:bg-white/5"
                      >
                        <Eye size={16} />
                        View
                      </button>

                      {/* PENDING ACTIONS */}
                      {app.status === "pending" && (
                        <>
                          <button
                            disabled={actionLoading}
                            onClick={() =>
                              updateStatus(
                                app._id,
                                "rejected"
                              )
                            }
                            className="rounded-xl border border-red-500/20 px-3.5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                          >
                            <X size={16} />
                          </button>

                          <button
                            disabled={actionLoading}
                            onClick={() =>
                              updateStatus(
                                app._id,
                                "accepted"
                              )
                            }
                            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold hover:bg-violet-500 disabled:opacity-50"
                          >
                            <Check size={16} />
                            Accept
                          </button>
                        </>
                      )}

                      {/* WORKSPACE */}
                      {app.status === "accepted" && (
                        <button
                          onClick={() =>
                            openWorkspace(app)
                          }
                          className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold hover:bg-cyan-500"
                        >
                          Open Workspace
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#11111d] p-6 shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs uppercase tracking-wider text-violet-400">
                  Application Details
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {selected.creatorName ||
                    selected.creatorId?.name ||
                    "Creator"}
                </h2>

              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"
              >
                <X size={19} />
              </button>

            </div>

            {/* DETAILS */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <Info
                label="Campaign"
                value={
                  selected.campaignId?.title ||
                  "-"
                }
              />

              <Info
                label="Email"
                value={
                  selected.creatorEmail ||
                  selected.creatorId?.email ||
                  "-"
                }
              />

              <Info
                label="Portfolio"
                value={
                  selected.portfolioLink ||
                  "Not provided"
                }
              />

              <Info
                label="Proposed Rate"
                value={
                  selected.proposedRate
                    ? `₹${Number(
                        selected.proposedRate
                      ).toLocaleString("en-IN")}`
                    : "Not specified"
                }
              />

              <Info
                label="Applied On"
                value={formatDate(
                  selected.createdAt
                )}
              />

              <Info
                label="Status"
                value={selected.status}
              />

            </div>

            {/* MESSAGE */}
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">

              <h3 className="font-semibold">
                Creator Message
              </h3>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-400">
                {selected.message ||
                  "No message provided."}
              </p>

            </div>

            {/* MODAL ACTIONS */}
            <div className="mt-6 flex flex-wrap justify-end gap-3">

              {selected.status === "pending" && (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={() =>
                      updateStatus(
                        selected._id,
                        "rejected"
                      )
                    }
                    className="rounded-xl border border-red-500/20 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    Reject
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() =>
                      updateStatus(
                        selected._id,
                        "accepted"
                      )
                    }
                    className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold hover:bg-violet-500 disabled:opacity-50"
                  >
                    Accept Creator
                  </button>
                </>
              )}

              {selected.status === "accepted" && (
                <button
                  onClick={() =>
                    openWorkspace(selected)
                  }
                  className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold hover:bg-cyan-500"
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


// ==========================================
// INFO COMPONENT
// ==========================================

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-200">
        {value}
      </p>

    </div>
  );
}


// ==========================================
// EMPTY STATE ICON
// ==========================================

function UsersIcon() {
  return (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
      <MessageCircle size={22} />
    </div>
  );
}