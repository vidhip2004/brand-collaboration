import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Wallet,
  DollarSign,
  CheckCircle2,
  Clock,
  Search,
  Eye,
  X,
  Building2,
  TrendingUp,
  Receipt,
  Sparkles,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import authService from "../../services/authService";
import paymentService from "../../services/paymentService";
import {
  getCurrencyFromCountry,
  formatCurrency,
} from "../../services/currency";

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
    : "—";

const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export default function CreatorEarnings() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const creatorCurrency = getCurrencyFromCountry(user?.country);

  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    paidEarnings: 0,
    pendingEarnings: 0,
    readyEarnings: 0,
    completedCollaborations: 0,
    totalCollaborations: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Receipt / Detail Modal State
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Load Creator Earnings & Payments
  const loadEarningsData = async () => {
    if (!user?.id || user.role !== "creator") {
      setError("Please log in as a creator to view earnings.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await paymentService.getCreatorPayments(user.id);
      setPayments(data.payments || []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Creator earnings loading error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load earnings data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarningsData();
  }, [user?.id, user?.role]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return payments.filter((p) => {
      const brandName = p.brandId?.companyName || p.brandId?.name || "";
      const campaignTitle = p.campaignId?.title || "";
      const txnId = p.transactionId || "";

      const matchesSearch =
        !term ||
        brandName.toLowerCase().includes(term) ||
        campaignTitle.toLowerCase().includes(term) ||
        txnId.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  // Counts for status tabs
  const tabCounts = {
    all: payments.length,
    paid: payments.filter((p) => p.status === "paid").length,
    ready: payments.filter((p) => p.status === "ready").length,
    pending: payments.filter((p) => p.status === "pending").length,
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] flex items-center justify-center px-6 font-sans">
        <div className="text-center bg-[#FAF9F6] p-8 rounded-2xl border border-[#D7C9B8] shadow-xl max-w-sm w-full">
          <p className="text-[#4A3A2E]/70 text-xs mb-4">
            Please log in to view creator earnings.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-2.5 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white font-bold text-xs shadow-xs"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#D7C9B8] bg-[#FAF9F6]/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/creator/dashboard")}
              className="rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] p-2.5 text-[#4A3A2E] transition hover:bg-[#EDE7DC] hover:text-[#2B241F] shadow-2xs"
              title="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div className="text-lg font-bold tracking-tight text-[#2B241F]">
                Brand<span className="text-[#8B6F5A]">Verse</span>
              </div>
              <p className="text-[11px] font-medium text-[#4A3A2E]/60">
                Creator Earnings & Payouts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE7DC] border border-[#D7C9B8] text-xs text-[#8B6F5A] font-bold">
              <Sparkles size={13} />
              Creator Wallet
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8B6F5A] text-xs font-bold text-white shadow-xs">
              {getInitials(user?.name || "Creator")}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-[1500px] px-6 py-8 lg:px-8 space-y-6">
        {/* TITLE & INTRO */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#2B241F] tracking-tight">
                Creator Earnings
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Verified Collaborations
              </span>
            </div>
            <p className="mt-1 text-xs text-[#4A3A2E]/70">
              Track your agreed collaboration fees, payouts received from brands, and upcoming releases.
            </p>
          </div>

          <button
            onClick={() => navigate("/creator/discover-campaigns")}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white font-bold text-xs transition shadow-xs"
          >
            Discover More Campaigns
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs text-red-700 flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0 text-red-500" />
            <span className="flex-1 font-semibold">{error}</span>
            <button
              onClick={loadEarningsData}
              className="px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-xs font-bold text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {/* SUMMARY STAT CARDS */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Total Earnings */}
          <div className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-5 shadow-xs hover:shadow-sm hover:border-[#8B6F5A] transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#4A3A2E]/70">
                Total Earnings
              </span>
              <div className="p-2.5 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <TrendingUp size={18} />
              </div>
            </div>
            <p className="text-2xl font-black mt-3 text-[#2B241F]">
              {loading
                ? "..."
                : formatCurrency(stats.totalEarnings, creatorCurrency.code)}
            </p>
            <p className="text-[11px] text-[#4A3A2E]/60 mt-1">
              All agreed collaboration amounts
            </p>
          </div>

          {/* Paid Earnings */}
          <div className="rounded-2xl border border-[#D7C9B8] bg-[#EDE7DC]/40 p-5 shadow-xs hover:shadow-sm hover:border-[#8B6F5A] transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800">
                Paid Earnings
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <p className="text-2xl font-black mt-3 text-emerald-700">
              {loading
                ? "..."
                : formatCurrency(stats.paidEarnings, creatorCurrency.code)}
            </p>
            <p className="text-[11px] text-emerald-800/80 mt-1 flex items-center gap-1 font-medium">
              <Check size={12} /> Received in account
            </p>
          </div>

          {/* Pending Earnings */}
          <div className="rounded-2xl border border-[#D7C9B8] bg-[#EDE7DC]/40 p-5 shadow-xs hover:shadow-sm hover:border-[#8B6F5A] transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800">
                Pending Earnings
              </span>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <Clock size={18} />
              </div>
            </div>
            <p className="text-2xl font-black mt-3 text-amber-700">
              {loading
                ? "..."
                : formatCurrency(stats.pendingEarnings, creatorCurrency.code)}
            </p>
            <p className="text-[11px] text-amber-800/80 mt-1 font-medium">
              {stats.readyEarnings > 0
                ? `${formatCurrency(stats.readyEarnings, creatorCurrency.code)} ready for payout`
                : "Awaiting review completion"}
            </p>
          </div>

          {/* Completed Collaborations */}
          <div className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-5 shadow-xs hover:shadow-sm hover:border-[#8B6F5A] transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8B6F5A]">
                Completed Deliverables
              </span>
              <div className="p-2.5 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <Receipt size={18} />
              </div>
            </div>
            <p className="text-2xl font-black mt-3 text-[#2B241F]">
              {loading ? "..." : stats.completedCollaborations}
            </p>
            <p className="text-[11px] text-[#4A3A2E]/70 mt-1 font-medium">
              Successfully paid brand campaigns
            </p>
          </div>
        </section>

        {/* SEARCH & FILTERS */}
        <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A3A2E]/50 pointer-events-none"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by campaign, brand name, or transaction ID..."
                className="w-full rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 py-2.5 pl-10 pr-4 text-xs font-medium text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:bg-[#FAF9F6] placeholder:text-[#4A3A2E]/50"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                ["all", "All Earnings", tabCounts.all],
                ["paid", "Paid", tabCounts.paid],
                ["ready", "Ready for Payment", tabCounts.ready],
                ["pending", "Pending", tabCounts.pending],
              ].map(([id, label, count]) => (
                <button
                  key={id}
                  onClick={() => setStatusFilter(id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    statusFilter === id
                      ? "bg-[#8B6F5A] text-white shadow-xs"
                      : "bg-[#EDE7DC]/40 border border-[#D7C9B8] text-[#4A3A2E] hover:text-[#2B241F] hover:bg-[#EDE7DC]"
                  }`}
                >
                  {label}
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      statusFilter === id
                        ? "bg-white/20 text-white"
                        : "bg-[#EDE7DC] text-[#4A3A2E]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* EARNINGS HISTORY TABLE */}
        <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] overflow-hidden shadow-xs">
          <div className="p-5 border-b border-[#D7C9B8]/70 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#2B241F] tracking-tight">
                Earnings History
              </h2>
              <p className="text-xs text-[#4A3A2E]/60 mt-0.5">
                Showing {filteredPayments.length} of {payments.length} collaboration payments
              </p>
            </div>
            <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
              <Receipt size={18} />
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-[#4A3A2E]/50 flex flex-col items-center justify-center gap-3">
              <Loader2 size={28} className="animate-spin text-[#8B6F5A]" />
              <p className="text-xs font-semibold">Loading earnings records...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-16 text-center bg-[#EDE7DC]/20">
              <div className="w-12 h-12 mx-auto rounded-xl bg-[#EDE7DC] flex items-center justify-center text-[#8B6F5A] border border-[#D7C9B8] mb-3">
                <Wallet size={22} />
              </div>
              <h3 className="text-sm font-extrabold text-[#2B241F]">
                No earnings records found
              </h3>
              <p className="text-xs text-[#4A3A2E]/60 mt-1 max-w-sm mx-auto">
                {search || statusFilter !== "all"
                  ? "No earnings match your current search and filter criteria."
                  : "Apply to campaigns and submit deliverables to start earning."}
              </p>
              {(search || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-[#FAF9F6] border border-[#D7C9B8] text-xs font-bold text-[#2B241F] shadow-2xs hover:bg-[#EDE7DC]"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#D7C9B8]/70 bg-[#EDE7DC]/40 font-bold text-[#4A3A2E]/70 uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-6">Campaign</th>
                    <th className="py-3.5 px-6">Brand</th>
                    <th className="py-3.5 px-6">Agreed Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Transaction ID</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7C9B8]/60">
                  {filteredPayments.map((p) => {
                    const brandName =
                      p.brandId?.companyName || p.brandId?.name || "Brand";
                    const brandEmail = p.brandId?.email || "";
                    const campaignTitle = p.campaignId?.title || "Campaign";
                    const campaignCategory =
                      p.campaignId?.category || "Collaboration";

                    return (
                      <tr
                        key={p._id}
                        className="hover:bg-[#EDE7DC]/30 transition-colors"
                      >
                        {/* Campaign */}
                        <td className="py-4 px-6 font-semibold">
                          <div className="max-w-[200px]">
                            <p className="truncate text-[#2B241F] font-bold">
                              {campaignTitle}
                            </p>
                            <span className="text-[11px] font-semibold text-[#8B6F5A]">
                              {campaignCategory}
                            </span>
                          </div>
                        </td>

                        {/* Brand */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#8B6F5A] flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-2xs">
                              {getInitials(brandName)}
                            </div>
                            <div className="min-w-0 max-w-[150px]">
                              <p className="truncate font-bold text-[#2B241F]">
                                {brandName}
                              </p>
                              {brandEmail && (
                                <p className="truncate text-[10px] text-[#4A3A2E]/60">
                                  {brandEmail}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-sm text-[#2B241F]">
                              {formatCurrency(
                                p.creatorAmount !== undefined && p.creatorAmount !== null ? p.creatorAmount : p.amount,
                                p.creatorCurrency || creatorCurrency.code
                              )}
                            </span>
                            {p.creatorCurrency && (p.brandCurrency || p.currency) && p.creatorCurrency !== (p.brandCurrency || p.currency) && (
                              <span className="text-[10px] font-semibold text-[#8B6F5A]">
                                Paid by brand: {formatCurrency(p.amount, p.brandCurrency || p.currency || "EUR")}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          {p.status === "paid" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={11} />
                              Paid
                            </span>
                          )}
                          {p.status === "ready" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                              <Sparkles size={11} />
                              Ready
                            </span>
                          )}
                          {p.status === "pending" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock size={11} />
                              Pending
                            </span>
                          )}
                          {p.status === "failed" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                              Failed
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-4 px-6 text-[#4A3A2E]/70 font-medium">
                          {p.paidAt ? formatDate(p.paidAt) : formatDate(p.createdAt)}
                        </td>

                        {/* Transaction ID */}
                        <td className="py-4 px-6">
                          {p.transactionId ? (
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#EDE7DC]/50 border border-[#D7C9B8] text-[#2B241F]">
                              {p.transactionId}
                            </span>
                          ) : (
                            <span className="text-[#4A3A2E]/50 font-mono">—</span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedPayment(p)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EDE7DC] hover:bg-[#D7C9B8]/40 border border-[#D7C9B8] text-[#2B241F] font-bold transition shadow-2xs"
                          >
                            <Eye size={12} />
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* =====================================================
          PAYMENT DETAILS MODAL
      ===================================================== */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B241F]/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-[#D7C9B8]/70 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] flex items-center justify-center border border-[#D7C9B8]">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#2B241F]">
                    Payment Details
                  </h3>
                  <p className="text-[11px] text-[#4A3A2E]/60">Collaboration Receipt</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1.5 rounded-xl text-[#4A3A2E]/70 hover:text-[#2B241F] hover:bg-[#EDE7DC] transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 p-4 text-center">
                <p className="text-[10px] font-bold text-[#4A3A2E]/60 uppercase tracking-wider">
                  {selectedPayment.status === "paid"
                    ? "Payment Received"
                    : "Agreed Fee"}
                </p>
                <p className="text-2xl font-black text-[#2B241F] mt-1">
                  {formatCurrency(
                    selectedPayment.creatorAmount !== undefined && selectedPayment.creatorAmount !== null
                      ? selectedPayment.creatorAmount
                      : selectedPayment.amount,
                    selectedPayment.creatorCurrency || creatorCurrency.code
                  )}
                </p>
                {selectedPayment.creatorCurrency && (selectedPayment.brandCurrency || selectedPayment.currency) && selectedPayment.creatorCurrency !== (selectedPayment.brandCurrency || selectedPayment.currency) && (
                  <p className="text-xs text-[#8B6F5A] mt-1 font-semibold">
                    Brand Payout: {formatCurrency(selectedPayment.amount, selectedPayment.brandCurrency || selectedPayment.currency)}
                  </p>
                )}
                <div className="mt-2">
                  {selectedPayment.status === "paid" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 size={12} />
                      Paid
                    </span>
                  )}
                  {selectedPayment.status === "ready" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                      <Sparkles size={12} />
                      Ready for Payment
                    </span>
                  )}
                  {selectedPayment.status === "pending" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock size={12} />
                      Pending Approval
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] p-3.5 space-y-2.5">
                <div className="flex justify-between items-center py-0.5 border-b border-[#D7C9B8]/60">
                  <span className="text-[#4A3A2E]/60">Campaign</span>
                  <span className="font-bold text-[#2B241F]">
                    {selectedPayment.campaignId?.title || "Campaign"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5 border-b border-[#D7C9B8]/60">
                  <span className="text-[#4A3A2E]/60">Brand</span>
                  <span className="font-bold text-[#2B241F]">
                    {selectedPayment.brandId?.companyName ||
                      selectedPayment.brandId?.name ||
                      "Brand"}
                  </span>
                </div>

                {selectedPayment.paymentMethod && (
                  <div className="flex justify-between items-center py-0.5 border-b border-[#D7C9B8]/60">
                    <span className="text-[#4A3A2E]/60">Payment Method</span>
                    <span className="font-bold text-[#2B241F] uppercase text-[10px] px-2 py-0.5 rounded bg-[#EDE7DC]">
                      {selectedPayment.paymentMethod === "demo"
                        ? "Demo Payment"
                        : selectedPayment.paymentMethod === "upi"
                        ? "UPI Transfer"
                        : "Bank Transfer"}
                    </span>
                  </div>
                )}

                {selectedPayment.transactionId && (
                  <div className="flex justify-between items-center py-0.5 border-b border-[#D7C9B8]/60">
                    <span className="text-[#4A3A2E]/60">Transaction ID</span>
                    <span className="font-mono text-[11px] text-[#8B6F5A] font-bold">
                      {selectedPayment.transactionId}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-[#4A3A2E]/60">
                    {selectedPayment.paidAt ? "Paid At" : "Created At"}
                  </span>
                  <span className="font-semibold text-[#4A3A2E]">
                    {selectedPayment.paidAt
                      ? formatDateTime(selectedPayment.paidAt)
                      : formatDateTime(selectedPayment.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedPayment(null)}
              className="w-full mt-5 py-2.5 rounded-xl bg-[#EDE7DC] hover:bg-[#D7C9B8]/50 text-[#2B241F] font-bold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
