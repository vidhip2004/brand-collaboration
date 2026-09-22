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
      <label className="block text-sm font-semibold text-[#2B241F] mb-2">
        {label} {required && <span className="text-[#C98B6B]">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full bg-[#FAF9F6] border border-[#D7C9B8] rounded-xl px-4 py-3
        text-[#2B241F] placeholder:text-[#4A3A2E]/45 text-sm font-medium
        focus:outline-none focus:border-[#8B6F5A] focus:ring-4 focus:ring-[#8B6F5A]/15
        shadow-2xs transition disabled:opacity-50 disabled:bg-[#EDE7DC]/40"
      />
    </div>
  );
};

export default InputField;