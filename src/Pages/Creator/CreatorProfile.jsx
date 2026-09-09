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
    followers: user?.followers || "125K",
    engagementRate: user?.engagementRate || "6.8%",
    averageReach: user?.averageReach || "85K",
  });

  const [editData, setEditData] = useState(profile);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center">
        <div className="text-center">

          <div className="text-5xl mb-5">
            🔒
          </div>

          <h1 className="text-2xl font-bold">
            Please Login
          </h1>

          <p className="text-gray-400 mt-2">
            You need to login to view your creator profile.
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

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setShowEditModal(false);
    } catch (err) {
      console.error("Save profile error:", err);
      setSaveError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white">

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* ========================= */}
        {/* PROFILE HEADER */}
        {/* ========================= */}

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div className="flex items-center gap-5">

              {/* Avatar */}
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-3xl font-bold shadow-lg shadow-violet-500/20">
                {getInitials(profile.name)}
              </div>

              {/* User Information */}
              <div>

                <h1 className="text-2xl md:text-3xl font-bold">
                  {profile.name || "Creator"}
                </h1>

                <div className="flex flex-wrap items-center gap-3 mt-3">

                  <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm">
                    Creator
                  </span>

                  <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                    ✓ Verified Profile
                  </span>

                </div>

                <div className="flex items-center gap-2 text-gray-400 text-sm mt-3">

                  <MapPin size={15} />

                  {profile.country || "Country not added"}

                </div>

              </div>

            </div>

            {/* Edit */}
            <button
              onClick={() => {
                setEditData(profile);
                setShowEditModal(true);
              }}
              className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 px-5 py-3 rounded-xl font-semibold transition"
            >
              <Edit size={17} />
              Edit Profile
            </button>

          </div>

        </section>

        {/* ========================= */}
        {/* PROFILE COMPLETION */}
        {/* ========================= */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

          <div className="flex justify-between items-center mb-3">

            <div>
              <h2 className="font-semibold">
                Profile Completion
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Complete your profile to attract more brands.
              </p>
            </div>

            <span className="text-violet-400 font-semibold">
              {calculateProfileCompletion(profile)}%
            </span>

          </div>

          <div className="w-full h-3 rounded-full bg-gray-800 overflow-hidden">

            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${calculateProfileCompletion(profile)}%` }}
            />

          </div>

        </section>

        {/* ========================= */}
        {/* ABOUT */}
        {/* ========================= */}

        <section className="mt-6 grid lg:grid-cols-3 gap-6">

          {/* About */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center gap-3 mb-5">

              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                <User size={20} />
              </div>

              <h2 className="text-xl font-semibold">
                About Me
              </h2>

            </div>

            <p className="text-gray-400 leading-7">
              {profile.bio}
            </p>

            <div className="grid md:grid-cols-2 gap-5 mt-7">

              <InfoItem
                icon={<Mail size={17} />}
                label="Email"
                value={profile.email || "Not available"}
              />

              <InfoItem
  icon={<span className="text-sm font-bold">@</span>}
  label="Instagram"
  value={profile.instagramHandle || "Not added"}
/>

              <InfoItem
                icon={<Briefcase size={17} />}
                label="Niche"
                value={profile.niche || "Not added"}
              />

              <InfoItem
                icon={<MapPin size={17} />}
                label="Country"
                value={profile.country || "Not added"}
              />

            </div>

          </div>

          {/* Creator Stats */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <h2 className="text-xl font-semibold mb-5">
              Social Statistics
            </h2>

            <div className="space-y-4">

              <StatCard
                title="Followers"
                value={profile.followers || "Not added"}
                icon={<Users size={20} />}
              />

              <StatCard
                title="Engagement Rate"
                value={profile.engagementRate || "Not added"}
                icon={<Heart size={20} />}
              />

              <StatCard
                title="Average Reach"
                value={profile.averageReach || "Not added"}
                icon={<TrendingUp size={20} />}
              />

            </div>

          </div>

        </section>

        {/* ========================= */}
        {/* CREATOR DETAILS */}
        {/* ========================= */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

          <h2 className="text-xl font-semibold mb-5">
            Creator Information
          </h2>

          <div className="grid md:grid-cols-3 gap-5">

            <DetailCard
              title="Name"
              value={profile.name || "Not added"}
            />

            <DetailCard
              title="Email"
              value={profile.email || "Not added"}
            />

            <DetailCard
              title="Niche"
              value={profile.niche || "Not added"}
            />

            <DetailCard
              title="Instagram"
              value={
                profile.instagramHandle
                  ? `@${profile.instagramHandle.replace("@", "")}`
                  : "Not added"
              }
            />

            <DetailCard
              title="Country"
              value={profile.country || "Not added"}
            />

            <DetailCard
              title="Account Type"
              value="Creator"
            />

          </div>

        </section>

      </main>

      {/* ========================= */}
      {/* EDIT MODAL */}
      {/* ========================= */}

      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0d1421] shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">

              <h2 className="text-xl font-bold">
                Edit Creator Profile
              </h2>

              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              >
                <X size={20} />
              </button>

            </div>

            {/* Form */}
            <div className="p-6 max-h-[80vh] overflow-y-auto">

              {saveError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {saveError}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">

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
                  placeholder="Fashion, Beauty, Fitness..."
                />

                <Input
                  label="Country"
                  name="country"
                  value={editData.country}
                  onChange={handleEditChange}
                />

              </div>

              {/* Social Statistics Section in Edit Modal */}
              <div className="mt-6 pt-5 border-t border-white/10">

                <h3 className="text-sm font-semibold text-violet-400 mb-3">
                  Social Statistics
                </h3>

                <div className="grid md:grid-cols-3 gap-4">

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

              <div className="mt-4">

                <label className="block text-sm text-gray-400 mb-2">
                  Bio
                </label>

                <textarea
                  name="bio"
                  value={editData.bio}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-white/10 text-white outline-none focus:border-violet-500 resize-none"
                  placeholder="Tell brands about yourself..."
                />

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">

                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50"
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 font-semibold disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
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
/* COMPONENTS */
/* ========================= */

const InfoItem = ({ icon, label, value }) => {
  return (
    <div>

      <div className="flex items-center gap-2 text-gray-500 text-sm">
        {icon}
        {label}
      </div>

      <p className="mt-2 text-gray-200">
        {value}
      </p>

    </div>
  );
};


const StatCard = ({ title, value, icon }) => {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111827]/70 p-4">

      <div className="flex items-center justify-between">

        <span className="text-gray-400">
          {title}
        </span>

        <span className="text-violet-400">
          {icon}
        </span>

      </div>

      <p className="text-2xl font-bold mt-2">
        {value}
      </p>

    </div>
  );
};


const DetailCard = ({ title, value }) => {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111827]/70 p-5">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-gray-200 break-words">
        {value}
      </p>

    </div>
  );
};


const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div>

      <label className="block text-sm text-gray-400 mb-2">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-white/10 text-white outline-none focus:border-violet-500 transition"
      />

    </div>
  );
};


export default CreatorProfile;