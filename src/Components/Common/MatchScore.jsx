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

  const [
    showDetails,
    setShowDetails,
  ] = useState(false);


  const getScoreText = () => {

    if (score >= 85) {
      return "text-emerald-400";
    }

    if (score >= 70) {
      return "text-cyan-400";
    }

    if (score >= 50) {
      return "text-yellow-400";
    }

    return "text-orange-400";
  };


  const getScoreBackground = () => {

    if (score >= 85) {
      return "bg-emerald-500/10 border-emerald-500/20";
    }

    if (score >= 70) {
      return "bg-cyan-500/10 border-cyan-500/20";
    }

    if (score >= 50) {
      return "bg-yellow-500/10 border-yellow-500/20";
    }

    return "bg-orange-500/10 border-orange-500/20";
  };


  const getProgressWidth = () => {
    return `${Math.min(
      100,
      Math.max(0, score)
    )}%`;
  };


  return (
    <div
      className={`rounded-xl border ${getScoreBackground()} ${
        compact ? "p-3" : "p-4"
      }`}
    >

      {/* SCORE HEADER */}

      <div className="flex items-center justify-between gap-3">

        <div className="flex items-center gap-2">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">

            <Sparkles
              size={17}
              className="text-violet-400"
            />

          </div>

          <div>

            <p className="text-xs text-gray-500">
              Smart Match
            </p>

            <p
              className={`font-semibold ${getScoreText()}`}
            >
              {level}
            </p>

          </div>

        </div>


        <div className="text-right">

          <p
            className={`text-2xl font-bold ${getScoreText()}`}
          >
            {score}%
          </p>

          <p className="text-[10px] text-gray-500">
            compatibility
          </p>

        </div>

      </div>


      {/* PROGRESS BAR */}

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-800">

        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-700"
          style={{
            width: getProgressWidth(),
          }}
        />

      </div>


      {/* DETAILS BUTTON */}

      {reasons.length > 0 && (

        <button
          type="button"
          onClick={() =>
            setShowDetails(
              !showDetails
            )
          }
          className="mt-3 flex w-full items-center justify-between text-xs text-gray-400 transition hover:text-white"
        >

          <span className="flex items-center gap-2">

            <Info size={14} />

            Why this match?

          </span>

          {showDetails ? (
            <ChevronUp size={15} />
          ) : (
            <ChevronDown size={15} />
          )}

        </button>

      )}


      {/* DETAILS */}

      {showDetails && (

        <div className="mt-3 space-y-2 border-t border-white/10 pt-3">

          {reasons.map(
            (reason, index) => {

              const isInfo =
                reason.type ===
                "info";

              return (
                <div
                  key={`${reason.type}-${index}`}
                  className="flex items-start gap-2 text-xs"
                >

                  {isInfo ? (
                    <Info
                      size={14}
                      className="mt-0.5 shrink-0 text-gray-500"
                    />
                  ) : (
                    <CheckCircle2
                      size={14}
                      className="mt-0.5 shrink-0 text-emerald-400"
                    />
                  )}

                  <span
                    className={
                      isInfo
                        ? "text-gray-500"
                        : "text-gray-300"
                    }
                  >
                    {reason.label}
                  </span>

                </div>
              );
            }
          )}

        </div>

      )}

    </div>
  );
};


export default MatchScore;