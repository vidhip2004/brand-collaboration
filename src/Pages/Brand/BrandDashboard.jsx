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
        const [campaignsResponse, applicationsResponse] =
          await Promise.all([
            axios.get(`${CAMPAIGN_API_URL}/brand/${user.id}`),
            axios.get(`${APPLICATION_API_URL}/brand/${user.id}`),
          ]);

        const campaignData =
          campaignsResponse.data?.campaigns ||
          campaignsResponse.data?.data ||
          [];

        const applicationData =
          applicationsResponse.data?.applications ||
          applicationsResponse.data?.data ||
          [];

        setCampaigns(
          Array.isArray(campaignData) ? campaignData : []
        );

        setApplications(
          Array.isArray(applicationData) ? applicationData : []
        );
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

 const brandCurrency =
  getCurrencyFromCountry(country);

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
      // Change this route later if your Find Creators page
      // uses a different path.
      navigate("/brand/find-creators");
    }

    if (menu === "messages") {
      navigate("/messages");
    }

    if (menu === "earnings") {
      navigate("/brand/earnings");
    }

      if( menu === "notifications") {
      navigate("/notifications");
    }
  };

  // ==========================================
  // IF USER IS NOT LOGGED IN
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <User
              size={35}
              className="text-red-400"
            />
          </div>

          <h1 className="text-2xl font-bold mt-6">
            Please Login
          </h1>

          <p className="text-gray-400 mt-2">
            You need to login to access your brand dashboard.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-6 bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-xl font-semibold transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          w-72
          bg-[#0b1020]
          border-r border-white/10
          transform transition-transform duration-300
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div className="h-20 px-6 flex items-center justify-between border-b border-white/10">
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-extrabold tracking-wide"
          >
            Brand<span className="text-violet-500">Verse</span>
          </button>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center font-bold text-lg">
              {getInitials(brandName)}
            </div>

            <div className="min-w-0">
              <h3 className="font-semibold truncate">
                {brandName}
              </h3>

              <p className="text-xs text-violet-400 truncate">
                Brand Account
              </p>
            </div>
          </div>
        </div>

        <nav className="px-4 py-6 space-y-2">
          <SidebarItem
            icon={<LayoutDashboard size={19} />}
            label="Dashboard"
            active={activeMenu === "dashboard"}
            onClick={() =>
              handleMenuClick("dashboard")
            }
          />

          <SidebarItem
            icon={<Search size={19} />}
            label="Find Creators"
            active={activeMenu === "creators"}
            onClick={() =>
              handleMenuClick("creators")
            }
          />

          <SidebarItem
            icon={<Briefcase size={19} />}
            label="My Campaigns"
            active={activeMenu === "campaigns"}
            onClick={() =>
              handleMenuClick("campaigns")
            }
          />

          <SidebarItem
            icon={<UserCheck size={19} />}
            label="Applications"
            active={activeMenu === "applications"}
            onClick={() =>
              handleMenuClick("applications")
            }
          />

          <SidebarItem
            icon={<MessageCircle size={19} />}
            label="Messages"
            active={activeMenu === "messages"}
            onClick={() =>
              handleMenuClick("messages")
            }
          />

          <SidebarItem
            icon={<Wallet size={19} />}
            label="Payments"
            active={activeMenu === "earnings"}
            onClick={() =>
              handleMenuClick("earnings")
            }
          />

          <SidebarItem
            icon={<Bell size={19} />}
            label="Notifications"
            active={activeMenu === "notifications"}
            onClick={() =>
              handleMenuClick("notifications")
            }
          />

          <div className="pt-5 mt-5 border-t border-white/10">
            <SidebarItem
              icon={<User size={19} />}
              label="Company Profile"
              active={activeMenu === "profile"}
              onClick={() =>
                handleMenuClick("profile")
              }
            />

            <SidebarItem
              icon={<Settings size={19} />}
              label="Settings"
              active={activeMenu === "settings"}
              onClick={() =>
                handleMenuClick("settings")
              }
            />
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-72 min-h-screen">
        {/* TOP NAVBAR */}
        <header className="sticky top-0 z-30 h-20 bg-[#070b14]/90 backdrop-blur-xl border-b border-white/10">
          <div className="h-full px-5 md:px-8 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5"
            >
              <Menu size={24} />
            </button>

            <div className="hidden lg:block">
              <p className="text-sm text-gray-400">
                Brand Dashboard
              </p>

              <h1 className="text-xl font-bold">
                Welcome back,{" "}
                {contactPerson.split(" ")[0]} 👋
              </h1>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <button
                onClick={() =>
                  handleMenuClick("notifications")
                }
                className="relative p-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/10 transition"
              >
                <Bell size={19} />

                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-violet-600 text-[10px] flex items-center justify-center font-bold">
                  {pendingApplications}
                </span>
              </button>

              <button
                onClick={() =>
                  navigate("/brand/profile")
                }
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center font-bold">
                  {getInitials(brandName)}
                </div>

                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold">
                    {brandName}
                  </p>

                  <p className="text-xs text-gray-500">
                    Brand
                  </p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="p-5 md:p-8 max-w-7xl mx-auto">
          {dashboardError && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-300">
              {dashboardError}
            </div>
          )}

          {/* Mobile Welcome */}
          <div className="lg:hidden mb-7">
            <p className="text-sm text-gray-400">
              Brand Dashboard
            </p>

            <h1 className="text-2xl font-bold mt-1">
              Welcome back,{" "}
              {contactPerson.split(" ")[0]} 👋
            </h1>
          </div>

          {/* COMPANY SUMMARY */}
          <section className="rounded-2xl border border-white/10 bg-gradient-to-r from-violet-500/10 via-white/[0.03] to-cyan-500/10 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-2xl font-bold shadow-lg shadow-violet-500/20">
                  {getInitials(brandName)}
                </div>

                <div>
                  <h2 className="text-2xl font-bold">
                    {brandName}
                  </h2>

                  <p className="text-violet-400 mt-1">
                    {industry}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs">
                      Brand
                    </span>

                    <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-1">
                      <CheckCircle size={13} />
                      Account Active
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate("/brand/create-campaign")
                }
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 font-semibold transition"
              >
                <Plus size={18} />
                Create Campaign
              </button>
            </div>
          </section>

          {/* STATISTICS */}
          <section className="mt-7">
            <div className="mb-5">
              <h2 className="text-xl font-bold">
                Campaign Performance
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Overview of your brand collaboration activity
              </p>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <StatCard
                title="Active Campaigns"
                value={
                  loading ? "..." : activeCampaigns.length
                }
                change={`${draftCampaigns.length} drafts`}
                icon={<Briefcase size={21} />}
              />

              <StatCard
                title="Creators Hired"
                value={
                  loading ? "..." : hiredCreators
                }
                change={`${acceptedApplications} accepted`}
                icon={<Users size={21} />}
              />

              <StatCard
                title="Total Applications"
                value={
                  loading ? "..." : totalApplications
                }
                change={`${pendingApplications} pending`}
                icon={<FileText size={21} />}
              />

              <StatCard
                title="Total Campaign Budget"
                value={
                  loading ? "..." : formatCurrency(totalBudget)
                }
                change={`${formatCurrency(activeBudget)} active`}
                icon={<DollarSign size={21} />}
              />
            </div>
          </section>

          {/* CAMPAIGNS + QUICK ACTIONS */}
          <div className="grid xl:grid-cols-3 gap-6 mt-7">
            <section className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">
                    Active Campaigns
                  </h2>

                  <p className="text-sm text-gray-400 mt-1">
                    Manage your current campaigns
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleMenuClick("campaigns")
                  }
                  className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  View All
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <LoadingBox text="Loading campaigns..." />
                ) : activeCampaigns.length === 0 ? (
                  <EmptyBox
                    icon={<Briefcase size={28} />}
                    title="No active campaigns"
                    description="Create and publish your first campaign to start collaborating with creators."
                    buttonText="Create Campaign"
                    onClick={() =>
                      navigate("/brand/create-campaign")
                    }
                  />
                ) : (
                  activeCampaigns
                    .slice(0, 3)
                    .map((campaign) => (
                      <CampaignCard
                        key={campaign._id}
                        title={campaign.title}
                        category={campaign.category}
                        creators={`${campaign.creatorsNeeded || 0} Creators Needed`}
                        budget={formatFullCurrency(
                          campaign.budget
                        )}
                        status="Active"
                      />
                    ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-xl font-bold">
                Quick Actions
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Manage your brand account
              </p>

              <div className="space-y-3 mt-6">
                <QuickAction
                  icon={<Plus size={19} />}
                  title="Create Campaign"
                  description="Launch a new campaign"
                  onClick={() =>
                    navigate("/brand/create-campaign")
                  }
                />

                <QuickAction
                  icon={<Search size={19} />}
                  title="Find Creators"
                  description="Discover suitable creators"
                  onClick={() =>
                    handleMenuClick("creators")
                  }
                />

                <QuickAction
                  icon={<UserCheck size={19} />}
                  title="Review Applications"
                  description="Check creator applications"
                  onClick={() =>
                    navigate("/brand/applications")
                  }
                />

                <QuickAction
                  icon={<MessageCircle size={19} />}
                  title="Messages"
                  description="Talk to creators"
                  onClick={() =>
                    navigate("/messages")
                  }
                />
              </div>
            </section>
          </div>

          {/* APPLICATION OVERVIEW */}
          <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">
                  Creator Applications
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Review creators who applied to your campaigns
                </p>
              </div>

              <UserCheck
                size={22}
                className="text-violet-400"
              />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ApplicationStat
                label="Total Applications"
                value={
                  loading ? "..." : totalApplications
                }
                icon={<FileText size={19} />}
              />

              <ApplicationStat
                label="Pending Review"
                value={
                  loading ? "..." : pendingApplications
                }
                icon={<Clock size={19} />}
              />

              <ApplicationStat
                label="Rejected"
                value={
                  loading ? "..." : rejectedApplications
                }
                icon={<X size={19} />}
              />

              <ApplicationStat
                label="Hired Creators"
                value={
                  loading ? "..." : hiredCreators
                }
                icon={<CheckCircle size={19} />}
              />
            </div>

            <div className="mt-6 p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                  <TrendingUp size={20} />
                </div>

                <div>
                  <p className="font-semibold">
                    Application success rate:{" "}
                    {loading
                      ? "..."
                      : `${applicationSuccessRate}%`}
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    {totalApplications === 0
                      ? "No creator applications yet."
                      : `${acceptedApplications} of ${totalApplications} applications accepted.`}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                navigate("/brand/applications")
              }
              className="mt-6 w-full py-3 rounded-xl border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition font-semibold"
            >
              Review Applications
            </button>
          </section>

          {/* CAMPAIGN INSIGHTS */}
          <div className="grid lg:grid-cols-2 gap-6 mt-7">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <TrendingUp size={21} />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Campaign Budget
                  </h2>

                  <p className="text-sm text-gray-400">
                    Budget allocated to your campaigns
                  </p>
                </div>
              </div>

              <div className="mt-7">
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-bold">
                    {loading
                      ? "..."
                      : formatCurrency(totalBudget)}
                  </p>

                  <span className="text-green-400 text-sm">
                    {activeCampaigns.length} active
                  </span>
                </div>

                <div className="w-full h-3 bg-gray-800 rounded-full mt-5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                    style={{
                      width:
                        totalBudget > 0
                          ? `${Math.min(
                              (activeBudget /
                                totalBudget) *
                                100,
                              100
                            )}%`
                          : "0%",
                    }}
                  />
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  {formatCurrency(activeBudget)} currently allocated
                  to published campaigns
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
                  <Target size={21} />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Creator Matching
                  </h2>

                  <p className="text-sm text-gray-400">
                    Creators who have interacted with your campaigns
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-3xl font-bold">
                  {loading ? "..." : creatorMatchingCount}
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  unique creators have applied to your campaigns
                </p>
              </div>

              <button
                onClick={() =>
                  handleMenuClick("creators")
                }
                className="mt-5 flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-semibold"
              >
                Discover Creators
                <ArrowUpRight size={16} />
              </button>
            </section>
          </div>

          {/* UPCOMING DEADLINES */}
          <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                <Clock size={20} />
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Upcoming Campaign Deadlines
                </h2>

                <p className="text-sm text-gray-400">
                  Stay on top of your campaign schedule
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
                    icon={<Clock size={28} />}
                    title="No upcoming deadlines"
                    description="Your published campaigns do not have upcoming application deadlines."
                    buttonText="Create Campaign"
                    onClick={() =>
                      navigate("/brand/create-campaign")
                    }
                  />
                </div>
              ) : (
                upcomingDeadlines.map((campaign) => {
                  const daysLeft = getDaysLeft(
                    campaign.applicationDeadline
                  );

                  return (
                    <DeadlineCard
                      key={campaign._id}
                      campaign={
                        campaign.title ||
                        "Campaign"
                      }
                      date={formatDate(
                        campaign.applicationDeadline
                      )}
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
          <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">
                  Recent Campaign Activity
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Your latest campaigns
                </p>
              </div>

              <Briefcase
                size={22}
                className="text-violet-400"
              />
            </div>

            {loading ? (
              <LoadingBox text="Loading campaign activity..." />
            ) : recentCampaigns.length === 0 ? (
              <EmptyBox
                icon={<FileText size={28} />}
                title="No campaigns created yet"
                description="Create your first BrandVerse campaign."
                buttonText="Create Campaign"
                onClick={() =>
                  navigate("/brand/create-campaign")
                }
              />
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {recentCampaigns.map((campaign) => (
                  <div
                    key={campaign._id}
                    className="rounded-xl border border-white/10 bg-[#0d1421] p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">
                          {campaign.title}
                        </h3>

                        <p className="text-xs text-violet-400 mt-2">
                          {campaign.category}
                        </p>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[11px] bg-violet-500/10 border border-violet-500/20 text-violet-300 capitalize">
                        {campaign.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 mt-4 line-clamp-2">
                      {campaign.description ||
                        "No description available."}
                    </p>

                    <div className="flex justify-between mt-5 text-xs">
                      <span className="text-gray-500">
                        Budget
                      </span>

                      <span className="font-semibold">
                        {formatFullCurrency(
                          campaign.budget
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* COMPANY INFORMATION */}
          <section className="mt-7 mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <p className="text-sm text-gray-500">
                  Company Information
                </p>

                <h3 className="text-lg font-semibold mt-1">
                  {brandName}
                </h3>

                <p className="text-sm text-gray-400 mt-2">
                  {email}
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  {country} • {industry}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Instagram: {instagram}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    navigate("/brand/profile")
                  }
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition"
                >
                  <User size={17} />
                  View Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition"
                >
                  <LogOut size={17} />
                  Logout
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

const SidebarItem = ({
  icon,
  label,
  active,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3
        px-4 py-3 rounded-xl
        text-sm font-medium
        transition
        ${
          active
            ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

/* =====================================================
   STAT CARD
===================================================== */

const StatCard = ({
  title,
  value,
  change,
  icon,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-violet-500/30 transition">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">
          {title}
        </span>

        <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
          {icon}
        </div>
      </div>

      <div className="flex items-end justify-between mt-5">
        <p className="text-2xl font-bold">
          {value}
        </p>

        <span className="text-xs text-green-400 flex items-center gap-1">
          <TrendingUp size={13} />
          {change}
        </span>
      </div>
    </div>
  );
};

/* =====================================================
   CAMPAIGN CARD
===================================================== */

const CampaignCard = ({
  title,
  category,
  creators,
  budget,
  status,
}) => {
  return (
    <div className="p-4 rounded-xl border border-white/10 bg-[#0d1421] hover:border-violet-500/30 transition">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center text-violet-400">
            <Briefcase size={21} />
          </div>

          <div>
            <h3 className="font-semibold">
              {title}
            </h3>

            <p className="text-xs text-violet-400 mt-1">
              {category}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {creators}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold">
              {budget}
            </p>

            <p className="text-xs text-gray-500">
              Budget
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs bg-green-500/10 border border-green-500/20 text-green-400 capitalize">
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

const ApplicationStat = ({
  label,
  value,
  icon,
}) => {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1421] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {label}
        </p>

        <span className="text-violet-400">
          {icon}
        </span>
      </div>

      <p className="text-3xl font-bold mt-4">
        {value}
      </p>
    </div>
  );
};

/* =====================================================
   QUICK ACTION
===================================================== */

const QuickAction = ({
  icon,
  title,
  description,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-[#0d1421] hover:border-violet-500/30 hover:bg-violet-500/5 transition text-left"
    >
      <div className="p-2.5 rounded-lg bg-violet-500/10 text-violet-400">
        {icon}
      </div>

      <div className="flex-1">
        <p className="font-semibold text-sm">
          {title}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          {description}
        </p>
      </div>

      <ChevronRight
        size={17}
        className="text-gray-500"
      />
    </button>
  );
};

/* =====================================================
   DEADLINE CARD
===================================================== */

const DeadlineCard = ({
  campaign,
  date,
  days,
}) => {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1421] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">
            {campaign}
          </h3>

          <p className="text-sm text-gray-400 mt-2">
            Deadline: {date}
          </p>
        </div>

        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
          <Clock size={18} />
        </div>
      </div>

      <p className="text-xs text-orange-400 mt-4">
        {days}
      </p>
    </div>
  );
};

/* =====================================================
   LOADING BOX
===================================================== */

const LoadingBox = ({ text }) => {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-[#0d1421] text-center text-gray-400">
      {text}
    </div>
  );
};

/* =====================================================
   EMPTY BOX
===================================================== */

const EmptyBox = ({
  icon,
  title,
  description,
  buttonText,
  onClick,
}) => {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-[#0d1421] text-center">
      <div className="w-12 h-12 mx-auto rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
        {icon}
      </div>

      <p className="font-semibold mt-3">
        {title}
      </p>

      <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
        {description}
      </p>

      {buttonText && (
        <button
          onClick={onClick}
          className="mt-4 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-sm font-semibold transition"
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
