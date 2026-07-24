import Navbar from "../../Components/Common/Navbar.jsx";
import Footer from "../../Components/Common/Footer.jsx";
import Hero from "../../Components/Common/Hero.jsx";

const Home = () =>{
    return(
        <div className="bg-[#080815]">
            <Navbar/>  
            <Hero/>
            <Footer/>

        </div>
    );
}

export default Home