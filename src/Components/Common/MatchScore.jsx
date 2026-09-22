import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const MatchScore = ({
  score = 0,
  level = "Match",
  reasons = [],
  compact = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getScoreText = () => {
    if (score >= 85) {
      return "text-[#2B241F]";
    }
    if (score >= 70) {
      return "text-[#4A3A2E]";
    }
    if (score >= 50) {
      return "text-[#8B6F5A]";
    }
    return "text-[#C98B6B]";
  };

  const getScoreBackground = () => {
    return "bg-[#FAF9F6] border-[#D7C9B8]";
  };

  const getProgressWidth = () => {
    return `${Math.min(100, Math.max(0, score))}%`;
  };

  return (
    <div
      className={`rounded-2xl border ${getScoreBackground()} ${
        compact ? "p-3" : "p-4"
      } font-sans shadow-2xs`}
    >
      {/* SCORE HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EDE7DC] border border-[#D7C9B8]/60 shadow-2xs">
            <Sparkles size={15} className="text-[#8B6F5A]" />
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold text-[#4A3A2E]/60 tracking-wider">
              Smart Match
            </p>
            <p className={`text-xs font-black ${getScoreText()}`}>
              {level}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-xl font-black ${getScoreText()}`}>
            {score}%
          </p>
          <p className="text-[10px] text-[#4A3A2E]/60 font-medium">
            compatibility
          </p>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#EDE7DC]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#8B6F5A] to-[#C98B6B] transition-all duration-700"
          style={{
            width: getProgressWidth(),
          }}
        />
      </div>

      {/* DETAILS BUTTON */}
      {reasons.length > 0 && (
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="mt-2.5 flex w-full items-center justify-between text-[11px] font-bold text-[#4A3A2E]/70 transition hover:text-[#2B241F]"
        >
          <span className="flex items-center gap-1.5">
            <Info size={13} className="text-[#8B6F5A]" />
            Why this match?
          </span>

          {showDetails ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
        </button>
      )}

      {/* DETAILS LIST */}
      {showDetails && (
        <div className="mt-2.5 space-y-1.5 border-t border-[#D7C9B8]/40 pt-2.5">
          {reasons.map((reason, index) => {
            const isInfo = reason.type === "info";

            return (
              <div
                key={`${reason.type}-${index}`}
                className="flex items-start gap-2 text-xs"
              >
                {isInfo ? (
                  <Info
                    size={13}
                    className="mt-0.5 shrink-0 text-[#4A3A2E]/50"
                  />
                ) : (
                  <CheckCircle2
                    size={13}
                    className="mt-0.5 shrink-0 text-[#8B6F5A]"
                  />
                )}

                <span
                  className={
                    isInfo
                      ? "text-[#4A3A2E]/60 font-medium"
                      : "text-[#4A3A2E] font-semibold"
                  }
                >
                  {reason.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchScore;