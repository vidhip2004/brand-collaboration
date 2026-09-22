import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-[#FAF9F6] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden bg-[#2B241F] p-8 sm:p-14 text-[#FAF9F6] border border-[#4A3A2E]/50 shadow-[0_16px_40px_-8px_rgba(43,36,31,0.25)]">
          {/* Ambient decorative warm glow orbs inside CTA */}
          <div className="absolute w-96 h-96 bg-[#8B6F5A]/20 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />
          <div className="absolute w-96 h-96 bg-[#C98B6B]/15 rounded-full blur-3xl -bottom-20 -right-20 pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#4A3A2E] border border-[#8B6F5A]/40 px-4 py-1.5 rounded-full text-xs font-bold text-[#EDE7DC] mb-6 backdrop-blur-md">
              <Sparkles size={14} className="text-[#C98B6B]" />
              <span>Scale Your Reach in 2026</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-[#FAF9F6]">
              Ready to launch your next viral collaboration?
            </h2>

            <p className="text-[#EDE7DC]/80 text-base sm:text-lg mt-5 leading-relaxed max-w-2xl font-normal">
              Join thousands of fast-growing brands and verified creators collaborating, managing campaigns, and getting paid seamlessly on BrandVerse.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-8">
              <button
                onClick={() => navigate("/signup")}
                className="inline-flex items-center gap-2.5 bg-[#FAF9F6] text-[#2B241F] hover:bg-[#EDE7DC] px-8 py-4 rounded-2xl font-extrabold text-base shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <span>Get Started for Free</span>
                <ArrowRight size={18} className="text-[#8B6F5A]" />
              </button>

              <button
                onClick={() => navigate("/brand/find-creators")}
                className="inline-flex items-center gap-2 border border-[#D7C9B8]/40 hover:border-[#D7C9B8] bg-white/5 hover:bg-white/10 px-8 py-4 rounded-2xl text-[#FAF9F6] font-bold text-base backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <span>Browse Talent</span>
                <Zap size={16} className="text-[#C98B6B]" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t border-[#4A3A2E] text-xs sm:text-sm font-semibold text-[#D7C9B8]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#8B6F5A]" /> Free 14-day brand trial
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#8B6F5A]" /> 0% fee for initial creator deals
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#8B6F5A]" /> Instant escrow releases
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;