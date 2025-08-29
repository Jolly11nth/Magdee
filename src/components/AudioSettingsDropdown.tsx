import React, { useState, useRef, useEffect } from "react";
import { Settings, ChevronDown, Globe, Gauge, Mic } from "lucide-react";

interface AudioSettingsDropdownProps {
  onClose?: () => void;
}

export function AudioSettingsDropdown({ onClose }: AudioSettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: string) => {
    console.log(`Selected: ${option}`);
    setIsOpen(false);
    onClose?.();
    // Handle option selection here
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      {/* Dropdown Trigger Button */}
      <button
        onClick={toggleDropdown}
        style={{
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "0.5rem",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Settings size={24} color="#374151" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: "0",
            marginTop: "8px",
            backgroundColor: "#ffffff",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            minWidth: "200px",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#F9FAFB",
              borderBottom: "1px solid #E5E7EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Audio Settings
            </span>
            <ChevronDown size={16} color="#6B7280" />
          </div>

          {/* Menu Options */}
          <div style={{ padding: "8px 0" }}>
            {/* Language Option */}
            <button
              onClick={() => handleOptionClick("language")}
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "0.875rem",
                color: "#374151",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F3F4F6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Globe size={18} color="#6B7280" />
              <span>Language</span>
            </button>

            {/* Speed Option */}
            <button
              onClick={() => handleOptionClick("speed")}
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "0.875rem",
                color: "#374151",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F3F4F6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Gauge size={18} color="#6B7280" />
              <span>Speed</span>
            </button>

            {/* Voice Option */}
            <button
              onClick={() => handleOptionClick("voice")}
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "0.875rem",
                color: "#374151",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F3F4F6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Mic size={18} color="#6B7280" />
              <span>Voice</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}