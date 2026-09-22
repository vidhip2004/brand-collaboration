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
  CreditCard,
  ShieldCheck,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Receipt,
  Smartphone,
  Landmark,
  Sparkles,
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

export default function BrandPayments() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const brandCurrency = getCurrencyFromCountry(user?.country);

  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalBudget: 0,
    totalPaid: 0,
    pendingPayments: 0,
    readyPayments: 0,
    remainingBudget: 0,
    totalCollaborations: 0,
    paidCount: 0,
    readyCount: 0,
    pendingCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Payment Confirmation Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedPaymentForPay, setSelectedPaymentForPay] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("demo");
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  // View Receipt / Details Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedPaymentReceipt, setSelectedPaymentReceipt] = useState(null);

  // Load Brand Payments Data
  const loadPaymentsData = async () => {
    if (!user?.id || user.role !== "brand") {
      setError("Please log in as a brand to view payment history.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await paymentService.getBrandPayments(user.id);
      setPayments(data.payments || []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Brand payments loading error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load brand payments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentsData();
  }, [user?.id, user?.role]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return payments.filter((p) => {
      const creatorName =
        p.creatorId?.name || p.creatorName || "";
      const creatorEmail =
        p.creatorId?.email || "";
      const campaignTitle =
        p.campaignId?.title || "";
      const txnId = p.transactionId || "";

      const matchesSearch =
        !term ||
        creatorName.toLowerCase().includes(term) ||
        creatorEmail.toLowerCase().includes(term) ||
        campaignTitle.toLowerCase().includes(term) ||
        txnId.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  // Counts for tabs
  const tabCounts = {
    all: payments.length,
    ready: payments.filter((p) => p.status === "ready").length,
    paid: payments.filter((p) => p.status === "paid").length,
    pending: payments.filter((p) => p.status === "pending").length,
  };

  // Open Pay Creator Modal
  const handleOpenPayModal = (payment) => {
    setSelectedPaymentForPay(payment);
    setPaymentMethod("demo");
    setPaymentSuccessData(null);
    setPayModalOpen(true);
  };

  // Close Pay Creator Modal
  const handleClosePayModal = () => {
    if (isProcessingPay) return;
    setPayModalOpen(false);
    setSelectedPaymentForPay(null);
    setPaymentSuccessData(null);
  };

  // Execute Simulated Payment
  const handleConfirmPayment = async () => {
    if (!selectedPaymentForPay?._id || !user?.id) return;

    try {
      setIsProcessingPay(true);

      // Short simulated delay for realistic UX
      await new Promise((resolve) => setTimeout(resolve, 800));

      const result = await paymentService.payCreator(
        selectedPaymentForPay._id,
        user.id,
        paymentMethod
      );

      setPaymentSuccessData({
        payment: result.payment,
        transaction: result.transaction,
      });

      await loadPaymentsData();
    } catch (err) {
      console.error("Payment execution error:", err);
      alert(
        err.response?.data?.message ||
          "Payment processing failed. Please try again."
      );
    } finally {
      setIsProcessingPay(false);
    }
  };

  // Open Receipt Modal
  const handleOpenReceipt = (payment) => {
    setSelectedPaymentReceipt(payment);
    setReceiptModalOpen(true);
  };

  // Close Receipt Modal
  const handleCloseReceipt = () => {
    setReceiptModalOpen(false);
    setSelectedPaymentReceipt(null);
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
            Please log in as a brand to view payment history.
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
                Brand Payments
              </h1>
              <p className="text-xs text-[#4A3A2E]/70">
                Disburse agreed creator payouts and track payment history
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] text-xs text-[#4A3A2E] font-bold">
              <ShieldCheck size={15} className="text-[#8B6F5A]" />
              Secure Payout Gateway
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] text-sm font-bold text-[#8B6F5A] shadow-xs">
              {getInitials(user?.companyName || user?.name || "Brand")}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8 space-y-7">
        {/* TITLE & ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-black text-[#2B241F]">
                Payment & Payout Engine
              </h1>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EDE7DC] text-[#4A3A2E] border border-[#D7C9B8]">
                Instant Processing
              </span>
            </div>
            <p className="mt-1 text-xs text-[#4A3A2E]/70">
              Disburse payments to creators for approved content deliverables and maintain tax receipts.
            </p>
          </div>

          <button
            onClick={() => navigate("/brand/create-campaign")}
            className="self-start md:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white font-bold text-xs shadow-xs transition"
          >
            Create New Campaign
            <ArrowUpRight size={15} />
          </button>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="rounded-xl border border-[#C98B6B]/40 bg-[#C98B6B]/15 p-4 text-sm font-semibold text-[#C98B6B] flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0 text-[#C98B6B]" />
            <span className="flex-1">{error}</span>
            <button
              onClick={loadPaymentsData}
              className="px-3 py-1 rounded-lg bg-[#C98B6B]/20 hover:bg-[#C98B6B]/30 text-xs font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* SUMMARY STAT CARDS */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Total Budget */}
          <div className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A3A2E]/70 uppercase tracking-wider">
                Total Campaign Budget
              </span>
              <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <DollarSign size={18} />
              </div>
            </div>
            <p className="text-3xl font-black text-[#2B241F] mt-3">
              {loading ? "..." : formatCurrency(stats.totalBudget, brandCurrency.code)}
            </p>
            <p className="text-xs text-[#4A3A2E]/60 mt-1 font-medium">
              Combined budget of all campaigns
            </p>
          </div>

          {/* Total Paid */}
          <div className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A3A2E]/70 uppercase tracking-wider">
                Total Paid to Creators
              </span>
              <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <p className="text-3xl font-black text-[#2B241F] mt-3">
              {loading ? "..." : formatCurrency(stats.totalPaid, brandCurrency.code)}
            </p>
            <p className="text-xs text-[#4A3A2E]/80 mt-1 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} className="text-[#8B6F5A]" />
              {stats.paidCount} completed payout{stats.paidCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Pending Payments */}
          <div className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A3A2E]/70 uppercase tracking-wider">
                Pending Payouts
              </span>
              <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#C98B6B] border border-[#D7C9B8]">
                <Clock size={18} />
              </div>
            </div>
            <p className="text-3xl font-black text-[#C98B6B] mt-3">
              {loading ? "..." : formatCurrency(stats.pendingPayments, brandCurrency.code)}
            </p>
            <p className="text-xs text-[#4A3A2E]/80 mt-1 font-semibold">
              {stats.readyCount} ready to disburse • {stats.pendingCount} in review
            </p>
          </div>

          {/* Remaining Budget */}
          <div className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A3A2E]/70 uppercase tracking-wider">
                Remaining Budget
              </span>
              <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <Wallet size={18} />
              </div>
            </div>
            <p className="text-3xl font-black text-[#2B241F] mt-3">
              {loading ? "..." : formatCurrency(stats.remainingBudget, brandCurrency.code)}
            </p>
            <p className="text-xs text-[#4A3A2E]/70 mt-1 font-medium">
              Available uncommitted campaign funds
            </p>
          </div>
        </section>

        {/* CONTROLS: SEARCH & FILTER TABS */}
        <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A3A2E]/50"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by creator name, campaign title, or transaction ID..."
                className="w-full rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] py-3 pl-11 pr-4 text-sm font-medium text-[#2B241F] outline-none placeholder:text-[#4A3A2E]/40 focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 transition"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {[
                ["all", "All Records", tabCounts.all],
                ["ready", "Ready to Pay", tabCounts.ready],
                ["paid", "Paid", tabCounts.paid],
                ["pending", "In Review", tabCounts.pending],
              ].map(([id, label, count]) => (
                <button
                  key={id}
                  onClick={() => setStatusFilter(id)}
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition ${
                    statusFilter === id
                      ? "bg-[#8B6F5A] text-white shadow-xs"
                      : "bg-[#EDE7DC]/50 border border-[#D7C9B8] text-[#4A3A2E] hover:text-[#2B241F] hover:bg-[#EDE7DC]"
                  }`}
                >
                  {label}
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
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

        {/* PAYMENT HISTORY TABLE */}
        <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#D7C9B8] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#2B241F]">Payment Records</h2>
              <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                Showing {filteredPayments.length} of {payments.length} collaboration payments
              </p>
            </div>
            <Receipt size={20} className="text-[#8B6F5A]" />
          </div>

          {loading ? (
            <div className="py-20 text-center text-[#4A3A2E]/70 flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="animate-spin text-[#8B6F5A]" />
              <p className="text-sm font-semibold">Loading payment history...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 mx-auto rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] flex items-center justify-center text-[#8B6F5A] mb-4">
                <Receipt size={26} />
              </div>
              <h3 className="text-base font-bold text-[#2B241F]">
                No payments found
              </h3>
              <p className="text-xs text-[#4A3A2E]/70 mt-1 max-w-sm mx-auto">
                {search || statusFilter !== "all"
                  ? "No payments match your current search and status filters."
                  : "When you accept creator applications, payment records will be created here."}
              </p>
              {(search || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#EDE7DC] hover:bg-[#D7C9B8] text-xs font-bold text-[#2B241F] transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#D7C9B8] bg-[#EDE7DC]/40 text-[11px] font-bold text-[#4A3A2E]/70 uppercase tracking-wider">
                    <th className="py-4 px-6">Campaign</th>
                    <th className="py-4 px-6">Creator</th>
                    <th className="py-4 px-6">Agreed Amount</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Transaction ID</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7C9B8]/40">
                  {filteredPayments.map((p) => {
                    const creatorName =
                      p.creatorId?.name || p.creatorName || "Creator";
                    const creatorEmail =
                      p.creatorId?.email || "No email";
                    const campaignTitle =
                      p.campaignId?.title || "Campaign";
                    const campaignCategory =
                      p.campaignId?.category || "Collaboration";

                    return (
                      <tr
                        key={p._id}
                        className="hover:bg-[#EDE7DC]/20 transition-colors"
                      >
                        {/* Campaign */}
                        <td className="py-4 px-6 font-medium">
                          <div className="max-w-[200px]">
                            <p className="truncate text-[#2B241F] font-bold text-sm">
                              {campaignTitle}
                            </p>
                            <span className="text-xs font-semibold text-[#8B6F5A]">
                              {campaignCategory}
                            </span>
                          </div>
                        </td>

                        {/* Creator */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] flex items-center justify-center font-bold text-xs text-[#8B6F5A] shrink-0 shadow-xs">
                              {getInitials(creatorName)}
                            </div>
                            <div className="min-w-0 max-w-[160px]">
                              <p className="truncate font-bold text-[#2B241F] text-sm">
                                {creatorName}
                              </p>
                              <p className="truncate text-xs text-[#4A3A2E]/60">
                                {creatorEmail}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-base text-[#2B241F]">
                              {formatCurrency(p.amount, p.brandCurrency || p.currency || brandCurrency.code)}
                            </span>
                            {p.creatorAmount && p.creatorCurrency && (p.creatorCurrency !== (p.brandCurrency || p.currency)) && (
                              <span className="text-[11px] font-semibold text-[#8B6F5A]">
                                Creator: {formatCurrency(p.creatorAmount, p.creatorCurrency)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          {p.status === "paid" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EDE7DC] text-[#2B241F] border border-[#D7C9B8]">
                              <CheckCircle2 size={13} className="text-[#8B6F5A]" />
                              Paid
                            </span>
                          )}
                          {p.status === "ready" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EDE7DC] text-[#8B6F5A] border border-[#8B6F5A]">
                              <Sparkles size={13} />
                              Ready for Payment
                            </span>
                          )}
                          {p.status === "pending" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EDE7DC] text-[#4A3A2E] border border-[#D7C9B8]">
                              <Clock size={13} />
                              In Review
                            </span>
                          )}
                          {p.status === "failed" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C98B6B]/15 text-[#C98B6B] border border-[#C98B6B]/30">
                              Failed
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-4 px-6 text-[#4A3A2E]/70 text-xs font-medium">
                          {p.paidAt ? formatDate(p.paidAt) : formatDate(p.createdAt)}
                        </td>

                        {/* Transaction ID */}
                        <td className="py-4 px-6">
                          {p.transactionId ? (
                            <span className="font-mono text-xs px-2 py-1 rounded-lg bg-[#EDE7DC] border border-[#D7C9B8] text-[#2B241F] font-semibold">
                              {p.transactionId}
                            </span>
                          ) : (
                            <span className="text-[#4A3A2E]/40 text-xs font-mono">—</span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-4 px-6 text-right">
                          {p.status === "ready" && (
                            <button
                              onClick={() => handleOpenPayModal(p)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white font-bold text-xs transition shadow-xs"
                            >
                              <CreditCard size={14} />
                              Pay Creator
                            </button>
                          )}

                          {p.status === "paid" && (
                            <button
                              onClick={() => handleOpenReceipt(p)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EDE7DC] hover:bg-[#D7C9B8] border border-[#D7C9B8] text-[#2B241F] font-bold text-xs transition"
                            >
                              <Eye size={14} />
                              Receipt
                            </button>
                          )}

                          {p.status === "pending" && (
                            <span className="text-xs text-[#4A3A2E]/60 font-medium italic">
                              Pending Review
                            </span>
                          )}
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
          CONFIRM PAYMENT MODAL (Pay Creator)
      ===================================================== */}
      {payModalOpen && selectedPaymentForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B241F]/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 sm:p-8 shadow-xl relative">
            {!paymentSuccessData ? (
              <>
                {/* Modal Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] text-[#8B6F5A] flex items-center justify-center shadow-xs">
                      <CreditCard size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#2B241F]">
                        Confirm Payout
                      </h3>
                      <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                        Brand Collaboration Compensation
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleClosePayModal}
                    disabled={isProcessingPay}
                    className="p-2 rounded-xl text-[#4A3A2E]/60 hover:text-[#2B241F] hover:bg-[#EDE7DC] transition disabled:opacity-50"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Amount Display */}
                <div className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/40 p-5 text-center mb-6">
                  <p className="text-xs font-bold text-[#4A3A2E]/70 uppercase tracking-wider">
                    Total Amount Due
                  </p>
                  <p className="text-4xl font-black text-[#2B241F] mt-1">
                    {formatCurrency(
                      selectedPaymentForPay.amount,
                      selectedPaymentForPay.brandCurrency || selectedPaymentForPay.currency || brandCurrency.code
                    )}
                  </p>
                  {selectedPaymentForPay.creatorAmount && selectedPaymentForPay.creatorCurrency && (selectedPaymentForPay.creatorCurrency !== (selectedPaymentForPay.brandCurrency || selectedPaymentForPay.currency)) ? (
                    <p className="text-xs text-[#8B6F5A] mt-1 font-semibold">
                      Creator receives: {formatCurrency(selectedPaymentForPay.creatorAmount, selectedPaymentForPay.creatorCurrency)}
                    </p>
                  ) : (
                    <p className="text-xs text-[#8B6F5A] mt-1 font-semibold">
                      Agreed Creator Rate
                    </p>
                  )}
                </div>

                {/* Collaboration Details */}
                <div className="space-y-3 mb-6 rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/20 p-4 text-xs font-medium">
                  <div className="flex justify-between items-center py-1 border-b border-[#D7C9B8]/60">
                    <span className="text-[#4A3A2E]/70">Creator</span>
                    <span className="font-bold text-[#2B241F]">
                      {selectedPaymentForPay.creatorId?.name || "Creator"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-[#D7C9B8]/60">
                    <span className="text-[#4A3A2E]/70">Campaign</span>
                    <span className="font-bold text-[#2B241F] truncate max-w-[220px]">
                      {selectedPaymentForPay.campaignId?.title || "Campaign"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#4A3A2E]/70">Deliverable Status</span>
                    <span className="text-[#2B241F] font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-[#8B6F5A]" />
                      Approved Content
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-[#4A3A2E] mb-2 uppercase tracking-wider">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: "demo", label: "Demo Payout", icon: Sparkles },
                      { id: "upi", label: "UPI", icon: Smartphone },
                      { id: "bank_transfer", label: "Bank Transfer", icon: Landmark },
                    ].map((method) => {
                      const Icon = method.icon;
                      const active = paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                            active
                              ? "border-[#8B6F5A] bg-[#EDE7DC] text-[#2B241F] font-bold shadow-xs"
                              : "border-[#D7C9B8] bg-[#FAF9F6] text-[#4A3A2E]/80 hover:bg-[#EDE7DC]/50"
                          }`}
                        >
                          <Icon size={18} className={active ? "text-[#8B6F5A]" : "text-[#4A3A2E]/50"} />
                          <span className="text-xs mt-1.5">{method.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notice */}
                <div className="mb-6 p-3 rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] text-xs text-[#4A3A2E] flex items-start gap-2">
                  <ShieldCheck size={16} className="shrink-0 mt-0.5 text-[#8B6F5A]" />
                  <span>
                    Simulated transaction engine active. Payout will immediately credit creator earnings and generate a verified transaction ID.
                  </span>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClosePayModal}
                    disabled={isProcessingPay}
                    className="flex-1 py-3 rounded-xl border border-[#D7C9B8] bg-[#EDE7DC] hover:bg-[#D7C9B8] text-[#2B241F] font-bold text-xs transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={isProcessingPay}
                    className="flex-1 py-3 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isProcessingPay ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Processing payment...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        Confirm Payout
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Success Screen */
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EDE7DC] border border-[#D7C9B8] text-[#8B6F5A] flex items-center justify-center shadow-xs">
                  <CheckCircle2 size={36} />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-[#2B241F]">
                    Payment Successful ✓
                  </h3>
                  <p className="text-xs text-[#4A3A2E]/70 mt-1">
                    The payment has been released to the creator.
                  </p>
                </div>

                <div className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/20 p-4 text-left space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#4A3A2E]/70">Amount Paid</span>
                    <span className="text-base font-black text-[#2B241F]">
                      {formatCurrency(
                        paymentSuccessData.payment?.amount,
                        paymentSuccessData.payment?.currency || "INR"
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#4A3A2E]/70">Creator</span>
                    <span className="font-bold text-[#2B241F]">
                      {selectedPaymentForPay.creatorId?.name || "Creator"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#4A3A2E]/70">Campaign</span>
                    <span className="font-bold text-[#2B241F]">
                      {selectedPaymentForPay.campaignId?.title || "Campaign"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[#D7C9B8]/60">
                    <span className="text-[#4A3A2E]/70">Transaction ID</span>
                    <span className="font-mono text-xs font-bold text-[#2B241F] px-2 py-0.5 rounded bg-[#EDE7DC] border border-[#D7C9B8]">
                      {paymentSuccessData.transaction?.transactionId ||
                        paymentSuccessData.payment?.transactionId}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleClosePayModal}
                  className="w-full py-3 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white font-bold text-xs shadow-xs transition"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          VIEW RECEIPT / DETAILS MODAL
      ===================================================== */}
      {receiptModalOpen && selectedPaymentReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B241F]/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 sm:p-8 shadow-xl relative space-y-6">
            <div className="flex items-start justify-between border-b border-[#D7C9B8] pb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] flex items-center justify-center border border-[#D7C9B8]">
                  <Receipt size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#2B241F]">Payment Receipt</h3>
                  <p className="text-xs text-[#4A3A2E]/70">Official Brand Payout Record</p>
                </div>
              </div>

              <button
                onClick={handleCloseReceipt}
                className="p-2 rounded-xl text-[#4A3A2E]/60 hover:text-[#2B241F] hover:bg-[#EDE7DC] transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 p-5 text-center">
                <p className="text-xs font-bold text-[#4A3A2E]/70 uppercase">Paid Amount</p>
                <p className="text-3xl font-black text-[#2B241F] mt-1">
                  {formatCurrency(
                    selectedPaymentReceipt.amount,
                    selectedPaymentReceipt.brandCurrency || selectedPaymentReceipt.currency || brandCurrency.code
                  )}
                </p>
                {selectedPaymentReceipt.creatorAmount && selectedPaymentReceipt.creatorCurrency && (selectedPaymentReceipt.creatorCurrency !== (selectedPaymentReceipt.brandCurrency || selectedPaymentReceipt.currency)) && (
                  <p className="text-xs text-[#8B6F5A] mt-1 font-semibold">
                    Creator Received: {formatCurrency(selectedPaymentReceipt.creatorAmount, selectedPaymentReceipt.creatorCurrency)}
                  </p>
                )}
                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-bold bg-[#EDE7DC] text-[#2B241F] border border-[#D7C9B8]">
                  <CheckCircle2 size={12} className="text-[#8B6F5A]" />
                  Payment Completed
                </span>
              </div>

              <div className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/20 p-4 space-y-3 font-medium">
                <div className="flex justify-between items-center py-1 border-b border-[#D7C9B8]/60">
                  <span className="text-[#4A3A2E]/70">Campaign</span>
                  <span className="font-bold text-[#2B241F]">
                    {selectedPaymentReceipt.campaignId?.title || "Campaign"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-[#D7C9B8]/60">
                  <span className="text-[#4A3A2E]/70">Creator</span>
                  <span className="font-bold text-[#2B241F]">
                    {selectedPaymentReceipt.creatorId?.name || "Creator"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-[#D7C9B8]/60">
                  <span className="text-[#4A3A2E]/70">Payment Method</span>
                  <span className="font-bold text-[#2B241F] uppercase text-[11px] px-2 py-0.5 rounded bg-[#EDE7DC] border border-[#D7C9B8]">
                    {selectedPaymentReceipt.paymentMethod || "Demo"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-[#D7C9B8]/60">
                  <span className="text-[#4A3A2E]/70">Transaction ID</span>
                  <span className="font-mono text-xs text-[#2B241F] font-bold">
                    {selectedPaymentReceipt.transactionId || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[#4A3A2E]/70">Paid At</span>
                  <span className="font-bold text-[#2B241F]">
                    {formatDateTime(selectedPaymentReceipt.paidAt)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCloseReceipt}
              className="w-full py-3 rounded-xl bg-[#EDE7DC] hover:bg-[#D7C9B8] text-[#2B241F] font-bold text-xs transition"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
