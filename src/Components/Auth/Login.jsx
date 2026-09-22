import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import { Sparkles, ArrowRight, Lock, Mail, Building2, Palette, AlertCircle } from "lucide-react";

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
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Background Radial Glows for Warm Theme */}
      <div className="absolute w-[500px] h-[500px] bg-[#EDE7DC]/60 rounded-full blur-[140px] top-0 left-1/4 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-[#D7C9B8]/30 rounded-full blur-[140px] bottom-0 right-1/4 pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-11 h-11 rounded-2xl bg-[#8B6F5A] flex items-center justify-center shadow-xs group-hover:bg-[#785D4A] transition-all">
              <Sparkles size={22} className="text-[#FAF9F6]" />
            </div>
            <span className="text-3xl font-black text-[#2B241F] tracking-tight">
              Brand<span className="text-[#8B6F5A]">Verse</span>
            </span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-[#2B241F] tracking-tight mt-2">
            Welcome Back 👋
          </h1>
          <p className="text-[#4A3A2E]/70 mt-2 text-base font-medium">
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
            className={`text-left p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden cursor-pointer ${
              role === "creator"
                ? "border-[#8B6F5A] bg-[#EDE7DC]/40 shadow-xs ring-1 ring-[#8B6F5A]/30"
                : "border-[#D7C9B8]/70 bg-[#FAF9F6] hover:border-[#8B6F5A]/50 hover:bg-[#EDE7DC]/20 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                  role === "creator"
                    ? "bg-[#8B6F5A] text-[#FAF9F6]"
                    : "bg-[#EDE7DC] text-[#4A3A2E]"
                }`}
              >
                <Palette size={26} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2B241F] flex items-center gap-2">
                  Creator Login
                  {role === "creator" && (
                    <span className="text-xs bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8] px-2.5 py-0.5 rounded-full font-bold">
                      Selected
                    </span>
                  )}
                </h2>
                <p className="text-[#4A3A2E]/70 text-sm mt-1 font-normal">
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
            className={`text-left p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden cursor-pointer ${
              role === "brand"
                ? "border-[#8B6F5A] bg-[#EDE7DC]/40 shadow-xs ring-1 ring-[#8B6F5A]/30"
                : "border-[#D7C9B8]/70 bg-[#FAF9F6] hover:border-[#8B6F5A]/50 hover:bg-[#EDE7DC]/20 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                  role === "brand"
                    ? "bg-[#8B6F5A] text-[#FAF9F6]"
                    : "bg-[#EDE7DC] text-[#4A3A2E]"
                }`}
              >
                <Building2 size={26} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2B241F] flex items-center gap-2">
                  Brand Login
                  {role === "brand" && (
                    <span className="text-xs bg-[#EDE7DC] text-[#8B6F5A] border border-[#D7C9B8] px-2.5 py-0.5 rounded-full font-bold">
                      Selected
                    </span>
                  )}
                </h2>
                <p className="text-[#4A3A2E]/70 text-sm mt-1 font-normal">
                  Manage campaigns, discover talent & pay creators
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Login Form Container */}
        <div className="max-w-md mx-auto">
          <div className="bg-[#FAF9F6] rounded-3xl p-8 sm:p-9 border border-[#D7C9B8] shadow-xs">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-[#8B6F5A]">
                {role === "creator" ? "Content Creator Portal" : "Brand Management Portal"}
              </h2>
              <p className="text-[#4A3A2E]/70 text-sm mt-1 font-medium">
                Enter your credentials to proceed
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-rose-50 border border-rose-300 text-rose-700 p-4 rounded-2xl text-sm mb-6 font-medium flex items-center gap-3">
                <AlertCircle size={18} className="text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-[#2B241F] text-sm font-bold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A3A2E]/50 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className="w-full bg-[#FAF9F6] border border-[#D7C9B8] text-[#2B241F] placeholder:text-[#4A3A2E]/40 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-[#8B6F5A] focus:ring-4 focus:ring-[#8B6F5A]/15 transition text-sm font-medium shadow-2xs"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[#2B241F] text-sm font-bold">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-[#8B6F5A] hover:text-[#785D4A] font-semibold transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A3A2E]/50 pointer-events-none" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-[#FAF9F6] border border-[#D7C9B8] text-[#2B241F] placeholder:text-[#4A3A2E]/40 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-[#8B6F5A] focus:ring-4 focus:ring-[#8B6F5A]/15 transition text-sm font-medium shadow-2xs"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#8B6F5A] hover:bg-[#785D4A] disabled:opacity-60 text-[#FAF9F6] py-3.5 rounded-xl font-bold transition-all shadow-xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 text-base mt-2 cursor-pointer"
              >
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    <span>Login as {role === "creator" ? "Creator" : "Brand"}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Signup Redirect */}
            <p className="text-center text-[#4A3A2E]/70 text-sm mt-7 pt-5 border-t border-[#D7C9B8]/40 font-medium">
              Don't have an account yet?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-[#8B6F5A] hover:text-[#785D4A] font-bold transition hover:underline cursor-pointer"
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