const SESSION_KEY = "auramarket_session";
const ORDERS_KEY = "auramarket_orders";
const CART_KEY = "shopeasy_cart"; // same key as the homepage and dashboard

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
const naira = (n) => "₦" + n.toLocaleString("en-NG");

const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const fmtDateTime = (iso) =>
  fmtDate(iso) +
  " • " +
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const orderTotal = (o) =>
  o.items.reduce((sum, i) => sum + i.price * (i.qty || 1), 0);
const itemCount = (o) => o.items.reduce((sum, i) => sum + (i.qty || 1), 0);

function showToast(text) {
  const t = $("toast");
  t.textContent = text;
  t.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => (t.hidden = true), 2200);
}

// ---------- Data (sample orders, saved in localStorage so changes persist) ----------
const sampleOrders = [
  {
    id: "AM20261008-001",
    date: "2026-10-08T10:24:00",
    status: "processing",
    items: [
      {
        pid: 1,
        name: "Wireless Earbuds",
        price: 15000,
        img: "../image/earbuds.png",
      },
      { pid: 2, name: "Sneakers", price: 20000, img: "../image/sneakers.png" },
      {
        pid: 3,
        name: "Smart Watch",
        price: 35000,
        img: "../image/Smart_Watch.png",
      },
      { pid: 7, name: "Phone Case", price: 5000, img: "../image/case.png" },
    ],
  },
  {
    id: "AM20261005-002",
    date: "2026-10-05T16:18:00",
    status: "shipped",
    items: [
      {
        pid: 6,
        name: "Black Sneakers",
        price: 35000,
        img: "../image/black-shoes.png",
      },
    ],
  },
  {
    id: "AM20260930-003",
    date: "2026-09-30T13:12:00",
    status: "delivered",
    deliveredAt: "2026-10-02T12:00:00",
    items: [
      {
        pid: 3,
        name: "Smart Watch",
        price: 20000,
        img: "../image/Smart_Watch.png",
      },
    ],
  },
  {
    id: "AM20260925-004",
    date: "2026-09-25T11:30:00",
    status: "cancelled",
    items: [
      { pid: 4, name: "Perfume", price: 15000, img: "../image/perfume.png" },
    ],
  },
];

function loadOrders() {
  try {
    const saved = JSON.parse(localStorage.getItem(ORDERS_KEY));
    if (Array.isArray(saved)) return saved;
  } catch {}
  return sampleOrders;
}

function saveOrders() {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {}
}

let orders = loadOrders();
let filter = "all";

const STATUS = {
  pending: {
    label: "Pending",
    icon: "🕒",
    note: () => "Waiting for confirmation",
  },
  processing: {
    label: "Processing",
    icon: "⚙️",
    note: () => "Processing your order...",
  },
  shipped: { label: "Shipped", icon: "🚚", note: () => "On the way" },
  delivered: {
    label: "Delivered",
    icon: "✔️",
    note: (o) => "Delivered on " + fmtDate(o.deliveredAt || o.date),
  },
  cancelled: { label: "Cancelled", icon: "❌", note: () => "Order cancelled" },
};

// ---------- Cart ----------
function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function updateCartBadge() {
  const count = readCart().reduce((sum, i) => sum + i.qty, 0);
  $("cartBadge").textContent = count;
  $("cartBadge").hidden = count === 0;
}

function reorder(order) {
  const cart = readCart();
  order.items.forEach((it) => {
    const found = cart.find((c) => c.id === it.pid);
    found
      ? (found.qty += it.qty || 1)
      : cart.push({ id: it.pid, qty: it.qty || 1 });
  });
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {}
  updateCartBadge();
  showToast("Items added to your cart");
}

