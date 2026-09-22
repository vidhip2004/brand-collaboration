import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, CheckCircle2, TrendingUp, Star, Zap, ShieldCheck } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[92vh] bg-[#FAF9F6] overflow-hidden flex items-center pt-28 pb-16">
      {/* Ambient Radial Background Glows for Warm Theme */}
      <div className="absolute w-[550px] h-[550px] bg-[#EDE7DC]/60 rounded-full blur-[140px] top-10 -left-20 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-[#D7C9B8]/30 rounded-full blur-[140px] bottom-10 right-0 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-[#EDE7DC]/40 rounded-full blur-[120px] top-1/2 left-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-14 items-center relative z-10">
        {/* Left Column */}
        <div>
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-[#EDE7DC] border border-[#D7C9B8]/60 text-[#8B6F5A] px-4 py-2 rounded-full mb-8 shadow-xs backdrop-blur-md">
            <Sparkles size={16} className="text-[#8B6F5A]" />
            <span className="text-xs md:text-sm font-bold tracking-wide">
              ⚡ Next-Gen Influencer & Creator Platform
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.08] text-[#2B241F] tracking-tight">
            Find the <br className="hidden sm:inline" />
            <span className="text-[#8B6F5A]">Perfect Creator</span> <br />
            For Your Brand.
          </h1>

          <p className="text-[#4A3A2E]/80 mt-7 text-lg sm:text-xl leading-relaxed max-w-xl font-normal">
            Connect directly with verified creators, launch high-ROI campaigns, approve deliverables, and process instant transparent payouts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mt-9">
            <button
              onClick={() => navigate("/brand/find-creators")}
              className="inline-flex items-center gap-2.5 bg-[#8B6F5A] hover:bg-[#785D4A] px-8 py-4 rounded-2xl text-[#FAF9F6] font-bold text-base transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Explore Creators</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="inline-flex items-center gap-2 border border-[#D7C9B8] hover:border-[#8B6F5A] bg-[#FAF9F6] hover:bg-[#EDE7DC]/70 px-8 py-4 rounded-2xl text-[#2B241F] hover:text-[#8B6F5A] font-bold text-base transition-all shadow-xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Join as Creator</span>
              <Zap size={16} className="text-[#C98B6B]" />
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-wrap items-center gap-6 pt-6 border-t border-[#D7C9B8]/50">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#4A3A2E]">
              <CheckCircle2 size={18} className="text-[#8B6F5A]" />
              <span>100% Verified Profiles</span>
            </div>
    
            <div className="flex items-center gap-2 text-sm font-semibold text-[#4A3A2E]">
              <ShieldCheck size={18} className="text-[#8B6F5A]" />
              <span>Secure Milestones</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Preview Card */}
        <div className="relative">
          {/* Decorative Floating Pill 1: Match Score */}
          <div className="absolute -top-5 -left-4 sm:-left-6 z-20 bg-[#FAF9F6]/95 border border-[#D7C9B8]/70 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-md flex items-center gap-3 animate-float">
            <div className="w-10 h-10 rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] flex items-center justify-center text-[#8B6F5A]">
              <Star size={20} className="fill-[#8B6F5A]" />
            </div>
            <div>
              <p className="text-xs text-[#4A3A2E]/70 font-semibold">Match Score</p>
              <p className="text-sm font-extrabold text-[#2B241F]">98.5% Perfect Match</p>
            </div>
          </div>

          {/* Decorative Floating Pill 2: Instant Payout */}
          <div className="absolute -bottom-5 -right-3 sm:-right-5 z-20 bg-[#FAF9F6]/95 border border-[#D7C9B8]/70 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-md flex items-center gap-3 animate-float" style={{ animationDelay: "2s" }}>
            <div className="w-10 h-10 rounded-xl bg-[#EDE7DC] border border-[#D7C9B8] flex items-center justify-center text-[#8B6F5A] font-bold text-sm">
              $
            </div>
            <div>
              <p className="text-xs text-[#4A3A2E]/70 font-semibold">Creator Payout</p>
              <p className="text-sm font-extrabold text-[#8B6F5A]">Verified & Paid</p>
            </div>
          </div>

          {/* Main Showcase Card */}
          <div className="bg-[#FAF9F6] rounded-3xl p-6 sm:p-7 shadow-[0_10px_32px_-6px_rgba(74,58,46,0.08)] border border-[#D7C9B8]/70 relative overflow-hidden group hover:shadow-[0_14px_40px_-6px_rgba(74,58,46,0.12)] transition-all duration-300">
            <div className="relative overflow-hidden rounded-2xl bg-[#EDE7DC]">
              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=700"
                alt="Creator Spotlight"
                className="rounded-2xl h-[360px] sm:h-[390px] w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2B241F]/80 via-transparent to-transparent opacity-80" />
              
              {/* Badge overlay on image */}
              <div className="absolute top-4 right-4 bg-[#FAF9F6]/95 backdrop-blur-md border border-[#D7C9B8]/60 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#2B241F] flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#8B6F5A] animate-ping" />
                <span>Open for Collaborations</span>
              </div>

              {/* Text overlay at bottom of photo */}
              <div className="absolute bottom-4 left-4 right-4 text-[#FAF9F6]">
                <span className="px-3 py-1 rounded-full bg-[#2B241F]/60 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#FAF9F6]">
                  Lifestyle & Aesthetics
                </span>
              </div>
            </div>

            {/* Creator Meta */}
            <div className="mt-5 flex justify-between items-center">
              <div>
                <h2 className="text-[#2B241F] text-2xl font-black tracking-tight">
                  Emily Carter
                </h2>
                <p className="text-[#8B6F5A] text-sm mt-0.5 font-semibold">
                  @emilycreates · Los Angeles, CA
                </p>
              </div>

              <div className="text-right bg-[#EDE7DC] border border-[#D7C9B8]/60 px-4 py-2.5 rounded-2xl shadow-xs">
                <h3 className="text-[#8B6F5A] font-black text-xl">
                  240K
                </h3>
                <p className="text-[#4A3A2E]/70 text-xs font-semibold">
                  Engaged Reach
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;