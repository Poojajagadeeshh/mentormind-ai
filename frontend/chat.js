const API_URL = "http://127.0.0.1:8000";

let chats = JSON.parse(localStorage.getItem("mentormind_chats")) || [];
let currentChat = localStorage.getItem("mentormind_current_chat");

if (currentChat) {
    currentChat = Number(currentChat);
}

/* =========================
   SAVE DATA
========================= */

function saveChats() {
    localStorage.setItem("mentormind_chats", JSON.stringify(chats));

    if (currentChat !== null) {
        localStorage.setItem("mentormind_current_chat", currentChat);
    }
}


/* =========================
   CREATE CHAT
========================= */

function createChat() {

    const id = Date.now();

    const chat = {
        id: id,
        title: "New Chat",
        messages: []
    };

    chats.push(chat);

    currentChat = id;

    saveChats();

    renderChats();
    renderMessages();
}


/* =========================
   RENDER CHAT LIST
========================= */

function renderChats() {

    const list = document.getElementById("chatList");

    if (!list) {
        console.error("chatList not found");
        return;
    }

    list.innerHTML = "";

    chats.forEach(chat => {

        const div = document.createElement("div");
        div.className = "chat-item";

        if (chat.id === currentChat) {
            div.style.border = "1px solid #555";
        }

        const title = document.createElement("span");
        title.innerText = chat.title;

        title.style.flex = "1";

        title.onclick = function () {

            currentChat = chat.id;

            saveChats();

            renderChats();
            renderMessages();
        };


        /* Rename */

        const renameButton = document.createElement("button");

        renameButton.innerText = "✏";

        renameButton.onclick = function (event) {

            event.stopPropagation();

            renameChat(chat.id);
        };


        /* Delete */

        const deleteButton = document.createElement("button");

        deleteButton.innerText = "🗑";

        deleteButton.onclick = function (event) {

            event.stopPropagation();

            deleteChat(chat.id);
        };


        const actions = document.createElement("span");

        actions.appendChild(renameButton);
        actions.appendChild(deleteButton);


        div.appendChild(title);
        div.appendChild(actions);

        list.appendChild(div);
    });
}


/* =========================
   SHOW MESSAGES
========================= */

function renderMessages() {

    const box = document.getElementById("messages");

    if (!box) {
        console.error("messages element not found");
        return;
    }

    box.innerHTML = "";

    const chat = chats.find(c => c.id === currentChat);

    if (!chat) {
        return;
    }

    chat.messages.forEach(message => {

        addMessageToScreen(
            message.role,
            message.text,
            false
        );

    });

    box.scrollTop = box.scrollHeight;
}


/* =========================
   ADD MESSAGE TO SCREEN
========================= */

function addMessageToScreen(role, text, showCopy = true) {

    const box = document.getElementById("messages");

    const row = document.createElement("div");

    row.className =
        "message-row " +
        (role === "user" ? "user-row" : "");


    /* Avatar */

    const avatar = document.createElement("div");

    avatar.className = "avatar";

    avatar.innerText =
        role === "user"
            ? "👤"
            : "🤖";


    /* Message bubble */

    const bubble = document.createElement("div");

    bubble.className =
        "message " + role;

    bubble.innerText = text;


    /* Copy */

    if (role === "assistant" && showCopy) {

        const copyButton = document.createElement("button");

        copyButton.className = "copy-btn";

        copyButton.innerText = "Copy";

        copyButton.onclick = function () {

            navigator.clipboard.writeText(text);

            copyButton.innerText = "Copied!";

            setTimeout(() => {
                copyButton.innerText = "Copy";
            }, 1500);
        };

        bubble.appendChild(copyButton);
    }


    if (role === "user") {

        row.appendChild(bubble);
        row.appendChild(avatar);

    } else {

        row.appendChild(avatar);
        row.appendChild(bubble);
    }


    box.appendChild(row);

    box.scrollTop = box.scrollHeight;
}


