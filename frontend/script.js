// ============================================================
//  GALAXYX AI — FINAL PREMIUM JS (2025 SUPER POLISHED EDITION)
//  All Buttons Fixed • Real Share Link • Typing Animation
// ============================================================

const API_URL = "https://galaxy-ai-3.onrender.com/chat";

// ------------------------------------------------------------
// DOM ELEMENTS
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
let chats = JSON.parse(localStorage.getItem("galaxy_chats_v3") || "[]");
let activeChatId = null;

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const nowTime = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const escapeHTML = (t) =>
  String(t).replace(/</g, "&lt;").replace(/>/g, "&gt;");

function save() {
  localStorage.setItem("galaxy_chats_v3", JSON.stringify(chats));
}

function findChat(id) {
  return chats.find((c) => c.id === id);
}

// ------------------------------------------------------------
// SIDEBAR MOBILE
// ------------------------------------------------------------
menuBtn.onclick = () => {
  sidebar.classList.toggle("open");
  document.body.classList.toggle(
    "mobile-open",
    sidebar.classList.contains("open")
  );
};

document.addEventListener("click", (e) => {
  if (window.innerWidth > 900) return;

  if (!sidebar.contains(e.target) && e.target !== menuBtn) {
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
      const div = document.createElement("div");
      div.className = "chat-item";
      div.dataset.id = chat.id;

      div.innerHTML = `
        <div class="avatar">${(chat.title || "NC")
          .slice(0, 2)
          .toUpperCase()}</div>
        <div class="meta">
          <div class="title">${chat.title}</div>
          <div class="sub">${chat.last || "No messages yet"}</div>
        </div>
      `;

      div.onclick = () => {
        openChat(chat.id);
        sidebar.classList.remove("open");
        document.body.classList.remove("mobile-open");
      };

      chatsList.appendChild(div);
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

  chat.messages.forEach((m) =>
    appendMessage(m.text, m.role === "assistant" ? "ai" : m.role, m.time)
  );
  scrollToBottom(true);
}

// ------------------------------------------------------------
// WELCOME
// ------------------------------------------------------------
function showWelcome() {
  messagesEl.innerHTML = `
    <div class="welcome-card">
      <h2>Welcome to GalaxyX AI 🚀</h2>
      <p>Type your message below.</p>
    </div>
  `;
}

// ------------------------------------------------------------
// APPEND MESSAGE
// ------------------------------------------------------------
function appendMessage(text, role = "ai", time = nowTime()) {
  const w = messagesEl.querySelector(".welcome-card");
  if (w) w.remove();

  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  row.innerHTML = `
    <div class="message">${escapeHTML(text)}</div>
    <div class="small-meta">${time}</div>
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
  row.dataset.typing = "true";

  row.innerHTML = `
    <div class="message typing-dots">
      <span></span><span></span><span></span>
    </div>
  `;

  messagesEl.appendChild(row);
  scrollToBottom();
}

function removeTyping() {
  const t = messagesEl.querySelector("[data-typing='true']");
  if (t) t.remove();
}

// ------------------------------------------------------------
// SCROLL
// ------------------------------------------------------------
function scrollToBottom(immediate = false) {
  setTimeout(() => {
    const area = document.querySelector(".chat-area");
    if (area) area.scrollTop = area.scrollHeight;
  }, immediate ? 10 : 40);
}

// ------------------------------------------------------------
// NEW CHAT
// ------------------------------------------------------------
function createNewChat() {
  const id = uid();

  chats.push({
    id,
    title: "New Chat",
    last: "",
    messages: [],
  });

  save();
  renderChatList();
  openChat(id);
}

// ------------------------------------------------------------
// TEXTAREA AUTO RESIZE
// ------------------------------------------------------------
function adjustTextarea() {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(150, userInput.scrollHeight) + "px";
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
  chat.title = chat.title === "New Chat" ? text.slice(0, 16) : chat.title;

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

    const data = await res.json();
    const reply = data.reply || "No response received.";

    removeTyping();

    const rt = nowTime();
    appendMessage(reply, "ai", rt);

    chat.messages.push({ role: "assistant", text: reply, time: rt });
    chat.last = reply.slice(0, 40);

    save();
    renderChatList(searchInput.value);
  } catch (err) {
    removeTyping();
    appendMessage("⚠ Server error: " + (err.message || err), "ai", nowTime());
  }
}

// ------------------------------------------------------------
// EXPORT CHATS
// ------------------------------------------------------------
function exportChats() {
  const blob = new Blob([JSON.stringify(chats, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "galaxyx_chats.json";
  a.click();
}

// ------------------------------------------------------------
// CLEAR ALL
// ------------------------------------------------------------
function clearAll() {
  if (!confirm("Delete all chats?")) return;
  chats = [];
  save();
  renderChatList();
  showWelcome();
}

// ------------------------------------------------------------
// 🔥 REAL SHARE LINK (ChatGPT Style)
// ------------------------------------------------------------
function shareConversation() {
  const chat = findChat(activeChatId);
  if (!chat) return alert("Open a chat first!");

  const encoded = btoa(JSON.stringify(chat)); // Base64
  const url = `${location.origin}?share=${encoded}`;

  navigator.clipboard.writeText(url);
  alert("Sharable link copied!");
}

// Auto-load shared chat if ?share= is present
(function loadSharedChat() {
  const params = new URLSearchParams(location.search);
  const data = params.get("share");

  if (data) {
    try {
      const chat = JSON.parse(atob(data));
      chats.push(chat);
      save();
      renderChatList();
      openChat(chat.id);
    } catch (e) {
      console.error("Share decode error:", e);
    }
  }
})();

// ------------------------------------------------------------
// ATTACH BUTTON ANIMATION
// ------------------------------------------------------------
attachBtn.onclick = () => {
  attachBtn.animate(
    [{ transform: "rotate(0deg)" }, { transform: "rotate(20deg)" }, { transform: "rotate(0deg)" }],
    { duration: 220 }
  );
};

// ------------------------------------------------------------
// ⭐ MIC BUTTON → OPEN JARVIS VOICE MODE (FINAL STABLE SYSTEM)
// ------------------------------------------------------------
micBtn.onclick = () => {
  micBtn.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(0.9)" },
      { transform: "scale(1)" },
    ],
    { duration: 200 }
  );

  // FULL AUTO PATH DETECTION (WORKS ON LOCALHOST + VERCEL + LIVE SERVER)
  const base = window.location.pathname.replace(/\/[^\/]*$/, "");

  const possible = [
    base + "/voice.html",
    base + "voice.html",
    "/voice.html",
    "./voice.html",
    "voice.html",
    "/frontend/voice.html",
    base + "/frontend/voice.html"
  ];

  (async () => {
    for (let path of possible) {
      try {
        const res = await fetch(path, { method: "GET" });
        if (res && res.ok) {
          window.location.href = path;
          return;
        }
      } catch (e) {
        // ignore and try next
      }
    }

    alert("❌ voice.html not found!\n➡ Make sure voice.html is located inside your frontend folder (frontend/voice.html).");
  })();
};

// ------------------------------------------------------------
// EVENTS
// ------------------------------------------------------------
newChatBtn.onclick = createNewChat;
searchInput.oninput = (e) => renderChatList(e.target.value);
sendBtn.onclick = sendMessage;
clearBtn.onclick = clearAll;
exportBtn.onclick = exportChats;
shareBtn.onclick = shareConversation;

userInput.oninput = adjustTextarea;

userInput.onkeydown = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

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
