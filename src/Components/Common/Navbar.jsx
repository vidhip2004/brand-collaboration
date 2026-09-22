import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, X, Sparkles, ArrowRight } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-[#FAF9F6]/90 border-b border-[#D7C9B8]/40 transition-all shadow-[0_2px_12px_-2px_rgba(74,58,46,0.04)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#8B6F5A] text-[#FAF9F6] flex items-center justify-center shadow-sm group-hover:bg-[#785D4A] group-hover:scale-105 transition-all">
            <Sparkles size={20} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#2B241F]">
            Brand<span className="text-[#8B6F5A]">Verse</span>
          </h1>
        </Link>

        {/* Links */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#4A3A2E]/80">
          <li>
            <Link to="/" className="hover:text-[#8B6F5A] transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link to="/brand/find-creators" className="hover:text-[#8B6F5A] transition-colors">
              Find Creators
            </Link>
          </li>
          <li>
            <Link to="/creator/discover-campaigns" className="hover:text-[#8B6F5A] transition-colors">
              Campaigns
            </Link>
          </li>
          <li>
            <Link to="/collaboration-workspace" className="hover:text-[#8B6F5A] transition-colors">
              Workspace
            </Link>
          </li>
        </ul>

        {/* Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            className="px-5 py-2.5 rounded-xl border border-[#D7C9B8] hover:border-[#8B6F5A] hover:bg-[#EDE7DC]/60 text-[#4A3A2E] hover:text-[#2B241F] font-semibold text-sm transition-all shadow-xs"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="px-5 py-2.5 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-[#FAF9F6] font-semibold text-sm transition-all shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
            onClick={() => navigate("/signup")}
          >
            <span>Sign Up</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Mobile Icon */}
        <button
          className="md:hidden p-2.5 rounded-xl text-[#4A3A2E] hover:text-[#2B241F] hover:bg-[#EDE7DC] transition"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pt-3 pb-6 border-b border-[#D7C9B8]/40 bg-[#FAF9F6]/98 backdrop-blur-md space-y-4 shadow-lg">
          <div className="flex flex-col gap-3 font-semibold text-[#4A3A2E] pt-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 hover:text-[#8B6F5A] transition border-b border-[#EDE7DC]"
            >
              Home
            </Link>
            <Link
              to="/brand/find-creators"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 hover:text-[#8B6F5A] transition border-b border-[#EDE7DC]"
            >
              Find Creators
            </Link>
            <Link
              to="/creator/discover-campaigns"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 hover:text-[#8B6F5A] transition border-b border-[#EDE7DC]"
            >
              Campaigns
            </Link>
            <Link
              to="/collaboration-workspace"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 hover:text-[#8B6F5A] transition"
            >
              Workspace
            </Link>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <button
              className="w-full py-3 rounded-xl border border-[#D7C9B8] text-[#2B241F] font-semibold text-sm hover:bg-[#EDE7DC] transition"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/login");
              }}
            >
              Login
            </button>
            <button
              className="w-full py-3 rounded-xl bg-[#8B6F5A] hover:bg-[#785D4A] text-[#FAF9F6] font-semibold text-sm transition shadow-sm"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/signup");
              }}
            >
              Sign Up Free
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;