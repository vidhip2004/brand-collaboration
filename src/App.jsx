import Home from "./Pages/Public/Home.jsx";
import { Route,Routes } from "react-router-dom";
import Signup from "./Pages/Auth/Signup.jsx";
function App()
{
  return(
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;