// Notes Application Logic for Tracepad

const addTitleEl = document.getElementById("addTitle");
const addTxtEl = document.getElementById("addTxt");
const addTagsEl = document.getElementById("addTags");
const addBtn = document.getElementById("addBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const notesEl = document.getElementById("notes");
const searchEl = document.getElementById("searchTxt");
const userEmailEl = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

const viewGridBtn = document.getElementById("viewGridBtn");
const viewListBtn = document.getElementById("viewListBtn");
const toastContainer = document.getElementById("toastContainer");

let currentUser = null;
let allNotes = [];
let editId = null;
let selectedColor = "default";
let currentView = localStorage.getItem("tp_view") || "grid";
let unsubscribe = null;

// Handle Auth & Listeners
if (logoutBtn) {
  logoutBtn.addEventListener("click", logOut);
}

auth.onAuthStateChanged(function (user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  if (userEmailEl) userEmailEl.textContent = user.email;
  listenToNotes();
});

function notesCollection() {
  return db.collection("users").doc(currentUser.uid).collection("notes");
}

function listenToNotes() {
  if (unsubscribe) unsubscribe();
  unsubscribe = notesCollection()
    .orderBy("createdAt", "desc")
    .onSnapshot(
      function (snapshot) {
        allNotes = snapshot.docs.map(function (doc) {
          return Object.assign({ id: doc.id }, doc.data());
        });
        renderNotes(searchEl ? searchEl.value : "");
      },
      function (err) {
        console.error("Failed to load notes:", err);
        showToast("Error loading notes from server", "error");
      }
    );
}

// View Toggle Handling
function setViewMode(mode) {
  currentView = mode;
  localStorage.setItem("tp_view", mode);
  if (viewGridBtn && viewListBtn) {
    viewGridBtn.classList.toggle("tp-btn-primary", mode === "grid");
    viewGridBtn.classList.toggle("tp-btn-ghost", mode !== "grid");
    viewListBtn.classList.toggle("tp-btn-primary", mode === "list");
    viewListBtn.classList.toggle("tp-btn-ghost", mode !== "list");
  }
  if (notesEl) {
    notesEl.className = mode === "list" ? "tp-notes-list" : "tp-notes-grid";
  }
}

if (viewGridBtn) viewGridBtn.addEventListener("click", function () { setViewMode("grid"); });
if (viewListBtn) viewListBtn.addEventListener("click", function () { setViewMode("list"); });

// Toast System
function showToast(message, type = "info") {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = `tp-toast tp-toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(function () {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3000);
}

// --- Rendering Notes ---------------------------------------------------

function renderNotes(filterText) {
  if (!notesEl) return;
  const query = (filterText || "").toLowerCase().trim();
  notesEl.innerHTML = "";
  setViewMode(currentView);

  if (allNotes.length === 0) {
    notesEl.appendChild(emptyMessage("Nothing here yet. Write your first note above!"));
    return;
  }

  // Filter notes
  const visible = allNotes.filter(function (note) {
    if (!query) return true;
    const tagsStr = Array.isArray(note.tags) ? note.tags.join(" ") : (note.tags || "");
    const haystack = ((note.title || "") + " " + (note.text || "") + " " + tagsStr).toLowerCase();
    return haystack.includes(query);
  });

  if (visible.length === 0) {
    notesEl.appendChild(emptyMessage("No notes match your search."));
    return;
  }

  // Sort pinned notes to top
  visible.sort(function (a, b) {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  visible.forEach(function (note) {
    notesEl.appendChild(buildNoteCard(note));
  });
}

function emptyMessage(text) {
  const div = document.createElement("div");
  div.className = "tp-empty";
  div.textContent = text;
  return div;
}

function buildNoteCard(note) {
  const card = document.createElement("div");
  const colorClass = note.color && note.color !== "default" ? `color-${note.color}` : "";
  card.className = `tp-note-card ${colorClass}`.trim();

  // Header (Title & Pin)
  const header = document.createElement("div");
  header.className = "tp-note-header";

  const title = document.createElement("h3");
  title.className = "tp-note-title";
  title.textContent = note.title || "Untitled";
  header.appendChild(title);

  const pinBtn = document.createElement("button");
  pinBtn.className = `tp-pin-btn ${note.pinned ? "pinned" : ""}`;
  pinBtn.type = "button";
  pinBtn.title = note.pinned ? "Unpin note" : "Pin note";
  pinBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="${note.pinned ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M12 2v10M12 12l4 4M12 12l-4 4M12 22v-6"/></svg>`;
  pinBtn.addEventListener("click", function () { togglePinNote(note); });
  header.appendChild(pinBtn);

  card.appendChild(header);

  // Body (Markdown support)
  const body = document.createElement("div");
  body.className = "tp-note-body";
  
  if (window.marked && typeof window.marked.parse === "function") {
    // Basic HTML escaping to prevent XSS before marked parsing
    const escapedText = (note.text || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    body.innerHTML = window.marked.parse(escapedText);
  } else {
    body.textContent = note.text;
  }
  card.appendChild(body);

  // Tags
  let tagsArr = [];
  if (Array.isArray(note.tags)) {
    tagsArr = note.tags;
  } else if (typeof note.tags === "string" && note.tags.trim()) {
    tagsArr = note.tags.split(",").map(t => t.trim()).filter(Boolean);
  }

  if (tagsArr.length > 0) {
    const tagsWrap = document.createElement("div");
    tagsWrap.className = "tp-tags-container";
    tagsArr.forEach(function (tag) {
      const badge = document.createElement("span");
      badge.className = "tp-tag-badge";
      badge.textContent = `#${tag}`;
      tagsWrap.appendChild(badge);
    });
    card.appendChild(tagsWrap);
  }

  // Footer (Timestamp & Actions)
  const footer = document.createElement("div");
  footer.className = "tp-note-footer";

  const dateSpan = document.createElement("span");
  dateSpan.textContent = formatDate(note.createdAt);
  footer.appendChild(dateSpan);

  const actions = document.createElement("div");
  actions.className = "tp-note-actions";

  // Copy button
  const copyBtn = document.createElement("button");
  copyBtn.className = "tp-btn tp-btn-ghost tp-btn-icon";
  copyBtn.type = "button";
  copyBtn.title = "Copy content";
  copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
  copyBtn.addEventListener("click", function () {
    navigator.clipboard.writeText(note.text || "").then(function () {
      showToast("Copied to clipboard!", "success");
    });
  });

  // Edit button
  const editBtn = document.createElement("button");
  editBtn.className = "tp-btn tp-btn-ghost tp-btn-icon";
  editBtn.type = "button";
  editBtn.title = "Edit note";
  editBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  editBtn.addEventListener("click", function () { startEdit(note); });

  // Delete button
  const delBtn = document.createElement("button");
  delBtn.className = "tp-btn tp-btn-danger tp-btn-icon";
  delBtn.type = "button";
  delBtn.title = "Delete note";
  delBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
  delBtn.addEventListener("click", function () { deleteNote(note.id); });

  actions.appendChild(copyBtn);
  actions.appendChild(editBtn);
  actions.appendChild(delBtn);
  footer.appendChild(actions);

  card.appendChild(footer);
  return card;
}

function formatDate(timestamp) {
  if (!timestamp) return "Just now";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

// --- Note Actions ----------------------------------------------------

if (addBtn) {
  addBtn.addEventListener("click", handleSaveNote);
}

function handleSaveNote() {
  const title = addTitleEl.value.trim();
  const text = addTxtEl.value.trim();
  const tagsStr = addTagsEl ? addTagsEl.value.trim() : "";
  const tags = tagsStr ? tagsStr.split(",").map(t => t.trim().toLowerCase()).filter(Boolean) : [];

  if (!text) {
    addTxtEl.focus();
    showToast("Please write some note content", "info");
    return;
  }

  const payload = {
    title: title,
    text: text,
    tags: tags,
    color: selectedColor,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  if (editId === null) {
    payload.pinned = false;
    payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    notesCollection().add(payload)
      .then(() => showToast("Note created!", "success"))
      .catch(err => showToast("Failed to save note", "error"));
  } else {
    notesCollection().doc(editId).update(payload)
      .then(() => showToast("Note updated!", "success"))
      .catch(err => showToast("Failed to update note", "error"));
    stopEdit();
  }

  resetForm();
}

function resetForm() {
  addTitleEl.value = "";
  addTxtEl.value = "";
  if (addTagsEl) addTagsEl.value = "";
  selectedColor = "default";
}

function startEdit(note) {
  editId = note.id;
  addTitleEl.value = note.title || "";
  addTxtEl.value = note.text || "";
  if (addTagsEl) addTagsEl.value = Array.isArray(note.tags) ? note.tags.join(", ") : (note.tags || "");
  
  selectedColor = note.color || "default";

  addBtn.textContent = "Save changes";
  cancelEditBtn.hidden = false;
  addTxtEl.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function stopEdit() {
  editId = null;
  addBtn.textContent = "Add note";
  cancelEditBtn.hidden = true;
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", function () {
    stopEdit();
    resetForm();
  });
}

function togglePinNote(note) {
  notesCollection().doc(note.id).update({
    pinned: !note.pinned
  }).then(function() {
    showToast(note.pinned ? "Unpinned note" : "Pinned note!", "info");
  });
}

function deleteNote(id) {
  if (confirm("Are you sure you want to delete this note?")) {
    notesCollection().doc(id).delete()
      .then(() => showToast("Note deleted", "info"))
      .catch(err => showToast("Failed to delete note", "error"));
    if (editId === id) stopEdit();
  }
}

if (searchEl) {
  searchEl.addEventListener("input", function () {
    renderNotes(searchEl.value);
  });
}

// Keyboard Shortcuts: Ctrl+Enter to save, Esc to cancel edit
document.addEventListener("keydown", function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    if (document.activeElement === addTxtEl || document.activeElement === addTitleEl || document.activeElement === addTagsEl) {
      e.preventDefault();
      handleSaveNote();
    }
  } else if (e.key === "Escape" && editId !== null) {
    stopEdit();
    resetForm();
  }
});
