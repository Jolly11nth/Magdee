import React, { useState, useRef } from "react";

interface AudioControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  onRestart?: () => void;
  onFastForward: () => void;
  onRewind: () => void;
  hasNextBook: boolean;
  hasPreviousBook: boolean;
  isShuffleMode: boolean;
  onToggleShuffle: () => void;
  isRepeatMode: boolean;
  onToggleRepeat: () => void;
}

export function AudioControls({ isPlaying, onPlayPause, onPlayNext, onPlayPrevious, onRestart, onFastForward, onRewind, hasNextBook, hasPreviousBook, isShuffleMode, onToggleShuffle, isRepeatMode, onToggleRepeat }: AudioControlsProps) {
  const [isDoubleClickPending, setIsDoubleClickPending] = useState(false);
  const [isFastForwarding, setIsFastForwarding] = useState(false);
  const [isRewinding, setIsRewinding] = useState(false);
  const [shuffleClicked, setShuffleClicked] = useState(false);
  const [repeatClicked, setRepeatClicked] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fastForwardTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rewindTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shuffleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const repeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePreviousClick = () => {
    if (isDoubleClickPending) {
      // This is the second click - double click detected
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      setIsDoubleClickPending(false);
      
      // Double click - go to previous book
      if (hasPreviousBook) {
        onPlayPrevious();
      }
    } else {
      // This is the first click - wait to see if there's a second one
      setIsDoubleClickPending(true);
      
      clickTimeoutRef.current = setTimeout(() => {
        // Single click timeout - restart from beginning
        if (onRestart) {
          onRestart();
        } else {
          console.log("Restarting from beginning");
        }
        setIsDoubleClickPending(false);
        clickTimeoutRef.current = null;
      }, 300); // 300ms timeout for double-click detection
    }
  };

  const handleFastForwardClick = () => {
    setIsFastForwarding(true);
    onFastForward();
    
    // Clear existing timeout if any
    if (fastForwardTimeoutRef.current) {
      clearTimeout(fastForwardTimeoutRef.current);
    }
    
    // Reset visual feedback after a short animation
    fastForwardTimeoutRef.current = setTimeout(() => {
      setIsFastForwarding(false);
      fastForwardTimeoutRef.current = null;
    }, 400);
  };

  const handleRewindClick = () => {
    setIsRewinding(true);
    onRewind();
    
    // Clear existing timeout if any
    if (rewindTimeoutRef.current) {
      clearTimeout(rewindTimeoutRef.current);
    }
    
    // Reset visual feedback after a short animation
    rewindTimeoutRef.current = setTimeout(() => {
      setIsRewinding(false);
      rewindTimeoutRef.current = null;
    }, 400);
  };

  const handleShuffleClick = () => {
    setShuffleClicked(true);
    onToggleShuffle();
    
    // Clear existing timeout if any
    if (shuffleTimeoutRef.current) {
      clearTimeout(shuffleTimeoutRef.current);
    }
    
    // Reset click animation after a short duration
    shuffleTimeoutRef.current = setTimeout(() => {
      setShuffleClicked(false);
      shuffleTimeoutRef.current = null;
    }, 200);
  };

  const handleRepeatClick = () => {
    setRepeatClicked(true);
    onToggleRepeat();
    
    // Clear existing timeout if any
    if (repeatTimeoutRef.current) {
      clearTimeout(repeatTimeoutRef.current);
    }
    
    // Reset click animation after a short duration
    repeatTimeoutRef.current = setTimeout(() => {
      setRepeatClicked(false);
      repeatTimeoutRef.current = null;
    }, 200);
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        padding: "0.875rem 0.625rem",
        backgroundColor: "#F8FAFC",
        borderRadius: "1.5rem",
        margin: "0 1rem",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)",
        border: "1px solid rgba(74, 144, 226, 0.1)",
      }}
    >
      {/* Main Controls Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
        }}
      >
        {/* Previous */}
        <button
          onClick={handlePreviousClick}
          className="control-btn"
          style={{
            width: "44px",
            height: "44px",
            backgroundColor: isDoubleClickPending ? "#F3F4F6" : "#ffffff",
            border: `1px solid ${isDoubleClickPending ? "#4A90E2" : "#E5E7EB"}`,
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isDoubleClickPending 
              ? "0 4px 12px rgba(74, 144, 226, 0.2)" 
              : "0 2px 4px rgba(0, 0, 0, 0.06)",
            transition: "all 0.2s ease",
            position: "relative",
            transform: isDoubleClickPending ? "scale(1.05)" : "scale(1)",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDoubleClickPending ? "#4A90E2" : "#6B7280"}
            strokeWidth="2"
          >
            <polygon points="19,20 9,12 19,4" />
            <line x1="5" y1="19" x2="5" y2="5" />
          </svg>
          
          {/* Double-click indicator */}
          <div
            style={{
              position: "absolute",
              bottom: "-2px",
              right: "-2px",
              width: "10px",
              height: "10px",
              backgroundColor: isDoubleClickPending ? "#10B981" : "#4A90E2",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "6px",
              color: "white",
              fontWeight: "bold",
              border: "1px solid #ffffff",
              transform: isDoubleClickPending ? "scale(1.2)" : "scale(1)",
              transition: "all 0.2s ease",
            }}
          >
            2
          </div>
        </button>

        {/* Rewind */}
        <button
          onClick={handleRewindClick}
          className="control-btn"
          style={{
            width: "44px",
            height: "44px",
            backgroundColor: isRewinding ? "#E3F2FD" : "#ffffff",
            border: `1px solid ${isRewinding ? "#4A90E2" : "#E5E7EB"}`,
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isRewinding 
              ? "0 4px 12px rgba(74, 144, 226, 0.3)" 
              : "0 2px 4px rgba(0, 0, 0, 0.06)",
            transition: "all 0.2s ease",
            fontSize: "1.125rem",
            transform: isRewinding ? "scale(1.1)" : "scale(1)",
            position: "relative",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isRewinding ? "#4A90E2" : "#6B7280"}
            strokeWidth="2"
          >
            <polygon points="19,20 9,12 19,4" />
            <polygon points="11,20 1,12 11,4" />
          </svg>
          
          {/* Rewind indicator */}
          {isRewinding && (
            <div
              style={{
                position: "absolute",
                top: "-8px",
                left: "-8px",
                backgroundColor: "#F59E0B",
                color: "white",
                fontSize: "10px",
                fontWeight: "600",
                padding: "2px 4px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "2px",
                border: "1px solid #ffffff",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                animation: "pulse 0.4s ease-in-out",
              }}
            >
              -15s
            </div>
          )}
          
          {/* Permanent 15s indicator */}
          <div
            style={{
              position: "absolute",
              bottom: "-2px",
              left: "-2px",
              width: "12px",
              height: "12px",
              backgroundColor: "#4A90E2",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "6px",
              color: "white",
              fontWeight: "bold",
              border: "1px solid #ffffff",
              transform: isRewinding ? "scale(1.3)" : "scale(1)",
              transition: "all 0.2s ease",
            }}
          >
            15
          </div>
        </button>

        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          style={{
            width: "72px",
            height: "72px",
            background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
            border: "none",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "1.5rem",
            boxShadow: "0 8px 24px rgba(74, 144, 226, 0.4), 0 4px 8px rgba(0, 0, 0, 0.1)",
            transition: "all 0.2s ease",
          }}
        >
          {isPlaying ? (
            <div
              style={{
                display: "flex",
                gap: "4px",
              }}
            >
              <div
                style={{
                  width: "4px",
                  height: "20px",
                  backgroundColor: "#ffffff",
                  borderRadius: "2px",
                }}
              />
              <div
                style={{
                  width: "4px",
                  height: "20px",
                  backgroundColor: "#ffffff",
                  borderRadius: "2px",
                }}
              />
            </div>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="#ffffff"
              style={{ marginLeft: "3px" }}
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Fast Forward */}
        <button
          onClick={handleFastForwardClick}
          className="control-btn"
          style={{
            width: "44px",
            height: "44px",
            backgroundColor: isFastForwarding ? "#E3F2FD" : "#ffffff",
            border: `1px solid ${isFastForwarding ? "#4A90E2" : "#E5E7EB"}`,
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isFastForwarding 
              ? "0 4px 12px rgba(74, 144, 226, 0.3)" 
              : "0 2px 4px rgba(0, 0, 0, 0.06)",
            transition: "all 0.2s ease",
            transform: isFastForwarding ? "scale(1.1)" : "scale(1)",
            position: "relative",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isFastForwarding ? "#4A90E2" : "#6B7280"}
            strokeWidth="2"
          >
            <polygon points="5,4 15,12 5,20" />
            <polygon points="13,4 23,12 13,20" />
          </svg>
          
          {/* Fast-forward indicator */}
          {isFastForwarding && (
            <div
              style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                backgroundColor: "#10B981",
                color: "white",
                fontSize: "10px",
                fontWeight: "600",
                padding: "2px 4px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "2px",
                border: "1px solid #ffffff",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                animation: "pulse 0.4s ease-in-out",
              }}
            >
              +15s
            </div>
          )}
          
          {/* Permanent 15s indicator */}
          <div
            style={{
              position: "absolute",
              bottom: "-2px",
              right: "-2px",
              width: "12px",
              height: "12px",
              backgroundColor: "#4A90E2",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "6px",
              color: "white",
              fontWeight: "bold",
              border: "1px solid #ffffff",
              transform: isFastForwarding ? "scale(1.3)" : "scale(1)",
              transition: "all 0.2s ease",
            }}
          >
            15
          </div>
        </button>

        {/* Next */}
        <button
          onClick={onPlayNext}
          className="control-btn"
          style={{
            width: "44px",
            height: "44px",
            backgroundColor: "#ffffff",
            border: `1px solid ${hasNextBook ? (isShuffleMode ? "#4A90E2" : "#E5E7EB") : "#F3F4F6"}`,
            borderRadius: "50%",
            cursor: hasNextBook ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: hasNextBook 
              ? (isShuffleMode ? "0 4px 12px rgba(74, 144, 226, 0.2)" : "0 2px 4px rgba(0, 0, 0, 0.06)")
              : "none",
            transition: "all 0.2s ease",
            opacity: hasNextBook ? 1 : 0.5,
            position: "relative",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={hasNextBook ? (isShuffleMode ? "#4A90E2" : "#6B7280") : "#9CA3AF"}
            strokeWidth="2"
          >
            <polygon points="5,4 15,12 5,20" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
          
          {/* Shuffle indicator for next button */}
          {isShuffleMode && hasNextBook && (
            <div
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                width: "8px",
                height: "8px",
                backgroundColor: "#10B981",
                borderRadius: "50%",
                border: "1px solid #ffffff",
                animation: "pulse 2s infinite",
              }}
            />
          )}
        </button>
      </div>

      {/* Secondary Controls Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
        }}
      >
        {/* Shuffle */}
        <button
          onClick={handleShuffleClick}
          className="control-btn"
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: isShuffleMode ? "#4A90E2" : "#ffffff",
            border: `1px solid ${isShuffleMode ? "#4A90E2" : "#E5E7EB"}`,
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isShuffleMode 
              ? "0 4px 16px rgba(74, 144, 226, 0.4)" 
              : "0 2px 4px rgba(0, 0, 0, 0.06)",
            transition: "all 0.2s ease",
            transform: shuffleClicked ? "scale(0.95)" : "scale(1)",
            position: "relative",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isShuffleMode ? "#ffffff" : "#6B7280"}
            strokeWidth="2"
          >
            <polyline points="16,3 21,3 21,8" />
            <path d="M4 20L21 3" />
            <polyline points="21,16 21,21 16,21" />
            <path d="M15 15L21 21" />
            <path d="M4 4L9 9" />
          </svg>
          
          {/* Shuffle active indicator */}
          {isShuffleMode && (
            <div
              style={{
                position: "absolute",
                top: "-6px",
                right: "-6px",
                width: "8px",
                height: "8px",
                backgroundColor: "#10B981",
                borderRadius: "50%",
                border: "1px solid #ffffff",
                animation: "pulse 2s infinite",
              }}
            />
          )}
          
          {/* Shuffle mode label */}
          {shuffleClicked && (
            <div
              style={{
                position: "absolute",
                bottom: "-24px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: isShuffleMode ? "#10B981" : "#6B7280",
                color: "white",
                fontSize: "10px",
                fontWeight: "600",
                padding: "2px 6px",
                borderRadius: "4px",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                animation: "slideDown 0.2s ease-out",
              }}
            >
              {isShuffleMode ? "Shuffle ON" : "Shuffle OFF"}
            </div>
          )}
        </button>

        {/* Repeat */}
        <button
          onClick={handleRepeatClick}
          className="control-btn"
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: isRepeatMode ? "#4A90E2" : "#ffffff",
            border: `1px solid ${isRepeatMode ? "#4A90E2" : "#E5E7EB"}`,
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isRepeatMode 
              ? "0 4px 16px rgba(74, 144, 226, 0.4)" 
              : "0 2px 4px rgba(0, 0, 0, 0.06)",
            transition: "all 0.2s ease",
            transform: repeatClicked ? "scale(0.95)" : "scale(1)",
            position: "relative",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isRepeatMode ? "#ffffff" : "#6B7280"}
            strokeWidth="2"
          >
            <polyline points="17,1 21,5 17,9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7,23 3,19 7,15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          
          {/* Repeat active indicator */}
          {isRepeatMode && (
            <div
              style={{
                position: "absolute",
                top: "-6px",
                right: "-6px",
                width: "8px",
                height: "8px",
                backgroundColor: "#10B981",
                borderRadius: "50%",
                border: "1px solid #ffffff",
                animation: "pulse 2s infinite",
              }}
            />
          )}
          
          {/* Repeat mode label */}
          {repeatClicked && (
            <div
              style={{
                position: "absolute",
                bottom: "-24px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: isRepeatMode ? "#10B981" : "#6B7280",
                color: "white",
                fontSize: "10px",
                fontWeight: "600",
                padding: "2px 6px",
                borderRadius: "4px",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                animation: "slideDown 0.2s ease-out",
              }}
            >
              {isRepeatMode ? "Repeat ON" : "Repeat OFF"}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}