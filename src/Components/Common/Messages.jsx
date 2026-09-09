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
        // Get logged-in user using existing auth service
        const user = authService.getCurrentUser();

        console.log("CURRENT USER IN MESSAGES:", user);

        if (!user) {
          console.error("User not found. Please login again.");
          navigate("/login");
          return;
        }

        // Support both _id and id
        const userId = user._id || user.id;

        if (!userId) {
          console.error("User ID not found:", user);
          alert("User ID not found. Please login again.");
          navigate("/login");
          return;
        }

        let response;

        // ==============================
        // BRAND
        // ==============================

        if (user.role === "brand") {
          response = await axios.get(
            `${API_URL}/api/applications/brand/${userId}`
          );
        }

        // ==============================
        // CREATOR
        // ==============================

        else if (user.role === "creator") {
          response = await axios.get(
            `${API_URL}/api/applications/creator/${userId}`
          );
        }

        // ==============================
        // INVALID ROLE
        // ==============================

        else {
          console.error("Invalid user role:", user.role);
          alert("Invalid user role.");
          return;
        }

        console.log("APPLICATIONS RESPONSE:", response.data);

        const applications = response.data?.applications || [];

        // Only accepted collaborations can have workspace messages
        const activeApplications = applications.filter(
          (application) => application.status === "accepted"
        );

        console.log("ACTIVE COLLABORATIONS:", activeApplications);

        // ==============================
        // NO ACTIVE COLLABORATION
        // ==============================

        if (activeApplications.length === 0) {
          alert("You don't have any active collaboration yet.");

          navigate(
            user.role === "brand"
              ? "/brand/dashboard"
              : "/creator/dashboard"
          );

          return;
        }

        // ==============================
        // OPEN FIRST ACTIVE WORKSPACE
        // ==============================

        const application = activeApplications[0];

        console.log(
          "OPENING WORKSPACE:",
          application._id
        );

        navigate(
          `/collaboration-workspace?applicationId=${application._id}&tab=messages`
        );
      } catch (error) {
        console.error("OPEN MESSAGES ERROR:", error);

        if (error.response) {
          console.error(
            "STATUS:",
            error.response.status
          );

          console.error(
            "DATA:",
            error.response.data
          );
        }
      }
    };

    openWorkspaceMessages();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-gray-400">
          Opening messages...
        </div>
      </div>
    </div>
  );
};

export default Messages;