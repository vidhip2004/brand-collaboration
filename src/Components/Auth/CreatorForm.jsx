import InputField from "../Common/InputField";

const CreatorForm = () => {
  return (
    <form className="space-y-5">

      <InputField
        label="Full Name"
        placeholder="Emily Carter"
      />

      <InputField
        label="Username"
        placeholder="emilycreates"
      />

      <InputField
        label="Email Address"
        type="email"
        placeholder="emily@gmail.com"
      />

      <InputField
        label="Instagram Username"
        placeholder="@emilycreates"
      />

      <InputField
        label="Primary Niche"
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
        className="w-full bg-cyan-600 hover:bg-cyan-700
        text-white py-3 rounded-xl font-semibold transition"
      >
        Create Creator Account
      </button>

    </form>
  );
};

export default CreatorForm;