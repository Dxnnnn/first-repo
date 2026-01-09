// Simple admin dropdown behavior and logout

const adminToggle = document.getElementById("adminToggle");
const adminMenu = document.getElementById("adminMenu");
const profileView = document.getElementById("profile-view");
const profileEdit = document.getElementById("profile-edit");
const editProfileBtn = document.getElementById("editProfileBtn");
const cancelEditProfile = document.getElementById("cancelEditProfile");
const profileNameEl = document.getElementById("profile-name");
const profileEmailEl = document.getElementById("profile-email");
const profileRoleEl = document.getElementById("profile-role");
const profileForm = document.getElementById("profileForm");

adminToggle?.addEventListener("click", () => {
  adminMenu?.classList.toggle("open");
});

document.addEventListener("click", (e) => {
  if (!adminMenu || !adminToggle) return;
  if (adminMenu.contains(e.target) || adminToggle.contains(e.target)) return;
  adminMenu.classList.remove("open");
});

adminMenu?.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLButtonElement)) return;
  const action = target.dataset.action;

  if (action === "profile") {
    window.scrollTo({ top: document.querySelector(".profile-page")?.offsetTop || 0, behavior: "smooth" });
  } else if (action === "logout") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    window.location.href = "Login.html";
  } else if (action === "employees" || action === "accounts" || action === "departments" || action === "requests") {
    alert(`${action.charAt(0).toUpperCase()}${action.slice(1)} is a placeholder in this prototype.`);
  }
});

// Load current admin data into profile view
(function loadProfile() {
  const raw = localStorage.getItem("currentUser");
  if (!raw) return;
  try {
    const user = JSON.parse(raw);
    if (profileNameEl && user.name) profileNameEl.textContent = user.name;
    if (profileEmailEl && user.email) profileEmailEl.textContent = user.email;
    if (profileRoleEl) profileRoleEl.textContent = user.role === "admin" ? "Admin" : "User";
  } catch {
    // ignore parse errors
  }
})();

function toggleEditProfile(showEdit) {
  if (!profileView || !profileEdit) return;
  if (showEdit) {
    profileView.classList.add("hidden");
    profileEdit.classList.remove("hidden");
    const raw = localStorage.getItem("currentUser");
    let user = { name: "Admin User", email: "admin@example.com", role: "admin" };
    if (raw) {
      try {
        user = { ...user, ...JSON.parse(raw) };
      } catch {
        // ignore
      }
    }
    const nameInput = document.getElementById("edit-name");
    const emailInput = document.getElementById("edit-email");
    if (nameInput instanceof HTMLInputElement) nameInput.value = user.name || "";
    if (emailInput instanceof HTMLInputElement) emailInput.value = user.email || "";
    const pwdInput = document.getElementById("edit-password");
    if (pwdInput instanceof HTMLInputElement) pwdInput.value = "";
  } else {
    profileView.classList.remove("hidden");
    profileEdit.classList.add("hidden");
  }
}

editProfileBtn?.addEventListener("click", () => {
  toggleEditProfile(true);
});

cancelEditProfile?.addEventListener("click", () => {
  toggleEditProfile(false);
});

profileForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const nameInput = document.getElementById("edit-name");
  const emailInput = document.getElementById("edit-email");
  const pwdInput = document.getElementById("edit-password");
  if (!(nameInput instanceof HTMLInputElement) || !(emailInput instanceof HTMLInputElement)) return;

  const newName = nameInput.value.trim();
  const newEmail = emailInput.value.trim();
  const newPassword = pwdInput instanceof HTMLInputElement ? pwdInput.value : "";

  const rawUser = localStorage.getItem("currentUser");
  let currentUser = rawUser ? JSON.parse(rawUser) : { role: "admin" };
  const oldEmail = currentUser.email;

  currentUser = { ...currentUser, name: newName, email: newEmail };
  if (newPassword) {
    currentUser.password = newPassword;
  }

  // Update users array used by login.js
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const updatedUsers = users.map((u) => {
    if (u.email === oldEmail) {
      return { ...u, email: newEmail, password: newPassword || u.password, name: newName };
    }
    return u;
  });
  localStorage.setItem("users", JSON.stringify(updatedUsers));

  // Update currentUser and token
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  const token = btoa(
    JSON.stringify({
      email: currentUser.email,
      role: currentUser.role || "admin",
      timestamp: Date.now(),
    })
  );
  localStorage.setItem("authToken", token);

  // Reflect changes in view
  if (profileNameEl) profileNameEl.textContent = newName || "Admin User";
  if (profileEmailEl) profileEmailEl.textContent = newEmail || "admin@example.com";

  alert("Profile updated in localStorage for this prototype.");
  toggleEditProfile(false);
});
