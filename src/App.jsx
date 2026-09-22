import { Routes, Route } from "react-router-dom";

import Home from "./Pages/Public/Home.jsx";

import Signup from "./Pages/Auth/Signup.jsx";

import Login from "./Components/Auth/Login.jsx";

import BrandDashboard from "./Pages/Brand/BrandDashboard.jsx";

import CreatorDashboard from "./Pages/Creator/CreatorDashboard.jsx";

import CreatorProfile from "./Pages/Creator/CreatorProfile.jsx";

import BrandProfile from "./Pages/Brand/BrandProfile.jsx";

import CreateCampaign from "./Pages/Brand/CreateCampaign.jsx";

import DiscoverCampaigns from "./Pages/Creator/DiscoverCampaigns.jsx";

import CollaborationWorkspace from "./Pages/Public/CollaborationWorkspace.jsx";

import Messages from "./Components/Common/Messages.jsx";

import BrandApplication from "./Pages/Brand/BrandApplication.jsx";

import ContentSubmission from "./Pages/Creator/ContentSubmission.jsx";

import FindCreators from "./Pages/Brand/FindCreators.jsx";

import Notifications from "./Components/Common/Notifications.jsx";

import CreatorDetails from "./Pages/Public/CreatorDetails.jsx";

import BrandPayments from "./Pages/Brand/BrandPayments.jsx";

import CreatorEarnings from "./Pages/Creator/CreatorEarnings.jsx";


function App() {
  return (
    <Routes>

      {/* Public Pages */}
      <Route path="/" element={<Home />} />

      <Route path="/signup" element={<Signup />} />

      <Route path="/login" element={<Login />} />


      {/* Brand Pages */}
      <Route
        path="/brand/dashboard"
        element={<BrandDashboard />}
      />

      <Route
        path="/brand/brandProfile"
        element={<BrandProfile />}
      />

      <Route
        path="/brand/create-campaign"
        element={<CreateCampaign />}
      />

      <Route
        path="/brand/applications"
        element={<BrandApplication />}
      />

      <Route
        path="/brand/find-creators"
        element={<FindCreators />}
      />

      <Route
        path="/brand/creator/:creatorId"
        element={<CreatorDetails />}
      />

      <Route
        path="/brand/earnings"
        element={<BrandPayments />}
      />

      <Route
        path="/brand/payments"
        element={<BrandPayments />}
      />


      {/* Creator Pages */}
      <Route
        path="/creator/dashboard"
        element={<CreatorDashboard />}
      />

      <Route
        path="/creator/creatorProfile"
        element={<CreatorProfile />}
      />

      <Route
        path="/creator/discover-campaigns"
        element={<DiscoverCampaigns />}
      />

      <Route
        path="/creator/content-submission"
        element={<ContentSubmission />}
      />

      <Route
        path="/creator/earnings"
        element={<CreatorEarnings />}
      />


      {/* Collaboration Workspace */}
      <Route
        path="/collaboration-workspace"
        element={<CollaborationWorkspace />}
      />


      {/* Messages */}
      <Route
        path="/messages"
        element={<Messages />}
      />


      {/* Notifications */}
      <Route
        path="/notifications"
        element={<Notifications />}
      />

    </Routes>
  );
}

export default App;