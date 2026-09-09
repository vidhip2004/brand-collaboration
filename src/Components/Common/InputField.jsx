const InputField = ({
  label,
  type = "text",
  placeholder,
  name,
  value,
  onChange,
  required = false,
  disabled = false,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full bg-[#1A1A30] border border-gray-700 rounded-xl px-4 py-3
        text-white placeholder-gray-500
        focus:outline-none focus:ring-2 focus:ring-violet-500
        focus:border-transparent transition disabled:opacity-50"
      />
    </div>
  );
};

export default InputField;