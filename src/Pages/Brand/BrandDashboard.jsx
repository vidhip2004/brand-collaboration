import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  MessageCircle,
  Wallet,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Users,
  Eye,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ChevronRight,
  Plus,
  FileText,
  UserCheck,
  Target,
  Sparkles,
} from "lucide-react";

import axios from "axios";
import authService from "../../services/authService";
import {
  getCurrencyFromCountry,
  formatCurrency as formatCurrencyValue,
  formatCompactCurrency,
} from "../../services/currency";

const CAMPAIGN_API_URL = "http://localhost:5000/api/campaigns";
const APPLICATION_API_URL = "http://localhost:5000/api/applications";
const PAYMENT_API_URL = "http://localhost:5000/api/payments";

const BrandDashboard = () => {
  const navigate = useNavigate();

  // ==========================================
  // GET LOGGED-IN USER
  // ==========================================
  const user = authService.getCurrentUser();

  const brandName = user?.companyName || user?.name || "Brand";
  const contactPerson = user?.contactPerson || user?.name || "Brand Manager";
  const email = user?.email || "No email available";
  const instagram = user?.instagramHandle || "Not added";
  const industry = user?.industry || "Business";
  const country = user?.country || "India";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  // ==========================================
  // DYNAMIC DASHBOARD DATA
  // ==========================================
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    totalPaid: 0,
    pendingPayments: 0,
    remainingBudget: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id || user.role !== "brand") {
        setLoading(false);
        return;
      }

      setLoading(true);
      setDashboardError("");

      try {
        const [campaignsResponse, applicationsResponse, paymentsResponse] =
          await Promise.all([
            axios.get(`${CAMPAIGN_API_URL}/brand/${user.id}`),
            axios.get(`${APPLICATION_API_URL}/brand/${user.id}`),
            axios.get(`${PAYMENT_API_URL}/brand/${user.id}`).catch(() => ({ data: { payments: [], stats: {} } })),
          ]);

        const campaignData =
          campaignsResponse.data?.campaigns ||
          campaignsResponse.data?.data ||
          [];

        const applicationData =
          applicationsResponse.data?.applications ||
          applicationsResponse.data?.data ||
          [];

        const paymentData =
          paymentsResponse.data?.payments ||
          [];

        const statsData =
          paymentsResponse.data?.stats ||
          {};

        setCampaigns(
          Array.isArray(campaignData) ? campaignData : []
        );

        setApplications(
          Array.isArray(applicationData) ? applicationData : []
        );

        setPayments(
          Array.isArray(paymentData) ? paymentData : []
        );

        setPaymentStats({
          totalPaid: statsData.totalPaid || 0,
          pendingPayments: statsData.pendingPayments || 0,
          remainingBudget: statsData.remainingBudget || 0,
        });
      } catch (error) {
        console.error("Brand dashboard error:", error);

        setDashboardError(
          error.response?.data?.message ||
            "Unable to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id, user?.role]);

  // ==========================================
  // CALCULATED DASHBOARD DATA
  // ==========================================
  const activeCampaigns = campaigns.filter(
    (campaign) => campaign.status === "published"
  );

  const draftCampaigns = campaigns.filter(
    (campaign) => campaign.status === "draft"
  );

  const closedCampaigns = campaigns.filter(
    (campaign) =>
      campaign.status === "closed" ||
      campaign.status === "completed"
  );

  const totalApplications = applications.length;

  const pendingApplications = applications.filter(
    (application) => application.status === "pending"
  ).length;

  const acceptedApplications = applications.filter(
    (application) => application.status === "accepted"
  ).length;

  const rejectedApplications = applications.filter(
    (application) => application.status === "rejected"
  ).length;

  // Current backend does not have a separate Collaboration model.
  // Accepted applications are therefore treated as hired creators.
  const hiredCreators = acceptedApplications;

  const totalBudget = campaigns.reduce(
    (total, campaign) =>
      total + (Number(campaign.budget) || 0),
    0
  );

  const activeBudget = activeCampaigns.reduce(
    (total, campaign) =>
      total + (Number(campaign.budget) || 0),
    0
  );

  const recentCampaigns = [...campaigns]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 3);

  const upcomingDeadlines = [...campaigns]
    .filter((campaign) => {
      if (!campaign.applicationDeadline) return false;

      return (
        new Date(campaign.applicationDeadline).getTime() >
        Date.now()
      );
    })
    .sort(
      (a, b) =>
        new Date(a.applicationDeadline).getTime() -
        new Date(b.applicationDeadline).getTime()
    )
    .slice(0, 3);

  const uniqueCreators = new Set(
    applications
      .map((application) => {
        if (
          application.creatorId &&
          typeof application.creatorId === "object"
        ) {
          return application.creatorId._id;
        }

        return application.creatorId;
      })
      .filter(Boolean)
  );

  const creatorMatchingCount = uniqueCreators.size;

  const applicationSuccessRate =
    totalApplications > 0
      ? Math.round(
          (acceptedApplications / totalApplications) * 100
        )
      : 0;

  const brandCurrency = getCurrencyFromCountry(country);

  const formatCurrency = (amount) => {
    return formatCompactCurrency(
      amount,
      brandCurrency.code
    );
  };

  const formatFullCurrency = (amount) => {
    return formatCurrencyValue(
      amount,
      brandCurrency.code
    );
  };

  const formatDate = (date) => {
    if (!date) return "Date not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysLeft = (date) => {
    if (!date) return null;

    const deadline = new Date(date).getTime();

    if (Number.isNaN(deadline)) return null;

    return Math.ceil(
      (deadline - Date.now()) /
        (1000 * 60 * 60 * 24)
    );
  };

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  // ==========================================
  // SIDEBAR NAVIGATION
  // ==========================================
  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    setSidebarOpen(false);

    if (menu === "profile") {
      navigate("/brand/brandProfile");
    }

    if (menu === "campaigns") {
      navigate("/brand/create-campaign");
    }

    if (menu === "applications") {
      navigate("/brand/applications");
    }

    if (menu === "creators") {
      navigate("/brand/find-creators");
    }

    if (menu === "messages") {
      navigate("/messages");
    }

    if (menu === "earnings") {
      navigate("/brand/earnings");
    }

    if (menu === "notifications") {
      navigate("/notifications");
    }
  };

  // ==========================================
  // IF USER IS NOT LOGGED IN
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] flex items-center justify-center px-6">
        <div className="text-center max-w-sm bg-[#FAF9F6] p-8 rounded-3xl border border-[#D7C9B8] shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EDE7DC] border border-[#D7C9B8] flex items-center justify-center text-[#8B6F5A]">
            <User size={30} />
          </div>

          <h1 className="text-2xl font-bold mt-5 text-[#2B241F]">
            Please Sign In
          </h1>

          <p className="text-[#4A3A2E]/70 text-sm mt-2">
            You need to be logged in to access your brand dashboard.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-6 w-full bg-[#8B6F5A] hover:bg-[#785D4A] text-[#FAF9F6] py-3 rounded-xl font-semibold shadow-xs transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F]">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#2B241F]/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          w-72
          bg-[#FAF9F6]
          border-r border-[#D7C9B8]
          shadow-xs
          transform transition-transform duration-300
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-[#D7C9B8]/40">
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-black tracking-tight flex items-center gap-1.5"
          >
            <span className="text-[#2B241F]">Brand</span>
            <span className="text-[#8B6F5A]">Verse</span>
          </button>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-[#4A3A2E]/60 hover:text-[#2B241F] rounded-lg hover:bg-[#EDE7DC]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mini Brand Profile */}
        <div className="px-5 py-5 border-b border-[#D7C9B8]/40 bg-[#EDE7DC]/30">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#8B6F5A] flex items-center justify-center font-bold text-[#FAF9F6] text-base shadow-xs">
              {getInitials(brandName)}
            </div>

            <div className="min-w-0">
              <h3 className="font-bold text-[#2B241F] text-sm truncate">
                {brandName}
              </h3>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#8B6F5A] animate-pulse" />
                <p className="text-xs font-medium text-[#8B6F5A] truncate">
                  Brand Account
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="px-3.5 py-5 space-y-1.5 overflow-y-auto max-h-[calc(100vh-210px)]">
          <SidebarItem
            icon={<LayoutDashboard size={19} />}
            label="Dashboard"
            active={activeMenu === "dashboard"}
            onClick={() => handleMenuClick("dashboard")}
          />

          <SidebarItem
            icon={<Search size={19} />}
            label="Find Creators"
            active={activeMenu === "creators"}
            onClick={() => handleMenuClick("creators")}
          />

          <SidebarItem
            icon={<Briefcase size={19} />}
            label="My Campaigns"
            active={activeMenu === "campaigns"}
            onClick={() => handleMenuClick("campaigns")}
          />

          <SidebarItem
            icon={<UserCheck size={19} />}
            label="Applications"
            badge={pendingApplications > 0 ? pendingApplications : null}
            active={activeMenu === "applications"}
            onClick={() => handleMenuClick("applications")}
          />

          <SidebarItem
            icon={<MessageCircle size={19} />}
            label="Messages"
            active={activeMenu === "messages"}
            onClick={() => handleMenuClick("messages")}
          />

          <SidebarItem
            icon={<Wallet size={19} />}
            label="Payments"
            active={activeMenu === "earnings"}
            onClick={() => handleMenuClick("earnings")}
          />

          <SidebarItem
            icon={<Bell size={19} />}
            label="Notifications"
            active={activeMenu === "notifications"}
            onClick={() => handleMenuClick("notifications")}
          />

          <div className="pt-4 mt-4 border-t border-[#D7C9B8]/40">
            <SidebarItem
              icon={<User size={19} />}
              label="Company Profile"
              active={activeMenu === "profile"}
              onClick={() => handleMenuClick("profile")}
            />

            <SidebarItem
              icon={<Settings size={19} />}
              label="Settings"
              active={activeMenu === "settings"}
              onClick={() => handleMenuClick("settings")}
            />
          </div>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#D7C9B8]/40 bg-[#FAF9F6]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#4A3A2E]/70 hover:text-rose-700 hover:bg-rose-50 transition text-sm font-semibold"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-72 min-h-screen flex flex-col">
        {/* TOP NAVBAR */}
        <header className="sticky top-0 z-30 h-20 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#D7C9B8]/50">
          <div className="h-full px-5 md:px-8 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#4A3A2E] hover:bg-[#EDE7DC] transition"
            >
              <Menu size={22} />
            </button>

            <div className="hidden lg:block">
              <p className="text-xs font-semibold text-[#8B6F5A] uppercase tracking-wider">
                Brand Workspace
              </p>

              <h1 className="text-xl font-bold text-[#2B241F] mt-0.5">
                Welcome back, {contactPerson.split(" ")[0]} 👋
              </h1>
            </div>

            <div className="flex items-center gap-3.5 ml-auto">
              <button
                onClick={() => handleMenuClick("notifications")}
                className="relative p-2.5 rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] hover:bg-[#EDE7DC] text-[#4A3A2E] hover:text-[#2B241F] transition shadow-2xs"
              >
                <Bell size={19} />

                {pendingApplications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#8B6F5A] text-[10px] text-[#FAF9F6] flex items-center justify-center font-bold shadow-2xs">
                    {pendingApplications}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate("/brand/brandProfile")}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-[#EDE7DC] transition"
              >
                <div className="w-9 h-9 rounded-xl bg-[#8B6F5A] flex items-center justify-center font-bold text-[#FAF9F6] text-sm shadow-2xs">
                  {getInitials(brandName)}
                </div>

                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-[#2B241F] leading-tight">
                    {brandName}
                  </p>
                  <p className="text-xs text-[#4A3A2E]/60">
                    {industry}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="p-5 md:p-8 max-w-7xl w-full mx-auto space-y-7">
          {dashboardError && (
            <div className="p-4 rounded-2xl border border-rose-300 bg-rose-50/80 text-sm text-rose-700 flex items-center gap-3">
              <span className="font-semibold">{dashboardError}</span>
            </div>
          )}

          {/* Mobile Welcome */}
          <div className="lg:hidden">
            <p className="text-xs font-semibold text-[#8B6F5A] uppercase tracking-wider">
              Brand Workspace
            </p>
            <h1 className="text-2xl font-black text-[#2B241F] mt-1">
              Welcome back, {contactPerson.split(" ")[0]} 👋
            </h1>
          </div>

          {/* COMPANY HERO BANNER */}
          <section className="rounded-2xl border border-[#D7C9B8] bg-gradient-to-r from-[#EDE7DC]/80 via-[#FAF9F6] to-[#D7C9B8]/40 p-6 md:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-18 h-18 md:w-20 md:h-20 rounded-2xl bg-[#8B6F5A] flex items-center justify-center text-2xl font-black text-[#FAF9F6] shadow-sm">
                  {getInitials(brandName)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl md:text-3xl font-black text-[#2B241F]">
                      {brandName}
                    </h2>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                      <CheckCircle size={12} />
                      Verified Brand
                    </span>
                  </div>

                  <p className="text-[#4A3A2E]/70 text-sm mt-1 font-medium">
                    {industry} • {country}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-3 py-1 rounded-full bg-[#EDE7DC] border border-[#D7C9B8] text-[#8B6F5A] text-xs font-semibold">
                      ✨ Active Brand Portal
                    </span>

                    <span className="px-3 py-1 rounded-full bg-[#EDE7DC] border border-[#D7C9B8] text-[#4A3A2E] text-xs font-semibold">
                      🎯 {activeCampaigns.length} Active Campaigns
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/brand/find-creators")}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FAF9F6] border border-[#D7C9B8] hover:bg-[#EDE7DC] font-bold text-[#2B241F] text-sm shadow-xs transition"
                >
                  <Search size={17} />
                  Find Creators
                </button>

                <button
                  onClick={() => navigate("/brand/create-campaign")}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-[#FAF9F6] font-bold text-sm shadow-xs transition"
                >
                  <Plus size={18} />
                  Create Campaign
                </button>
              </div>
            </div>
          </section>

          {/* STATISTICS OVERVIEW */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#2B241F]">
                  Performance Overview
                </h2>
                <p className="text-xs text-[#4A3A2E]/70">
                  Key metrics across your active creator campaigns
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <StatCard
                title="Active Campaigns"
                value={loading ? "..." : activeCampaigns.length}
                change={`${draftCampaigns.length} drafts in progress`}
                icon={<Briefcase size={20} />}
                color="violet"
              />

              <StatCard
                title="Creators Hired"
                value={loading ? "..." : hiredCreators}
                change={`${acceptedApplications} accepted partnerships`}
                icon={<Users size={20} />}
                color="indigo"
              />

              <StatCard
                title="Total Applications"
                value={loading ? "..." : totalApplications}
                change={`${pendingApplications} pending review`}
                icon={<FileText size={20} />}
                color="cyan"
              />

              <StatCard
                title="Total Budget"
                value={loading ? "..." : formatCurrency(totalBudget)}
                change={`${formatCurrency(activeBudget)} currently active`}
                icon={<DollarSign size={20} />}
                color="emerald"
              />
            </div>
          </section>

          {/* CAMPAIGNS & QUICK ACTIONS GRID */}
          <div className="grid xl:grid-cols-3 gap-7">
            {/* Active Campaigns Column */}
            <section className="xl:col-span-2 rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#2B241F]">
                    Active Campaigns
                  </h2>
                  <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                    Manage and monitor your live campaigns
                  </p>
                </div>

                <button
                  onClick={() => handleMenuClick("campaigns")}
                  className="text-xs font-bold text-[#8B6F5A] hover:text-[#785D4A] flex items-center gap-1 bg-[#EDE7DC] hover:bg-[#D7C9B8]/60 px-3 py-1.5 rounded-lg transition"
                >
                  View All
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="space-y-3.5">
                {loading ? (
                  <LoadingBox text="Loading campaigns..." />
                ) : activeCampaigns.length === 0 ? (
                  <EmptyBox
                    icon={<Briefcase size={26} />}
                    title="No active campaigns yet"
                    description="Launch your first BrandVerse campaign to start receiving applications from high-impact creators."
                    buttonText="Create Campaign"
                    onClick={() => navigate("/brand/create-campaign")}
                  />
                ) : (
                  activeCampaigns.slice(0, 3).map((campaign) => (
                    <CampaignCard
                      key={campaign._id}
                      title={campaign.title}
                      category={campaign.category}
                      creators={`${campaign.creatorsNeeded || 0} Creators Needed`}
                      budget={formatFullCurrency(campaign.budget)}
                      status="Active"
                    />
                  ))
                )}
              </div>
            </section>

            {/* Quick Actions Column */}
            <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#2B241F]">
                  Quick Actions
                </h2>
                <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                  Frequently used actions and shortcuts
                </p>

                <div className="space-y-3 mt-5">
                  <QuickAction
                    icon={<Plus size={18} />}
                    title="Create Campaign"
                    description="Launch a new brand campaign"
                    onClick={() => navigate("/brand/create-campaign")}
                  />

                  <QuickAction
                    icon={<Search size={18} />}
                    title="Find Creators"
                    description="Discover AI-matched creator talent"
                    onClick={() => handleMenuClick("creators")}
                  />

                  <QuickAction
                    icon={<UserCheck size={18} />}
                    title="Review Applications"
                    description="Review and accept creator pitches"
                    badge={pendingApplications > 0 ? `${pendingApplications} new` : null}
                    onClick={() => navigate("/brand/applications")}
                  />

                  <QuickAction
                    icon={<MessageCircle size={18} />}
                    title="Workspace Messages"
                    description="Coordinate with active creators"
                    onClick={() => navigate("/messages")}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* APPLICATION METRICS & WORKFLOW */}
          <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#2B241F]">
                  Creator Application Pipeline
                </h2>
                <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                  Overview of creators pitching for your campaigns
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <UserCheck size={20} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ApplicationStat
                label="Total Applications"
                value={loading ? "..." : totalApplications}
                icon={<FileText size={18} />}
                color="indigo"
              />

              <ApplicationStat
                label="Pending Review"
                value={loading ? "..." : pendingApplications}
                icon={<Clock size={18} />}
                color="amber"
              />

              <ApplicationStat
                label="Rejected"
                value={loading ? "..." : rejectedApplications}
                icon={<X size={18} />}
                color="rose"
              />

              <ApplicationStat
                label="Hired Creators"
                value={loading ? "..." : hiredCreators}
                icon={<CheckCircle size={18} />}
                color="emerald"
              />
            </div>

            {/* Success rate bar */}
            <div className="mt-5 p-4 rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#FAF9F6] text-[#8B6F5A] border border-[#D7C9B8] shadow-xs">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className="font-bold text-[#2B241F] text-sm">
                    Application Success Rate: {loading ? "..." : `${applicationSuccessRate}%`}
                  </p>
                  <p className="text-xs text-[#4A3A2E]/75 mt-0.5">
                    {totalApplications === 0
                      ? "No creator applications received yet."
                      : `${acceptedApplications} of ${totalApplications} applicants accepted for collaboration.`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/brand/applications")}
                className="shrink-0 px-4 py-2 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white font-bold text-xs transition"
              >
                Review All
              </button>
            </div>
          </section>

          {/* BUDGET ALLOCATION & CREATOR MATCHING */}
          <div className="grid lg:grid-cols-2 gap-7">
            {/* Campaign Budget Card */}
            <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#2B241F]">
                    Campaign Budget
                  </h2>
                  <p className="text-xs text-[#4A3A2E]/75">
                    Budget allocated across published campaigns
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-[#4A3A2E]/70 font-semibold uppercase">Total Budget</p>
                    <p className="text-3xl font-black text-[#2B241F] mt-0.5">
                      {loading ? "..." : formatCurrency(totalBudget)}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EDE7DC] text-[#4A3A2E] border border-[#D7C9B8]">
                    {activeCampaigns.length} published
                  </span>
                </div>

                <div className="w-full h-2.5 bg-[#EDE7DC] rounded-full mt-5 overflow-hidden">
                  <div
                    className="h-full bg-[#8B6F5A] rounded-full transition-all duration-500"
                    style={{
                      width:
                        totalBudget > 0
                          ? `${Math.min((activeBudget / totalBudget) * 100, 100)}%`
                          : "0%",
                    }}
                  />
                </div>

                <p className="text-xs text-[#4A3A2E]/75 mt-3 font-medium">
                  {formatCurrency(activeBudget)} active • {formatCurrency(paymentStats.totalPaid)} disbursed to creators
                </p>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#EDE7DC] text-xs">
                  <div>
                    <span className="text-[#4A3A2E]/70">Disbursed: </span>
                    <span className="font-bold text-[#2B241F]">
                      {formatCurrency(paymentStats.totalPaid)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#4A3A2E]/70">Pending: </span>
                    <span className="font-bold text-[#C98B6B]">
                      {formatCurrency(paymentStats.pendingPayments)}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate("/brand/earnings")}
                    className="text-[#8B6F5A] hover:text-[#785D4A] font-bold flex items-center gap-1"
                  >
                    Payments
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </section>

            {/* Creator Matching Card */}
            <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                    <Target size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#2B241F]">
                      Smart Creator Discovery
                    </h2>
                    <p className="text-xs text-[#4A3A2E]/75">
                      AI-matched creators ready for campaign partnerships
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs text-[#4A3A2E]/70 font-semibold uppercase">Engaged Talent</p>
                  <p className="text-3xl font-black text-[#2B241F] mt-0.5">
                    {loading ? "..." : creatorMatchingCount}
                  </p>
                  <p className="text-xs text-[#4A3A2E]/75 mt-1 font-medium">
                    Unique creators have interacted with or applied to your campaigns.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleMenuClick("creators")}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white font-bold text-sm transition shadow-xs"
              >
                <Sparkles size={16} />
                Discover Matching Creators
                <ArrowUpRight size={15} />
              </button>
            </section>
          </div>

          {/* UPCOMING DEADLINES */}
          <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <Clock size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#2B241F]">
                  Upcoming Application Deadlines
                </h2>
                <p className="text-xs text-[#4A3A2E]/75">
                  Stay on top of campaign submission schedules
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {loading ? (
                <div className="md:col-span-3">
                  <LoadingBox text="Loading deadlines..." />
                </div>
              ) : upcomingDeadlines.length === 0 ? (
                <div className="md:col-span-3">
                  <EmptyBox
                    icon={<Clock size={26} />}
                    title="No upcoming deadlines"
                    description="Your published campaigns do not have pending application deadlines."
                    buttonText="Create Campaign"
                    onClick={() => navigate("/brand/create-campaign")}
                  />
                </div>
              ) : (
                upcomingDeadlines.map((campaign) => {
                  const daysLeft = getDaysLeft(campaign.applicationDeadline);

                  return (
                    <DeadlineCard
                      key={campaign._id}
                      campaign={campaign.title || "Campaign"}
                      date={formatDate(campaign.applicationDeadline)}
                      days={
                        daysLeft === null
                          ? "Deadline unavailable"
                          : daysLeft === 1
                          ? "1 day left"
                          : `${daysLeft} days left`
                      }
                    />
                  );
                })
              )}
            </div>
          </section>

          {/* RECENT CAMPAIGNS */}
          <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#2B241F]">
                  Recent Campaign Activity
                </h2>
                <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                  Latest campaigns created under your account
                </p>
              </div>

              <Briefcase size={20} className="text-[#8B6F5A]" />
            </div>

            {loading ? (
              <LoadingBox text="Loading campaign activity..." />
            ) : recentCampaigns.length === 0 ? (
              <EmptyBox
                icon={<FileText size={26} />}
                title="No campaigns created yet"
                description="Launch your first campaign on BrandVerse to collaborate with creators."
                buttonText="Create Campaign"
                onClick={() => navigate("/brand/create-campaign")}
              />
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {recentCampaigns.map((campaign) => (
                  <div
                    key={campaign._id}
                    className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 hover:bg-[#FAF9F6] p-5 hover:border-[#8B6F5A] transition duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-[#2B241F] text-sm">
                          {campaign.title}
                        </h3>
                        <p className="text-xs font-semibold text-[#8B6F5A] mt-1">
                          {campaign.category}
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          campaign.status === "published"
                            ? "bg-[#EDE7DC] text-[#2B241F] border border-[#D7C9B8]"
                            : "bg-[#EDE7DC]/60 text-[#4A3A2E]/70 border border-[#D7C9B8]"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#4A3A2E]/75 mt-3 line-clamp-2 leading-relaxed">
                      {campaign.description || "No description available."}
                    </p>

                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#D7C9B8]/60 text-xs">
                      <span className="text-[#4A3A2E]/70 font-medium">Budget</span>
                      <span className="font-bold text-[#2B241F]">
                        {formatFullCurrency(campaign.budget)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* COMPANY PROFILE FOOTER */}
          <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <p className="text-xs font-semibold text-[#8B6F5A] uppercase tracking-wider">
                  Company Account
                </p>
                <h3 className="text-lg font-bold text-[#2B241F] mt-0.5">
                  {brandName}
                </h3>
                <p className="text-xs text-[#4A3A2E]/75 mt-1">
                  {email} • {country} • {industry}
                </p>
                {instagram !== "Not added" && (
                  <p className="text-xs text-[#4A3A2E]/60 mt-0.5">
                    Instagram: @{instagram.replace("@", "")}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/brand/brandProfile")}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#D7C9B8] bg-[#EDE7DC] hover:bg-[#D7C9B8] text-[#2B241F] font-semibold text-xs transition"
                >
                  <User size={15} />
                  View Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#C98B6B]/40 bg-[#C98B6B]/10 hover:bg-[#C98B6B]/20 text-[#C98B6B] font-semibold text-xs transition"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

/* =====================================================
   SIDEBAR ITEM
===================================================== */
const SidebarItem = ({ icon, label, badge, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between
        px-4 py-2.5 rounded-xl
        text-sm font-semibold
        transition-all duration-150
        ${
          active
            ? "bg-[#EDE7DC] text-[#2B241F] font-bold border border-[#D7C9B8]"
            : "text-[#4A3A2E]/80 hover:text-[#2B241F] hover:bg-[#EDE7DC]/50"
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span className={active ? "text-[#8B6F5A]" : "text-[#4A3A2E]/60"}>
          {icon}
        </span>
        <span>{label}</span>
      </div>

      {badge && (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#8B6F5A] text-white">
          {badge}
        </span>
      )}
    </button>
  );
};

/* =====================================================
   STAT CARD
===================================================== */
const StatCard = ({ title, value, change, icon, color = "violet" }) => {
  return (
    <div className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-5 shadow-xs hover:border-[#8B6F5A] transition duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#4A3A2E]/70 uppercase tracking-wider">
          {title}
        </span>

        <div className="p-2.5 rounded-xl border bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]">
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-3xl font-black text-[#2B241F] tracking-tight">
          {value}
        </p>

        <p className="text-xs text-[#4A3A2E]/75 font-medium mt-1.5 flex items-center gap-1 truncate">
          <TrendingUp size={13} className="text-[#8B6F5A] shrink-0" />
          {change}
        </p>
      </div>
    </div>
  );
};

/* =====================================================
   CAMPAIGN CARD
===================================================== */
const CampaignCard = ({ title, category, creators, budget, status }) => {
  return (
    <div className="p-4 rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] hover:bg-[#EDE7DC]/30 hover:border-[#8B6F5A] transition duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8] flex items-center justify-center font-bold shrink-0">
            <Briefcase size={20} />
          </div>

          <div>
            <h3 className="font-bold text-[#2B241F] text-sm">
              {title}
            </h3>

            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold text-[#8B6F5A]">
                {category}
              </span>
              <span className="text-[#D7C9B8]">•</span>
              <span className="text-xs text-[#4A3A2E]/70">
                {creators}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D7C9B8]/60">
          <div className="text-left sm:text-right">
            <p className="text-sm font-black text-[#2B241F]">
              {budget}
            </p>
            <p className="text-[10px] text-[#4A3A2E]/60 font-medium uppercase">
              Budget
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EDE7DC] border border-[#D7C9B8] text-[#2B241F] capitalize">
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   APPLICATION STAT
===================================================== */
const ApplicationStat = ({ label, value, icon, color = "violet" }) => {
  return (
    <div className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#4A3A2E]/75">
          {label}
        </p>

        <div className="p-2 rounded-lg border bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]">
          {icon}
        </div>
      </div>

      <p className="text-2xl font-black text-[#2B241F] mt-3">
        {value}
      </p>
    </div>
  );
};

/* =====================================================
   QUICK ACTION
===================================================== */
const QuickAction = ({ icon, title, description, badge, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 hover:bg-[#EDE7DC] hover:border-[#8B6F5A] transition duration-150 text-left"
    >
      <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#D7C9B8] text-[#8B6F5A] shadow-xs shrink-0">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-[#2B241F] text-xs">
            {title}
          </p>
          {badge && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#8B6F5A] text-white">
              {badge}
            </span>
          )}
        </div>

        <p className="text-[11px] text-[#4A3A2E]/70 mt-0.5 truncate">
          {description}
        </p>
      </div>

      <ChevronRight size={16} className="text-[#4A3A2E]/50 shrink-0" />
    </button>
  );
};

/* =====================================================
   DEADLINE CARD
===================================================== */
const DeadlineCard = ({ campaign, date, days }) => {
  return (
    <div className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-[#2B241F] text-sm">
            {campaign}
          </h3>

          <p className="text-xs text-[#4A3A2E]/70 mt-1">
            Deadline: {date}
          </p>
        </div>

        <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#C98B6B] border border-[#D7C9B8] shrink-0">
          <Clock size={16} />
        </div>
      </div>

      <p className="text-xs font-bold text-[#C98B6B] mt-3 flex items-center gap-1">
        ⏳ {days}
      </p>
    </div>
  );
};

/* =====================================================
   LOADING BOX
===================================================== */
const LoadingBox = ({ text }) => {
  return (
    <div className="p-8 rounded-2xl border border-[#D7C9B8] bg-[#EDE7DC]/20 text-center text-[#4A3A2E]/60 text-sm font-medium">
      {text}
    </div>
  );
};

/* =====================================================
   EMPTY BOX
===================================================== */
const EmptyBox = ({ icon, title, description, buttonText, onClick }) => {
  return (
    <div className="p-8 rounded-2xl border border-dashed border-[#D7C9B8] text-center">
      <div className="w-12 h-12 mx-auto rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8] flex items-center justify-center shadow-xs">
        {icon}
      </div>

      <p className="font-bold text-[#2B241F] mt-3 text-sm">
        {title}
      </p>

      <p className="text-xs text-[#4A3A2E]/70 mt-1 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>

      {buttonText && (
        <button
          onClick={onClick}
          className="mt-4 px-4 py-2 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white text-xs font-bold transition"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

/* =====================================================
   GET INITIALS
===================================================== */
const getInitials = (name) => {
  if (!name) return "BR";

  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

export default BrandDashboard;
