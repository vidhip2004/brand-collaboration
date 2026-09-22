import Navbar from "../../Components/Common/Navbar.jsx";
import Footer from "../../Components/Common/Footer.jsx";
import Hero from "../../Components/Common/Hero.jsx";
import Stats from "../../Components/Common/Stats.jsx";
import CTA from "../../Components/Common/CTA.jsx";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2B241F] selection:bg-[#8B6F5A]/20 selection:text-[#2B241F]">
      <Navbar />  
      <Hero />
      <Stats />
      <CTA />
      <Footer />
    </div>
  );
};

export default Home;