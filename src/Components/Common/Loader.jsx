import React from "react";

export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center font-sans">
      <div className="w-8 h-8 border-2 border-[#8B6F5A] border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-xs font-bold text-[#4A3A2E]/70">{text}</p>
    </div>
  );
}
