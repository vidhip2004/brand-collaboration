import { Link, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <h1 className="text-2xl font-extrabold tracking-wide text-white">
          Brand<span className="text-violet-500">Verse</span>
        </h1>

        {/* Links */}
        <ul className="hidden md:flex items-center gap-8 text-gray-300">
          <li className="hover:text-violet-400 cursor-pointer transition">
            Home
          </li>
          <li className="hover:text-violet-400 cursor-pointer transition">
            Creators
          </li>
          <li className="hover:text-violet-400 cursor-pointer transition">
            Campaigns
          </li>
          <li className="hover:text-violet-400 cursor-pointer transition">
            About
          </li>
        </ul>

        {/* Buttons */}
        <div className="hidden md:flex gap-4">
          <button className="hover:bg-violet-400 text-white py-2 px-4 rounded-lg transition" onClick={()=>navigate("/login")}>
            Login
          </button>
          <button className="hover:bg-violet-400 text-white py-2 px-4 rounded-lg transition" onClick={()=>navigate("/signup")}>
            Sign Up
          </button>
        </div>

        {/* Mobile Icon */}
        <button className="md:hidden text-white">
          <Menu size={28} />
        </button>

      </div>
    </nav>
  );
};

export default Navbar;