import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, CheckCircle2, TrendingUp, Star } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen bg-[#050714] overflow-hidden flex items-center pt-24 pb-16">
      {/* Ambient Radial Background Glows */}
      <div className="absolute w-[500px] h-[500px] bg-violet-600/25 rounded-full blur-[160px] top-10 -left-20 pointer-events-none animate-pulse-glow" />
      <div className="absolute w-[450px] h-[450px] bg-cyan-500/20 rounded-full blur-[160px] bottom-10 right-0 pointer-events-none animate-pulse-glow" />
      <div className="absolute w-[350px] h-[350px] bg-indigo-600/15 rounded-full blur-[140px] top-1/2 left-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center relative z-10">
        {/* Left Column */}
        <div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500/15 to-cyan-500/15 border border-violet-500/30 text-violet-300 px-4 py-2 rounded-full mb-8 backdrop-blur-md shadow-inner">
            <Sparkles size={16} className="text-violet-400 animate-spin-slow" />
            <span className="text-xs md:text-sm font-semibold tracking-wide">
              Influencer Marketing Platform of the Future
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] text-white tracking-tight">
            Find the <br className="hidden sm:inline" />
            <span className="gradient-text">Perfect Creator</span> <br />
            For Your Brand.
          </h1>

          <p className="text-slate-300/80 mt-8 text-lg leading-relaxed max-w-xl font-normal">
            Connect directly with verified creators, launch high-ROI campaigns, manage content submissions, and scale your brand identity seamlessly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mt-10">
            <button
              onClick={() => navigate("/brand/find-creators")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all shadow-xl shadow-violet-600/30 hover:shadow-violet-600/50 hover:-translate-y-0.5"
            >
              Explore Creators
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="inline-flex items-center gap-2 border border-white/15 hover:border-violet-500/50 bg-white/[0.04] hover:bg-white/[0.08] px-8 py-4 rounded-2xl text-white font-semibold text-base transition-all backdrop-blur-md hover:-translate-y-0.5"
            >
              Become Creator
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center gap-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <CheckCircle2 size={18} className="text-cyan-400" />
              <span>100% Verified Profiles</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <TrendingUp size={18} className="text-violet-400" />
              <span>Smart AI Matching</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Preview Card */}
        <div className="relative">
          {/* Decorative Floating Pill 1 */}
          <div className="absolute -top-6 -left-6 z-20 bg-slate-900/90 border border-white/15 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-float">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Star size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Match Accuracy</p>
              <p className="text-sm font-bold text-white">98.5% Score</p>
            </div>
          </div>

          {/* Main Card */}
          <div className="glass-card glass-card-hover rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10 relative overflow-hidden group">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=700"
                alt="Creator Spotlight"
                className="rounded-2xl h-[380px] w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80" />
              
              {/* Badge overlay on image */}
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Available for Campaigns</span>
              </div>
            </div>

            {/* Creator Meta */}
            <div className="mt-6 flex justify-between items-center">
              <div>
                <h2 className="text-white text-2xl font-bold tracking-tight">
                  Emily Carter
                </h2>
                <p className="text-violet-300/80 text-sm mt-0.5 font-medium">
                  Lifestyle & Travel Creator
                </p>
              </div>

              <div className="text-right bg-violet-500/10 border border-violet-500/20 px-4 py-2 rounded-xl">
                <h3 className="text-cyan-400 font-extrabold text-xl">
                  240K
                </h3>
                <p className="text-slate-400 text-xs font-medium">
                  Followers
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