import React from "react";

/**
 * Single comment row: avatar, name, role, bubble (text + time).
 * Uses existing classes: comment-row, avatar, meta-left, meta-name, meta-role, bubble, meta-time.
 */
const CommentItem = ({ comment, isOutgoing }) => {
  const name = comment?.user?.name || "User";
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";
  const role = comment?.user?.role ?? "";
  const text = comment?.comment ?? "";
  const time = comment?.createdAt
    ? new Date(comment.createdAt).toLocaleString()
    : "";

  return (
    <div className={`comment-row ${isOutgoing ? "outgoing" : "incoming"}`}>
      <div className="avatar" aria-hidden>{initials}</div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isOutgoing ? "flex-end" : "flex-start",
        }}
      >
        <div className="meta-left">
          <div className="meta-name">{name}</div>
          <div className="meta-role">{role}</div>
        </div>
        <div className={`bubble ${isOutgoing ? "requester" : "datamember"}`}>
          <div style={{ fontSize: 14, color: "#0f172a" }}>{text}</div>
          <div
            className="meta-time"
            style={{
              marginTop: 8,
              textAlign: isOutgoing ? "right" : "left",
              fontSize: 11,
              color: "#94a3b8",
            }}
          >
            {time}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
