import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  User,
  Mail,
  Briefcase,
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
          err.response?.data?.message ||
            "Unable to load creator details."
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
      <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center">
        <p className="text-gray-400">
          Loading creator details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="max-w-2xl mx-auto text-center mt-20">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center">
        <p className="text-gray-400">
          Creator not found.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white p-6 md:p-10">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400
                   hover:text-white transition mb-8"
      >
        <ArrowLeft size={18} />
        Back to Creators
      </button>

      <div className="max-w-5xl mx-auto">

        {/* Profile Header */}
        <div className="bg-[#11151f] border border-gray-800 rounded-2xl p-8">

          <div className="flex flex-col md:flex-row gap-6 items-start">

            {/* Avatar */}
            <div
              className="w-28 h-28 rounded-2xl flex items-center
                         justify-center text-3xl font-bold
                         bg-gradient-to-br from-purple-500 to-cyan-400"
            >
              {creator.name
                ?.split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            {/* Basic Information */}
            <div className="flex-1">

              <h1 className="text-3xl font-bold mb-2">
                {creator.name}
              </h1>

              {creator.instagramHandle && (
                <p className="text-pink-400 flex items-center gap-2 mb-4">
                <svg
  xmlns="http://www.w3.org/2000/svg"
  width="17"
  height="17"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <rect width="20" height="20" x="2" y="2" rx="5" />
  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
</svg>
                </p>
              )}

              <div className="flex flex-wrap gap-3">

                {creator.niche && (
                  <span className="px-4 py-2 rounded-lg bg-purple-500/10
                                   border border-purple-500/20
                                   text-purple-300">
                    {creator.niche}
                  </span>
                )}

                {creator.country && (
                  <span className="px-4 py-2 rounded-lg bg-gray-800
                                   text-gray-300 flex items-center gap-2">
                    <MapPin size={15} />
                    {creator.country}
                  </span>
                )}

              </div>

            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

          {/* Creator Information */}
          <div className="bg-[#11151f] border border-gray-800
                          rounded-2xl p-6">

            <h2 className="text-xl font-semibold mb-6">
              Creator Information
            </h2>

            <div className="space-y-5">

              <div className="flex items-start gap-4">
                <User className="text-purple-400 mt-1" size={20} />

                <div>
                  <p className="text-sm text-gray-500">
                    Name
                  </p>
                  <p className="text-gray-200">
                    {creator.name || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="text-purple-400 mt-1" size={20} />

                <div>
                  <p className="text-sm text-gray-500">
                    Email
                  </p>
                  <p className="text-gray-200">
                    {creator.email || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Briefcase
                  className="text-purple-400 mt-1"
                  size={20}
                />

                <div>
                  <p className="text-sm text-gray-500">
                    Niche
                  </p>
                  <p className="text-gray-200">
                    {creator.niche || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin
                  className="text-purple-400 mt-1"
                  size={20}
                />

                <div>
                  <p className="text-sm text-gray-500">
                    Country
                  </p>
                  <p className="text-gray-200">
                    {creator.country || "Not provided"}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Social / Professional */}
          <div className="bg-[#11151f] border border-gray-800
                          rounded-2xl p-6">

            <h2 className="text-xl font-semibold mb-6">
              Social & Professional
            </h2>

            <div className="space-y-5">

              {creator.instagramHandle ? (
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    Instagram
                  </p>

                  <a
                    href={`https://instagram.com/${creator.instagramHandle.replace(
                      "@",
                      ""
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-400 hover:text-pink-300"
                  >
                    {creator.instagramHandle}
                  </a>
                </div>
              ) : (
                <p className="text-gray-500">
                  No Instagram account provided.
                </p>
              )}

              {creator.industry && (
                <div>
                  <p className="text-sm text-gray-500">
                    Industry
                  </p>

                  <p className="text-gray-200 mt-1">
                    {creator.industry}
                  </p>
                </div>
              )}

              {/* Social Statistics */}
              <div className="pt-4 border-t border-gray-800">
                <p className="text-sm text-purple-400 font-semibold mb-3">
                  Social Statistics
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800 text-center">
                    <p className="text-xs text-gray-400">Followers</p>
                    <p className="text-base font-bold text-white mt-1">{creator.followers || "N/A"}</p>
                  </div>

                  <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800 text-center">
                    <p className="text-xs text-gray-400">Engagement</p>
                    <p className="text-base font-bold text-white mt-1">{creator.engagementRate || "N/A"}</p>
                  </div>

                  <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800 text-center">
                    <p className="text-xs text-gray-400">Avg Reach</p>
                    <p className="text-base font-bold text-white mt-1">{creator.averageReach || "N/A"}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CreatorDetails;