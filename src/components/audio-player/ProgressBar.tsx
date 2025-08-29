import React from "react";

interface ProgressBarProps {
  currentTime: string;
  totalTime: string;
  progress: number;
}

export function ProgressBar({ currentTime, totalTime, progress }: ProgressBarProps) {
  return (
    <div
      style={{
        padding: "0 1.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <span
          style={{
            fontSize: "0.875rem",
            color: "#6B7280",
            fontWeight: "500",
            minWidth: "45px",
          }}
        >
          {currentTime}
        </span>
        <div
          style={{
            flex: 1,
            height: "6px",
            backgroundColor: "#E5E7EB",
            borderRadius: "3px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
              borderRadius: "3px",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <span
          style={{
            fontSize: "0.875rem",
            color: "#6B7280",
            fontWeight: "500",
            minWidth: "45px",
          }}
        >
          {totalTime}
        </span>
      </div>
    </div>
  );
}