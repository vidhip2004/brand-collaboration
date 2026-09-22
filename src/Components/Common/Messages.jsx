import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import authService from "../../services/authService";

const API_URL = "http://localhost:5000";

const Messages = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const openWorkspaceMessages = async () => {
      try {
        const user = authService.getCurrentUser();

        if (!user) {
          navigate("/login");
          return;
        }

        const userId = user._id || user.id;

        if (!userId) {
          alert("User ID not found. Please login again.");
          navigate("/login");
          return;
        }

        let response;

        if (user.role === "brand") {
          response = await axios.get(
            `${API_URL}/api/applications/brand/${userId}`
          );
        } else if (user.role === "creator") {
          response = await axios.get(
            `${API_URL}/api/applications/creator/${userId}`
          );
        } else {
          alert("Invalid user role.");
          return;
        }

        const applications = response.data?.applications || [];

        const activeApplications = applications.filter(
          (application) => application.status === "accepted"
        );

        if (activeApplications.length === 0) {
          alert("You don't have any active collaborations yet.");
          navigate(
            user.role === "brand"
              ? "/brand/dashboard"
              : "/creator/dashboard"
          );
          return;
        }

        const application = activeApplications[0];

        navigate(
          `/collaboration-workspace?applicationId=${application._id}&tab=messages`
        );
      } catch (error) {
        console.error("OPEN MESSAGES ERROR:", error);
      }
    };

    openWorkspaceMessages();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] flex items-center justify-center font-sans">
      <div className="text-center bg-[#FAF9F6] p-8 rounded-3xl border border-[#D7C9B8] shadow-xs">
        <div className="w-8 h-8 border-2 border-[#8B6F5A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-[#4A3A2E]">
          Connecting to Workspace Messages...
        </p>
      </div>
    </div>
  );
};

export default Messages;