import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  LayoutGrid,
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
  Clock,
  CheckCircle,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import axios from "axios";
import authService from "../../services/authService";
import { calculateProfileCompletion } from "./CreatorProfile";
import {
  getCurrencyFromCountry,
  formatCurrency,
  convertCurrency,
} from "../../services/currency";

const CAMPAIGN_API_URL = "http://localhost:5000/api/campaigns";
const APPLICATION_API_URL = "http://localhost:5000/api/applications";
const PAYMENT_API_URL = "http://localhost:5000/api/payments";

const CreatorDashboard = () => {
  const navigate = useNavigate();

  const user = authService.getCurrentUser();

  const creatorCurrency = getCurrencyFromCountry(user?.country);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const [applications, setApplications] = useState([]);
  const [publishedCampaigns, setPublishedCampaigns] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    totalEarnings: 0,
    paidEarnings: 0,
    pendingEarnings: 0,
    completedCollaborations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const [convertedBudgets, setConvertedBudgets] = useState({});

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id || user.role !== "creator") {
        setLoading(false);
        return;
      }

      setLoading(true);
      setDashboardError("");

      try {
        const [applicationsResponse, campaignsResponse, paymentsResponse] =
          await Promise.all([
            axios.get(`${APPLICATION_API_URL}/creator/${user.id}`),
            axios.get(CAMPAIGN_API_URL),
            axios
              .get(`${PAYMENT_API_URL}/creator/${user.id}`)
              .catch(() => ({ data: { payments: [], stats: {} } })),
          ]);

        const applicationData =
          applicationsResponse.data?.applications ||
          applicationsResponse.data?.data ||
          [];

        const campaignData =
          campaignsResponse.data?.campaigns ||
          campaignsResponse.data?.data ||
          [];

        const paymentData = paymentsResponse.data?.payments || [];

        const statsData = paymentsResponse.data?.stats || {};

        setApplications(
          Array.isArray(applicationData) ? applicationData : []
        );

        setPublishedCampaigns(
          Array.isArray(campaignData) ? campaignData : []
        );

        setPayments(Array.isArray(paymentData) ? paymentData : []);

        setPaymentStats({
          totalEarnings: statsData.totalEarnings || 0,
          paidEarnings: statsData.paidEarnings || 0,
          pendingEarnings: statsData.pendingEarnings || 0,
          completedCollaborations: statsData.completedCollaborations || 0,
        });

        if (Array.isArray(campaignData)) {
          loadConvertedBudgets(campaignData);
        }
      } catch (error) {
        console.error("Creator dashboard error:", error);
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
  // APPLICATION STATISTICS
  // ==========================================

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

  // Accepted application = active collaboration
  const activeCollaborations = acceptedApplications;

  const successRate =
    totalApplications > 0
      ? Math.round((acceptedApplications / totalApplications) * 100)
      : 0;

  // ==========================================
  // RECENT APPLICATIONS
  // ==========================================

  const recentApplications = [...applications]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 3);

  // ==========================================
  // UPCOMING DEADLINES
  // ==========================================

  const getCampaignFromApplication = (application) => {
    if (!application) return null;

    if (
      application.campaignId &&
      typeof application.campaignId === "object"
    ) {
      return application.campaignId;
    }

    return publishedCampaigns.find(
      (campaign) =>
        String(campaign._id) === String(application.campaignId)
    );
  };

  const upcomingDeadlines = applications
    .map((application) => ({
      application,
      campaign: getCampaignFromApplication(application),
    }))
    .filter(({ campaign }) => {
      const deadline = campaign?.applicationDeadline;
      if (!deadline) return false;
      return new Date(deadline).getTime() > Date.now();
    })
    .sort(
      (a, b) =>
        new Date(a.campaign.applicationDeadline).getTime() -
        new Date(b.campaign.applicationDeadline).getTime()
    )
    .slice(0, 3);

  const availableCampaigns = publishedCampaigns.length;

  // ==========================================
  // USER DATA
  // ==========================================

  const creatorName = user?.name || "Creator";
  const username =
    user?.username || user?.instagramHandle || "creator";
  const email = user?.email || "No email available";
  const niche =
    user?.niche || user?.primaryNiche || "Content Creator";
  const country = user?.country || "India";

  // ==========================================
  // HELPERS
  // ==========================================

  const formatBudget = (campaign) => {
    if (!campaign) {
      return "Budget not specified";
    }

    const converted = convertedBudgets[campaign._id];

    if (converted === undefined) {
      return "Calculating...";
    }

    return formatCurrency(converted, creatorCurrency.code);
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

    return Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24));
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  // ==========================================
  // WORKSPACE NAVIGATION
  // ==========================================

  const handleWorkspaceNavigation = () => {
    setActiveMenu("workspace");
    setSidebarOpen(false);

    const acceptedApplication = applications.find(
      (item) => item?.status === "accepted"
    );

    if (!acceptedApplication) {
      alert("You do not have any accepted collaborations yet.");
      return;
    }

    const campaignId =
      acceptedApplication.campaignId?._id ||
      acceptedApplication.campaignId;

    if (!campaignId || !acceptedApplication._id) {
      alert(
        "Workspace information is incomplete for this collaboration."
      );
      return;
    }

    navigate(
      `/collaboration-workspace?campaignId=${campaignId}&applicationId=${acceptedApplication._id}`
    );
  };

  // ==========================================
  // SIDEBAR NAVIGATION
  // ==========================================

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    setSidebarOpen(false);

    if (menu === "dashboard") {
      return;
    }

    if (menu === "workspace") {
      handleWorkspaceNavigation();
      return;
    }

    if (menu === "profile") {
      navigate("/creator/creatorProfile");
      return;
    }

    if (menu === "discover") {
      navigate("/creator/discover-campaigns");
      return;
    }

    if (menu === "messages") {
      navigate("/messages");
      return;
    }

    if (menu === "earnings") {
      navigate("/creator/earnings");
      return;
    }

    if (menu === "notifications") {
      navigate("/notifications");
      return;
    }

    if (menu === "settings") {
      navigate("/creator/settings");
    }
  };

  // ==========================================
  // LOGIN CHECK
  // ==========================================

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] flex items-center justify-center px-6">
        <div className="text-center bg-[#FAF9F6] p-8 rounded-2xl border border-[#D7C9B8] shadow-sm max-w-md w-full">
          <div className="w-16 h-16 mx-auto rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] flex items-center justify-center">
            <User size={30} className="text-[#8B6F5A]" />
          </div>

          <h1 className="text-2xl font-bold mt-5 text-[#2B241F]">
            Please Login
          </h1>

          <p className="text-[#4A3A2E]/70 mt-2 text-sm">
            You need to login to access your creator dashboard.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-6 w-full bg-[#8B6F5A] hover:bg-[#785D4A] text-white font-semibold py-3 rounded-xl transition shadow-xs"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const loadConvertedBudgets = async (campaigns) => {
    try {
      const targetCurrency = creatorCurrency.code;
      const results = {};

      for (const campaign of campaigns) {
        if (!campaign?.budget) {
          continue;
        }

        const sourceCurrency = campaign.currency || "INR";

        const converted = await convertCurrency(
          campaign.budget,
          sourceCurrency,
          targetCurrency
        );

        results[campaign._id] = converted;
      }

      setConvertedBudgets(results);
    } catch (error) {
      console.error("Budget conversion error:", error);
    }
  };

  // ==========================================
  // MAIN DASHBOARD
  // ==========================================

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] font-sans">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#2B241F]/40 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =====================================
          SIDEBAR
      ====================================== */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-72
          bg-[#FAF9F6]
          border-r border-[#D7C9B8]
          shadow-lg lg:shadow-none
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-[#D7C9B8]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B6F5A] flex items-center justify-center text-white font-black text-xl shadow-xs">
              BV
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#2B241F]">
                Brand<span className="text-[#8B6F5A]">Verse</span>
              </h2>
              <p className="text-[11px] font-medium text-[#4A3A2E]/60 -mt-0.5">
                Creator Studio
              </p>
            </div>
          </div>

          <button
            className="lg:hidden p-2 rounded-xl text-[#4A3A2E]/70 hover:text-[#2B241F] hover:bg-[#EDE7DC]"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Creator Mini Profile */}
        <div className="px-5 py-4 border-b border-[#D7C9B8]/70 bg-[#EDE7DC]/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#8B6F5A] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {getInitials(creatorName)}
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-[#2B241F] text-sm truncate">
                {creatorName}
              </p>
              <p className="text-xs text-[#4A3A2E]/70 truncate">
                @{username}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-5 space-y-1.5 overflow-y-auto max-h-[calc(100vh-210px)]">
          <SidebarItem
            icon={<LayoutDashboard size={19} />}
            label="Dashboard"
            active={activeMenu === "dashboard"}
            onClick={() => handleMenuClick("dashboard")}
          />

          <SidebarItem
            icon={<Search size={19} />}
            label="Discover Campaigns"
            active={activeMenu === "discover"}
            onClick={() => handleMenuClick("discover")}
          />

          <SidebarItem
            icon={<LayoutGrid size={19} />}
            label="Workspace"
            active={activeMenu === "workspace"}
            onClick={handleWorkspaceNavigation}
          />

          <SidebarItem
            icon={<MessageCircle size={19} />}
            label="Messages"
            active={activeMenu === "messages"}
            onClick={() => handleMenuClick("messages")}
          />

          <SidebarItem
            icon={<Wallet size={19} />}
            label="Earnings"
            active={activeMenu === "earnings"}
            onClick={() => handleMenuClick("earnings")}
          />

          <SidebarItem
            icon={<Bell size={19} />}
            label="Notifications"
            active={activeMenu === "notifications"}
            onClick={() => handleMenuClick("notifications")}
            badge={pendingApplications > 0 ? pendingApplications : null}
          />

          <div className="pt-4 mt-4 border-t border-[#D7C9B8]/70">
            <SidebarItem
              icon={<User size={19} />}
              label="My Profile"
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#D7C9B8]/70 bg-[#FAF9F6]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#4A3A2E] hover:text-red-600 hover:bg-red-50 text-sm font-medium transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* =====================================
          MAIN CONTENT AREA
      ====================================== */}
      <main className="lg:ml-72 min-h-screen flex flex-col">
        {/* TOP NAVBAR */}
        <header className="sticky top-0 z-30 h-20 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#D7C9B8]">
          <div className="h-full px-5 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-[#4A3A2E] hover:bg-[#EDE7DC]"
              >
                <Menu size={22} />
              </button>

              <div className="hidden lg:block">
                <p className="text-xs font-semibold text-[#8B6F5A] uppercase tracking-wider">
                  Creator Hub
                </p>
                <h1 className="text-xl font-extrabold text-[#2B241F] tracking-tight">
                  Welcome back, {creatorName.split(" ")[0]} 👋
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleMenuClick("notifications")}
                className="relative p-2.5 rounded-xl border border-[#D7C9B8] text-[#4A3A2E] hover:text-[#8B6F5A] hover:bg-[#EDE7DC]/50 transition"
              >
                <Bell size={19} />
                {pendingApplications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#8B6F5A] text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-[#FAF9F6]">
                    {pendingApplications}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate("/creator/creatorProfile")}
                className="flex items-center gap-3 pl-2 py-1 pr-3 rounded-xl border border-[#D7C9B8] hover:border-[#8B6F5A] hover:bg-[#EDE7DC]/50 transition bg-[#FAF9F6]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#8B6F5A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {getInitials(creatorName)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-[#2B241F] truncate">
                    {creatorName}
                  </p>
                  <p className="text-[11px] text-[#4A3A2E]/70">Creator</p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* CONTENT BODY */}
        <div className="p-5 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* MOBILE WELCOME */}
          <div className="lg:hidden">
            <p className="text-xs font-semibold text-[#8B6F5A] uppercase tracking-wider">
              Creator Hub
            </p>
            <h1 className="text-2xl font-extrabold text-[#2B241F] tracking-tight mt-0.5">
              Welcome back, {creatorName.split(" ")[0]} 👋
            </h1>
          </div>

          {/* ERROR ALERT */}
          {dashboardError && (
            <div className="rounded-2xl border border-red-200 bg-red-50/80 px-5 py-4 text-sm text-red-700 flex items-center justify-between">
              <span>{dashboardError}</span>
              <button
                onClick={() => setDashboardError("")}
                className="text-red-500 hover:text-red-800 font-bold ml-4"
              >
                ✕
              </button>
            </div>
          )}

          {/* HERO PROFILE SUMMARY */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#8B6F5A] via-[#785D4A] to-[#4A3A2E] text-white p-6 md:p-8 shadow-sm">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black text-white shadow-inner shrink-0">
                  {getInitials(creatorName)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold tracking-tight">
                      {creatorName}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-xs">
                      Verified
                    </span>
                  </div>

                  <p className="text-[#EDE7DC] font-medium text-sm mt-1">
                    {niche}
                  </p>

                  <p className="text-xs text-[#D7C9B8] mt-1 flex items-center gap-2">
                    <span>{country}</span>
                    <span>•</span>
                    <span>{email}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/creator/creatorProfile")}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FAF9F6] text-[#2B241F] hover:bg-[#EDE7DC] transition font-bold text-sm shadow-xs"
                >
                  <User size={16} />
                  View Profile
                </button>
              </div>
            </div>
          </section>

          {/* =====================================
              PROFILE COMPLETION SCORE
          ====================================== */}
          {(() => {
            const completionScore = calculateProfileCompletion(user);
            return (
              <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-[#2B241F] text-base flex items-center gap-2">
                        <Sparkles size={18} className="text-[#8B6F5A]" />
                        Profile Completion Score
                      </h3>
                      <span className="text-lg font-black text-[#8B6F5A]">
                        {completionScore}%
                      </span>
                    </div>
                    <p className="text-xs text-[#4A3A2E]/70 mb-3">
                      {completionScore === 100
                        ? "🎉 Your profile is 100% complete! Brands can easily discover your statistics."
                        : "Complete your profile details & social statistics to attract up to 3x more brand collaborations."}
                    </p>
                    <div className="w-full h-2.5 rounded-full bg-[#EDE7DC] overflow-hidden">
                      <div
                        className="h-full bg-[#8B6F5A] rounded-full transition-all duration-700"
                        style={{ width: `${completionScore}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/creator/creatorProfile")}
                    className="self-start md:self-center flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] hover:bg-[#D7C9B8]/40 font-bold transition shrink-0 text-sm border border-[#D7C9B8]"
                  >
                    <User size={16} />
                    {completionScore === 100
                      ? "View / Edit Profile"
                      : "Complete Profile"}
                  </button>
                </div>
              </section>
            );
          })()}

          {/* =====================================
              EARNINGS OVERVIEW
          ====================================== */}
          <section className="rounded-2xl border border-[#D7C9B8] bg-[#EDE7DC]/40 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] text-[#8B6F5A] flex items-center justify-center shrink-0 shadow-xs">
                  <Wallet size={24} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#2B241F] flex items-center gap-2">
                    Earnings & Payouts
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Live
                    </span>
                  </h3>
                  <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                    Track confirmed brand payouts and pending collaboration fees
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center md:text-left bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl p-3 shadow-2xs">
                <div className="px-2">
                  <p className="text-[10px] text-[#4A3A2E]/60 uppercase font-bold tracking-wider">
                    Total
                  </p>
                  <p className="text-sm md:text-base font-extrabold text-[#2B241F] mt-0.5">
                    {loading
                      ? "..."
                      : formatCurrency(
                          paymentStats.totalEarnings,
                          creatorCurrency.code
                        )}
                  </p>
                </div>
                <div className="px-2 border-x border-[#D7C9B8]">
                  <p className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider">
                    Paid
                  </p>
                  <p className="text-sm md:text-base font-extrabold text-emerald-700 mt-0.5">
                    {loading
                      ? "..."
                      : formatCurrency(
                          paymentStats.paidEarnings,
                          creatorCurrency.code
                        )}
                  </p>
                </div>
                <div className="px-2">
                  <p className="text-[10px] text-amber-700 uppercase font-bold tracking-wider">
                    Pending
                  </p>
                  <p className="text-sm md:text-base font-extrabold text-amber-700 mt-0.5">
                    {loading
                      ? "..."
                      : formatCurrency(
                          paymentStats.pendingEarnings,
                          creatorCurrency.code
                        )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/creator/earnings")}
                className="self-start md:self-center flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white font-bold transition shrink-0 text-sm shadow-xs"
              >
                <Wallet size={16} />
                View Earnings
              </button>
            </div>
          </section>

          {/* =====================================
              STAT CARDS
          ====================================== */}
          <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Active Collaborations"
              value={loading ? "..." : activeCollaborations}
              change={acceptedApplications > 0 ? "Active" : "None"}
              icon={<Users size={20} />}
              color="mocha"
            />

            <StatCard
              title="Total Applications"
              value={loading ? "..." : totalApplications}
              change={
                totalApplications > 0
                  ? `${successRate}% success`
                  : "Start applying"
              }
              icon={<Briefcase size={20} />}
              color="latte"
            />

            <StatCard
              title="Pending Applications"
              value={loading ? "..." : pendingApplications}
              change={
                pendingApplications > 0 ? "Waiting response" : "All clear"
              }
              icon={<Clock size={20} />}
              color="amber"
            />

            <StatCard
              title="Available Campaigns"
              value={loading ? "..." : availableCampaigns}
              change="Explore"
              icon={<Search size={20} />}
              color="emerald"
            />
          </section>

          {/* =====================================
              QUICK ACTIONS
          ====================================== */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-extrabold text-[#2B241F] tracking-tight">
                Quick Actions
              </h2>
              <p className="text-xs text-[#4A3A2E]/70">
                Manage your creator activities effortlessly
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <QuickAction
                icon={<Search size={18} />}
                title="Discover Campaigns"
                description="Find new brand collaboration opportunities."
                onClick={() => handleMenuClick("discover")}
              />

              <QuickAction
                icon={<LayoutGrid size={18} />}
                title="Open Workspace"
                description="View accepted collaborations, messages and deliverables."
                onClick={handleWorkspaceNavigation}
              />

              <QuickAction
                icon={<Wallet size={18} />}
                title="View Earnings"
                description="Track your collaboration earnings and payouts."
                onClick={() => handleMenuClick("earnings")}
              />
            </div>
          </section>

          {/* =====================================
              RECENT APPLICATIONS
          ====================================== */}
          <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-extrabold text-[#2B241F] tracking-tight">
                  Recent Applications
                </h2>
                <p className="text-xs text-[#4A3A2E]/70">
                  Latest campaigns you applied to
                </p>
              </div>

              <span className="text-xs font-bold text-[#8B6F5A] bg-[#EDE7DC] px-3 py-1 rounded-full border border-[#D7C9B8]">
                {totalApplications} total
              </span>
            </div>

            {loading ? (
              <div className="py-10 text-center text-[#4A3A2E]/50 text-sm">
                Loading applications...
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="py-10 text-center bg-[#EDE7DC]/30 rounded-xl border border-dashed border-[#D7C9B8]">
                <Briefcase size={32} className="mx-auto text-[#4A3A2E]/40" />
                <p className="mt-3 font-bold text-[#2B241F] text-sm">
                  No applications yet
                </p>
                <p className="text-xs text-[#4A3A2E]/70 mt-1 max-w-sm mx-auto">
                  Start discovering campaigns and apply to top brands looking for creators like you.
                </p>
                <button
                  onClick={() => handleMenuClick("discover")}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white text-xs font-bold shadow-xs"
                >
                  Discover Campaigns
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((application) => {
                  const campaign = getCampaignFromApplication(application);

                  return (
                    <CampaignCard
                      key={application._id}
                      brand={campaign?.brandName || "Brand"}
                      title={campaign?.title || "Campaign"}
                      category={campaign?.category || "Campaign"}
                      budget={formatBudget(campaign)}
                      status={application.status || "pending"}
                    />
                  );
                })}
              </div>
            )}
          </section>

          {/* =====================================
              APPLICATION OVERVIEW
          ====================================== */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <Briefcase size={18} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#2B241F] tracking-tight">
                  Application Overview
                </h2>
                <p className="text-xs text-[#4A3A2E]/70">
                  Track the status breakdown of your applications
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ApplicationStat
                label="Total"
                value={loading ? "..." : totalApplications}
                icon={<Briefcase size={18} />}
                color="mocha"
              />

              <ApplicationStat
                label="Pending"
                value={loading ? "..." : pendingApplications}
                icon={<Clock size={18} />}
                color="amber"
              />

              <ApplicationStat
                label="Accepted"
                value={loading ? "..." : acceptedApplications}
                icon={<CheckCircle size={18} />}
                color="emerald"
              />

              <ApplicationStat
                label="Rejected"
                value={loading ? "..." : rejectedApplications}
                icon={<X size={18} />}
                color="terracotta"
              />
            </div>
          </section>

          {/* =====================================
              ACTIVE COLLABORATIONS
          ====================================== */}
          <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#2B241F] tracking-tight">
                  Active Collaborations
                </h2>
                <p className="text-xs text-[#4A3A2E]/70">
                  Open your accepted collaboration workspace
                </p>
              </div>

              {acceptedApplications > 0 && (
                <button
                  onClick={handleWorkspaceNavigation}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white text-xs font-bold transition shadow-xs"
                >
                  Open Workspace
                  <ArrowUpRight size={15} />
                </button>
              )}
            </div>

            {acceptedApplications === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-[#D7C9B8] bg-[#EDE7DC]/30 p-6 text-center">
                <Users size={28} className="mx-auto text-[#4A3A2E]/40" />
                <p className="mt-2 font-bold text-[#2B241F] text-sm">
                  No active collaboration
                </p>
                <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                  When a brand accepts your application, your active workspace will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {applications
                  .filter((application) => application.status === "accepted")
                  .slice(0, 3)
                  .map((application) => {
                    const campaign = getCampaignFromApplication(application);
                    const campaignId =
                      application.campaignId?._id || application.campaignId;

                    return (
                      <div
                        key={application._id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 hover:border-[#8B6F5A] transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#8B6F5A] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                            {(campaign?.brandName || "BR")
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="text-xs font-bold text-[#8B6F5A]">
                              {campaign?.brandName || "Brand"}
                            </p>
                            <h3 className="font-bold text-[#2B241F] text-sm mt-0.5">
                              {campaign?.title || "Campaign"}
                            </h3>
                            <p className="text-xs text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                              <CheckCircle size={12} /> Accepted collaboration
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (!campaignId) {
                              alert("Campaign information is unavailable.");
                              return;
                            }
                            navigate(
                              `/collaboration-workspace?campaignId=${campaignId}&applicationId=${application._id}`
                            );
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#FAF9F6] border border-[#D7C9B8] text-[#2B241F] hover:text-[#8B6F5A] hover:border-[#8B6F5A] text-xs font-bold transition shadow-2xs"
                        >
                          Open Workspace
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>

          {/* =====================================
              UPCOMING DEADLINES
          ====================================== */}
          <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <Clock size={18} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#2B241F] tracking-tight">
                  Upcoming Deadlines
                </h2>
                <p className="text-xs text-[#4A3A2E]/70">
                  Keep track of campaign deadlines & submissions
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {loading ? (
                <div className="md:col-span-3 p-6 rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 text-center text-[#4A3A2E]/50 text-sm">
                  Loading upcoming deadlines...
                </div>
              ) : upcomingDeadlines.length === 0 ? (
                <div className="md:col-span-3 p-6 rounded-xl border border-dashed border-[#D7C9B8] bg-[#EDE7DC]/30 text-center">
                  <Clock size={28} className="mx-auto text-amber-600" />
                  <p className="font-bold text-[#2B241F] text-sm mt-2">
                    No upcoming deadlines
                  </p>
                  <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                    Accepted campaign deadlines will appear here.
                  </p>
                </div>
              ) : (
                upcomingDeadlines.map(({ application, campaign }) => {
                  const deadline = campaign?.applicationDeadline;
                  const daysLeft = getDaysLeft(deadline);

                  return (
                    <DeadlineCard
                      key={application._id}
                      campaign={campaign?.title || "Campaign"}
                      date={formatDate(deadline)}
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
        </div>
      </main>
    </div>
  );
};

/* =====================================================
   SIDEBAR ITEM COMPONENT
===================================================== */
const SidebarItem = ({ icon, label, active, onClick, badge }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between
        px-3.5 py-2.5 rounded-xl
        text-xs font-semibold
        transition
        ${
          active
            ? "bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8] shadow-2xs font-bold"
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
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8B6F5A] text-white">
          {badge}
        </span>
      )}
    </button>
  );
};

/* =====================================================
   STAT CARD COMPONENT
===================================================== */
const StatCard = ({ title, value, change, icon, color = "mocha" }) => {
  const colorMap = {
    mocha: "bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]",
    latte: "bg-[#EDE7DC] text-[#A78B7F] border-[#D7C9B8]",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-5 shadow-xs hover:shadow-sm hover:border-[#8B6F5A] transition">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#4A3A2E]/70">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.mocha}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-end justify-between mt-4">
        <p className="text-2xl font-black text-[#2B241F]">{value}</p>
        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <TrendingUp size={12} />
          {change}
        </span>
      </div>
    </div>
  );
};

/* =====================================================
   CAMPAIGN CARD COMPONENT
===================================================== */
const CampaignCard = ({ brand, title, category, budget, status }) => {
  const statusText =
    status?.charAt(0).toUpperCase() + status?.slice(1) || "Pending";

  const getStatusBadge = (st) => {
    switch (st?.toLowerCase()) {
      case "accepted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="p-4 rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] hover:border-[#8B6F5A] hover:shadow-2xs transition">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#8B6F5A] text-white flex items-center justify-center text-sm font-bold shadow-xs">
            {(brand || "BR").substring(0, 2).toUpperCase()}
          </div>

          <div>
            <p className="text-xs font-bold text-[#8B6F5A]">{brand}</p>
            <h3 className="font-bold text-[#2B241F] text-sm mt-0.5">{title}</h3>
            <p className="text-xs text-[#4A3A2E]/70 mt-0.5">{category}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-extrabold text-[#2B241F]">{budget}</p>
            <p className="text-[11px] text-[#4A3A2E]/60">Budget</p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
              status
            )}`}
          >
            {statusText}
          </span>
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   APPLICATION STAT COMPONENT
===================================================== */
const ApplicationStat = ({ label, value, icon, color = "mocha" }) => {
  const colorMap = {
    mocha: "bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    terracotta: "bg-red-50 text-[#C98B6B] border-red-200",
  };

  return (
    <div className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#4A3A2E]/70">{label}</p>
        <span className={`p-2 rounded-xl border ${colorMap[color] || colorMap.mocha}`}>
          {icon}
        </span>
      </div>

      <p className="text-2xl font-black text-[#2B241F] mt-3">{value}</p>
    </div>
  );
};

/* =====================================================
   QUICK ACTION COMPONENT
===================================================== */
const QuickAction = ({ icon, title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 p-4 rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] hover:border-[#8B6F5A] hover:bg-[#EDE7DC]/30 transition text-left shadow-xs group"
    >
      <div className="p-2.5 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8] group-hover:scale-105 transition">
        {icon}
      </div>

      <div className="flex-1">
        <p className="font-bold text-[#2B241F] text-sm">{title}</p>
        <p className="text-xs text-[#4A3A2E]/70 mt-0.5">{description}</p>
      </div>

      <ChevronRight size={16} className="text-[#4A3A2E]/40 group-hover:text-[#8B6F5A] transition" />
    </button>
  );
};

/* =====================================================
   DEADLINE CARD COMPONENT
===================================================== */
const DeadlineCard = ({ campaign, date, days }) => {
  return (
    <div className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-4 shadow-xs hover:border-[#8B6F5A] transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-[#2B241F] text-sm">{campaign}</h3>
          <p className="text-xs text-[#4A3A2E]/70 mt-1">Deadline: {date}</p>
        </div>

        <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={16} />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#D7C9B8]/60">
        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          {days}
        </span>
      </div>
    </div>
  );
};

/* =====================================================
   GET INITIALS HELPER
===================================================== */
const getInitials = (name) => {
  if (!name) return "CR";

  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

export default CreatorDashboard;