/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {

    const input = document.getElementById("messageInput");

    if (!input) {
        console.error("messageInput not found");
        return;
    }

    const text = input.value.trim();

    if (!text) {
        return;
    }


    /* If no chat exists, automatically create one */

    if (!currentChat) {
        createChat();
    }


    const chat = chats.find(c => c.id === currentChat);

    if (!chat) {
        alert("Please create a chat first.");
        return;
    }


    /* Save user message */

    chat.messages.push({
        role: "user",
        text: text
    });


    /* Automatically name chat */

    if (chat.title === "New Chat") {

        chat.title =
            text.length > 25
                ? text.substring(0, 25) + "..."
                : text;
    }


    input.value = "";

    saveChats();

    renderChats();
    renderMessages();


    /* Typing message */

    const typing = document.createElement("div");

    typing.id = "typingIndicator";

    typing.className = "message-row";

    typing.innerHTML = `
        <div class="avatar">🤖</div>
        <div class="message assistant">
            Thinking...
        </div>
    `;

    document.getElementById("messages").appendChild(typing);


    try {

        const response = await fetch(
            API_URL + "/ask/1",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: text
                })
            }
        );


        const data = await response.json();


        /* Remove typing */

        const indicator =
            document.getElementById("typingIndicator");

        if (indicator) {
            indicator.remove();
        }


        let answer = data.answer;


        if (!answer) {

            answer =
                data.detail ||
                "The AI could not generate a response.";
        }


        /* Save AI response */

        chat.messages.push({
            role: "assistant",
            text: answer
        });


        saveChats();

        renderMessages();


    } catch (error) {

        console.error("API ERROR:", error);


        const indicator =
            document.getElementById("typingIndicator");

        if (indicator) {
            indicator.remove();
        }


        const errorMessage =
            "Unable to connect to the AI server. Make sure the FastAPI backend is running on port 8000.";


        chat.messages.push({
            role: "assistant",
            text: errorMessage
        });


        saveChats();

        renderMessages();
    }
}


/* =========================
   RENAME CHAT
========================= */

function renameChat(id) {

    const chat = chats.find(c => c.id === id);

    if (!chat) {
        return;
    }


    const newName =
        prompt(
            "Enter new chat name:",
            chat.title
        );


    if (!newName || !newName.trim()) {
        return;
    }


    chat.title = newName.trim();

    saveChats();

    renderChats();
}


/* =========================
   DELETE CHAT
========================= */

function deleteChat(id) {

    const confirmed =
        confirm("Delete this chat?");

    if (!confirmed) {
        return;
    }


    chats =
        chats.filter(chat => chat.id !== id);


    if (currentChat === id) {

        if (chats.length > 0) {

            currentChat =
                chats[chats.length - 1].id;

        } else {

            currentChat = null;
        }
    }


    saveChats();

    renderChats();
    renderMessages();
}


/* =========================
   EXPORT PDF
========================= */

function exportPDF() {

    if (!currentChat) {

        alert("Open a chat first.");

        return;
    }


    const chat =
        chats.find(c => c.id === currentChat);


    if (!chat) {

        alert("No chat selected.");

        return;
    }


    if (!window.jspdf) {

        alert(
            "PDF library is not loaded. Check your internet connection."
        );

        return;
    }


    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();


    pdf.setFontSize(18);

    pdf.text(
        "MentorMind AI",
        20,
        20
    );


    pdf.setFontSize(11);


    let y = 35;


    chat.messages.forEach(message => {

        const label =
            message.role === "user"
                ? "You:"
                : "MentorMind AI:";


        const lines =
            pdf.splitTextToSize(
                label + " " + message.text,
                170
            );


        if (y + lines.length * 7 > 280) {

            pdf.addPage();

            y = 20;
        }


        pdf.text(
            lines,
            20,
            y
        );


        y +=
            lines.length * 7 + 8;
    });


    pdf.save(
        (chat.title || "MentorMind Chat") +
        ".pdf"
    );
}


/* =========================
   ENTER KEY
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "MentorMind chat.js loaded successfully"
        );


        renderChats();


        if (currentChat) {

            renderMessages();

        } else if (chats.length > 0) {

            currentChat =
                chats[0].id;

            saveChats();

            renderMessages();
        }


        const input =
            document.getElementById(
                "messageInput"
            );


        if (input) {

            input.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter" &&
                        !event.shiftKey
                    ) {

                        event.preventDefault();

                        sendMessage();
                    }
                }
            );
        }
    }
);