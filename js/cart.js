const SESSION_KEY = "auramarket_session";
const CART_KEY = "shopeasy_cart"; // same key as the homepage and dashboard (saves [{id, qty}])
const CHECKOUT_KEY = "auramarket_checkout";

// ---- Pricing rules: change these to suit your store ----
const SHIPPING_FEE = 1000;
const DISCOUNT_MIN = 50000; // spend at least this much...
const DISCOUNT_OFF = 5000; // ...and get this much off
const MAX_QTY = 10;

// ---- Product list: ids must match the ids used on the homepage / dashboard ----
const catalog = {
  1: {
    name: "Wireless Earbuds",
    price: 15000,
    img: "../image/earbuds.png",
    variant: "Color: Black",
  },
  2: {
    name: "Sneakers",
    price: 20000,
    img: "../image/sneakers.png",
    variant: "Size: 42 | Color: White",
  },
  3: {
    name: "Smart Watch",
    price: 35000,
    img: "../image/Smart_Watch.png",
    variant: "Color: Black",
  },
  4: {
    name: "Perfume",
    price: 15000,
    img: "../image/perfume.png",
    variant: "100ml",
  },
  5: {
    name: "Backpack",
    price: 18000,
    img: "../image/backpack.png",
    variant: "Color: Black",
  },
  6: {
    name: "Black Sneakers",
    price: 35000,
    img: "../image/black-shoes.png",
    variant: "Size: 42 | Color: Black",
  },
  7: {
    name: "Phone Case",
    price: 5000,
    img: "../image/case.png",
    variant: "Color: Clear",
  },
};

const $ = (id) => document.getElementById(id);
const naira = (n) => "₦" + n.toLocaleString("en-NG");

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

// ---------- Cart data ----------
function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

let cart = readCart();
let selected = new Set(cart.map((i) => i.id)); // everything ticked by default

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {}
}

const visibleItems = () => cart.filter((i) => catalog[i.id]);

function showToast(text) {
  const t = $("toast");
  t.textContent = text;
  t.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => (t.hidden = true), 2000);
}

// ---------- Render ----------
function renderItems() {
  const items = visibleItems();

  $("cartCard").querySelector(".select-row").hidden = items.length === 0;
  $("clearCart").hidden = items.length === 0;

  if (!items.length) {
    $("items").innerHTML = `
      <div class="empty-cart">
        <div class="big">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything yet.</p>
        <a href="../index.html#products" class="btn">Start Shopping &rarr;</a>
      </div>`;
    return;
  }

  $("items").innerHTML = items
    .map((i) => {
      const p = catalog[i.id];
      return `
    <div class="cart-item">
      <input type="checkbox" data-sel="${i.id}" ${selected.has(i.id) ? "checked" : ""} aria-label="Select ${p.name}">
      <img class="ci-img" src="${p.img}" alt="${p.name}">
      <div class="ci-info">
        <b>${p.name}</b>
        <small>${p.variant}</small>
        <span class="stock">✔ In Stock</span>
      </div>
      <div class="ci-price">${naira(p.price)}</div>
      <div class="qty">
        <button data-dec="${i.id}" aria-label="Decrease quantity" ${i.qty <= 1 ? "disabled" : ""}>−</button>
        <span>${i.qty}</span>
        <button data-inc="${i.id}" aria-label="Increase quantity" ${i.qty >= MAX_QTY ? "disabled" : ""}>+</button>
      </div>
      <div class="ci-total">${naira(p.price * i.qty)}</div>
      <button class="trash" data-del="${i.id}" aria-label="Remove ${p.name}">🗑</button>
    </div>`;
    })
    .join("");
}

function renderSummary() {
  const chosen = visibleItems().filter((i) => selected.has(i.id));
  const count = chosen.reduce((s, i) => s + i.qty, 0);
  const subtotal = chosen.reduce((s, i) => s + catalog[i.id].price * i.qty, 0);
  const shipping = chosen.length ? SHIPPING_FEE : 0;
  const discount = subtotal >= DISCOUNT_MIN ? DISCOUNT_OFF : 0;
  const total = subtotal + shipping - discount;

  $("subLabel").textContent =
    `Subtotal (${count} item${count === 1 ? "" : "s"})`;
  $("subtotal").textContent = naira(subtotal);
  $("shipping").textContent = naira(shipping);
  $("discount").textContent = "- " + naira(discount);
  $("total").textContent = naira(total);
  $("checkoutBtn").disabled = chosen.length === 0;

  // Select-all checkbox state
  const all = visibleItems();
  const sa = $("selectAll");
  sa.checked = all.length > 0 && chosen.length === all.length;
  sa.indeterminate = chosen.length > 0 && chosen.length < all.length;
  $("removeSelected").disabled = chosen.length === 0;
}

function updateBadge() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  $("cartBadge").textContent = count;
  $("cartBadge").hidden = count === 0;
}

function render() {
  renderItems();
  renderSummary();
  updateBadge();
}

function removeIds(ids) {
  cart = cart.filter((i) => !ids.includes(i.id));
  ids.forEach((id) => selected.delete(id));
  saveCart();
  render();
}

// ---------- Events ----------
$("items").addEventListener("click", (e) => {
  const inc = e.target.closest("[data-inc]");
  const dec = e.target.closest("[data-dec]");
  const del = e.target.closest("[data-del]");

  if (inc || dec) {
    const id = +(inc || dec).dataset[inc ? "inc" : "dec"];
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty = Math.min(MAX_QTY, Math.max(1, item.qty + (inc ? 1 : -1)));
    saveCart();
    render();
  }

  if (del) {
    removeIds([+del.dataset.del]);
    showToast("Item removed");
  }
});

$("items").addEventListener("change", (e) => {
  const box = e.target.closest("[data-sel]");
  if (!box) return;
  const id = +box.dataset.sel;
  box.checked ? selected.add(id) : selected.delete(id);
  renderSummary();
});

$("selectAll").addEventListener("change", (e) => {
  selected = e.target.checked
    ? new Set(visibleItems().map((i) => i.id))
    : new Set();
  render();
});

$("removeSelected").addEventListener("click", () => {
  const ids = [...selected];
  if (ids.length && confirm("Remove the selected items from your cart?")) {
    removeIds(ids);
    showToast("Selected items removed");
  }
});

$("clearCart").addEventListener("click", () => {
  if (confirm("Remove everything from your cart?")) {
    cart = [];
    selected = new Set();
    saveCart();
    render();
  }
});

$("checkoutBtn").addEventListener("click", () => {
  const ids = visibleItems()
    .filter((i) => selected.has(i.id))
    .map((i) => i.id);
  if (!ids.length) return;
  try {
    localStorage.setItem(CHECKOUT_KEY, JSON.stringify(ids));
  } catch {}
  window.location.href = "checkout.html";
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
