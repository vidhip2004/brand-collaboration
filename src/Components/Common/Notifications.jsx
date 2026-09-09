import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ArrowLeft,
  Briefcase,
  FileCheck,
  FileText,
  MessageCircle,
  UserPlus,
  UserCheck,
  UserX,
  Sparkles,
  Megaphone,
  RefreshCcw,
  Circle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const NOTIFICATION_API =
  "http://localhost:5000/api/notifications";

const notificationIcons = {
  application: UserPlus,
  application_accepted: UserCheck,
  application_rejected: UserX,
  collaboration: Briefcase,
  match: Sparkles,
  message: MessageCircle,
  content_submitted: FileCheck,
  content_approved: Check,
  content_changes_requested: RefreshCcw,
  content_rejected: UserX,
  campaign: Megaphone,
  system: Bell,
};

const notificationIconStyles = {
  application:
    "bg-blue-500/10 text-blue-400 border-blue-500/20",

  application_accepted:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",

  application_rejected:
    "bg-red-500/10 text-red-400 border-red-500/20",

  collaboration:
    "bg-violet-500/10 text-violet-400 border-violet-500/20",

  match:
    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",

  message:
    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",

  content_submitted:
    "bg-orange-500/10 text-orange-400 border-orange-500/20",

  content_approved:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",

  content_changes_requested:
    "bg-orange-500/10 text-orange-400 border-orange-500/20",

  content_rejected:
    "bg-red-500/10 text-red-400 border-red-500/20",

  campaign:
    "bg-pink-500/10 text-pink-400 border-pink-500/20",

  system:
    "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function Notifications() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  /*
  =========================================================
  GET CURRENT USER
  =========================================================
  */

  useEffect(() => {
    const currentUser = authService.getCurrentUser();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    setUser(currentUser);
  }, [navigate]);

  /*
  =========================================================
  FETCH NOTIFICATIONS
  =========================================================
  */

  const loadNotifications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${NOTIFICATION_API}/user/${user.id}`
      );

      setNotifications(
        response.data.notifications || []
      );
    } catch (err) {
      console.error(
        "NOTIFICATIONS LOADING ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user]);

  /*
  =========================================================
  FORMAT DATE
  =========================================================
  */

  const formatNotificationTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();

    const diffInSeconds = Math.floor(
      (now.getTime() - date.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return "Just now";
    }

    const diffInMinutes = Math.floor(
      diffInSeconds / 60
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${
        diffInMinutes !== 1 ? "s" : ""
      } ago`;
    }

    const diffInHours = Math.floor(
      diffInMinutes / 60
    );

    if (diffInHours < 24) {
      return `${diffInHours} hour${
        diffInHours !== 1 ? "s" : ""
      } ago`;
    }

    const diffInDays = Math.floor(
      diffInHours / 24
    );

    if (diffInDays < 7) {
      return `${diffInDays} day${
        diffInDays !== 1 ? "s" : ""
      } ago`;
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /*
  =========================================================
  GET NOTIFICATION ICON
  =========================================================
  */

  const getNotificationIcon = (type) => {
    return (
      notificationIcons[type] || Bell
    );
  };

  /*
  =========================================================
  GET NOTIFICATION ICON STYLE
  =========================================================
  */

  const getNotificationIconStyle = (type) => {
    return (
      notificationIconStyles[type] ||
      notificationIconStyles.system
    );
  };

  /*
  =========================================================
  BUILD NOTIFICATION DESTINATION
  =========================================================

  Important:

  Content review notifications should open:

  /collaboration-workspace
      ?applicationId=XXXX
      &tab=content-review

  This matches your CollaborationWorkspace component.
  =========================================================
  */

  const getNotificationLink = (notification) => {
    /*
    -------------------------------------------------------
    CONTENT SUBMITTED
    -------------------------------------------------------

    Brand receives this notification when creator
    submits content.

    We need the applicationId to open the correct
    collaboration workspace.

    Backend notification should ideally contain:

    /collaboration-workspace?applicationId=XXXX&tab=content-review
    -------------------------------------------------------
    */

    if (
      notification.type ===
        "content_submitted" &&
      notification.link
    ) {
      return notification.link;
    }

    /*
    -------------------------------------------------------
    CONTENT APPROVED / CHANGES / REJECTED
    -------------------------------------------------------

    Creator notifications can continue using the
    creator content submission page.
    -------------------------------------------------------
    */

    if (
      [
        "content_approved",
        "content_changes_requested",
        "content_rejected",
      ].includes(notification.type)
    ) {
      return (
        notification.link ||
        "/creator/content-submission"
      );
    }

    /*
    -------------------------------------------------------
    APPLICATION NOTIFICATIONS
    -------------------------------------------------------
    */

    if (
      notification.type === "application" ||
      notification.type ===
        "application_accepted" ||
      notification.type ===
        "application_rejected"
    ) {
      return (
        notification.link ||
        "/brand/applications"
      );
    }

    /*
    -------------------------------------------------------
    COLLABORATION
    -------------------------------------------------------
    */

    if (
      notification.type ===
      "collaboration"
    ) {
      return (
        notification.link ||
        "/collaboration-workspace"
      );
    }

    /*
    -------------------------------------------------------
    MATCH
    -------------------------------------------------------
    */

    if (
      notification.type === "match"
    ) {
      if (user?.role === "brand") {
        return "/brand/dashboard";
      }

      return "/creator/discover-campaigns";
    }

    /*
    -------------------------------------------------------
    MESSAGE
    -------------------------------------------------------
    */

    if (
      notification.type === "message"
    ) {
      return (
        notification.link ||
        "/collaboration-workspace"
      );
    }

    /*
    -------------------------------------------------------
    CAMPAIGN
    -------------------------------------------------------
    */

    if (
      notification.type === "campaign"
    ) {
      if (user?.role === "brand") {
        return "/brand/dashboard";
      }

      return "/creator/discover-campaigns";
    }

    /*
    -------------------------------------------------------
    FALLBACK
    -------------------------------------------------------
    */

    return notification.link || null;
  };

  /*
  =========================================================
  MARK ONE NOTIFICATION AS READ
  =========================================================
  */

  const markAsRead = async (
    notificationId
  ) => {
    try {
      await axios.put(
        `${NOTIFICATION_API}/${notificationId}/read`
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id ===
          notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (err) {
      console.error(
        "MARK NOTIFICATION READ ERROR:",
        err
      );
    }
  };

  /*
  =========================================================
  MARK ALL AS READ
  =========================================================
  */

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      setMarkingAll(true);

      await axios.put(
        `${NOTIFICATION_API}/user/${user.id}/read-all`
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (err) {
      console.error(
        "MARK ALL NOTIFICATIONS READ ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to mark all notifications as read."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  /*
  =========================================================
  DELETE NOTIFICATION
  =========================================================
  */

  const deleteNotification = async (
    notificationId
  ) => {
    try {
      await axios.delete(
        `${NOTIFICATION_API}/${notificationId}`
      );

      setNotifications((prev) =>
        prev.filter(
          (notification) =>
            notification._id !==
            notificationId
        )
      );
    } catch (err) {
      console.error(
        "DELETE NOTIFICATION ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to delete notification."
      );
    }
  };

  /*
  =========================================================
  HANDLE NOTIFICATION CLICK
  =========================================================
  */

  const handleNotificationClick = async (
    notification
  ) => {
    /*
    -------------------------------------------------------
    Mark notification as read first
    -------------------------------------------------------
    */

    if (!notification.isRead) {
      await markAsRead(
        notification._id
      );
    }

    /*
    -------------------------------------------------------
    Get destination
    -------------------------------------------------------
    */

    const destination =
      getNotificationLink(
        notification
      );

    /*
    -------------------------------------------------------
    Navigate
    -------------------------------------------------------
    */

    if (destination) {
      navigate(destination);
    }
  };

  /*
  =========================================================
  UNREAD COUNT
  =========================================================
  */

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080812] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-400">
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  /*
  =========================================================
  MAIN UI
  =========================================================
  */

  return (
    <div className="min-h-screen bg-[#080812] text-white">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-white/10 bg-[#0d0d1a] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                navigate(-1)
              }
              className="p-2 rounded-lg hover:bg-white/10 transition"
              title="Go back"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-xl font-bold">
                Notifications
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Stay updated with your
                collaborations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <span className="hidden sm:flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 text-xs text-violet-300">
                <Circle
                  size={8}
                  fill="currentColor"
                />

                {unreadCount} unread
              </span>
            )}

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={markingAll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm disabled:opacity-50"
              >
                <CheckCheck size={16} />

                {markingAll
                  ? "Marking..."
                  : "Mark all read"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {notifications.length === 0 ? (
          <div className="min-h-[500px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
                <Bell
                  size={30}
                  className="text-violet-400"
                />
              </div>

              <h2 className="text-lg font-semibold text-slate-200">
                No notifications yet
              </h2>

              <p className="text-sm text-slate-500 mt-2 max-w-sm">
                When you receive applications,
                campaign updates, messages, or
                content review updates, they will
                appear here.
              </p>
            </div>
          </div>
        ) : (
          /* =================================================
             NOTIFICATION LIST
          ================================================= */

          <div className="space-y-3">
            {notifications.map(
              (notification) => {
                const Icon =
                  getNotificationIcon(
                    notification.type
                  );

                const iconStyle =
                  getNotificationIconStyle(
                    notification.type
                  );

                return (
                  <div
                    key={
                      notification._id
                    }
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                    className={`group relative rounded-2xl border p-5 transition cursor-pointer ${
                      notification.isRead
                        ? "bg-white/[0.025] border-white/10 hover:bg-white/[0.045]"
                        : "bg-violet-500/[0.06] border-violet-500/20 hover:bg-violet-500/[0.09]"
                    }`}
                  >
                    {/* Unread indicator */}

                    {!notification.isRead && (
                      <div className="absolute top-5 left-2 w-1.5 h-1.5 rounded-full bg-violet-400" />
                    )}

                    <div className="flex items-start gap-4">
                      {/* Icon */}

                      <div
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${iconStyle}`}
                      >
                        <Icon size={20} />
                      </div>

                      {/* Notification body */}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3
                              className={`font-semibold ${
                                notification.isRead
                                  ? "text-slate-300"
                                  : "text-white"
                              }`}
                            >
                              {
                                notification.title
                              }
                            </h3>

                            <p className="text-sm text-slate-400 mt-1 leading-6">
                              {
                                notification.message
                              }
                            </p>
                          </div>

                          {/* Delete */}

                          <button
                            onClick={(
                              event
                            ) => {
                              event.stopPropagation();

                              deleteNotification(
                                notification._id
                              );
                            }}
                            className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition shrink-0"
                            title="Delete notification"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </div>

                        {/* Footer */}

                        <div className="flex flex-wrap items-center gap-3 mt-4">
                          <span className="text-xs text-slate-600">
                            {formatNotificationTime(
                              notification.createdAt
                            )}
                          </span>

                          {notification.senderName && (
                            <>
                              <span className="text-slate-700">
                                •
                              </span>

                              <span className="text-xs text-slate-500">
                                From{" "}
                                <span className="text-slate-400">
                                  {
                                    notification.senderName
                                  }
                                </span>
                              </span>
                            </>
                          )}

                          {!notification.isRead && (
                            <span className="ml-auto flex items-center gap-1.5 text-xs text-violet-300">
                              <Circle
                                size={7}
                                fill="currentColor"
                              />
                              Unread
                            </span>
                          )}

                          {notification.isRead && (
                            <span className="ml-auto flex items-center gap-1.5 text-xs text-slate-600">
                              <Check
                                size={13}
                              />
                              Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </main>
    </div>
  );
}