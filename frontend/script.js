// === CONFIG ===
const API_URL = "http://127.0.0.1:8000/chat"; 

/* DOM */
const chatsList = document.getElementById("chatsList");
const newChatBtn = document.getElementById("newChatBtn");
const searchInput = document.getElementById("searchInput");
const messagesEl = document.getElementById("messages");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const exportBtn = document.getElementById("exportBtn");
const attachBtn = document.getElementById("attachBtn");
const micBtn = document.getElementById("micBtn");
const shareBtn = document.getElementById("shareBtn");
const sampleBtn = document.getElementById("sampleBtn") || null;

let chats = JSON.parse(localStorage.getItem("galaxy_chats_v2") || "[]");
let activeChatId = null;

/* utils */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function save() { localStorage.setItem("galaxy_chats_v2", JSON.stringify(chats)); }
function findChat(id) { return chats.find(c => c.id === id); }

/* Render chat list */
function renderChatList(filter = "") {
    chatsList.innerHTML = "";
    const list = chats.slice().reverse();

    list
    .filter(c => (c.title || "").toLowerCase().includes(filter.toLowerCase()))
    .forEach(chat => {
        const el = document.createElement("div");
        el.className = "chat-item";
        el.dataset.id = chat.id;

        el.innerHTML = `
            <div class="avatar">${(chat.title || "Chat").slice(0, 2).toUpperCase()}</div>
            <div class="meta">
                <div class="title">${chat.title || "New chat"}</div>
                <div class="sub">${chat.last || "No messages yet"}</div>
            </div>
        `;

        el.onclick = () => openChat(chat.id);
        chatsList.appendChild(el);
    });
}

/* Open chat */
function openChat(id) {
    activeChatId = id;
    const chat = findChat(id);

    messagesEl.innerHTML = "";

    if (!chat || !chat.messages || chat.messages.length === 0) {
        showWelcome();
    } else {
        chat.messages.forEach(m => appendMessage(m.text, m.role, m.time));
    }

    scrollToBottom();
}

/* Welcome message */
function showWelcome() {
    messagesEl.innerHTML = `
        <div class="welcome-card">
            <h2>Welcome to Galaxy AI 🚀</h2>
            <p>Type your message below.</p>
            <div class="quick-actions">
                <button id="sampleBtnInner" class="ghost">Try "Hi"</button>
            </div>
        </div>
    `;

    const i = document.getElementById("sampleBtnInner");
    if (i) i.onclick = () => {
        userInput.value = "Hi";
        adjustTextarea();
        userInput.focus();
    };
}

/* Append message */
function appendMessage(text, role = "ai", time = null) {
    const welcome = messagesEl.querySelector(".welcome-card");
    if (welcome) welcome.remove();

    const row = document.createElement("div");
    row.className = "msg-row " + (role === "user" ? "user" : "ai");

    const msg = document.createElement("div");
    msg.className = "message " + (role === "user" ? "user" : "ai");
    msg.innerText = text;

    const meta = document.createElement("div");
    meta.className = "small-meta";
    meta.innerText = time || nowTime();

    row.appendChild(msg);
    row.appendChild(meta);

    messagesEl.appendChild(row);
    scrollToBottom();
}

/* Typing */
function showTyping() {
    removeTyping();

    const row = document.createElement("div");
    row.className = "msg-row ai";
    row.dataset.typing = "1";

    row.innerHTML = `
        <div class="message ai">
            <span class="typing-dots">
                <span></span><span></span><span></span>
            </span>
        </div>
    `;

    messagesEl.appendChild(row);
    scrollToBottom();
}

function removeTyping() {
    const t = messagesEl.querySelector("[data-typing='1']");
    if (t) t.remove();
}

/* Scroll */
function scrollToBottom() {
    setTimeout(() => {
        document.querySelector(".chat-area").scrollTop =
            document.querySelector(".chat-area").scrollHeight;
    }, 30);
}

/* New chat */
function createNewChat() {
    const id = uid();
    chats.push({ id, title: "New chat", last: "", messages: [] });
    save();
    renderChatList();
    openChat(id);
}

/* Resize input */
function adjustTextarea() {
    userInput.style.height = "auto";
    userInput.style.height = Math.min(160, userInput.scrollHeight) + "px";
}

/* Send message */
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    if (!activeChatId) createNewChat();
    const chat = findChat(activeChatId);

    const t = nowTime();
    chat.messages.push({ role: "user", text, time: t });
    chat.last = text.slice(0, 50);

    save();
    renderChatList(searchInput.value);

    appendMessage(text, "user", t);

    userInput.value = "";
    adjustTextarea();
    userInput.focus();

    showTyping();

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        if (!res.ok) throw new Error("Backend error");

        const json = await res.json();
        const reply = json.reply || json.text || json.message;

        removeTyping();

        const rt = nowTime();
        appendMessage(reply, "ai", rt);

        chat.messages.push({ role: "assistant", text: reply, time: rt });
        chat.last = reply.slice(0, 60);

        save();
        renderChatList(searchInput.value);

    } catch (e) {
        removeTyping();
        appendMessage("⚠ Error: " + e.message, "ai", nowTime());
    }
}

/* Clear & Export */
function clearAll() {
    if (!confirm("Clear all chats?")) return;
    chats = [];
    save();
    renderChatList();
    messagesEl.innerHTML = "";
    showWelcome();
}

function exportChats() {
    const blob = new Blob([JSON.stringify(chats, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "galaxy_chats.json";
    a.click();
}

/* Share */
function shareConversation() {
    const chat = findChat(activeChatId);
    if (!chat) return alert("No chat opened");

    const text = chat.messages.map(m => `${m.role}: ${m.text}`).join("\n\n");
    navigator.clipboard.writeText(text);

    alert("Copied!");
}

/* Events */
newChatBtn.onclick = createNewChat;
searchInput.oninput = e => renderChatList(e.target.value);
sendBtn.onclick = sendMessage;
userInput.oninput = adjustTextarea;

userInput.onkeydown = e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
};

clearBtn.onclick = clearAll;
exportBtn.onclick = exportChats;
attachBtn.onclick = () => alert("Attach not implemented");
micBtn.onclick = () => alert("Mic coming soon!");
shareBtn.onclick = shareConversation;

/* INIT */
(function init() {
    if (!chats.length) createNewChat();
    else {
        renderChatList();
        openChat(chats[chats.length - 1].id);
    }
    adjustTextarea();
})();
