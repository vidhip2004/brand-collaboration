import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  User,
  Mail,
  Briefcase,
  Sparkles,
  Users,
  Heart,
  TrendingUp,
} from "lucide-react";

const API_URL = "http://localhost:5000";

const CreatorDetails = () => {
  const { creatorId } = useParams();
  const navigate = useNavigate();

  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/api/users/${creatorId}`
        );

        setCreator(response.data.user);
      } catch (err) {
        console.error("CREATOR DETAILS ERROR:", err);
        setError(
          err.response?.data?.message || "Unable to load creator details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (creatorId) {
      fetchCreator();
    }
  }, [creatorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#8B6F5A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#4A3A2E]/70">
            Loading creator profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] p-8 font-sans">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-[#4A3A2E] hover:text-[#2B241F] mb-8"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="max-w-md mx-auto text-center bg-[#FAF9F6] p-8 rounded-3xl border border-red-300 shadow-xs">
          <p className="text-xs font-bold text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] flex items-center justify-center font-sans">
        <p className="text-xs font-semibold text-[#4A3A2E]/70">
          Creator not found.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] p-6 md:p-10 font-sans">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-[#4A3A2E] hover:text-[#2B241F] transition mb-6"
      >
        <ArrowLeft size={16} />
        Back to Creators Discovery
      </button>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-[#FAF9F6] border border-[#D7C9B8] rounded-2xl p-6 md:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black text-[#FAF9F6] bg-[#8B6F5A] shadow-xs shrink-0">
              {creator.name
                ?.split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            {/* Basic Information */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#2B241F] tracking-tight">
                {creator.name}
              </h1>

              {creator.instagramHandle && (
                <a
                  href={`https://instagram.com/${creator.instagramHandle.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#8B6F5A] hover:text-[#785D4A] text-xs font-bold flex items-center gap-1.5 mt-1 hover:underline"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  @{creator.instagramHandle.replace("@", "")}
                </a>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {creator.niche && (
                  <span className="px-3 py-1 rounded-full bg-[#EDE7DC] border border-[#D7C9B8] text-[#8B6F5A] text-xs font-bold">
                    {creator.niche}
                  </span>
                )}

                {creator.country && (
                  <span className="px-3 py-1 rounded-full bg-[#EDE7DC] border border-[#D7C9B8] text-[#4A3A2E] text-xs font-bold flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#8B6F5A]" />
                    {creator.country}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Creator Information */}
          <div className="bg-[#FAF9F6] border border-[#D7C9B8] rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-extrabold text-[#2B241F] mb-5 tracking-tight">
              Creator Information
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8] shrink-0">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#4A3A2E]/60">Name</p>
                  <p className="font-bold text-[#2B241F] mt-0.5">
                    {creator.name || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8] shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#4A3A2E]/60">Email</p>
                  <p className="font-bold text-[#2B241F] mt-0.5">
                    {creator.email || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8] shrink-0">
                  <Briefcase size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#4A3A2E]/60">Niche</p>
                  <p className="font-bold text-[#2B241F] mt-0.5">
                    {creator.niche || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8] shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#4A3A2E]/60">Country</p>
                  <p className="font-bold text-[#2B241F] mt-0.5">
                    {creator.country || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social / Professional */}
          <div className="bg-[#FAF9F6] border border-[#D7C9B8] rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-extrabold text-[#2B241F] mb-5 tracking-tight">
              Social Statistics & Reach
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#EDE7DC]/40 p-3.5 rounded-xl border border-[#D7C9B8]/60 text-center">
                  <p className="text-[10px] uppercase font-bold text-[#4A3A2E]/60">Followers</p>
                  <p className="text-base font-black text-[#2B241F] mt-0.5">
                    {creator.followers || "N/A"}
                  </p>
                </div>

                <div className="bg-[#EDE7DC]/40 p-3.5 rounded-xl border border-[#D7C9B8]/60 text-center">
                  <p className="text-[10px] uppercase font-bold text-[#4A3A2E]/60">Engagement</p>
                  <p className="text-base font-black text-[#8B6F5A] mt-0.5">
                    {creator.engagementRate || "N/A"}
                  </p>
                </div>

                <div className="bg-[#EDE7DC]/40 p-3.5 rounded-xl border border-[#D7C9B8]/60 text-center">
                  <p className="text-[10px] uppercase font-bold text-[#4A3A2E]/60">Avg Reach</p>
                  <p className="text-base font-black text-[#8B6F5A] mt-0.5">
                    {creator.averageReach || "N/A"}
                  </p>
                </div>
              </div>

              {creator.bio && (
                <div className="pt-3 border-t border-[#D7C9B8]/30">
                  <p className="text-[10px] uppercase font-bold text-[#4A3A2E]/60 mb-1">
                    Bio
                  </p>
                  <p className="text-xs text-[#4A3A2E]/80 leading-relaxed">
                    {creator.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDetails;