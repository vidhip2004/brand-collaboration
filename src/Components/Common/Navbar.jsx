import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-2xl bg-[#050714]/80 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-600/25 group-hover:scale-105 transition-transform">
            <Sparkles size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Brand<span className="gradient-text">Verse</span>
          </h1>
        </Link>

        {/* Links */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <li>
            <Link to="/" className="hover:text-violet-400 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link to="/brand/find-creators" className="hover:text-violet-400 transition-colors">
              Creators
            </Link>
          </li>
          <li>
            <Link to="/creator/discover-campaigns" className="hover:text-violet-400 transition-colors">
              Campaigns
            </Link>
          </li>
          <li>
            <Link to="/collaboration-workspace" className="hover:text-violet-400 transition-colors">
              Workspace
            </Link>
          </li>
        </ul>

        {/* Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-violet-500/40 hover:bg-white/5 text-gray-200 hover:text-white font-semibold text-sm transition-all"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 hover:-translate-y-0.5"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </div>

        {/* Mobile Icon */}
        <button
          className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pt-2 pb-6 border-b border-white/10 bg-[#050714]/95 backdrop-blur-2xl space-y-4">
          <div className="flex flex-col gap-3 font-medium text-gray-300 pt-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-violet-400 transition"
            >
              Home
            </Link>
            <Link
              to="/brand/find-creators"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-violet-400 transition"
            >
              Creators
            </Link>
            <Link
              to="/creator/discover-campaigns"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-violet-400 transition"
            >
              Campaigns
            </Link>
            <Link
              to="/collaboration-workspace"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-violet-400 transition"
            >
              Workspace
            </Link>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <button
              className="w-full py-3 rounded-xl border border-white/10 text-white font-semibold text-sm hover:bg-white/5 transition"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/login");
              }}
            >
              Login
            </button>
            <button
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm transition shadow-lg shadow-violet-600/25"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/signup");
              }}
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;