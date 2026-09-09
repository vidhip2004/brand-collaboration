import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../Common/InputField";
import authService from "../../services/authService";

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
      const response = await authService.registerBrand({
        name: formData.companyName,
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        instagramHandle: formData.instagramUsername,
        industry: formData.industry,
        country: formData.country,
        password: formData.password,
      });

      setSuccess("Account created successfully! Redirecting...");
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
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded-xl text-sm">
          {success}
        </div>
      )}

      <InputField
        label="Company Name"
        name="companyName"
        value={formData.companyName}
        onChange={handleChange}
        placeholder="Nike"
        required
      />

      <InputField
        label="Contact Person"
        name="contactPerson"
        value={formData.contactPerson}
        onChange={handleChange}
        placeholder="John Doe"
      />

      <InputField
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="john@gmail.com"
        required
      />

      <InputField
        label="Instagram Username"
        name="instagramUsername"
        value={formData.instagramUsername}
        onChange={handleChange}
        placeholder="@nike"
      />

      <InputField
        label="Industry"
        name="industry"
        value={formData.industry}
        onChange={handleChange}
        placeholder="Fashion"
      />

      <InputField
        label="Country"
        name="country"
        value={formData.country}
        onChange={handleChange}
        placeholder="India"
      />

      <InputField
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="********"
        required
      />

      <InputField
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="********"
        required
      />

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleChange}
          className="mt-1 accent-violet-600 cursor-pointer"
        />

        <p className="text-gray-400 text-sm">
          I agree to the Terms & Conditions
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60
        text-white py-3 rounded-xl font-semibold transition cursor-pointer"
      >
        {loading ? "Creating Account..." : "Create Brand Account"}
      </button>
    </form>
  );
};

export default BrandForm;