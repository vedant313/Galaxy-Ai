// ============================================================
//  GALAXYX AI — FINAL PREMIUM JS (2025 POLISHED EDITION)
//  Smooth • Fast • Mobile-Perfect • Bug-Free
// ============================================================

// === CONFIG ===
const API_URL = "https://galaxy-ai-3.onrender.com/chat";

// ------------------------------------------------------------
// DOM ELEMENTS (SAFE REFERENCES)
// ------------------------------------------------------------
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
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");

// ------------------------------------------------------------
// UTILITIES
// ------------------------------------------------------------
let chats = JSON.parse(localStorage.getItem("galaxy_chats_v2") || "[]");
let activeChatId = null;

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const nowTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const escapeHTML = (t) =>
  t.replace(/</g, "&lt;").replace(/>/g, "&gt;");

function save() {
  localStorage.setItem("galaxy_chats_v2", JSON.stringify(chats));
}
function findChat(id) {
  return chats.find((c) => c.id === id);
}

// ------------------------------------------------------------
// SIDEBAR MOBILE TOGGLE
// ------------------------------------------------------------
if (menuBtn) {
  menuBtn.onclick = () => {
    sidebar.classList.toggle("open");
    document.body.classList.toggle("mobile-open", sidebar.classList.contains("open"));
  };
}

// Auto-close sidebar on outside tap (mobile)
document.addEventListener("click", (e) => {
  if (window.innerWidth > 900) return;

  if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
    sidebar.classList.remove("open");
    document.body.classList.remove("mobile-open");
  }
});

// ------------------------------------------------------------
// RENDER CHAT LIST
// ------------------------------------------------------------
function renderChatList(filter = "") {
  chatsList.innerHTML = "";

  chats
    .slice()
    .reverse()
    .filter((c) =>
      (c.title || "New Chat").toLowerCase().includes(filter.toLowerCase())
    )
    .forEach((chat) => {
      const el = document.createElement("div");
      el.className = "chat-item";
      el.dataset.id = chat.id;

      el.innerHTML = `
        <div class="avatar">${(chat.title || "NC").slice(0, 2).toUpperCase()}</div>
        <div class="meta">
          <div class="title">${chat.title}</div>
          <div class="sub">${chat.last || "No messages yet"}</div>
        </div>
      `;

      el.onclick = () => {
        openChat(chat.id);
        sidebar.classList.remove("open");
        document.body.classList.remove("mobile-open");
      };

      chatsList.appendChild(el);
    });
}

// ------------------------------------------------------------
// OPEN CHAT
// ------------------------------------------------------------
function openChat(id) {
  activeChatId = id;
  const chat = findChat(id);

  messagesEl.innerHTML = "";

  if (!chat || !chat.messages.length) return showWelcome();

  chat.messages.forEach((m) => appendMessage(m.text, m.role, m.time));
  scrollToBottom(true);
}

// ------------------------------------------------------------
// WELCOME CARD
// ------------------------------------------------------------
function showWelcome() {
  messagesEl.innerHTML = `
    <div class="welcome-card">
      <h2>Welcome to GalaxyX AI 🚀</h2>
      <p>Type your message below.</p>
      <button class="ghost" id="sampleBtnInner">Try "Hi"</button>
    </div>
  `;

  document.getElementById("sampleBtnInner").onclick = () => {
    userInput.value = "Hi";
    adjustTextarea();
    userInput.focus();
  };
}

// ------------------------------------------------------------
// APPEND MESSAGE
// ------------------------------------------------------------
function appendMessage(text, role = "ai", time = null) {
  const welcome = messagesEl.querySelector(".welcome-card");
  if (welcome) welcome.remove();

  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  row.innerHTML = `
    <div class="message">${escapeHTML(text)}</div>
    <div class="small-meta">${time || nowTime()}</div>
  `;

  messagesEl.appendChild(row);
  scrollToBottom();
}

// ------------------------------------------------------------
// TYPING INDICATOR
// ------------------------------------------------------------
function showTyping() {
  removeTyping();

  const row = document.createElement("div");
  row.className = "msg-row ai";
  row.dataset.typing = "1";

  row.innerHTML = `
    <div class="message">
      <span class="typing-dots"><span></span><span></span><span></span></span>
    </div>
  `;

  messagesEl.appendChild(row);
  scrollToBottom();
}

const removeTyping = () => {
  const t = messagesEl.querySelector("[data-typing='1']");
  if (t) t.remove();
};

// ------------------------------------------------------------
// SCROLL
// ------------------------------------------------------------
function scrollToBottom(now = false) {
  setTimeout(() => {
    const area = document.querySelector(".chat-area");
    area.scrollTop = area.scrollHeight;
  }, now ? 5 : 40);
}

// ------------------------------------------------------------
// NEW CHAT
// ------------------------------------------------------------
function createNewChat() {
  const id = uid();
  chats.push({ id, title: "New Chat", last: "", messages: [] });
  save();

  renderChatList();
  openChat(id);
}

// ------------------------------------------------------------
// TEXTAREA AUTO RESIZE
// ------------------------------------------------------------
function adjustTextarea() {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(160, userInput.scrollHeight) + "px";
}

// ------------------------------------------------------------
// SEND MESSAGE
// ------------------------------------------------------------
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  if (!activeChatId) createNewChat();

  const chat = findChat(activeChatId);
  const t = nowTime();

  chat.messages.push({ role: "user", text, time: t });
  chat.last = text.slice(0, 40);
  chat.title = chat.title === "New Chat" ? text.slice(0, 18) : chat.title;

  save();
  appendMessage(text, "user", t);

  userInput.value = "";
  adjustTextarea();
  showTyping();

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) throw new Error("Server error!");

    const data = await res.json();
    const reply = data.reply || "No reply received.";

    removeTyping();

    const rt = nowTime();
    appendMessage(reply, "ai", rt);

    chat.messages.push({ role: "assistant", text: reply, time: rt });
    chat.last = reply.slice(0, 40);

    save();
    renderChatList(searchInput.value);

  } catch (err) {
    removeTyping();
    appendMessage("⚠ Error: " + err.message, "ai", nowTime());
  }
}

// ------------------------------------------------------------
// EXTRA CONTROLS
// ------------------------------------------------------------
function clearAll() {
  if (!confirm("Clear all chats?")) return;
  chats = [];
  save();
  renderChatList();
  showWelcome();
}

function exportChats() {
  const blob = new Blob([JSON.stringify(chats, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "galaxy_chats.json";
  a.click();
}

function shareConversation() {
  const chat = findChat(activeChatId);
  if (!chat) return alert("Open a chat first!");

  const text = chat.messages
    .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
    .join("\n\n");

  navigator.clipboard.writeText(text);
  alert("Conversation copied!");
}

// ------------------------------------------------------------
// EVENT LISTENERS
// ------------------------------------------------------------
if (newChatBtn) newChatBtn.onclick = createNewChat;
if (searchInput) searchInput.oninput = (e) => renderChatList(e.target.value);
if (sendBtn) sendBtn.onclick = sendMessage;
if (clearBtn) clearBtn.onclick = clearAll;
if (exportBtn) exportBtn.onclick = exportChats;
if (shareBtn) shareBtn.onclick = shareConversation;

if (userInput) {
  userInput.oninput = adjustTextarea;

  userInput.onkeydown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
}

// ------------------------------------------------------------
// INIT APP
// ------------------------------------------------------------
(function init() {
  if (!chats.length) createNewChat();
  else {
    renderChatList();
    openChat(chats[chats.length - 1].id);
  }
  adjustTextarea();
})();
