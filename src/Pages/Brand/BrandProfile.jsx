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
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const BrandProfile = () => {
  const navigate = useNavigate();
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
            You need to login to view your brand profile.
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

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = () => {
    setProfile(editData);

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

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setShowEditModal(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F]">
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-7">
        {/* Back Button */}
        <button
          onClick={() => navigate("/brand/dashboard")}
          className="flex items-center gap-2 text-[#4A3A2E]/70 hover:text-[#2B241F] font-semibold text-sm transition"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* ========================= */}
        {/* PROFILE HEADER */}
        {/* ========================= */}
        <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 md:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Company Avatar */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#EDE7DC] border border-[#D7C9B8] flex items-center justify-center text-3xl font-black text-[#8B6F5A] shrink-0">
                {getInitials(profile.companyName || profile.name)}
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-black text-[#2B241F]">
                  {profile.companyName || profile.name || "Brand"}
                </h1>

                <p className="text-sm font-semibold text-[#8B6F5A] mt-1">
                  {profile.industry || "Brand Collaboration Partner"}
                </p>

                <div className="flex flex-wrap items-center gap-2.5 mt-3">
                  <span className="px-3 py-1 rounded-full bg-[#EDE7DC] border border-[#D7C9B8] text-[#4A3A2E] text-xs font-semibold">
                    Brand Account
                  </span>

                  <span className="px-3 py-1 rounded-full bg-[#EDE7DC] border border-[#D7C9B8] text-[#2B241F] text-xs font-semibold flex items-center gap-1">
                    <CheckCircle size={13} className="text-[#8B6F5A]" />
                    Verified Partner
                  </span>

                  {profile.country && (
                    <span className="flex items-center gap-1 text-[#4A3A2E] text-xs font-medium px-2.5 py-1 rounded-full bg-[#EDE7DC] border border-[#D7C9B8]">
                      <MapPin size={12} className="text-[#8B6F5A]" />
                      {profile.country}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => {
                setEditData(profile);
                setShowEditModal(true);
              }}
              className="flex items-center justify-center gap-2 bg-[#8B6F5A] hover:bg-[#785D4A] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-xs transition shrink-0"
            >
              <Edit size={16} />
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
              <h2 className="font-bold text-[#2B241F] text-base">
                Profile Completeness
              </h2>
              <p className="text-xs text-[#4A3A2E]/70 mt-0.5">
                Detailed profiles achieve higher collaboration interest from creators
              </p>
            </div>

            <span className="text-[#8B6F5A] font-extrabold text-lg">
              95%
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-[#EDE7DC] overflow-hidden">
            <div
              className="h-full bg-[#8B6F5A] rounded-full transition-all duration-500"
              style={{ width: "95%" }}
            />
          </div>
        </section>

        {/* ========================= */}
        {/* COMPANY INFORMATION */}
        {/* ========================= */}
        <section className="grid lg:grid-cols-3 gap-7">
          {/* About Brand */}
          <div className="lg:col-span-2 rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8]">
                <Building2 size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#2B241F]">
                  About the Brand
                </h2>
                <p className="text-xs text-[#4A3A2E]/70">
                  Brand story and mission statement
                </p>
              </div>
            </div>

            <p className="text-[#4A3A2E]/80 text-sm leading-relaxed font-medium">
              {profile.bio}
            </p>

            <div className="grid md:grid-cols-2 gap-4 mt-7">
              <InfoItem
                icon={<Building2 size={16} />}
                label="Company"
                value={profile.companyName || "Not added"}
              />

              <InfoItem
                icon={<User size={16} />}
                label="Contact Person"
                value={profile.contactPerson || profile.name || "Not added"}
              />

              <InfoItem
                icon={<Mail size={16} />}
                label="Email"
                value={profile.email || "Not available"}
              />

              <InfoItem
                icon={<span className="text-xs font-black">@</span>}
                label="Instagram"
                value={
                  profile.instagramHandle
                    ? `@${profile.instagramHandle.replace("@", "")}`
                    : "Not added"
                }
              />

              <InfoItem
                icon={<Briefcase size={16} />}
                label="Industry"
                value={profile.industry || "Not added"}
              />

              <InfoItem
                icon={<MapPin size={16} />}
                label="Country"
                value={profile.country || "Not added"}
              />
            </div>
          </div>

          {/* Brand Stats */}
          <div className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#2B241F] mb-1">
                Collaboration Metrics
              </h2>
              <p className="text-xs text-[#4A3A2E]/70 mb-5">
                Lifetime platform statistics
              </p>

              <div className="space-y-3.5">
                <StatCard
                  title="Campaigns Launched"
                  value="12"
                  icon={<Megaphone size={19} />}
                />

                <StatCard
                  title="Active Collaborations"
                  value="3"
                  icon={<Globe size={19} />}
                />

                <StatCard
                  title="Creator Partnerships"
                  value="27"
                  icon={<User size={19} />}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ========================= */}
        {/* BRAND OVERVIEW GRID */}
        {/* ========================= */}
        <section className="rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] p-6 md:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-[#2B241F] mb-1">
            Registered Account Information
          </h2>
          <p className="text-xs text-[#4A3A2E]/70 mb-6">
            Official details associated with your verified BrandVerse account
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <DetailCard
              title="Company Name"
              value={profile.companyName || "Not added"}
            />

            <DetailCard
              title="Contact Person"
              value={profile.contactPerson || profile.name || "Not added"}
            />

            <DetailCard
              title="Email Address"
              value={profile.email || "Not added"}
            />

            <DetailCard
              title="Industry"
              value={profile.industry || "Not added"}
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
              title="Country / HQ"
              value={profile.country || "Not added"}
            />
          </div>
        </section>
      </main>

      {/* ========================= */}
      {/* EDIT MODAL */}
      {/* ========================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B241F]/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#D7C9B8] bg-[#FAF9F6] shadow-xl">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 py-5 border-b border-[#D7C9B8] bg-[#FAF9F6] z-10">
              <div>
                <h2 className="text-lg font-bold text-[#2B241F]">
                  Edit Brand Profile
                </h2>
                <p className="text-xs text-[#4A3A2E]/70">
                  Update your public company information
                </p>
              </div>

              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-xl text-[#4A3A2E]/60 hover:text-[#2B241F] hover:bg-[#EDE7DC] transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 md:p-8 space-y-5">
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
                  label="Official Email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditChange}
                />

                <Input
                  label="Instagram Handle"
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
              <div>
                <label className="block text-xs font-bold text-[#4A3A2E] uppercase tracking-wider mb-2">
                  Brand Biography / Vision
                </label>

                <textarea
                  name="bio"
                  value={editData.bio}
                  onChange={handleEditChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] border border-[#D7C9B8] text-[#2B241F] placeholder:text-[#4A3A2E]/40 outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 transition text-sm font-medium resize-none"
                  placeholder="Tell creators about your brand mission..."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#D7C9B8]">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#D7C9B8] hover:bg-[#EDE7DC] text-[#4A3A2E] font-semibold text-sm transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-white font-bold text-sm shadow-xs transition"
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
/* SUB-COMPONENTS */
/* ========================= */
const InfoItem = ({ icon, label, value }) => {
  return (
    <div className="p-3.5 rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30">
      <div className="flex items-center gap-2 text-[#4A3A2E]/70 text-xs font-bold uppercase tracking-wider">
        <span className="text-[#8B6F5A]">{icon}</span>
        {label}
      </div>

      <p className="mt-1 text-[#2B241F] font-bold text-sm truncate">
        {value}
      </p>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#4A3A2E]/70 uppercase tracking-wider">
          {title}
        </span>

        <span className="p-2 rounded-xl border bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]">
          {icon}
        </span>
      </div>

      <p className="text-2xl font-black text-[#2B241F] mt-2">
        {value}
      </p>
    </div>
  );
};

const DetailCard = ({ title, value }) => {
  return (
    <div className="rounded-xl border border-[#D7C9B8] bg-[#EDE7DC]/30 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#4A3A2E]/70">
        {title}
      </p>

      <p className="mt-1 font-bold text-[#2B241F] text-sm break-words">
        {value}
      </p>
    </div>
  );
};

const Input = ({ label, name, value, onChange, placeholder }) => {
  return (
    <div>
      <label className="block text-xs font-bold text-[#4A3A2E] uppercase tracking-wider mb-2">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] border border-[#D7C9B8] text-[#2B241F] placeholder:text-[#4A3A2E]/40 outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/15 transition text-sm font-medium"
      />
    </div>
  );
};

export default BrandProfile;