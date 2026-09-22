import { Sparkles, Mail, Globe, Share2, MessageSquare, Send } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#EDE7DC]/40 border-t border-[#D7C9B8]/50 relative overflow-hidden">
      {/* Background warm glow accent */}
      <div className="absolute w-[450px] h-[220px] bg-[#D7C9B8]/30 rounded-full blur-[120px] bottom-0 left-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#8B6F5A] text-[#FAF9F6] flex items-center justify-center shadow-xs group-hover:bg-[#785D4A] group-hover:scale-105 transition-all">
                <Sparkles size={18} />
              </div>
              <h2 className="text-2xl font-black text-[#2B241F] tracking-tight">
                Brand<span className="text-[#8B6F5A]">Verse</span>
              </h2>
            </Link>

            <p className="text-[#4A3A2E]/80 mt-4 text-sm leading-relaxed max-w-sm">
              The modern collaboration ecosystem connecting forward-thinking brands with top-tier digital creators. Powering high-impact campaigns worldwide.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="w-9 h-9 rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] hover:bg-[#EDE7DC] hover:border-[#8B6F5A]/50 text-[#4A3A2E] hover:text-[#8B6F5A] flex items-center justify-center transition-all shadow-xs">
                <Globe size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] hover:bg-[#EDE7DC] hover:border-[#8B6F5A]/50 text-[#4A3A2E] hover:text-[#8B6F5A] flex items-center justify-center transition-all shadow-xs">
                <Share2 size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] hover:bg-[#EDE7DC] hover:border-[#8B6F5A]/50 text-[#4A3A2E] hover:text-[#8B6F5A] flex items-center justify-center transition-all shadow-xs">
                <MessageSquare size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl border border-[#D7C9B8] bg-[#FAF9F6] hover:bg-[#EDE7DC] hover:border-[#8B6F5A]/50 text-[#4A3A2E] hover:text-[#8B6F5A] flex items-center justify-center transition-all shadow-xs">
                <Send size={16} />
              </a>
            </div>
          </div>

          {/* Column 1 */}
          <div>
            <h3 className="text-[#2B241F] font-bold text-xs tracking-wider uppercase mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm text-[#4A3A2E]/80 font-medium">
              <li>
                <Link to="/brand/find-creators" className="hover:text-[#8B6F5A] transition-colors">
                  Find Creators
                </Link>
              </li>
              <li>
                <Link to="/creator/discover-campaigns" className="hover:text-[#8B6F5A] transition-colors">
                  Discover Campaigns
                </Link>
              </li>
              <li>
                <Link to="/collaboration-workspace" className="hover:text-[#8B6F5A] transition-colors">
                  Collaboration Hub
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-[#8B6F5A] transition-colors">
                  Join as Creator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-[#2B241F] font-bold text-xs tracking-wider uppercase mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm text-[#4A3A2E]/80 font-medium">
              <li><a href="#" className="hover:text-[#8B6F5A] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[#8B6F5A] transition-colors">Success Stories</a></li>
              <li><a href="#" className="hover:text-[#8B6F5A] transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-[#8B6F5A] transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-[#2B241F] font-bold text-xs tracking-wider uppercase mb-4">
              Contact
            </h3>
            <p className="text-[#4A3A2E] text-sm flex items-center gap-2 mb-3 font-medium">
              <Mail size={16} className="text-[#8B6F5A]" />
              hello@brandverse.com
            </p>
            <div className="p-3.5 rounded-2xl border border-[#D7C9B8]/60 bg-[#FAF9F6] shadow-xs">
              <p className="text-xs text-[#4A3A2E]/70 font-medium">Need immediate assistance?</p>
              <p className="text-xs text-[#8B6F5A] font-bold mt-1">24/7 Creator Support</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#D7C9B8]/40 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4A3A2E]/60">
          <p>© 2026 BrandVerse Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 font-medium">
            <a href="#" className="hover:text-[#2B241F] transition">Terms of Service</a>
            <a href="#" className="hover:text-[#2B241F] transition">Privacy Settings</a>
            <a href="#" className="hover:text-[#2B241F] transition">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;