import React from "react";

function Message({ role, content }) {
  const isUser = role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        padding: "10px"
      }}
    >
      <div
        style={{
          background: isUser ? "#4CAF50" : "#444654",
          color: "white",
          padding: "10px 15px",
          borderRadius: "10px",
          maxWidth: "60%"
        }}
      >
        {content}
      </div>
    </div>
  );
}

export default Message;