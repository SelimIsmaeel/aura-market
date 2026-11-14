const USERS_KEY = "auramarket_users";
const SESSION_KEY = "auramarket_session";
const REMEMBER_KEY = "auramarket_remember_email";
const DASHBOARD = "user/dashboard.html"; // where users go after login

const form = document.getElementById("loginForm");
const emailEl = document.getElementById("email");
const pwEl = document.getElementById("password");
const rememberEl = document.getElementById("remember");
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

function showMsg(text, type) {
  msg.className = "msg " + type;
  msg.textContent = text;
}

// Already logged in? Skip the form and go to the dashboard.
try {
  if (
    localStorage.getItem(SESSION_KEY) ||
    sessionStorage.getItem(SESSION_KEY)
  ) {
    window.location.replace(DASHBOARD);
  }
  const saved = localStorage.getItem(REMEMBER_KEY);
  if (saved) {
    emailEl.value = saved;
    rememberEl.checked = true;
  }
} catch {}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  showMsg("", "");

  const email = emailEl.value.trim().toLowerCase();
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
    pwEl.value ? "" : "Enter your password.",
  );
  if (!okEmail || !okPw) return;

  const user = readUsers().find(
    (u) => u.email === email && u.password === pwEl.value,
  );
  if (!user) {
    showMsg("Incorrect email or password.", "fail");
    return;
  }

  const session = JSON.stringify({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  });

  try {
    // Remember Me: stay logged in across browser restarts. Otherwise: this tab session only.
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    if (rememberEl.checked) {
      localStorage.setItem(SESSION_KEY, session);
      localStorage.setItem(REMEMBER_KEY, email);
    } else {
      sessionStorage.setItem(SESSION_KEY, session);
      localStorage.removeItem(REMEMBER_KEY);
    }
  } catch {
    showMsg(
      "Could not start your session. Check your browser storage settings.",
      "fail",
    );
    return;
  }

  showMsg("Login successful! Redirecting...", "ok");
  form.querySelector(".submit").disabled = true;
  setTimeout(() => (window.location.href = DASHBOARD), 900);
});

[emailEl, pwEl].forEach((el) =>
  el.addEventListener("input", () =>
    el.closest(".field").classList.remove("bad"),
  ),
);

document.getElementById("togglePw").addEventListener("click", () => {
  pwEl.type = pwEl.type === "password" ? "text" : "password";
});

document.getElementById("forgot").addEventListener("click", (e) => {
  e.preventDefault();
  showMsg(
    "Password reset needs a backend. Contact support to reset your password.",
    "fail",
  );
});

document.getElementById("burger").addEventListener("click", () => {
  document.getElementById("menu").classList.toggle("open");
});
