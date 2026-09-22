import React from "react";
import { Users, Briefcase, DollarSign, Sparkles, ArrowUpRight } from "lucide-react";

const stats = [
  {
    label: "Active Verified Creators",
    value: "15,000+",
    growth: "+28% this month",
    icon: Users,
  },
  {
    label: "Successful Campaigns",
    value: "4,800+",
    growth: "99.2% satisfaction",
    icon: Briefcase,
  },
  {
    label: "Total Creator Payouts",
    value: "₹12.5 Cr+",
    growth: "Instant & Escrowed",
    icon: DollarSign,
  },
  {
    label: "Smart Match Accuracy",
    value: "98.4%",
    growth: "Powered pairing",
    icon: Sparkles,
  },
];

const Stats = () => {
  return (
    <section className="py-20 bg-[#EDE7DC]/35 relative overflow-hidden border-y border-[#D7C9B8]/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest font-black text-[#8B6F5A] bg-[#EDE7DC] px-3.5 py-1.5 rounded-full border border-[#D7C9B8]/60">
            Platform Numbers
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#2B241F] mt-4 tracking-tight">
            Powering the Modern Creator Economy
          </h2>
          <p className="text-[#4A3A2E]/80 mt-3 text-base">
            Real data from real partnerships. Thousands of brands and creators collaborate on BrandVerse daily.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#FAF9F6] rounded-2xl p-6 sm:p-7 border border-[#D7C9B8]/60 shadow-[0_4px_20px_-4px_rgba(74,58,46,0.04)] hover:shadow-[0_10px_28px_-4px_rgba(74,58,46,0.08)] hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-[#EDE7DC] text-[#8B6F5A] border-[#D7C9B8]/60">
                    <Icon size={22} />
                  </div>
                  <span className="text-xs font-bold text-[#4A3A2E]/60 flex items-center gap-0.5 group-hover:text-[#8B6F5A] transition-colors">
                    <span>Explore</span>
                    <ArrowUpRight size={13} />
                  </span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-[#2B241F] tracking-tight">
                  {item.value}
                </h3>
                <p className="text-[#4A3A2E] text-sm font-semibold mt-1">
                  {item.label}
                </p>
                <div className="mt-4 pt-4 border-t border-[#D7C9B8]/30 flex items-center gap-1.5 text-xs font-bold text-[#8B6F5A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B6F5A]" />
                  <span>{item.growth}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;