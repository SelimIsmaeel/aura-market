const products = [
  {
    id: 1,
    name: "Wireless Earbuds",
    icon: "image/air_bud.png",
    price: 15000,
    old: 18000,
    off: 20,
    rating: 4.5,
    reviews: 120,
  },
  {
    id: 2,
    name: "Sneakers",
    icon: "image/shoe.png",
    price: 20000,
    old: 23500,
    off: 15,
    rating: 4.6,
    reviews: 98,
  },
  {
    id: 3,
    name: "Smart Watch",
    icon: "image/Smart_Watch.png",
    price: 35000,
    old: 38500,
    off: 10,
    rating: 4.7,
    reviews: 75,
  },
  {
    id: 4,
    name: "Backpack",
    icon: "image/laptop_backpack.png",
    price: 18000,
    old: null,
    off: null,
    rating: 4.6,
    reviews: 60,
  },
  {
    id: 5,
    name: "Perfume",
    icon: "image/gold-capped.png",
    price: 15000,
    old: 20000,
    off: 25,
    rating: 4.4,
    reviews: 45,
  },
];

const naira = (n) => "₦" + n.toLocaleString("en-NG");

// ---- localStorage helpers (safe) ----
const store = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
};

let cart = store.get("shopeasy_cart", []); // [{id, qty}]
let favs = store.get("shopeasy_favs", []); // [id]

const cartCount = document.getElementById("cartCount");
const grid = document.getElementById("productGrid");

function updateCartBadge() {
  cartCount.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
}

function renderProducts() {
  grid.innerHTML = products
    .map(
      (p) => `
    <article class="card">
      ${p.off ? `<span class="discount">-${p.off}%</span>` : ""}
      <button class="fav ${favs.includes(p.id) ? "on" : ""}" data-fav="${p.id}" aria-label="Add ${p.name} to wishlist">${favs.includes(p.id) ? "♥" : "♡"}</button>
      <div class="thumb"><img src="${p.icon}" alt="${p.name}"></div>
      <h3>${p.name}</h3>
      <div class="price">${naira(p.price)}${p.old ? `<s>${naira(p.old)}</s>` : ""}</div>
      <div class="rating"><b>★</b> ${p.rating} (${p.reviews})</div>
      <button class="add" data-add="${p.id}">  <img style="padding-right: 10px;  height: 1.6rem;" src="image/basil--shopping-cart-solid.svg" alt="">   Add to Cart</button>
    </article>`,
    )
    .join("");
}

grid.addEventListener("click", (e) => {
  const addBtn = e.target.closest("[data-add]");
  const favBtn = e.target.closest("[data-fav]");
  // this is cart code
  if (addBtn) {
    const id = +addBtn.dataset.add;
    const item = cart.find((i) => i.id === id);
    item ? item.qty++ : cart.push({ id, qty: 1 });
    store.set("shopeasy_cart", cart);
    updateCartBadge();
  }

  if (favBtn) {
    const id = +favBtn.dataset.fav;
    favs = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
    store.set("shopeasy_favs", favs);
    favBtn.classList.toggle("on");
    favBtn.textContent = favs.includes(id) ? "♥" : "♡";
  }
});

// ---- Mobile menu ----
document.getElementById("burger").addEventListener("click", () => {
  document.getElementById("menu").classList.toggle("open");
});

renderProducts();
updateCartBadge();

function goToLogin() {
  window.location.href = "login.html";
}

function goToRegister() {
  window.location.href = "register.html";
}
