import InputField from "../Common/InputField";

const BrandForm = () => {
  return (
    <form className="space-y-5">

      <InputField
        label="Company Name"
        placeholder="Nike"
      />

      <InputField
        label="Contact Person"
        placeholder="John Doe"
      />

      <InputField
        label="Email Address"
        type="email"
        placeholder="john@gmail.com"
      />

      <InputField
        label="Instagram Username"
        placeholder="@nike"
      />

      <InputField
        label="Industry"
        placeholder="Fashion"
      />

      <InputField
        label="Country"
        placeholder="India"
      />

      <InputField
        label="Password"
        type="password"
        placeholder="********"
      />

      <InputField
        label="Confirm Password"
        type="password"
        placeholder="********"
      />

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 accent-violet-600"
        />

        <p className="text-gray-400 text-sm">
          I agree to the Terms & Conditions
        </p>
      </div>

      <button
        className="w-full bg-violet-600 hover:bg-violet-700
        text-white py-3 rounded-xl font-semibold transition"
      >
        Create Brand Account
      </button>

    </form>
  );
};

export default BrandForm;