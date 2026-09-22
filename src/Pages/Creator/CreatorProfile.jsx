import React, { useState } from "react";
import axios from "axios";
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  Users,
  Heart,
  TrendingUp,
  Edit,
  Save,
  X,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import authService from "../../services/authService";

export const calculateProfileCompletion = (profileData) => {
  if (!profileData) return 0;
  const fields = [
    { key: "name", weight: 10 },
    { key: "email", weight: 10 },
    { key: "instagramHandle", weight: 10 },
    { key: "niche", weight: 15 },
    { key: "country", weight: 10 },
    { key: "bio", weight: 15 },
    { key: "followers", weight: 10 },
    { key: "engagementRate", weight: 10 },
    { key: "averageReach", weight: 10 },
  ];

  let score = 0;
  fields.forEach(({ key, weight }) => {
    const val = profileData[key];
    if (val && String(val).trim().length > 0) {
      score += weight;
    }
  });

  return Math.min(100, Math.max(0, score));
};

const CreatorProfile = () => {
  const user = authService.getCurrentUser();

  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Dynamic data from logged-in user
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    instagramHandle: user?.instagramHandle || "",
    niche: user?.niche || "",
    country: user?.country || "",
    bio:
      user?.bio ||
      "Content creator passionate about creating engaging and authentic content for brands.",
    followers: user?.followers,
    engagementRate: user?.engagementRate ,
    averageReach: user?.averageReach ,
  });

  const [editData, setEditData] = useState(profile);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] flex items-center justify-center p-6 font-sans">
        <div className="text-center bg-[#FAF9F6] p-8 rounded-2xl border border-[#D7C9B8] shadow-sm max-w-sm w-full">
          <div className="w-14 h-14 rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] flex items-center justify-center mx-auto text-[#8B6F5A] mb-4">
            <User size={28} />
          </div>
          <h1 className="text-xl font-extrabold text-[#2B241F]">Please Login</h1>
          <p className="text-[#4A3A2E]/70 text-xs mt-1.5">
            You need to login to view and edit your creator profile.
          </p>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "CR";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveError("");

    try {
      if (user?.id) {
        await axios.put(`http://localhost:5000/api/users/${user.id}`, editData);
      }

      setProfile(editData);

      // Update localStorage user as well
      const updatedUser = {
        ...user,
        name: editData.name,
        email: editData.email,
        instagramHandle: editData.instagramHandle,
        niche: editData.niche,
        country: editData.country,
        bio: editData.bio,
        followers: editData.followers,
        engagementRate: editData.engagementRate,
        averageReach: editData.averageReach,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowEditModal(false);
    } catch (err) {
      console.error("Save profile error:", err);
      setSaveError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] font-sans">
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-6">
        {/* ========================= */}
        {/* PROFILE HEADER */}
        {/* ========================= */}
        <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 md:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#8B6F5A] text-white flex items-center justify-center text-2xl md:text-3xl font-black shadow-xs shrink-0">
                {getInitials(profile.name)}
              </div>

              {/* User Information */}
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#2B241F] tracking-tight">
                  {profile.name || "Creator"}
                </h1>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EDE7DC] border border-[#D7C9B8] text-[#8B6F5A] text-xs font-bold">
                    Creator
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verified Profile
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[#4A3A2E]/70 text-xs font-medium mt-2">
                  <MapPin size={13} className="text-[#8B6F5A]" />
                  {profile.country || "Country not added"}
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => {
                setEditData(profile);
                setShowEditModal(true);
              }}
              className="flex items-center justify-center gap-2 bg-[#8B6F5A] hover:bg-[#785D4A] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Edit size={14} />
              Edit Profile
            </button>
          </div>
        </section>

        {/* ========================= */}
        {/* PROFILE COMPLETION */}
        {/* ========================= */}
        <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="font-extrabold text-[#2B241F] text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-[#8B6F5A]" />
                Profile Completion
              </h2>
              <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                Complete your profile data to boost collaboration visibility.
              </p>
            </div>

            <span className="text-[#8B6F5A] font-extrabold text-sm">
              {calculateProfileCompletion(profile)}%
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-[#EDE7DC] overflow-hidden">
            <div
              className="h-full bg-[#8B6F5A] rounded-full transition-all duration-500"
              style={{ width: `${calculateProfileCompletion(profile)}%` }}
            />
          </div>
        </section>

        {/* ========================= */}
        {/* ABOUT & STATS */}
        {/* ========================= */}
        <section className="grid lg:grid-cols-3 gap-6">
          {/* About Card */}
          <div className="lg:col-span-2 rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <User size={18} />
              </div>
              <h2 className="text-base font-extrabold text-[#2B241F] tracking-tight">
                About Me
              </h2>
            </div>

            <p className="text-[#4A3A2E] text-xs leading-relaxed">
              {profile.bio}
            </p>

            <div className="grid md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#D7C9B8]/70">
              <InfoItem
                icon={<Mail size={15} />}
                label="Email"
                value={profile.email || "Not available"}
              />

              <InfoItem
                icon={<span className="text-xs font-bold">@</span>}
                label="Instagram"
                value={profile.instagramHandle || "Not added"}
              />

              <InfoItem
                icon={<Briefcase size={15} />}
                label="Niche"
                value={profile.niche || "Not added"}
              />

              <InfoItem
                icon={<MapPin size={15} />}
                label="Country"
                value={profile.country || "Not added"}
              />
            </div>
          </div>

          {/* Creator Stats */}
          <div className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs">
            <h2 className="text-base font-extrabold text-[#2B241F] mb-4 tracking-tight">
              Social Statistics
            </h2>

            <div className="space-y-3">
              <StatCard
                title="Followers"
                value={profile.followers || "Not added"}
                icon={<Users size={18} />}
                color="mocha"
              />

              <StatCard
                title="Engagement Rate"
                value={profile.engagementRate || "Not added"}
                icon={<Heart size={18} />}
                color="terracotta"
              />

              <StatCard
                title="Average Reach"
                value={profile.averageReach || "Not added"}
                icon={<TrendingUp size={18} />}
                color="latte"
              />
            </div>
          </div>
        </section>

        {/* ========================= */}
        {/* CREATOR DETAILS SUMMARY */}
        {/* ========================= */}
        <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 md:p-8 shadow-xs">
          <h2 className="text-base font-extrabold text-[#2B241F] mb-4 tracking-tight">
            Creator Information Summary
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <DetailCard title="Name" value={profile.name || "Not added"} />
            <DetailCard title="Email" value={profile.email || "Not added"} />
            <DetailCard title="Niche" value={profile.niche || "Not added"} />
            <DetailCard
              title="Instagram"
              value={
                profile.instagramHandle
                  ? `@${profile.instagramHandle.replace("@", "")}`
                  : "Not added"
              }
            />
            <DetailCard title="Country" value={profile.country || "Not added"} />
            <DetailCard title="Account Type" value="Creator" />
          </div>
        </section>
      </main>

      {/* ========================= */}
      {/* EDIT MODAL */}
      {/* ========================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2B241F]/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#D7C9B8]/70 bg-[#EDE7DC]/40">
              <div>
                <h2 className="text-base font-extrabold text-[#2B241F] tracking-tight">
                  Edit Creator Profile
                </h2>
                <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                  Update your personal bio, contact info, and social reach metrics.
                </p>
              </div>

              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-xl text-[#4A3A2E]/70 hover:text-[#2B241F] hover:bg-[#EDE7DC] transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
              {saveError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {saveError}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-3.5">
                <Input
                  label="Name"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                />

                <Input
                  label="Email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditChange}
                />

                <Input
                  label="Instagram"
                  name="instagramHandle"
                  value={editData.instagramHandle}
                  onChange={handleEditChange}
                  placeholder="yourusername"
                />

                <Input
                  label="Niche"
                  name="niche"
                  value={editData.niche}
                  onChange={handleEditChange}
                  placeholder="Fashion, Beauty, Tech..."
                />

                <Input
                  label="Country"
                  name="country"
                  value={editData.country}
                  onChange={handleEditChange}
                />
              </div>

              {/* Social Statistics Section */}
              <div className="mt-5 pt-4 border-t border-[#D7C9B8]/70">
                <h3 className="text-xs font-bold text-[#8B6F5A] uppercase tracking-wider mb-3">
                  Social Statistics
                </h3>

                <div className="grid md:grid-cols-3 gap-3.5">
                  <Input
                    label="Followers"
                    name="followers"
                    value={editData.followers || ""}
                    onChange={handleEditChange}
                    placeholder="e.g. 125K"
                  />

                  <Input
                    label="Engagement Rate"
                    name="engagementRate"
                    value={editData.engagementRate || ""}
                    onChange={handleEditChange}
                    placeholder="e.g. 6.8%"
                  />

                  <Input
                    label="Average Reach"
                    name="averageReach"
                    value={editData.averageReach || ""}
                    onChange={handleEditChange}
                    placeholder="e.g. 85K"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B241F] mb-1.5">
                  Bio
                </label>

                <textarea
                  name="bio"
                  value={editData.bio}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDE7DC]/30 border border-[#D7C9B8] text-xs font-medium text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:bg-[#FAF9F6] resize-none transition"
                  placeholder="Tell brands about your creative journey and niche..."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#D7C9B8]/70">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D7C9B8] text-[#4A3A2E] hover:bg-[#EDE7DC] text-xs font-bold transition disabled:opacity-50"
                >
                  <X size={14} />
                  Cancel
                </button>

                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ========================= */
/* SUB-COMPONENTS */
/* ========================= */

const InfoItem = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] text-[#8B6F5A] mt-0.5">
        {icon}
      </div>
      <div>
        <span className="text-[11px] font-semibold text-[#4A3A2E]/60 uppercase tracking-wide">
          {label}
        </span>
        <p className="mt-0.5 text-xs font-bold text-[#2B241F] break-words">{value}</p>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color = "mocha" }) => {
  const colorMap = {
    mocha: "bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]",
    terracotta: "bg-red-50 text-[#C98B6B] border-red-200",
    latte: "bg-[#EDE7DC] text-[#A78B7F] border-[#D7C9B8]",
  };

  return (
    <div className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 p-3.5 flex items-center justify-between">
      <div>
        <span className="text-[11px] font-semibold text-[#4A3A2E]/60">{title}</span>
        <p className="text-lg font-black text-[#2B241F] mt-0.5">{value}</p>
      </div>
      <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.mocha}`}>
        {icon}
      </div>
    </div>
  );
};

const DetailCard = ({ title, value }) => {
  return (
    <div className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 p-4">
      <p className="text-[11px] font-bold text-[#4A3A2E]/60 uppercase tracking-wider">
        {title}
      </p>
      <p className="mt-1 text-xs font-bold text-[#2B241F] break-words">{value}</p>
    </div>
  );
};

const Input = ({ label, name, value, onChange, placeholder }) => {
  return (
    <div>
      <label className="block text-xs font-bold text-[#2B241F] mb-1.5">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDE7DC]/30 border border-[#D7C9B8] text-xs font-medium text-[#2B241F] outline-none focus:border-[#8B6F5A] focus:bg-[#FAF9F6] transition"
      />
    </div>
  );
};

export default CreatorProfile;