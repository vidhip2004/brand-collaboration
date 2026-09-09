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
} from "lucide-react";

import axios from "axios";
import authService from "../../services/authService";
import {
  getCurrencyFromCountry,
  formatCurrency,
  convertCurrency,
} from "../../services/currency";

const CAMPAIGN_API_URL = "http://localhost:5000/api/campaigns";
const APPLICATION_API_URL = "http://localhost:5000/api/applications";

const CreatorDashboard = () => {
  const navigate = useNavigate();

  const user = authService.getCurrentUser();

  const creatorCurrency =
    getCurrencyFromCountry(
      user?.country
    );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const [applications, setApplications] = useState([]);
  const [publishedCampaigns, setPublishedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const [convertedBudgets, setConvertedBudgets] =
    useState({});

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id || user.role !== "creator") {
        setLoading(false);
        return;
      }

      setLoading(true);
      setDashboardError("");

      try {
        const [applicationsResponse, campaignsResponse] =
          await Promise.all([
            axios.get(
              `${APPLICATION_API_URL}/creator/${user.id}`
            ),
            axios.get(CAMPAIGN_API_URL),
          ]);

        const applicationData =
          applicationsResponse.data?.applications ||
          applicationsResponse.data?.data ||
          [];

        const campaignData =
          campaignsResponse.data?.campaigns ||
          campaignsResponse.data?.data ||
          [];

        setApplications(
          Array.isArray(applicationData)
            ? applicationData
            : []
        );

        setPublishedCampaigns(
          Array.isArray(campaignData)
            ? campaignData
            : []
        );
        if (Array.isArray(campaignData)) {
          loadConvertedBudgets(
            campaignData
          );
        }
      } catch (error) {
        console.error(
          "Creator dashboard error:",
          error
        );

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

  const totalApplications =
    applications.length;

  const pendingApplications =
    applications.filter(
      (application) =>
        application.status === "pending"
    ).length;

  const acceptedApplications =
    applications.filter(
      (application) =>
        application.status === "accepted"
    ).length;

  const rejectedApplications =
    applications.filter(
      (application) =>
        application.status === "rejected"
    ).length;

  // Accepted application = active collaboration
  const activeCollaborations =
    acceptedApplications;

  const successRate =
    totalApplications > 0
      ? Math.round(
        (acceptedApplications /
          totalApplications) *
        100
      )
      : 0;

  // ==========================================
  // RECENT APPLICATIONS
  // ==========================================

  const recentApplications = [
    ...applications,
  ]
    .sort(
      (a, b) =>
        new Date(
          b.createdAt || 0
        ).getTime() -
        new Date(
          a.createdAt || 0
        ).getTime()
    )
    .slice(0, 3);

  // ==========================================
  // UPCOMING DEADLINES
  // ==========================================

  const getCampaignFromApplication = (
    application
  ) => {
    if (!application) return null;

    if (
      application.campaignId &&
      typeof application.campaignId ===
      "object"
    ) {
      return application.campaignId;
    }

    return publishedCampaigns.find(
      (campaign) =>
        String(campaign._id) ===
        String(application.campaignId)
    );
  };

  const upcomingDeadlines =
    applications
      .map((application) => ({
        application,
        campaign:
          getCampaignFromApplication(
            application
          ),
      }))
      .filter(({ campaign }) => {
        const deadline =
          campaign?.applicationDeadline;

        if (!deadline) return false;

        return (
          new Date(deadline).getTime() >
          Date.now()
        );
      })
      .sort(
        (a, b) =>
          new Date(
            a.campaign.applicationDeadline
          ).getTime() -
          new Date(
            b.campaign.applicationDeadline
          ).getTime()
      )
      .slice(0, 3);

  const availableCampaigns =
    publishedCampaigns.length;

  // ==========================================
  // USER DATA
  // ==========================================

  const creatorName =
    user?.name || "Creator";

  const username =
    user?.username ||
    user?.instagramHandle ||
    "creator";

  const email =
    user?.email ||
    "No email available";

  const niche =
    user?.niche ||
    user?.primaryNiche ||
    "Content Creator";

  const country =
    user?.country || "India";

  // ==========================================
  // HELPERS
  // ==========================================

  const formatBudget = (
    campaign
  ) => {
    if (!campaign) {
      return "Budget not specified";
    }

    const converted =
      convertedBudgets[campaign._id];

    if (converted === undefined) {
      return "Calculating...";
    }

    return formatCurrency(
      converted,
      creatorCurrency.code
    );
  };

  const formatDate = (date) => {
    if (!date)
      return "Date not available";

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Date not available";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getDaysLeft = (date) => {
    if (!date) return null;

    const deadline =
      new Date(date).getTime();

    if (Number.isNaN(deadline))
      return null;

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
  // WORKSPACE NAVIGATION
  // ==========================================

  const handleWorkspaceNavigation = () => {
    setActiveMenu("workspace");
    setSidebarOpen(false);

    const acceptedApplication =
      applications.find(
        (item) =>
          item?.status === "accepted"
      );

    if (!acceptedApplication) {
      alert(
        "You do not have any accepted collaborations yet."
      );
      return;
    }

    const campaignId =
      acceptedApplication.campaignId?._id ||
      acceptedApplication.campaignId;

    if (
      !campaignId ||
      !acceptedApplication._id
    ) {
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
      navigate(
        "/creator/discover-campaigns"
      );
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
            You need to login to access your
            creator dashboard.
          </p>

          <button
            onClick={() =>
              navigate("/login")
            }
            className="mt-6 bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-xl font-semibold transition"
          >
            Go to Login
          </button>

        </div>
      </div>
    );
  }


  const loadConvertedBudgets = async (
    campaigns
  ) => {
    try {
      const targetCurrency =
        creatorCurrency.code;

      const results = {};

      for (const campaign of campaigns) {
        if (!campaign?.budget) {
          continue;
        }

        const sourceCurrency =
          campaign.currency || "INR";

        const converted =
          await convertCurrency(
            campaign.budget,
            sourceCurrency,
            targetCurrency
          );

        results[campaign._id] = converted;
      }

      setConvertedBudgets(results);
    } catch (error) {
      console.error(
        "Budget conversion error:",
        error
      );
    }
  };

  // ==========================================
  // MAIN DASHBOARD
  // ==========================================

  return (
    <div className="dashboard-light min-h-screen bg-[#070b14] text-white">

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* =====================================
          SIDEBAR
      ====================================== */}

      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-72
          bg-[#0a0f1c]
          border-r border-white/10
          transition-transform duration-300
          ${sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
          }
          lg:translate-x-0
        `}
      >

        {/* Logo */}

        <div className="h-20 px-6 flex items-center justify-between border-b border-white/10">

          <div>

            <h2 className="text-xl font-bold">
              Brand
              <span className="text-violet-400">
                Verse
              </span>
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Creator Panel
            </p>

          </div>

          <button
            className="lg:hidden p-2 rounded-lg hover:bg-white/5"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X size={20} />
          </button>

        </div>

        {/* Creator Mini Profile */}

        <div className="px-5 py-5 border-b border-white/10">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center font-bold">
              {getInitials(creatorName)}
            </div>

            <div className="min-w-0">

              <p className="font-semibold truncate">
                {creatorName}
              </p>

              <p className="text-xs text-gray-500 truncate">
                {username}
              </p>

            </div>

          </div>

        </div>

        {/* Navigation */}

        <nav className="px-4 py-6 space-y-2">

          <SidebarItem
            icon={
              <LayoutDashboard size={19} />
            }
            label="Dashboard"
            active={
              activeMenu === "dashboard"
            }
            onClick={() =>
              handleMenuClick(
                "dashboard"
              )
            }
          />

          <SidebarItem
            icon={
              <Search size={19} />
            }
            label="Discover Campaigns"
            active={
              activeMenu === "discover"
            }
            onClick={() =>
              handleMenuClick(
                "discover"
              )
            }
          />

          {/* WORKSPACE */}

          <SidebarItem
            icon={
              <LayoutGrid size={19} />
            }
            label="Workspace"
            active={
              activeMenu === "workspace"
            }
            onClick={
              handleWorkspaceNavigation
            }
          />

          <SidebarItem
            icon={
              <MessageCircle size={19} />
            }
            label="Messages"
            active={
              activeMenu === "messages"
            }
            onClick={() =>
              handleMenuClick(
                "messages"
              )
            }
          />

          <SidebarItem
            icon={
              <Wallet size={19} />
            }
            label="Earnings"
            active={
              activeMenu === "earnings"
            }
            onClick={() =>
              handleMenuClick(
                "earnings"
              )
            }
          />

          <SidebarItem
            icon={
              <Bell size={19} />
            }
            label="Notifications"
            active={
              activeMenu ===
              "notifications"
            }
            onClick={() =>
              handleMenuClick(
                "notifications"
              )
            }
          />

          <div className="pt-5 mt-5 border-t border-white/10">

            <SidebarItem
              icon={
                <User size={19} />
              }
              label="My Profile"
              active={
                activeMenu === "profile"
              }
              onClick={() =>
                handleMenuClick(
                  "profile"
                )
              }
            />

            <SidebarItem
              icon={
                <Settings size={19} />
              }
              label="Settings"
              active={
                activeMenu === "settings"
              }
              onClick={() =>
                handleMenuClick(
                  "settings"
                )
              }
            />

          </div>

        </nav>

        {/* Logout */}

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

      {/* =====================================
          MAIN
      ====================================== */}

      <main className="lg:ml-72 min-h-screen">

        {/* TOP NAVBAR */}

        <header className="sticky top-0 z-30 h-20 bg-[#070b14]/90 backdrop-blur-xl border-b border-white/10">

          <div className="h-full px-5 md:px-8 flex items-center justify-between">

            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="lg:hidden p-2 rounded-lg hover:bg-white/5"
            >
              <Menu size={24} />
            </button>

            <div className="hidden lg:block">

              <p className="text-sm text-gray-400">
                Creator Dashboard
              </p>

              <h1 className="text-xl font-bold">
                Welcome back,{" "}
                {
                  creatorName.split(
                    " "
                  )[0]
                }{" "}
                👋
              </h1>

            </div>

            <div className="flex items-center gap-4 ml-auto">

              <button
                onClick={() =>
                  handleMenuClick(
                    "notifications"
                  )
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
                  navigate(
                    "/creator/creatorProfile"
                  )
                }
                className="flex items-center gap-3"
              >

                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center font-bold">
                  {getInitials(
                    creatorName
                  )}
                </div>

                <div className="hidden md:block text-left">

                  <p className="text-sm font-semibold">
                    {creatorName}
                  </p>

                  <p className="text-xs text-gray-500">
                    Creator
                  </p>

                </div>

              </button>

            </div>

          </div>

        </header>

        {/* CONTENT */}

        <div className="p-5 md:p-8 max-w-7xl mx-auto">

          {/* MOBILE WELCOME */}

          <div className="lg:hidden mb-7">

            <p className="text-sm text-gray-400">
              Creator Dashboard
            </p>

            <h1 className="text-2xl font-bold mt-1">
              Welcome back,{" "}
              {
                creatorName.split(
                  " "
                )[0]
              }{" "}
              👋
            </h1>

          </div>

          {/* ERROR */}

          {dashboardError && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              {dashboardError}
            </div>
          )}

          {/* PROFILE SUMMARY */}

          <section className="rounded-2xl border border-white/10 bg-gradient-to-r from-violet-500/10 via-white/[0.03] to-cyan-500/10 p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div className="flex items-center gap-5">

                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-2xl font-bold shadow-lg shadow-violet-500/20">
                  {getInitials(
                    creatorName
                  )}
                </div>

                <div>

                  <h2 className="text-2xl font-bold">
                    {creatorName}
                  </h2>

                  <p className="text-gray-400 mt-1">
                    {niche}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {country} • {email}
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  navigate(
                    "/creator/profile"
                  )
                }
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition"
              >
                <User size={17} />
                View Profile
              </button>

            </div>

          </section>

          {/* =====================================
              STAT CARDS
          ====================================== */}

          <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-7">

            <StatCard
              title="Active Collaborations"
              value={
                loading
                  ? "..."
                  : activeCollaborations
              }
              change={
                acceptedApplications > 0
                  ? "Active"
                  : "None"
              }
              icon={
                <Users size={20} />
              }
            />

            <StatCard
              title="Total Applications"
              value={
                loading
                  ? "..."
                  : totalApplications
              }
              change={
                totalApplications > 0
                  ? `${successRate}% success`
                  : "Start applying"
              }
              icon={
                <Briefcase size={20} />
              }
            />

            <StatCard
              title="Pending Applications"
              value={
                loading
                  ? "..."
                  : pendingApplications
              }
              change={
                pendingApplications > 0
                  ? "Waiting"
                  : "All clear"
              }
              icon={
                <Clock size={20} />
              }
            />

            <StatCard
              title="Available Campaigns"
              value={
                loading
                  ? "..."
                  : availableCampaigns
              }
              change="Explore"
              icon={
                <Search size={20} />
              }
            />

          </section>

          {/* =====================================
              QUICK ACTIONS
          ====================================== */}

          <section className="mt-7">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-xl font-bold">
                  Quick Actions
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Manage your creator activities.
                </p>

              </div>

            </div>

            <div className="grid md:grid-cols-3 gap-4">

              <QuickAction
                icon={
                  <Search size={19} />
                }
                title="Discover Campaigns"
                description="Find new brand collaboration opportunities."
                onClick={() =>
                  handleMenuClick(
                    "discover"
                  )
                }
              />

              <QuickAction
                icon={
                  <LayoutGrid size={19} />
                }
                title="Open Workspace"
                description="View accepted collaborations, messages and deliverables."
                onClick={
                  handleWorkspaceNavigation
                }
              />

              <QuickAction
                icon={
                  <Wallet size={19} />
                }
                title="View Earnings"
                description="Track your collaboration earnings."
                onClick={() =>
                  handleMenuClick(
                    "earnings"
                  )
                }
              />

            </div>

          </section>

          {/* =====================================
              RECENT APPLICATIONS
          ====================================== */}

          <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-xl font-bold">
                  Recent Applications
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Latest campaigns you applied to.
                </p>

              </div>

              <div className="text-xs text-gray-500">
                {totalApplications} total
              </div>

            </div>

            {loading ? (
              <div className="py-10 text-center text-gray-400">
                Loading applications...
              </div>
            ) : recentApplications.length ===
              0 ? (
              <div className="py-10 text-center">

                <Briefcase
                  size={32}
                  className="mx-auto text-gray-600"
                />

                <p className="mt-4 font-semibold">
                  No applications yet
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Start discovering campaigns and apply to brands.
                </p>

                <button
                  onClick={() =>
                    handleMenuClick(
                      "discover"
                    )
                  }
                  className="mt-5 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-sm font-semibold"
                >
                  Discover Campaigns
                </button>

              </div>
            ) : (
              <div className="space-y-3">

                {recentApplications.map(
                  (application) => {
                    const campaign =
                      getCampaignFromApplication(
                        application
                      );

                    return (
                      <CampaignCard
                        key={
                          application._id
                        }
                        brand={
                          campaign?.brandName ||
                          "Brand"
                        }
                        title={
                          campaign?.title ||
                          "Campaign"
                        }
                        category={
                          campaign?.category ||
                          "Campaign"
                        }
                        budget={formatBudget(
                          campaign
                        )}
                        status={
                          application.status ||
                          "pending"
                        }
                      />
                    );
                  }
                )}

              </div>
            )}

          </section>

          {/* =====================================
              APPLICATION OVERVIEW
          ====================================== */}

          <section className="mt-7">

            <div className="flex items-center gap-3 mb-6">

              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                <Briefcase size={20} />
              </div>

              <div>

                <h2 className="text-xl font-bold">
                  Application Overview
                </h2>

                <p className="text-sm text-gray-400">
                  Track the status of your applications.
                </p>

              </div>

            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <ApplicationStat
                label="Total"
                value={
                  loading
                    ? "..."
                    : totalApplications
                }
                icon={
                  <Briefcase size={18} />
                }
              />

              <ApplicationStat
                label="Pending"
                value={
                  loading
                    ? "..."
                    : pendingApplications
                }
                icon={
                  <Clock size={18} />
                }
              />

              <ApplicationStat
                label="Accepted"
                value={
                  loading
                    ? "..."
                    : acceptedApplications
                }
                icon={
                  <CheckCircle
                    size={18}
                  />
                }
              />

              <ApplicationStat
                label="Rejected"
                value={
                  loading
                    ? "..."
                    : rejectedApplications
                }
                icon={
                  <X size={18} />
                }
              />

            </div>

          </section>

          {/* =====================================
              ACTIVE COLLABORATION
          ====================================== */}

          <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>

                <h2 className="text-xl font-bold">
                  Active Collaboration
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Open your accepted collaboration workspace.
                </p>

              </div>

              {acceptedApplications >
                0 && (
                  <button
                    onClick={
                      handleWorkspaceNavigation
                    }
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 font-semibold transition"
                  >
                    Open Workspace
                    <ArrowUpRight
                      size={17}
                    />
                  </button>
                )}

            </div>

            {acceptedApplications ===
              0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-white/10 p-7 text-center">

                <Users
                  size={30}
                  className="mx-auto text-gray-600"
                />

                <p className="mt-3 font-semibold">
                  No active collaboration
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  When a brand accepts your application, your workspace will appear here.
                </p>

              </div>
            ) : (
              <div className="mt-6 space-y-3">

                {applications
                  .filter(
                    (application) =>
                      application.status ===
                      "accepted"
                  )
                  .slice(0, 3)
                  .map(
                    (application) => {
                      const campaign =
                        getCampaignFromApplication(
                          application
                        );

                      const campaignId =
                        application
                          .campaignId?._id ||
                        application.campaignId;

                      return (
                        <div
                          key={
                            application._id
                          }
                          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-xl border border-violet-500/20 bg-violet-500/[0.04]"
                        >

                          <div className="flex items-center gap-4">

                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center text-violet-400 font-bold">
                              {(
                                campaign?.brandName ||
                                "BR"
                              )
                                .substring(
                                  0,
                                  2
                                )
                                .toUpperCase()}
                            </div>

                            <div>

                              <p className="text-xs text-violet-400">
                                {campaign?.brandName ||
                                  "Brand"}
                              </p>

                              <h3 className="font-semibold mt-1">
                                {campaign?.title ||
                                  "Campaign"}
                              </h3>

                              <p className="text-xs text-gray-500 mt-1">
                                Accepted collaboration
                              </p>

                            </div>

                          </div>

                          <button
                            onClick={() => {
                              if (
                                !campaignId
                              ) {
                                alert(
                                  "Campaign information is unavailable."
                                );
                                return;
                              }

                              navigate(
                                `/collaboration-workspace?campaignId=${campaignId}&applicationId=${application._id}`
                              );
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-violet-500/20 text-violet-300 hover:bg-violet-500/10 transition"
                          >
                            Open Workspace
                            <ArrowUpRight
                              size={16}
                            />
                          </button>

                        </div>
                      );
                    }
                  )}

              </div>
            )}

          </section>

          {/* =====================================
              PROFILE COMPLETION
          ====================================== */}

          <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  Profile Strength
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Complete your profile to improve your chances of collaboration.
                </p>

              </div>

              <span className="text-2xl font-bold text-violet-400">
                {Math.min(
                  100,
                  60 +
                  (user?.name
                    ? 10
                    : 0) +
                  (user?.email
                    ? 10
                    : 0) +
                  (user?.niche
                    ? 10
                    : 0) +
                  (user?.instagramHandle
                    ? 10
                    : 0)
                )}
                %
              </span>

            </div>

            <div className="mt-5 h-3 rounded-full bg-white/5 overflow-hidden">

              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                style={{
                  width: `${Math.min(
                    100,
                    60 +
                    (user?.name
                      ? 10
                      : 0) +
                    (user?.email
                      ? 10
                      : 0) +
                    (user?.niche
                      ? 10
                      : 0) +
                    (user?.instagramHandle
                      ? 10
                      : 0)
                  )}%`,
                }}
              />

            </div>

            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <CompletionItem
                label="Name"
                completed={Boolean(
                  user?.name
                )}
              />

              <CompletionItem
                label="Email"
                completed={Boolean(
                  user?.email
                )}
              />

              <CompletionItem
                label="Niche"
                completed={Boolean(
                  user?.niche
                )}
              />

              <CompletionItem
                label="Instagram"
                completed={Boolean(
                  user?.instagramHandle
                )}
              />

            </div>

          </section>

          {/* =====================================
              UPCOMING DEADLINES
          ====================================== */}

          <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                <Clock size={20} />
              </div>

              <div>

                <h2 className="text-xl font-bold">
                  Upcoming Deadlines
                </h2>

                <p className="text-sm text-gray-400">
                  Keep track of your active collaborations
                </p>

              </div>

            </div>

            <div className="grid md:grid-cols-3 gap-4">

              {loading ? (
                <div className="md:col-span-3 p-6 rounded-xl border border-white/10 bg-[#0d1421] text-center text-gray-400">
                  Loading upcoming deadlines...
                </div>
              ) : upcomingDeadlines.length ===
                0 ? (
                <div className="md:col-span-3 p-6 rounded-xl border border-white/10 bg-[#0d1421] text-center">

                  <Clock
                    size={28}
                    className="mx-auto text-orange-400"
                  />

                  <p className="font-semibold mt-3">
                    No upcoming deadlines
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Accepted campaign deadlines will appear here.
                  </p>

                </div>
              ) : (
                upcomingDeadlines.map(
                  ({
                    application,
                    campaign,
                  }) => {
                    const deadline =
                      campaign?.applicationDeadline;

                    const daysLeft =
                      getDaysLeft(
                        deadline
                      );

                    return (
                      <DeadlineCard
                        key={
                          application._id
                        }
                        campaign={
                          campaign?.title ||
                          "Campaign"
                        }
                        date={formatDate(
                          deadline
                        )}
                        days={
                          daysLeft === null
                            ? "Deadline unavailable"
                            : daysLeft ===
                              1
                              ? "1 day left"
                              : `${daysLeft} days left`
                        }
                      />
                    );
                  }
                )
              )}

            </div>

          </section>

          {/* =====================================
              FOOTER
          ====================================== */}

          <section className="mt-7 mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div>

                <p className="text-sm text-gray-500">
                  Logged in as
                </p>

                <p className="font-semibold mt-1">
                  {email}
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  {country} • {niche}
                </p>

              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition"
              >
                <LogOut size={17} />
                Logout
              </button>

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
        ${active
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
  brand,
  title,
  category,
  budget,
  status,
}) => {
  const statusText =
    status?.charAt(0).toUpperCase() +
    status?.slice(1) ||
    "Pending";

  return (
    <div className="p-4 rounded-xl border border-white/10 bg-[#0d1421] hover:border-violet-500/30 transition">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center text-lg font-bold text-violet-400">
            {(brand || "BR")
              .substring(0, 2)
              .toUpperCase()}
          </div>

          <div>

            <p className="text-xs text-violet-400">
              {brand}
            </p>

            <h3 className="font-semibold mt-1">
              {title}
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              {category}
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

          <span className="px-3 py-1 rounded-full text-xs bg-violet-500/10 border border-violet-500/20 text-violet-300">
            {statusText}
          </span>

        </div>

      </div>

    </div>
  );
};

/* =====================================================
   COMPLETION ITEM
===================================================== */

const CompletionItem = ({
  label,
  completed,
}) => {
  return (
    <div className="flex items-center justify-between">

      <span className="text-sm text-gray-300">
        {label}
      </span>

      {completed ? (
        <CheckCircle
          size={18}
          className="text-green-400"
        />
      ) : (
        <div className="w-[18px] h-[18px] rounded-full border border-gray-600" />
      )}

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
   GET INITIALS
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