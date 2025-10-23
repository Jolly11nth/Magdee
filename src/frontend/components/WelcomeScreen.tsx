import React from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function WelcomeScreen({ onNavigate }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Main Heading */}
      <h1
        style={{
          fontSize: "20 px",
          fontWeight: "500",
          color: "#3598DB",
          textAlign: "center",
          marginBottom: "100px",
          maxWidth: "320px",
          lineHeight: "1.4",
        }}
      >
        Experience seamless document conversion and audio
        quality!
      </h1>

      {/* Logo */}
      <div
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ImageWithFallback
          src="/assets/images/magdee-logo.png"
          alt="Magdee Logo"
          style={{
            width: "299px",
            height: "281px",
            objectFit: "contain",
          }}
        />
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "280px",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <button
          onClick={() => onNavigate("login")}
          className="transition-all"
          style={{
            width: "100%",
            height: "52px",
            backgroundColor: "transparent",
            color: "#4A90E2",
            border: "2px solid #4A90E2",
            borderRadius: "1rem",
            fontSize: "1rem",
            textAlign: "center",
            fontWeight: "600",
            cursor: "pointer",
            fontFamily: "Poppins, sans-serif",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#4A90E2";
            e.target.style.color = "white";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "#4A90E2";
          }}
        >
          Sign In
        </button>
        <button
          onClick={() => onNavigate("signup")}
          className="transition-all"
          style={{
            width: "100%",
            height: "52px",
            backgroundColor: "#4A90E2",
            color: "white",
            border: "none",
            borderRadius: "1rem",
            fontSize: "1rem",
            textAlign: "center",
            fontWeight: "600",
            cursor: "pointer",
            fontFamily: "Poppins, sans-serif",
            boxShadow: "0 4px 12px rgba(74, 144, 226, 0.3)",
          }}
        >
          Create Account
        </button>
      </div>

      <p
        style={{
          color: "#999999",
          fontSize: "0.75rem",
          marginTop: "2rem",
          textAlign: "center",
          maxWidth: "280px",
          lineHeight: "1.5",
        }}
      >
        Join thousands of users who have transformed their
        reading experience with Magdee
      </p>

      {/* Debug Button */}
      <div
        style={{
          textAlign: "center",
          marginTop: "1rem",
        }}
      >
        <button
          onClick={() => onNavigate("auth-debug")}
          style={{
            backgroundColor: "transparent",
            border: "1px solid #E5E7EB",
            color: "#6B7280",
            fontSize: "0.75rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          🔧 Debug Auth
        </button>
      </div>
    </div>
  );
}