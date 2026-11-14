const USERS_KEY = "auramarket_users";

const form = document.getElementById("registerForm");
const nameEl = document.getElementById("fullName");
const emailEl = document.getElementById("email");
const pwEl = document.getElementById("password");
const confirmEl = document.getElementById("confirm");
const msg = document.getElementById("formMsg");

const readUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
};

function setError(input, errId, text) {
  document.getElementById(errId).textContent = text;
  input.closest(".field").classList.toggle("bad", !!text);
  return !text;
}

function validate() {
  const email = emailEl.value.trim().toLowerCase();
  const okName = setError(
    nameEl,
    "nameErr",
    nameEl.value.trim().length >= 2 ? "" : "Enter your full name.",
  );
  const okEmail = setError(
    emailEl,
    "emailErr",
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? ""
      : "Enter a valid email address.",
  );
  const okPw = setError(
    pwEl,
    "pwErr",
    pwEl.value.length >= 6 ? "" : "Password must be at least 6 characters.",
  );
  const okConfirm = setError(
    confirmEl,
    "confirmErr",
    confirmEl.value && confirmEl.value === pwEl.value
      ? ""
      : "Passwords do not match.",
  );
  return okName && okEmail && okPw && okConfirm;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  msg.className = "msg";
  msg.textContent = "";
  if (!validate()) return;

  const users = readUsers();
  const email = emailEl.value.trim().toLowerCase();

  if (users.some((u) => u.email === email)) {
    msg.className = "msg fail";
    msg.textContent =
      "An account with this email already exists. Login instead.";
    return;
  }

  const user = {
    id: Date.now(),
    fullName: nameEl.value.trim(),
    email,
    password: pwEl.value, // demo only: localStorage is not secure storage
    role: "customer",
    createdAt: new Date().toISOString(),
  };

  // Save the account only. No session is created here, so the user
  // lands on the login page and logs in properly.
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  } catch {
    msg.className = "msg fail";
    msg.textContent =
      "Could not save your account. Check your browser storage settings.";
    return;
  }

  msg.className = "msg ok";
  msg.textContent = "Account created! Redirecting to login...";
  form.querySelector(".submit").disabled = true;
  setTimeout(() => (window.location.href = "./login.html"), 1200);
});

[nameEl, emailEl, pwEl, confirmEl].forEach((el) =>
  el.addEventListener("input", () =>
    el.closest(".field").classList.remove("bad"),
  ),
);

// Show / hide password (works for both password fields)
document.querySelectorAll(".eye").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.setAttribute(
      "aria-label",
      (show ? "Hide " : "Show ") +
        (btn.dataset.target === "confirm" ? "confirm password" : "password"),
    );
  });
});

// Mobile menu
document.getElementById("burger").addEventListener("click", () => {
  document.getElementById("menu").classList.toggle("open");
});
