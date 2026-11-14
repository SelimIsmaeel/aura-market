const SESSION_KEY = "auramarket_session";
const NOTIF_KEY = "auramarket_notifications";
const CART_KEY = "shopeasy_cart";

const $ = (id) => document.getElementById(id);

// ---------- Session ----------
function getSession() {
  try {
    return JSON.parse(
      localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY),
    );
  } catch {
    return null;
  }
}

const session = getSession();
if (!session) window.location.replace("../login.html");

$("logout").addEventListener("click", (e) => {
  e.preventDefault();
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
  window.location.href = "../login.html";
});

// ---------- Helpers ----------
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

const fmt = (iso) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " • " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
};

// ---------- Data (sample notifications, saved in localStorage) ----------
// type: orders | events | promotions | account     href: page to open on click
const sample = [
  {
    id: 1,
    type: "orders",
    title: "Order Update",
    text: "Your order #AM20261008-001 has been delivered successfully.",
    date: "2026-10-08T14:30:00",
    read: false,
    href: "orders.html",
  },
  {
    id: 2,
    type: "events",
    title: "Event Reminder",
    text: "Tech Innovation Summit is happening tomorrow. Don’t miss out!",
    date: "2026-10-07T10:00:00",
    read: false,
    href: "#",
  },
  {
    id: 3,
    type: "promotions",
    title: "Special Offer",
    text: "Get 20% OFF on selected items. Shop now and save more!",
    date: "2026-10-06T18:15:00",
    read: false,
    href: "../index.html#products",
  },
  {
    id: 4,
    type: "account",
    title: "Account Info",
    text: "Your account settings have been updated successfully.",
    date: "2026-10-05T11:20:00",
    read: true,
    href: "#",
  },
];

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(NOTIF_KEY));
    if (Array.isArray(saved)) return saved;
  } catch {}
  return sample;
}

function save() {
  try {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notes));
  } catch {}
}

let notes = load();
let filter = "all";

const ICONS = { orders: "🛒", events: "📅", promotions: "%", account: "ℹ️" };

const TABS = [
  { key: "all", label: "All", icon: "🔔" },
  { key: "orders", label: "Orders", icon: "🛒" },
  { key: "events", label: "Events", icon: "📅" },
  { key: "promotions", label: "Promotions", icon: "🏷️" },
];

// Tab numbers show UNREAD notifications, like your design (All (3) with 4 in the list)
const unread = (type) =>
  notes.filter((n) => !n.read && (type === "all" || n.type === type)).length;

// ---------- Render ----------
function setBadge(id, count) {
  $(id).textContent = count;
  $(id).hidden = count === 0;
}

function renderBadges() {
  const count = unread("all");
  ["notifBadge", "bellBadge", "bannerBadge"].forEach((id) =>
    setBadge(id, count),
  );
  $("markAll").disabled = count === 0;

  let cartCount = 0;
  try {
    cartCount = (JSON.parse(localStorage.getItem(CART_KEY)) || []).reduce(
      (s, i) => s + i.qty,
      0,
    );
  } catch {}
  setBadge("cartBadge", cartCount);
}

function renderTabs() {
  $("tabs").innerHTML = TABS.map(
    (t) => `
    <button class="tab ${filter === t.key ? "active" : ""}" data-filter="${t.key}">
      ${t.icon} ${t.label} (${unread(t.key)})
    </button>`,
  ).join("");
}

function renderList() {
  const list = notes
    .filter((n) => filter === "all" || n.type === filter)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!list.length) {
    $("list").innerHTML =
      `<div class="n-empty"><div class="big">🔔</div><p>No notifications here yet.</p></div>`;
    return;
  }

  $("list").innerHTML = list
    .map(
      (n) => `
    <button class="n-item ${n.read ? "" : "unread"}" data-id="${n.id}">
      <span class="n-icon ${esc(n.type)}">${ICONS[n.type] || "🔔"}${n.read ? "" : '<span class="dot"></span>'}</span>
      <span class="n-body">
        <b>${esc(n.title)}</b>
        <p>${esc(n.text)}</p>
        <time datetime="${esc(n.date)}">🕒 ${fmt(n.date)}</time>
      </span>
      <span class="n-pill ${n.read ? "read" : "new"}">${n.read ? "Read" : "New"}</span>
      <span class="n-arrow" aria-hidden="true">&rsaquo;</span>
    </button>`,
    )
    .join("");
}

function render() {
  renderBadges();
  renderTabs();
  renderList();
}

// ---------- Events ----------
$("tabs").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-filter]");
  if (!btn) return;
  filter = btn.dataset.filter;
  render();
});

$("list").addEventListener("click", (e) => {
  const row = e.target.closest("[data-id]");
  if (!row) return;
  const note = notes.find((n) => n.id === +row.dataset.id);
  if (!note) return;

  note.read = true;
  save();
  if (note.href && note.href !== "#") {
    window.location.href = note.href;
  } else {
    render();
  }
});

$("markAll").addEventListener("click", () => {
  notes.forEach((n) => (n.read = true));
  save();
  render();
});

// Top bar
document.addEventListener("click", () => ($("dropdown").hidden = true));
$("avatarBtn").addEventListener("click", (e) => {
  e.stopPropagation();
  $("dropdown").hidden = !$("dropdown").hidden;
});
$("menuBtn").addEventListener("click", () =>
  $("sidebar").classList.toggle("open"),
);

const name = (session && session.fullName) || "User";
$("menuName").textContent = name;
$("avatarText").textContent = name
  .split(" ")
  .map((w) => w[0])
  .slice(0, 2)
  .join("")
  .toUpperCase();

render();
