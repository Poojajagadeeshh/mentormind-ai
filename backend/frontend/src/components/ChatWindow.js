import React, { useState } from "react";
import Message from "./Message";

function ChatWindow({ messages, onSend }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.messages}>
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} content={msg.content} />
        ))}
      </div>

      <div style={styles.inputArea}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Type your message..."
        />
        <button style={styles.button} onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#343541",
    height: "100vh"
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "20px"
  },
  inputArea: {
    display: "flex",
    padding: "10px",
    background: "#40414F"
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    marginRight: "10px"
  },
  button: {
    padding: "10px 15px",
    background: "#19c37d",
    border: "none",
    cursor: "pointer",
    color: "white"
  }
};

export default ChatWindow;