// --- Auth actions -----------------------------------------------------

function signUp(email, password) {
  return auth.createUserWithEmailAndPassword(email, password);
}

function logIn(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

function logInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider);
}

function resetPassword(email) {
  return auth.sendPasswordResetEmail(email);
}

function logOut() {
  return auth.signOut().then(function () {
    window.location.href = "login.html";
  });
}

// --- Page guards --------------------------------------------------------

function requireAuth() {
  auth.onAuthStateChanged(function (user) {
    if (!user) {
      window.location.href = "login.html";
    }
  });
}

function redirectIfSignedIn() {
  auth.onAuthStateChanged(function (user) {
    if (user) {
      window.location.href = "notes.html";
    }
  });
}

// Updates any nav auth-area on a page (shared header state)
function renderAuthNav(navElId) {
  const el = document.getElementById(navElId);
  if (!el) return;
  auth.onAuthStateChanged(function (user) {
    el.innerHTML = "";
    if (user) {
      const notesLink = document.createElement("a");
      notesLink.href = "notes.html";
      notesLink.className = "tp-nav-link";
      notesLink.textContent = "My Notes";

      const logoutBtn = document.createElement("button");
      logoutBtn.className = "tp-btn tp-btn-ghost-dark";
      logoutBtn.type = "button";
      logoutBtn.textContent = "Log out";
      logoutBtn.addEventListener("click", logOut);

      el.appendChild(notesLink);
      el.appendChild(logoutBtn);
    } else {
      const loginLink = document.createElement("a");
      loginLink.href = "login.html";
      loginLink.className = "tp-nav-link";
      loginLink.textContent = "Login";
      el.appendChild(loginLink);
    }
  });
}

// --- Theme Management ---------------------------------------------------

function initTheme() {
  const savedTheme = localStorage.getItem("tp_theme");
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("tp_theme", next);
  updateThemeToggleButtons();
}

function updateThemeToggleButtons() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const btns = document.querySelectorAll(".tp-theme-toggle");
  btns.forEach(function (btn) {
    btn.innerHTML = isDark
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    btn.setAttribute("title", isDark ? "Switch to Light Mode" : "Switch to Dark Mode");
    btn.setAttribute("aria-label", isDark ? "Switch to Light Mode" : "Switch to Dark Mode");
  });
}

// Initialize theme immediately
initTheme();
document.addEventListener("DOMContentLoaded", updateThemeToggleButtons);

// --- PWA Service Worker Registration ------------------------------------

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function (err) {
      console.warn("ServiceWorker registration failed:", err);
    });
  });
}
