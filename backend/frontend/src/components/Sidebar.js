import React from "react";

function Sidebar({ chats, onNewChat, onSelectChat, onDeleteChat, onRenameChat }) {
  return (
    <div style={styles.sidebar}>
      <button style={styles.newChatBtn} onClick={onNewChat}>
        + New Chat
      </button>

      <div style={styles.chatList}>
        {chats.map((chat) => (
          <div key={chat.id} style={styles.chatItem}>
            <span onClick={() => onSelectChat(chat.id)}>
              {chat.title || `Chat #${chat.id}`}
            </span>

            <div style={styles.actions}>
              <button onClick={() => onRenameChat(chat.id)}>✏</button>
              <button onClick={() => onDeleteChat(chat.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "250px",
    background: "#202123",
    color: "white",
    padding: "15px",
    height: "100vh",
    display: "flex",
    flexDirection: "column"
  },
  newChatBtn: {
    padding: "10px",
    background: "#343541",
    color: "white",
    border: "none",
    cursor: "pointer",
    marginBottom: "15px"
  },
  chatList: {
    flex: 1,
    overflowY: "auto"
  },
  chatItem: {
    padding: "10px",
    background: "#343541",
    marginBottom: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  actions: {
    display: "flex",
    gap: "5px"
  }
};

export default Sidebar;