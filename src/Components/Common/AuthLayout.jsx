import BrandForm from "../Auth/BrandForm";
import CreatorForm from "../Auth/CreatorForm";
import { Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const AuthLayout = ({ role, setRole }) => {
  return (
    <div className="min-h-screen bg-[#050714] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[160px] top-10 left-10 pointer-events-none animate-pulse-glow" />
      <div className="absolute w-[450px] h-[450px] bg-cyan-500/15 rounded-full blur-[150px] bottom-10 right-10 pointer-events-none" />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 overflow-hidden rounded-3xl border border-white/10 shadow-2xl relative z-10 backdrop-blur-2xl">
        {/* ================= LEFT PANEL ================= */}
        <div className="relative bg-gradient-to-br from-violet-900/90 via-indigo-900/90 to-slate-950 p-10 lg:p-14 flex flex-col justify-between overflow-hidden">
          <div className="absolute w-72 h-72 bg-pink-500/15 rounded-full blur-[120px] top-10 -left-20 pointer-events-none" />
          <div className="absolute w-72 h-72 bg-cyan-400/15 rounded-full blur-[120px] bottom-0 right-0 pointer-events-none" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-10 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
                <Sparkles size={20} className="text-white" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Brand<span className="gradient-text">Verse</span>
              </span>
            </Link>

            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
              Create. <br />
              <span className="gradient-text">Connect.</span> <br />
              Collaborate.
            </h2>

            <p className="text-slate-300/90 mt-6 leading-relaxed text-base max-w-md">
              Join thousands of visionary brands and creators forging high-performance partnerships and shaping digital culture together.
            </p>
          </div>

          <div className="relative z-10 mt-10 space-y-4">
            <div className="glass-card rounded-2xl p-5 border border-white/15 bg-white/[0.04]">
              <div className="flex items-center gap-3 text-violet-300 font-semibold mb-1">
                <Zap size={18} className="text-violet-400" />
                <span>Instant Match Engine</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our smart algorithm pairs campaign deliverables with creator demographics seamlessly.
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-cyan-400" /> Verified Accounts
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-400" /> Secure Payments
              </span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="bg-slate-950/90 p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Create Your Account
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Select your role below to get started
            </p>
          </div>

          {/* Toggle */}
          <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 flex gap-2 mb-8">
            <button
              onClick={() => setRole("brand")}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                role === "brand"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🏢 I'm a Brand
            </button>

            <button
              onClick={() => setRole("creator")}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                role === "creator"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🎨 I'm a Creator
            </button>
          </div>

          {/* Form */}
          <div className="transition-all duration-500">
            {role === "brand" ? <BrandForm /> : <CreatorForm />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;