import BrandForm from "../Auth/BrandForm";
import CreatorForm from "../Auth/CreatorForm";
import { Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const AuthLayout = ({ role, setRole }) => {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute w-[500px] h-[500px] bg-[#EDE7DC]/60 rounded-full blur-[140px] top-10 left-10 pointer-events-none" />
      <div className="absolute w-[450px] h-[450px] bg-[#D7C9B8]/30 rounded-full blur-[140px] bottom-10 right-10 pointer-events-none" />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 overflow-hidden rounded-3xl border border-[#D7C9B8] shadow-[0_16px_48px_-12px_rgba(74,58,46,0.1)] relative z-10 bg-[#FAF9F6]">
        {/* ================= LEFT PANEL ================= */}
        <div className="relative bg-[#2B241F] p-10 lg:p-14 flex flex-col justify-between overflow-hidden text-[#FAF9F6]">
          <div className="absolute w-72 h-72 bg-[#8B6F5A]/20 rounded-full blur-[100px] top-10 -left-20 pointer-events-none" />
          <div className="absolute w-72 h-72 bg-[#C98B6B]/15 rounded-full blur-[100px] bottom-0 right-0 pointer-events-none" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-10 group">
              <div className="w-10 h-10 rounded-xl bg-[#8B6F5A] flex items-center justify-center shadow-xs group-hover:bg-[#785D4A] transition-all">
                <Sparkles size={20} className="text-[#FAF9F6]" />
              </div>
              <span className="text-2xl font-black text-[#FAF9F6] tracking-tight">
                Brand<span className="text-[#D7C9B8]">Verse</span>
              </span>
            </Link>

            <h2 className="text-4xl lg:text-5xl font-black text-[#FAF9F6] leading-tight tracking-tight">
              Create. <br />
              <span className="text-[#C98B6B]">Connect.</span> <br />
              Collaborate.
            </h2>

            <p className="text-[#EDE7DC]/80 mt-6 leading-relaxed text-base max-w-md font-normal">
              Join thousands of visionary brands and creators forging high-performance partnerships and shaping digital culture together.
            </p>
          </div>

          <div className="relative z-10 mt-10 space-y-4">
            <div className="rounded-2xl p-5 border border-[#4A3A2E] bg-[#3B2F26]">
              <div className="flex items-center gap-2 text-[#C98B6B] font-bold mb-1 text-sm">
                <Zap size={18} />
                <span>Instant Match Engine</span>
              </div>
              <p className="text-xs text-[#EDE7DC]/80 leading-relaxed font-normal">
                Our smart algorithm pairs campaign deliverables with creator demographics seamlessly.
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs text-[#D7C9B8] font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#8B6F5A]" /> Verified Accounts
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#8B6F5A]" /> Secure Payments
              </span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="bg-[#FAF9F6] p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-[#2B241F] tracking-tight">
              Create Your Account
            </h2>
            <p className="text-[#4A3A2E]/70 text-sm mt-1 font-medium">
              Select your role below to get started
            </p>
          </div>

          {/* Toggle */}
          <div className="bg-[#EDE7DC] p-1.5 rounded-2xl border border-[#D7C9B8]/60 flex gap-2 mb-8">
            <button
              onClick={() => setRole("brand")}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                role === "brand"
                  ? "bg-[#8B6F5A] text-[#FAF9F6] shadow-xs"
                  : "text-[#4A3A2E] hover:text-[#2B241F]"
              }`}
            >
              🏢 I'm a Brand
            </button>

            <button
              onClick={() => setRole("creator")}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                role === "creator"
                  ? "bg-[#8B6F5A] text-[#FAF9F6] shadow-xs"
                  : "text-[#4A3A2E] hover:text-[#2B241F]"
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