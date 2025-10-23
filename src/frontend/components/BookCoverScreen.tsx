import React from "react";
import {
  ArrowLeft,
  Play,
  Heart,
  Download,
  Share,
  Clock,
  BookOpen,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  duration?: string;
  chapters?: number;
  description?: string;
  genre?: string;
  rating?: number;
  progress?: number;
}

interface BookCoverScreenProps {
  book: Book;
  onNavigate: (screen: string) => void;
  onPlay?: (book: Book) => void;
}

export function BookCoverScreen({ book, onNavigate, onPlay }: BookCoverScreenProps) {
  const handlePlayBook = () => {
    if (onPlay) {
      onPlay(book);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #4A90E2 0%, #74b9ff 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "3rem 1.5rem 1rem 1.5rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        <button
          onClick={() => onNavigate("back")}
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            border: "none",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
          }}
        >
          <ArrowLeft size={20} color="white" />
        </button>

        <button
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            border: "none",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
          }}
        >
          <Share size={20} color="white" />
        </button>
      </div>

      {/* Book Cover */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "2rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
        }}
      >
        <div
          style={{
            width: "220px",
            height: "300px",
            backgroundColor: "#ffffff",
            borderRadius: "1.5rem",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            position: "relative",
          }}
        >
          <ImageWithFallback
            src={book.cover}
            alt={book.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          
          {/* Progress indicator if book is partially read */}
          {book.progress && book.progress > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "4px",
                backgroundColor: "rgba(255,255,255,0.3)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  backgroundColor: "#4A90E2",
                  width: `${book.progress}%`,
                  borderRadius: "0 0 1.5rem 1.5rem",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Content Container */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "2rem 2rem 0 0",
          padding: "2rem 1.5rem",
          minHeight: "45%",
          position: "relative",
          flex: 1,
        }}
      >
        {/* Book Info */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#1F2937",
              marginBottom: "0.5rem",
              lineHeight: "1.3",
            }}
          >
            {book.title}
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "#6B7280",
              marginBottom: "1rem",
            }}
          >
            By {book.author}
          </p>

          {/* Book Stats */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            {book.duration && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Clock size={16} color="#6B7280" />
                <span style={{ fontSize: "0.9rem", color: "#6B7280" }}>
                  {book.duration}
                </span>
              </div>
            )}
            {book.chapters && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <BookOpen size={16} color="#6B7280" />
                <span style={{ fontSize: "0.9rem", color: "#6B7280" }}>
                  {book.chapters} chapters
                </span>
              </div>
            )}
            {book.rating && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.9rem", color: "#6B7280" }}>
                  ⭐ {book.rating}/5
                </span>
              </div>
            )}
          </div>

          {/* Genre Tag */}
          {book.genre && (
            <div
              style={{
                display: "inline-block",
                backgroundColor: "#E3F2FD",
                color: "#4A90E2",
                padding: "0.5rem 1rem",
                borderRadius: "1rem",
                fontSize: "0.8rem",
                fontWeight: "500",
                marginBottom: "1.5rem",
              }}
            >
              {book.genre}
            </div>
          )}

          {/* Description */}
          {book.description && (
            <p
              style={{
                fontSize: "0.9rem",
                color: "#6B7280",
                lineHeight: "1.6",
                marginBottom: "2rem",
              }}
            >
              {book.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <button
            onClick={handlePlayBook}
            style={{
              flex: 1,
              backgroundColor: "#4A90E2",
              color: "white",
              border: "none",
              borderRadius: "1rem",
              padding: "1rem",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <Play size={20} fill="white" />
            {book.progress && book.progress > 0 ? "Continue" : "Play"}
          </button>

          <button
            style={{
              width: "56px",
              height: "56px",
              backgroundColor: "#F3F4F6",
              border: "none",
              borderRadius: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Heart size={20} color="#6B7280" />
          </button>

          <button
            style={{
              width: "56px",
              height: "56px",
              backgroundColor: "#F3F4F6",
              border: "none",
              borderRadius: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Download size={20} color="#6B7280" />
          </button>
        </div>
      </div>
    </div>
  );
}