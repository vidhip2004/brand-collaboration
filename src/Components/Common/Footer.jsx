import { Sparkles, Mail, Globe, Share2, MessageSquare, Send } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#03040c] border-t border-white/10 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute w-[400px] h-[200px] bg-violet-600/10 rounded-full blur-[120px] bottom-0 left-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-600/20 group-hover:scale-105 transition-transform">
                <Sparkles size={18} className="text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Brand<span className="gradient-text">Verse</span>
              </h2>
            </Link>

            <p className="text-slate-400 mt-4 text-sm leading-relaxed max-w-sm">
              The premier collaboration ecosystem connecting forward-thinking brands with top-tier digital creators. Powering high-impact campaigns worldwide.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-violet-600/20 hover:border-violet-500/40 text-slate-400 hover:text-white flex items-center justify-center transition-all">
                <Globe size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-violet-600/20 hover:border-violet-500/40 text-slate-400 hover:text-white flex items-center justify-center transition-all">
                <Share2 size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-violet-600/20 hover:border-violet-500/40 text-slate-400 hover:text-white flex items-center justify-center transition-all">
                <MessageSquare size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-violet-600/20 hover:border-violet-500/40 text-slate-400 hover:text-white flex items-center justify-center transition-all">
                <Send size={16} />
              </a>
            </div>
          </div>

          {/* Column 1 */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400 font-medium">
              <li>
                <Link to="/brand/find-creators" className="hover:text-violet-400 transition-colors">
                  Find Creators
                </Link>
              </li>
              <li>
                <Link to="/creator/discover-campaigns" className="hover:text-violet-400 transition-colors">
                  Discover Campaigns
                </Link>
              </li>
              <li>
                <Link to="/collaboration-workspace" className="hover:text-violet-400 transition-colors">
                  Collaboration Hub
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-violet-400 transition-colors">
                  Join as Creator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400 font-medium">
              <li><a href="#" className="hover:text-violet-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Success Stories</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              Contact
            </h3>
            <p className="text-slate-400 text-sm flex items-center gap-2 mb-3">
              <Mail size={16} className="text-violet-400" />
              hello@brandverse.com
            </p>
            <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
              <p className="text-xs text-slate-400 font-medium">Need immediate assistance?</p>
              <p className="text-xs text-violet-400 font-semibold mt-1">24/7 Support Available</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 BrandVerse Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-400 transition">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition">Privacy Settings</a>
            <a href="#" className="hover:text-slate-400 transition">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;