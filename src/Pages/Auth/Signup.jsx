import { useState } from "react";
import AuthLayout from "../../Components/Common/AuthLayout";

const Signup = () => {
  const [role, setRole] = useState("brand");

  return (
    <div className="min-h-screen bg-[#080815]">
      <AuthLayout role={role} setRole={setRole} />
    </div>
  );
};

export default Signup;