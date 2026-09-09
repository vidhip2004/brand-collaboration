import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import { Sparkles, ArrowRight, Lock, Mail, Building2, Palette } from "lucide-react";

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
      const user = await authService.login(formData.email, formData.password);

      if (!user) {
        setError("Login successful, but user information is missing.");
        return;
      }

      if (user.role === "creator") {
        navigate("/creator/dashboard");
        return;
      }

      if (user.role === "brand") {
        navigate("/brand/dashboard");
        return;
      }

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
    <div className="min-h-screen bg-[#050714] relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Background Radial Glows */}
      <div className="absolute w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[160px] top-0 left-1/4 pointer-events-none animate-pulse-glow" />
      <div className="absolute w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[140px] bottom-0 right-1/4 pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-600/30 group-hover:scale-105 transition-transform">
              <Sparkles size={22} className="text-white" />
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tight">
              Brand<span className="gradient-text">Verse</span>
            </span>
          </Link>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mt-2">
            Welcome Back
          </h1>
          <p className="text-slate-400 mt-2 text-base">
            Select your account type to access your personalized workspace
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Creator Option */}
          <button
            type="button"
            onClick={() => {
              setRole("creator");
              setError("");
            }}
            className={`text-left p-6 rounded-2xl border transition-all duration-300 backdrop-blur-xl relative overflow-hidden ${
              role === "creator"
                ? "border-cyan-500/60 bg-cyan-500/10 shadow-xl shadow-cyan-500/10"
                : "border-white/10 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-900/80"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all shadow-md ${
                  role === "creator"
                    ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/30"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                <Palette size={26} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Creator Login
                  {role === "creator" && (
                    <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-semibold">
                      Selected
                    </span>
                  )}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Access campaigns, submit content & track earnings
                </p>
              </div>
            </div>
          </button>

          {/* Brand Option */}
          <button
            type="button"
            onClick={() => {
              setRole("brand");
              setError("");
            }}
            className={`text-left p-6 rounded-2xl border transition-all duration-300 backdrop-blur-xl relative overflow-hidden ${
              role === "brand"
                ? "border-violet-500/60 bg-violet-500/10 shadow-xl shadow-violet-500/10"
                : "border-white/10 bg-slate-900/60 hover:border-violet-500/40 hover:bg-slate-900/80"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all shadow-md ${
                  role === "brand"
                    ? "bg-gradient-to-br from-violet-600 to-indigo-600 shadow-violet-500/30"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                <Building2 size={26} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Brand Login
                  {role === "brand" && (
                    <span className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-semibold">
                      Selected
                    </span>
                  )}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Manage campaigns, discover talent & review applications
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Login Form Container */}
        <div className="max-w-md mx-auto">
          <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-2xl">
            <div className="text-center mb-6">
              <h2
                className={`text-2xl font-bold ${
                  role === "creator" ? "gradient-text-cyan" : "gradient-text-purple"
                }`}
              >
                {role === "creator" ? "Content Creator Portal" : "Brand Management Portal"}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Enter your credentials to proceed
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-rose-500/15 border border-rose-500/40 text-rose-200 p-4 rounded-2xl text-sm mb-6 shadow-inner flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0 animate-ping" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className="w-full bg-slate-900/80 border border-white/15 text-white rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-violet-500 transition text-sm font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-slate-300 text-sm font-semibold">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-violet-400 hover:text-violet-300 font-medium transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/80 border border-white/15 text-white rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-violet-500 transition text-sm font-medium"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 ${
                  role === "creator"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/30"
                    : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-600/30"
                } disabled:opacity-60 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base mt-2`}
              >
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    Login as {role === "creator" ? "Creator" : "Brand"}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Signup Redirect */}
            <p className="text-center text-slate-400 text-sm mt-7 pt-5 border-t border-white/10">
              Don't have an account yet?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-violet-400 hover:text-violet-300 font-bold transition"
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