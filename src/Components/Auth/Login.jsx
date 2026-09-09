import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";



const Login = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("creator");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");

  if (!formData.email || !formData.password) {
    setError("Please enter your email and password.");
    return;
  }

  setLoading(true);

  try {
    const user = await authService.login(
      formData.email,
      formData.password
    );

    console.log("USER RECEIVED IN LOGIN.JSX:", user);

    // Safety check
    if (!user) {
      setError("Login successful, but user information is missing.");
      return;
    }

    // Creator
    if (user.role === "creator") {
      navigate("/creator/dashboard");
      return;
    }

    // Brand
    if (user.role === "brand") {
      navigate("/brand/dashboard");
      return;
    }

    // Unknown role
    setError("Invalid user role received from server.");

  } catch (err) {
    console.error("Login error:", err);

    if (err.response?.data?.message) {
      setError(err.response.data.message);
    } else if (err.message) {
      setError(err.message);
    } else {
      setError("Login failed. Please try again.");
    }

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl">

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Welcome Back
          </h1>

          <p className="text-gray-400 mt-2">
            Login to your Brand Collaboration account
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

          {/* Creator */}
          <button
            type="button"
            onClick={() => {
              setRole("creator");
              setError("");
            }}
            className={`text-left p-6 rounded-2xl border transition-all duration-300 ${
              role === "creator"
                ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                : "border-gray-800 bg-gray-900 hover:border-cyan-500/50"
            }`}
          >
            <div className="flex items-center gap-4">

              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                  role === "creator"
                    ? "bg-cyan-600"
                    : "bg-gray-800"
                }`}
              >
                🎨
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  Creator Login
                </h2>

                <p className="text-gray-400 text-sm mt-1">
                  Login as a content creator
                </p>
              </div>

            </div>
          </button>

          {/* Brand */}
          <button
            type="button"
            onClick={() => {
              setRole("brand");
              setError("");
            }}
            className={`text-left p-6 rounded-2xl border transition-all duration-300 ${
              role === "brand"
                ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10"
                : "border-gray-800 bg-gray-900 hover:border-violet-500/50"
            }`}
          >
            <div className="flex items-center gap-4">

              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                  role === "brand"
                    ? "bg-violet-600"
                    : "bg-gray-800"
                }`}
              >
                🏢
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  Brand Login
                </h2>

                <p className="text-gray-400 text-sm mt-1">
                  Login as a brand
                </p>
              </div>

            </div>
          </button>

        </div>

        {/* Login Form */}
        <div className="max-w-md mx-auto">

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7">

            {/* Header */}
            <div className="text-center mb-6">

              <h2
                className={`text-2xl font-bold ${
                  role === "creator"
                    ? "text-cyan-400"
                    : "text-violet-400"
                }`}
              >
                {role === "creator"
                  ? "Creator Login"
                  : "Brand Login"}
              </h2>

              <p className="text-gray-400 text-sm mt-2">
                Enter your account details to continue
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-xl text-sm mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="********"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${
                  role === "creator"
                    ? "bg-cyan-600 hover:bg-cyan-700"
                    : "bg-violet-600 hover:bg-violet-700"
                } disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition`}
              >
                {loading
                  ? "Logging in..."
                  : `Login as ${
                      role === "creator" ? "Creator" : "Brand"
                    }`}
              </button>

            </form>

            {/* Signup */}
            <p className="text-center text-gray-400 text-sm mt-6">
              Don't have an account?{" "}

              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Create Account
              </button>
            </p>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;