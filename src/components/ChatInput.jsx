import React, { useState } from "react";

const ChatInput = ({ onSend }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() === "") return;
    onSend(message);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        style={{
          flex: 1,
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <button
        onClick={handleSend}
        style={{
          padding: "10px 20px",
          borderRadius: "5px",
          backgroundColor: "#1976d2",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;