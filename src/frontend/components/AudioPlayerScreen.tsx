import React, { useState, useEffect } from "react";
import { ArrowLeft, Home, Headphones, User, Settings } from "lucide-react";
import { AudioControls } from "./audio-player/AudioControls";
import { ProgressBar } from "./audio-player/ProgressBar";
import { ReadingTextArea } from "./audio-player/ReadingTextArea";
import { useNotificationHelpers } from "./NotificationHelpers";

interface AudioPlayerScreenProps {
  onNavigate: (screen: string) => void;
  book: {
    id: string;
    title: string;
    author: string;
    cover: string;
    duration: string;
    chapters: number;
    genre: string;
  } | null;
  books: Array<{
    id: string;
    title: string;
    author: string;
    cover: string;
    duration: string;
    chapters: number;
    genre: string;
  }>;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  onFastForward: () => void;
  onRewind: () => void;
  isShuffleMode: boolean;
  onToggleShuffle: () => void;
  isRepeatMode: boolean;
  onToggleRepeat: () => void;
  onBookEnd: () => void;
}

export function AudioPlayerScreen({ onNavigate, book, books, onPlayNext, onPlayPrevious, onFastForward, onRewind, isShuffleMode, onToggleShuffle, isRepeatMode, onToggleRepeat, onBookEnd }: AudioPlayerScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const { notifyChapterComplete, notifyBookComplete, notifyListeningBreak, notifyShuffleMode, notifyRepeatMode, notifySpeedTip } = useNotificationHelpers();

  // Simulate listening time tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackTime(prev => prev + 1);
        
        // Notify about long listening session every 45 minutes (2700 seconds)
        if (playbackTime > 0 && playbackTime % 2700 === 0) {
          notifyListeningBreak(Math.floor(playbackTime / 60));
        }
        
        // Show speed tip after 10 minutes of listening
        if (playbackTime === 600) {
          notifySpeedTip();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackTime, notifyListeningBreak, notifySpeedTip]);

  // Notify when shuffle/repeat modes change
  useEffect(() => {
    if (isShuffleMode) {
      notifyShuffleMode(true);
    }
  }, [isShuffleMode, notifyShuffleMode]);

  useEffect(() => {
    if (isRepeatMode) {
      notifyRepeatMode(true);
    }
  }, [isRepeatMode, notifyRepeatMode]);

  if (!book) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          backgroundColor: "#ffffff",
        }}
      >
        <p>No book selected</p>
      </div>
    );
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    // Simulate chapter completion notifications randomly when pausing
    if (isPlaying && Math.random() > 0.7) {
      const currentChapter = Math.floor(Math.random() * book!.chapters) + 1;
      notifyChapterComplete(currentChapter, book!.chapters, book!.title);
      
      // Simulate book completion if it's the last chapter
      if (currentChapter === book!.chapters) {
        setTimeout(() => {
          notifyBookComplete(book!.title);
        }, 1500);
      }
    }
  };

  const handleRestart = () => {
    console.log("Restarting audio from beginning");
    // Here you would reset the audio position to 0
    // For now, we'll just log it and potentially restart playback
    setIsPlaying(true);
  };

  return (
    <div
      style={{
        height: "100%",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Poppins, sans-serif",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #F3F4F6",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => onNavigate("back")}
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
          <ArrowLeft size={24} color="#374151" />
        </button>

        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1F2937" }}>
            {book.title}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#6B7280", marginTop: "2px" }}>
            by {book.author}
          </div>
        </div>

        <button
          onClick={() => onNavigate("language")}
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
      </div>

      {/* Reading Text Area */}
      <div style={{ marginBottom: "20px", height: "380px", marginTop: "-20px" }}>
        <ReadingTextArea title={book.title} author={book.author} />
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: "20px" }}>
        <ProgressBar currentTime="12:34" totalTime="45:22" progress={28} />
      </div>

      {/* Audio Controls */}
      <div style={{ marginBottom: "105px" }}>
        <AudioControls 
          isPlaying={isPlaying} 
          onPlayPause={handlePlayPause} 
          onPlayNext={onPlayNext}
          onPlayPrevious={onPlayPrevious}
          onRestart={handleRestart}
          onFastForward={onFastForward}
          onRewind={onRewind}
          hasNextBook={books.length > 1}
          hasPreviousBook={books.length > 1}
          isShuffleMode={isShuffleMode}
          onToggleShuffle={onToggleShuffle}
          isRepeatMode={isRepeatMode}
          onToggleRepeat={onToggleRepeat}
        />
      </div>

      {/* Bottom Navigation */}
      <div
        style={{
          position: "absolute",
          bottom: "1.25rem",
          left: "1.25rem",
          right: "1.25rem",
          backgroundColor: "#E3F2FD",
          borderRadius: "15px",
          padding: "0 1rem",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => onNavigate("home")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            color: "#6B7280",
          }}
        >
          <Home size={24} />
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: "500",
            }}
          >
            Home
          </span>
        </button>

        <button
          onClick={() => onNavigate("library")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            color: "#4A90E2",
          }}
        >
          <Headphones size={24} />
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: "500",
            }}
          >
            Audio books
          </span>
        </button>

        <button
          onClick={() => onNavigate("profile")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            color: "#6B7280",
          }}
        >
          <User size={24} />
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: "500",
            }}
          >
            Profile
          </span>
        </button>
      </div>
    </div>
  );
}