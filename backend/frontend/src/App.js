import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

function App() {
  const API = "http://127.0.0.1:8000";

  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  // ---------------- LOGIN ----------------
  const login = async () => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData
    });

    const data = await res.json();

    if (data.access_token) {
      setToken(data.access_token);
    } else {
      alert("Login failed");
    }
  };

  // ---------------- LOAD CHATS ----------------
  const loadChats = async () => {
    const res = await fetch(`${API}/my-chats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setChats(data);
  };

  useEffect(() => {
    if (token) loadChats();
  }, [token]);

  // ---------------- CREATE CHAT ----------------
  const createChat = async () => {
    const res = await fetch(`${API}/create-chat`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setCurrentChatId(data.chat_id);
    setMessages([]);
    loadChats();
  };

  // ---------------- SELECT CHAT ----------------
  const selectChat = async (chatId) => {
    setCurrentChatId(chatId);

    const res = await fetch(`${API}/chat/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setMessages(data);
  };

  // ---------------- SEND MESSAGE ----------------
  const sendMessage = async (text) => {
    if (!currentChatId) return;

    // Show user message instantly
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    const res = await fetch(`${API}/ask/${currentChatId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();

    // Add AI response
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.answer }
    ]);
  };

  // ---------------- DELETE CHAT ----------------
  const deleteChat = async (chatId) => {
    await fetch(`${API}/delete-chat/${chatId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    setMessages([]);
    setCurrentChatId(null);
    loadChats();
  };

  // ---------------- RENAME CHAT ----------------
  const renameChat = async (chatId) => {
    const newTitle = prompt("Enter new chat name:");
    if (!newTitle) return;

    await fetch(`${API}/rename-chat/${chatId}?title=${newTitle}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });

    loadChats();
  };

  // ---------------- LOGIN UI ----------------
  if (!token) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>MentorMind AI</h2>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") login();
          }}
        />
        <br /><br />

        <button onClick={login}>Login</button>
      </div>
    );
  }

  // ---------------- MAIN UI ----------------
  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        chats={chats}
        onNewChat={createChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
      />

      <ChatWindow
        messages={messages}
        onSend={sendMessage}
      />
    </div>
  );
}

export default App;