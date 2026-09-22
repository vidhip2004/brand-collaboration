import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../Common/InputField";
import authService from "../../services/authService";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

const BrandForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    instagramUsername: "",
    industry: "",
    country: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email || !formData.password || !formData.companyName) {
      setError("Please fill in all required fields (Company Name, Email, Password).");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms & Conditions.");
      return;
    }

    setLoading(true);

    try {
      await authService.registerBrand({
        name: formData.companyName,
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        instagramHandle: formData.instagramUsername,
        industry: formData.industry,
        country: formData.country,
        password: formData.password,
      });

      setSuccess("Account created successfully! Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/brand/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.message || "Brand registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-rose-50 border border-rose-300 text-rose-700 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertCircle size={18} className="text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-[#EDE7DC] border border-[#D7C9B8] text-[#8B6F5A] p-3.5 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle2 size={18} className="text-[#8B6F5A] shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Company Name"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Nike India"
          required
        />

        <InputField
          label="Contact Person"
          name="contactPerson"
          value={formData.contactPerson}
          onChange={handleChange}
          placeholder="Alice Brand"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="brand@company.com"
          required
        />

        <InputField
          label="Instagram Username"
          name="instagramUsername"
          value={formData.instagramUsername}
          onChange={handleChange}
          placeholder="@nike"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Industry"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          placeholder="Fashion & Lifestyle"
        />

        <InputField
          label="Country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="India"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />

        <InputField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />
      </div>

      <div className="flex items-start gap-2.5 pt-1">
        <input
          type="checkbox"
          id="brandAgreeToTerms"
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleChange}
          className="mt-1 accent-[#8B6F5A] cursor-pointer rounded"
        />
        <label htmlFor="brandAgreeToTerms" className="text-[#4A3A2E]/80 text-xs font-medium cursor-pointer">
          I agree to the <span className="text-[#8B6F5A] font-semibold hover:underline">Terms & Conditions</span> and <span className="text-[#8B6F5A] font-semibold hover:underline">Privacy Policy</span>.
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#8B6F5A] hover:bg-[#785D4A] disabled:opacity-60
        text-[#FAF9F6] py-3.5 rounded-xl font-bold text-sm transition-all shadow-xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 mt-2"
      >
        {loading ? (
          "Creating Brand Account..."
        ) : (
          <>
            <span>Create Brand Account</span>
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
};

export default BrandForm;