const InputField = ({
  label,
  type = "text",
  placeholder,
  name,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="w-full bg-[#1A1A30] border border-gray-700 rounded-xl px-4 py-3
        text-white placeholder-gray-500
        focus:outline-none focus:ring-2 focus:ring-violet-500
        focus:border-transparent transition"
      />
    </div>
  );
};

export default InputField;