import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../Common/InputField";
import authService from "../../services/authService";

const CreatorForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    // username: "",
    email: "",
    instagramUsername: "",
    primaryNiche: "",
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

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields (Full Name, Email, Password).");
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
      const response = await authService.registerCreator({
        name: formData.name,
        // username: formData.username,
        email: formData.email,
        instagramHandle: formData.instagramUsername,
        niche: formData.primaryNiche,
        country: formData.country,
        password: formData.password,
      });

      setSuccess("Creator account created successfully! Redirecting...");
      setTimeout(() => {
        navigate("/creator/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.message || "Creator registration failed. Please try again.");
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
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Emily Carter"
        required
      />

      {/* <InputField
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="emilycreates"
      /> */}

      <InputField
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="emily@gmail.com"
        required
      />

      <InputField
        label="Instagram Username"
        name="instagramUsername"
        value={formData.instagramUsername}
        onChange={handleChange}
        placeholder="@emilycreates"
      />

      <InputField
        label="Primary Niche"
        name="primaryNiche"
        value={formData.primaryNiche}
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
          className="mt-1 accent-cyan-600 cursor-pointer"
        />

        <p className="text-gray-400 text-sm">
          I agree to the Terms & Conditions
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60
        text-white py-3 rounded-xl font-semibold transition cursor-pointer"
      >
        {loading ? "Creating Account..." : "Create Creator Account"}
      </button>
    </form>
  );
};

export default CreatorForm;