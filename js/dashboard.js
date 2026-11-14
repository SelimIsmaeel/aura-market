const SESSION_KEY = "auramarket_session";
const CART_KEY = "shopeasy_cart"; // same key as index.html so the cart is shared

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
if (!session) window.location.replace("login.html"); // not logged in

function logout(e) {
  e.preventDefault();
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
  window.location.href = "login.html";
}

// ---------- Data (replace with your real data later) ----------
const naira = (n) => "₦" + n.toLocaleString("en-NG");

const stats = [
  { icon: "🛍️", value: "5", label: "Total Orders" },
  { icon: "🛒", value: naira(75000), label: "Total Spent" },
  { icon: "⭐", value: "4.8", label: "Your Rating" },
  { icon: "📅", value: "2", label: "Upcoming Events" },
];

const orders = [
  {
    name: "Wireless Earbuds",
    price: 15000,
    img: "image/earbuds.png",
    status: "Delivered",
    date: "Oct 28, 2026",
  },
  {
    name: "Sneakers",
    price: 20000,
    img: "image/sneakers.png",
    status: "Processing",
    date: "Oct 26, 2026",
  },
  {
    name: "Smart Watch",
    price: 35000,
    img: "image/Smart_Watch.png",
    status: "Shipped",
    date: "Oct 24, 2026",
  },
];

const events = [
  {
    title: "Tech Innovation Summit",
    date: "Nov 15, 2026",
    place: "Online",
    img: "image/event1.png",
  },
  {
    title: "Mega Shopping Festival",
    date: "Nov 20, 2026",
    place: "Lagos, Nigeria",
    img: "image/event2.png",
  },
];

const products = [
  { id: 1, name: "Wireless Earbuds", price: 15000, img: "image/earbuds.png" },
  { id: 2, name: "Sneakers", price: 20000, img: "image/sneakers.png" },
  { id: 3, name: "Smart Watch", price: 35000, img: "image/Smart_Watch.png" },
  { id: 4, name: "Perfume", price: 15000, img: "image/perfume.png" },
  { id: 5, name: "Backpack", price: 18000, img: "image/backpack.png" },
];

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
  const badge = document.getElementById("cartBadge");
  badge.textContent = count;
  badge.hidden = count === 0;
}

// ---------- Render ----------
const $ = (id) => document.getElementById(id);

function render() {
  const name = (session && session.fullName) || "Guest";
  $("userName").textContent = name;
  $("menuName").textContent = name;
  $("avatarText").textContent = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  $("stats").innerHTML = stats
    .map(
      (s) => `
    <a href="#" class="stat">
      <i>${s.icon}</i>
      <div><strong>${s.value}</strong><span>${s.label}</span></div>
      <em aria-hidden="true">&rarr;</em>
    </a>`,
    )
    .join("");

  $("orders").innerHTML = orders
    .map(
      (o) => `
    <div class="order">
      <img src="${o.img}" alt="${o.name}">
      <div class="o-name"><b>${o.name}</b><span>${naira(o.price)}</span></div>
      <span class="pill ${o.status.toLowerCase()}">${o.status}</span>
      <time>${o.date}</time>
    </div>`,
    )
    .join("");

  $("events").innerHTML = events
    .map(
      (e) => `
    <div class="event">
      <img src="${e.img}" alt="${e.title}">
      <div class="e-info">
        <b>${e.title}</b>
        <span>📅 ${e.date}</span>
        <span>📍 ${e.place}</span>
      </div>
      <a href="#" class="btn-line">View Details</a>
    </div>`,
    )
    .join("");

  $("products").innerHTML = products
    .map(
      (p) => `
    <article class="prod">
      <img src="${p.img}" alt="${p.name}">
      <b>${p.name}</b>
      <span>${naira(p.price)}</span>
      <button data-add="${p.id}">Add to Cart</button>
    </article>`,
    )
    .join("");

  updateCartBadge();
}

$("products").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  const id = +btn.dataset.add;
  const cart = readCart();
  const item = cart.find((i) => i.id === id);
  item ? item.qty++ : cart.push({ id, qty: 1 });
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {}
  updateCartBadge();
  btn.textContent = "Added ✓";
  setTimeout(() => (btn.textContent = "Add to Cart"), 1200);
});

// ---------- UI ----------
$("logout").addEventListener("click", logout);
$("logout2").addEventListener("click", logout);

$("menuBtn").addEventListener("click", () =>
  $("sidebar").classList.toggle("open"),
);

$("avatarBtn").addEventListener("click", (e) => {
  e.stopPropagation();
  $("dropdown").hidden = !$("dropdown").hidden;
});
document.addEventListener("click", () => ($("dropdown").hidden = true));

render();

function logout(e) {
  e.preventDefault();
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
  window.location.href = "../login.html";
}

$("logout").addEventListener("click", logout);
// $("logout2").addEventListener("click", logout);
