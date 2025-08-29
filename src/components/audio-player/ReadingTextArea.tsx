import React from "react";

interface ReadingTextAreaProps {
  title: string;
  author: string;
}

export function ReadingTextArea({ title, author }: ReadingTextAreaProps) {
  return (
    <div
      style={{
        height: "380px",
        backgroundColor: "#F8FAFC",
        margin: "0 1rem",
        marginBottom: "5rem",
        borderRadius: "1.5rem",
        padding: "1.5rem",
        border: "1px solid rgba(74, 144, 226, 0.1)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Chapter/Section Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid rgba(74, 144, 226, 0.1)",
        }}
      >
        <div
          style={{
            fontSize: "0.875rem",
            color: "#6B7280",
            fontWeight: "500",
            marginBottom: "0.5rem",
          }}
        >
          Chapter 1
        </div>
        <div
          style={{
            fontSize: "1.125rem",
            fontWeight: "600",
            color: "#1F2937",
            lineHeight: "1.4",
          }}
        >
          Introduction to {title}
        </div>
      </div>

      {/* Reading Text */}
      <div
        style={{
          fontSize: "1rem",
          lineHeight: "1.8",
          color: "#374151",
          textAlign: "justify",
          flex: 1,
        }}
      >
        <p style={{ marginBottom: "1.5rem" }}>
          Welcome to this transformative journey through{" "}
          <strong>"{title}"</strong> by {author}. In this comprehensive
          exploration, we will delve deep into the fundamental concepts that will
          reshape your understanding and approach to personal growth.
        </p>

        <p style={{ marginBottom: "1.5rem" }}>
          <span
            style={{
              backgroundColor: "rgba(74, 144, 226, 0.1)",
              padding: "2px 6px",
              borderRadius: "4px",
              color: "#4A90E2",
              fontWeight: "500",
            }}
          >
            The foundation of all meaningful change begins with understanding.
          </span>{" "}
          Throughout this audiobook, you will discover practical strategies and
          time-tested principles that have guided countless individuals toward
          success and fulfillment.
        </p>

        <p style={{ marginBottom: "1.5rem" }}>
          Each chapter builds upon the previous one, creating a comprehensive
          framework for personal development. As we progress through these
          concepts, you'll find yourself equipped with the tools necessary to
          implement lasting positive changes in your life.
        </p>

        <p style={{ marginBottom: "1.5rem" }}>
          The key insights you'll gain from this experience include:
        </p>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            marginBottom: "1.5rem",
          }}
        >
          <li
            style={{
              marginBottom: "0.75rem",
              paddingLeft: "1.5rem",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "0",
                color: "#4A90E2",
                fontWeight: "600",
              }}
            >
              •
            </span>
            Fundamental principles for sustainable growth and development
          </li>
          <li
            style={{
              marginBottom: "0.75rem",
              paddingLeft: "1.5rem",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "0",
                color: "#4A90E2",
                fontWeight: "600",
              }}
            >
              •
            </span>
            Practical strategies you can implement immediately
          </li>
          <li
            style={{
              marginBottom: "0.75rem",
              paddingLeft: "1.5rem",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "0",
                color: "#4A90E2",
                fontWeight: "600",
              }}
            >
              •
            </span>
            Real-world applications of theoretical concepts
          </li>
        </ul>

        <p>
          As we embark on this journey together, remember that knowledge without
          action remains merely potential. The true transformation occurs when
          you apply these principles consistently in your daily life.
        </p>
      </div>
    </div>
  );
}