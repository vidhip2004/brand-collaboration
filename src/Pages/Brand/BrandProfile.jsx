import React, { useState } from "react";
import {
  Building2,
  Mail,
  MapPin,
  Briefcase,
  User,
  Edit,
  Save,
  X,
  Globe,
  Megaphone,
} from "lucide-react";

import authService from "../../services/authService";

const BrandProfile = () => {
  const user = authService.getCurrentUser();

  const [showEditModal, setShowEditModal] = useState(false);

  // Dynamic brand data
  const [profile, setProfile] = useState({
    name: user?.name || "",
    companyName: user?.companyName || "",
    contactPerson: user?.contactPerson || "",
    email: user?.email || "",
    instagramHandle: user?.instagramHandle || "",
    industry: user?.industry || "",
    country: user?.country || "",
    bio:
      user?.bio ||
      "We are a brand looking to collaborate with talented creators and build meaningful campaigns.",
  });

  const [editData, setEditData] = useState(profile);

  // Not logged in
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
            You need to login to view your brand profile.
          </p>

        </div>

      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "BR";

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

  const handleSaveProfile = () => {
    setProfile(editData);

    // Update localStorage
    const updatedUser = {
      ...user,
      name: editData.name,
      companyName: editData.companyName,
      contactPerson: editData.contactPerson,
      email: editData.email,
      instagramHandle: editData.instagramHandle,
      industry: editData.industry,
      country: editData.country,
      bio: editData.bio,
    };

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setShowEditModal(false);
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

              {/* Company Avatar */}
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-3xl font-bold shadow-lg shadow-violet-500/20">
                {getInitials(
                  profile.companyName || profile.name
                )}
              </div>

              <div>

                <h1 className="text-2xl md:text-3xl font-bold">
                  {profile.companyName ||
                    profile.name ||
                    "Brand"}
                </h1>

                <p className="text-violet-400 mt-1">
                  {profile.industry || "Brand"}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-3">

                  <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm">
                    Brand
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

            {/* Edit Button */}
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
                Complete your profile to attract more creators.
              </p>

            </div>

            <span className="text-violet-400 font-semibold">
              90%
            </span>

          </div>

          <div className="w-full h-3 rounded-full bg-gray-800 overflow-hidden">

            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
              style={{ width: "90%" }}
            />

          </div>

        </section>

        {/* ========================= */}
        {/* COMPANY INFORMATION */}
        {/* ========================= */}

        <section className="mt-6 grid lg:grid-cols-3 gap-6">

          {/* About Brand */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center gap-3 mb-5">

              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                <Building2 size={20} />
              </div>

              <h2 className="text-xl font-semibold">
                About the Brand
              </h2>

            </div>

            <p className="text-gray-400 leading-7">
              {profile.bio}
            </p>

            <div className="grid md:grid-cols-2 gap-5 mt-7">

              <InfoItem
                icon={<Building2 size={17} />}
                label="Company"
                value={
                  profile.companyName ||
                  "Not added"
                }
              />

              <InfoItem
                icon={<User size={17} />}
                label="Contact Person"
                value={
                  profile.contactPerson ||
                  profile.name ||
                  "Not added"
                }
              />

              <InfoItem
                icon={<Mail size={17} />}
                label="Email"
                value={
                  profile.email ||
                  "Not available"
                }
              />

            <InfoItem
  icon={<span className="text-sm font-bold">@</span>}
  label="Instagram"
  value={profile.instagramHandle || "Not added"}
/>

              <InfoItem
                icon={<Briefcase size={17} />}
                label="Industry"
                value={
                  profile.industry ||
                  "Not added"
                }
              />

              <InfoItem
                icon={<MapPin size={17} />}
                label="Country"
                value={
                  profile.country ||
                  "Not added"
                }
              />

            </div>

          </div>

          {/* Brand Stats */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <h2 className="text-xl font-semibold mb-5">
              Brand Statistics
            </h2>

            <div className="space-y-4">

              <StatCard
                title="Campaigns Created"
                value="12"
                icon={<Megaphone size={20} />}
              />

              <StatCard
                title="Active Campaigns"
                value="3"
                icon={<Globe size={20} />}
              />

              <StatCard
                title="Collaborations"
                value="27"
                icon={<User size={20} />}
              />

            </div>

          </div>

        </section>

        {/* ========================= */}
        {/* BRAND DETAILS */}
        {/* ========================= */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

          <h2 className="text-xl font-semibold mb-5">
            Brand Information
          </h2>

          <div className="grid md:grid-cols-3 gap-5">

            <DetailCard
              title="Company Name"
              value={
                profile.companyName ||
                "Not added"
              }
            />

            <DetailCard
              title="Contact Person"
              value={
                profile.contactPerson ||
                profile.name ||
                "Not added"
              }
            />

            <DetailCard
              title="Email"
              value={
                profile.email ||
                "Not added"
              }
            />

            <DetailCard
              title="Industry"
              value={
                profile.industry ||
                "Not added"
              }
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
              value={
                profile.country ||
                "Not added"
              }
            />

          </div>

        </section>

      </main>

      {/* ========================= */}
      {/* EDIT MODAL */}
      {/* ========================= */}

      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0d1421] shadow-2xl">

            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0d1421]">

              <h2 className="text-xl font-bold">
                Edit Brand Profile
              </h2>

              <button
                onClick={() =>
                  setShowEditModal(false)
                }
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              >
                <X size={20} />
              </button>

            </div>

            {/* Form */}
            <div className="p-6">

              <div className="grid md:grid-cols-2 gap-4">

                <Input
                  label="Company Name"
                  name="companyName"
                  value={editData.companyName}
                  onChange={handleEditChange}
                />

                <Input
                  label="Contact Person"
                  name="contactPerson"
                  value={editData.contactPerson}
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
                  placeholder="yourbrand"
                />

                <Input
                  label="Industry"
                  name="industry"
                  value={editData.industry}
                  onChange={handleEditChange}
                />

                <Input
                  label="Country"
                  name="country"
                  value={editData.country}
                  onChange={handleEditChange}
                />

              </div>

              {/* Bio */}
              <div className="mt-4">

                <label className="block text-sm text-gray-400 mb-2">
                  Bio
                </label>

                <textarea
                  name="bio"
                  value={editData.bio}
                  onChange={handleEditChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-white/10 text-white outline-none focus:border-violet-500 resize-none"
                  placeholder="Tell creators about your brand..."
                />

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">

                <button
                  onClick={() =>
                    setShowEditModal(false)
                  }
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 hover:bg-white/5"
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 font-semibold"
                >
                  <Save size={16} />
                  Save Changes
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

const InfoItem = ({
  icon,
  label,
  value,
}) => {
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


const StatCard = ({
  title,
  value,
  icon,
}) => {
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


const DetailCard = ({
  title,
  value,
}) => {
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


export default BrandProfile;