import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

const authService = {
  // =========================
  // CREATOR REGISTER
  // =========================
  async registerCreator(userData) {
    const response = await axios.post(
      `${API_URL}/register/creator`,
      userData
    );

    return response.data;
  },

  // =========================
  // BRAND REGISTER
  // =========================
  async registerBrand(userData) {
    const response = await axios.post(
      `${API_URL}/register/brand`,
      userData
    );

    return response.data;
  },

  // =========================
  // LOGIN
  // =========================
  async login(email, password) {
    // If an object is accidentally passed,
    // extract email and password.
    if (typeof email === "object" && email !== null) {
      password = email.password;
      email = email.email;
    }

    email = String(email || "").trim().toLowerCase();

    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const response = await axios.post(
      `${API_URL}/login`,
      {
        email,
        password,
      }
    );

    console.log("BACKEND LOGIN RESPONSE:", response.data);

    // Get user from backend response
    const user = response.data?.user;

    // Make sure backend actually returned user
    if (!user) {
      console.error(
        "Login response does not contain user:",
        response.data
      );

      throw new Error(
        "Login successful, but user data was not returned."
      );
    }

    // Save user in browser
    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    console.log("USER SAVED:", user);

    // IMPORTANT
    // Return the actual user object
    return user;
  },

  // =========================
  // GET CURRENT USER
  // =========================
  getCurrentUser() {
    const user = localStorage.getItem("user");

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user);
    } catch (error) {
      console.error("Invalid user data:", error);

      localStorage.removeItem("user");

      return null;
    }
  },

  // =========================
  // LOGOUT
  // =========================
  logout() {
    localStorage.removeItem("user");
  },

  // =========================
  // CHECK LOGIN
  // =========================
  isLoggedIn() {
    return !!localStorage.getItem("user");
  },
};

export default authService;