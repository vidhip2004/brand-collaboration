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
  Wallet,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const NOTIFICATION_API = "http://localhost:5000/api/notifications";

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
  content_published: Check,
  payment_received: Wallet,
  payment_sent: CreditCard,
  payment_ready: Sparkles,
  campaign: Megaphone,
  system: Bell,
};

const notificationIconStyles = {
  application: "bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]",
  application_accepted: "bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]",
  application_rejected: "bg-[#EDE7DC] text-[#C98B6B] border-[#D7C9B8]",
  collaboration: "bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]",
  match: "bg-[#EDE7DC] text-[#C98B6B] border-[#D7C9B8]",
  message: "bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]",
  content_submitted: "bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]",
  content_approved: "bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]",
  content_changes_requested: "bg-[#EDE7DC] text-[#C98B6B] border-[#D7C9B8]",
  content_rejected: "bg-[#EDE7DC] text-[#C98B6B] border-[#D7C9B8]",
  content_published: "bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]",
  payment_received: "bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]",
  payment_sent: "bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]",
  payment_ready: "bg-[#EDE7DC] text-[#C98B6B] border-[#D7C9B8]",
  campaign: "bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]",
  system: "bg-[#EDE7DC] text-[#4A3A2E] border-[#D7C9B8]",
};

export default function Notifications() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const currentUser = authService.getCurrentUser();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    setUser(currentUser);
  }, [navigate]);

  const loadNotifications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${NOTIFICATION_API}/user/${user.id}`
      );

      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error("NOTIFICATIONS LOADING ERROR:", err);
      setError(
        err.response?.data?.message || "Unable to load notifications."
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

  const formatNotificationTime = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes !== 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getNotificationIcon = (type) => {
    return notificationIcons[type] || Bell;
  };

  const getNotificationIconStyle = (type) => {
    return (
      notificationIconStyles[type] || notificationIconStyles.system
    );
  };

  const getNotificationLink = (notification) => {
    if (
      notification.type === "content_submitted" &&
      notification.link
    ) {
      return notification.link;
    }

    if (
      [
        "content_approved",
        "content_changes_requested",
        "content_rejected",
      ].includes(notification.type)
    ) {
      return (
        notification.link || "/creator/content-submission"
      );
    }

    if (
      notification.type === "application" ||
      notification.type === "application_accepted" ||
      notification.type === "application_rejected"
    ) {
      return notification.link || "/brand/applications";
    }

    if (notification.type === "collaboration") {
      return notification.link || "/collaboration-workspace";
    }

    if (notification.type === "match") {
      if (user?.role === "brand") {
        return "/brand/dashboard";
      }
      return "/creator/discover-campaigns";
    }

    if (notification.type === "message") {
      return notification.link || "/collaboration-workspace";
    }

    if (notification.type === "campaign") {
      if (user?.role === "brand") {
        return "/brand/dashboard";
      }
      return "/creator/discover-campaigns";
    }

    if (
      notification.type === "payment_received" ||
      notification.type === "payment_ready"
    ) {
      return notification.link || "/creator/earnings";
    }

    if (notification.type === "payment_sent") {
      return notification.link || "/brand/earnings";
    }

    return notification.link || null;
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${NOTIFICATION_API}/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (err) {
      console.error("MARK NOTIFICATION READ ERROR:", err);
    }
  };

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
      console.error("MARK ALL NOTIFICATIONS READ ERROR:", err);
      alert(
        err.response?.data?.message ||
          "Unable to mark all notifications as read."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${NOTIFICATION_API}/${notificationId}`);

      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId)
      );
    } catch (err) {
      console.error("DELETE NOTIFICATION ERROR:", err);
      alert(
        err.response?.data?.message || "Unable to delete notification."
      );
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    const destination = getNotificationLink(notification);
    if (destination) {
      navigate(destination);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#8B6F5A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#4A3A2E]/70">
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] font-sans">
      {/* HEADER */}
      <header className="border-b border-[#D7C9B8]/50 bg-[#FAF9F6]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] hover:bg-[#EDE7DC] text-[#4A3A2E] hover:text-[#2B241F] transition shadow-2xs"
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-lg font-extrabold text-[#2B241F] tracking-tight">
                Notifications
              </h1>
              <p className="text-xs text-[#4A3A2E]/60">
                Stay updated with your active campaigns & collaborations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {unreadCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-[#EDE7DC] border border-[#D7C9B8] px-3 py-1 text-xs font-bold text-[#8B6F5A]">
                <Circle size={6} fill="currentColor" />
                {unreadCount} unread
              </span>
            )}

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={markingAll}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FAF9F6] border border-[#D7C9B8] hover:bg-[#EDE7DC] text-[#2B241F] text-xs font-bold shadow-2xs disabled:opacity-50 transition"
              >
                <CheckCheck size={14} />
                {markingAll ? "Marking..." : "Mark all read"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-300 bg-red-50/80 p-4 text-xs font-bold text-red-700">
            {error}
          </div>
        )}

        {/* EMPTY STATE */}
        {notifications.length === 0 ? (
          <div className="min-h-[450px] flex items-center justify-center">
            <div className="text-center bg-[#FAF9F6] p-10 rounded-3xl border border-[#D7C9B8] shadow-xs max-w-sm w-full">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EDE7DC] border border-[#D7C9B8] flex items-center justify-center mb-3 text-[#8B6F5A]">
                <Bell size={26} />
              </div>

              <h2 className="text-base font-extrabold text-[#2B241F]">
                No notifications yet
              </h2>

              <p className="text-xs text-[#4A3A2E]/60 mt-1 leading-relaxed">
                When you receive campaign applications, messages, payouts, or content reviews, they will appear here.
              </p>
            </div>
          </div>
        ) : (
          /* NOTIFICATION LIST */
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const iconStyle = getNotificationIconStyle(notification.type);

              return (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`group relative rounded-2xl border p-5 transition cursor-pointer shadow-2xs ${
                    notification.isRead
                      ? "bg-[#FAF9F6] border-[#D7C9B8]/60 hover:border-[#8B6F5A]/50 hover:shadow-xs"
                      : "bg-[#EDE7DC]/45 border-[#D7C9B8] hover:border-[#8B6F5A] hover:bg-[#EDE7DC]/70"
                  }`}
                >
                  {!notification.isRead && (
                    <div className="absolute top-6 left-2.5 w-2 h-2 rounded-full bg-[#8B6F5A]" />
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${iconStyle}`}
                    >
                      <Icon size={18} />
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3
                            className={`font-bold text-xs ${
                              notification.isRead
                                ? "text-[#2B241F]"
                                : "text-[#2B241F] font-extrabold"
                            }`}
                          >
                            {notification.title}
                          </h3>

                          <p className="text-xs text-[#4A3A2E]/70 mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className="p-1.5 rounded-lg text-[#4A3A2E]/40 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition shrink-0"
                          title="Delete notification"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Footer Info */}
                      <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-[#D7C9B8]/30 text-[11px]">
                        <span className="text-[#4A3A2E]/50 font-medium">
                          {formatNotificationTime(notification.createdAt)}
                        </span>

                        {notification.senderName && (
                          <>
                            <span className="text-[#D7C9B8]">•</span>
                            <span className="text-[#4A3A2E]/70 font-semibold">
                              From{" "}
                              <span className="text-[#2B241F]">
                                {notification.senderName}
                              </span>
                            </span>
                          </>
                        )}

                        {!notification.isRead ? (
                          <span className="ml-auto flex items-center gap-1 text-[#8B6F5A] font-bold">
                            <Circle size={5} fill="currentColor" /> Unread
                          </span>
                        ) : (
                          <span className="ml-auto flex items-center gap-1 text-[#4A3A2E]/50 font-medium">
                            <Check size={12} /> Read
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}