// ---------- Render ----------
function renderTabs() {
  const count = (s) => orders.filter((o) => o.status === s).length;
  const tabs = [
    { key: "all", label: "All Orders", n: orders.length },
    ...Object.keys(STATUS).map((k) => ({
      key: k,
      label: STATUS[k].label,
      icon: STATUS[k].icon,
      n: count(k),
    })),
  ];
  $("tabs").innerHTML = tabs
    .map(
      (t) => `
    <button class="tab ${filter === t.key ? "active" : ""}" data-filter="${t.key}">
      ${t.icon ? t.icon + " " : ""}${t.label} (${t.n})
    </button>`,
    )
    .join("");
}

function renderOrders() {
  const list =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (!list.length) {
    $("orders").innerHTML =
      `<div class="empty">No orders in this category yet.</div>`;
    return;
  }

  $("orders").innerHTML = list
    .map((o) => {
      const st = STATUS[o.status] || STATUS.pending;
      const shown = o.items.slice(0, 3);
      const extra = o.items.length - shown.length;
      const canCancel = o.status === "pending" || o.status === "processing";
      const n = itemCount(o);

      return `
    <article class="order-row">
      <div>
        <div class="o-id">Order <b>#${esc(o.id)}</b></div>
        <div class="o-date">📅 ${fmtDateTime(o.date)}</div>
      </div>

      <div class="thumbs">
        ${shown.map((i) => `<img src="${esc(i.img)}" alt="${esc(i.name)}">`).join("")}
        ${extra > 0 ? `<span class="more">+${extra} more</span>` : ""}
      </div>

      <div class="o-total"><strong>${naira(orderTotal(o))}</strong><span>${n} item${n === 1 ? "" : "s"}</span></div>

      <div class="o-status">
        <span class="status-pill ${o.status}">${st.icon} ${st.label}</span>
        <div class="o-note">${st.note(o)}</div>
      </div>

      <div class="o-actions">
        <a href="order-details.html?id=${encodeURIComponent(o.id)}" class="btn-line">View Details &rarr;</a>
        <button class="kebab" data-menu="${esc(o.id)}" aria-label="More actions">&#8942;</button>
        <div class="row-menu" data-for="${esc(o.id)}" hidden>
          <button data-action="reorder" data-id="${esc(o.id)}">Reorder</button>
          ${canCancel ? `<button class="danger" data-action="cancel" data-id="${esc(o.id)}">Cancel order</button>` : ""}
        </div>
      </div>
    </article>`;
    })
    .join("");
}

function render() {
  renderTabs();
  renderOrders();
}

// ---------- Events ----------
$("tabs").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-filter]");
  if (!btn) return;
  filter = btn.dataset.filter;
  render();
});

$("orders").addEventListener("click", (e) => {
  const kebab = e.target.closest("[data-menu]");
  const action = e.target.closest("[data-action]");

  if (kebab) {
    e.stopPropagation();
    document.querySelectorAll(".row-menu").forEach((m) => {
      m.hidden = m.dataset.for !== kebab.dataset.menu ? true : !m.hidden;
    });
    return;
  }

  if (action) {
    const order = orders.find((o) => o.id === action.dataset.id);
    if (!order) return;

    if (action.dataset.action === "reorder") reorder(order);

    if (action.dataset.action === "cancel" && confirm("Cancel this order?")) {
      order.status = "cancelled";
      saveOrders();
      render();
      showToast("Order cancelled");
    }
    document.querySelectorAll(".row-menu").forEach((m) => (m.hidden = true));
  }
});

document.addEventListener("click", () => {
  document.querySelectorAll(".row-menu").forEach((m) => (m.hidden = true));
  $("dropdown").hidden = true;
});

$("avatarBtn").addEventListener("click", (e) => {
  e.stopPropagation();
  $("dropdown").hidden = !$("dropdown").hidden;
});

$("menuBtn").addEventListener("click", () =>
  $("sidebar").classList.toggle("open"),
);

// ---------- Init ----------
const name = (session && session.fullName) || "User";
$("menuName").textContent = name;
$("avatarText").textContent = name
  .split(" ")
  .map((w) => w[0])
  .slice(0, 2)
  .join("")
  .toUpperCase();

render();
updateCartBadge();
