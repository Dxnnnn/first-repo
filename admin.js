// Simple admin dropdown behavior and logout

// Check if current user is admin
function isAdmin() {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser.role === 'admin';
  } catch {
    return false;
  }
}

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

// Hide admin-only menu items and buttons for regular users
(function setupRoleBasedUI() {
  const isUserAdmin = isAdmin();
  
  // Hide admin-only menu items
  const adminMenuItems = document.querySelectorAll('.role-admin');
  adminMenuItems.forEach(item => {
    if (!isUserAdmin) {
      item.style.display = 'none';
    }
  });
  
  // Hide "Add Employee" button for non-admin users
  const addEmployeeBtn = document.getElementById("addEmployeeBtn");
  if (addEmployeeBtn && !isUserAdmin) {
    addEmployeeBtn.style.display = 'none';
  }
  
  // Update toggle button text
  if (adminToggle) {
    adminToggle.textContent = isUserAdmin ? 'Admin ▾' : 'Menu ▾';
  }
})();

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
  
  e.stopPropagation(); // Prevent the document click listener from interfering
  
  const action = target.dataset.action;
  
  // Close the menu after clicking an option
  adminMenu?.classList.remove("open");

  // Hide all sections first
  const allSections = ["profile-section", "employees-section", "accounts-section", "departments-section", "requests-section"];
  allSections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) section.classList.add("hidden");
  });

  if (action === "profile") {
    const profileSection = document.getElementById("profile-section");
    if (profileSection) profileSection.classList.remove("hidden");
    window.scrollTo({ top: document.querySelector(".profile-page")?.offsetTop || 0, behavior: "smooth" });
  } else if (action === "employees") {
    const employeesSection = document.getElementById("employees-section");
    if (employeesSection) employeesSection.classList.remove("hidden");
    renderEmployees();
  } else if (action === "accounts") {
    // Only allow admin to access accounts section
    if (!isAdmin()) {
      alert('Access denied. Admin only.');
      return;
    }
    const accountsSection = document.getElementById("accounts-section");
    if (accountsSection) accountsSection.classList.remove("hidden");
    renderAccounts();
  } else if (action === "departments") {
    // Only allow admin to access departments section
    if (!isAdmin()) {
      alert('Access denied. Admin only.');
      return;
    }
    const departmentsSection = document.getElementById("departments-section");
    if (departmentsSection) departmentsSection.classList.remove("hidden");
    renderDepartments();
  } else if (action === "requests") {
    const requestsSection = document.getElementById("requests-section");
    if (requestsSection) requestsSection.classList.remove("hidden");
    renderRequests();
  } else if (action === "logout") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    window.location.href = "Login.html";
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

// Department CRUD functionality with modals
function getDepartments() {
  try {
    return JSON.parse(localStorage.getItem("departments") || "[]");
  } catch {
    return [];
  }
}

function saveDepartments(list) {
  localStorage.setItem("departments", JSON.stringify(list));
}

// Initialize with sample departments if none exist
(function initDepartments() {
  const depts = getDepartments();
  if (depts.length === 0) {
    saveDepartments([
      { name: "Engineering", description: "Software team" },
      { name: "HR", description: "Human Resources" }
    ]);
  }
})();

function renderDepartments() {
  const departmentsTableBody = document.getElementById("departmentsTableBody");
  if (!departmentsTableBody) return;
  
  const deptList = getDepartments();
  
  if (!deptList.length) {
    departmentsTableBody.innerHTML =
      '<tr><td colspan="3" class="text-center">No departments yet.</td></tr>';
    return;
  }
  
  departmentsTableBody.innerHTML = deptList
    .map(
      (dept, index) => `<tr data-index="${index}">
        <td>${dept.name}</td>
        <td>${dept.description || ""}</td>
        <td>
          <div class="action-buttons">
            <button type="button" class="btn-edit" data-action="edit" data-index="${index}">Edit</button>
            <button type="button" class="btn-delete" data-action="delete" data-index="${index}">Delete</button>
          </div>
        </td>
      </tr>`
    ) 
    .join("");
}

// Employee CRUD functionality
function getEmployees() {
  try {
    return JSON.parse(localStorage.getItem("employees") || "[]");
  } catch {
    return [];
  }
}

function saveEmployees(list) {
  localStorage.setItem("employees", JSON.stringify(list));
}

function renderEmployees() {
  const employeesTableBody = document.getElementById("employeesTableBody");
  if (!employeesTableBody) return;
  
  const empList = getEmployees();
  const isUserAdmin = isAdmin();
  
  if (!empList.length) {
    employeesTableBody.innerHTML =
      '<tr><td colspan="5" class="text-center">No employees yet.</td></tr>';
    return;
  }
  
  employeesTableBody.innerHTML = empList
    .map(
      (emp, index) => {
        const actionsHtml = isUserAdmin 
          ? `<div class="action-buttons">
              <button type="button" class="btn-edit" data-action="edit" data-index="${index}">Edit</button>
              <button type="button" class="btn-delete" data-action="delete" data-index="${index}">Delete</button>
            </div>`
          : '<div class="action-buttons">-</div>';
        
        return `<tr data-index="${index}">
          <td>${emp.id || ""}</td>
          <td>${emp.name || ""}</td>
          <td>${emp.position || ""}</td>
          <td>${emp.department || ""}</td>
          <td>${actionsHtml}</td>
        </tr>`;
      }
    ) 
    .join("");
}

// Account CRUD functionality - uses users list as source of truth
function getAccounts() {
  try {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    // Convert users to account format for display
    return users.map(user => ({
      email: user.email,
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || user.email.split("@")[0],
      role: user.role === 'admin' ? 'Admin' : 'User',
      verified: user.verified !== undefined ? user.verified : false,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName
    }));
  } catch {
    return [];
  }
}

function saveAccounts(list) {
  // Update users list by merging account changes with existing user data
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  
  list.forEach(acc => {
    const userIndex = users.findIndex(u => u.email === acc.email);
    if (userIndex !== -1) {
      // Update existing user
      users[userIndex] = {
        ...users[userIndex],
        email: acc.email,
        password: acc.password || users[userIndex].password,
        role: acc.role === 'Admin' ? 'admin' : 'user',
        verified: acc.verified !== undefined ? acc.verified : users[userIndex].verified,
        firstName: acc.firstName || users[userIndex].firstName,
        lastName: acc.lastName || users[userIndex].lastName,
        name: acc.name || users[userIndex].name
      };
    } else {
      // Add new user if doesn't exist
      users.push({
        email: acc.email,
        password: acc.password,
        role: acc.role === 'Admin' ? 'admin' : 'user',
        verified: acc.verified !== undefined ? acc.verified : false,
        firstName: acc.firstName,
        lastName: acc.lastName,
        name: acc.name
      });
    }
  });
  
  localStorage.setItem("users", JSON.stringify(users));
}

function renderAccounts() {
  const accountsTableBody = document.getElementById("accountsTableBody");
  if (!accountsTableBody) return;
  
  const accList = getAccounts();
  
  if (!accList.length) {
    accountsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No accounts yet.</td></tr>';
    return;
  }
  
  accountsTableBody.innerHTML = accList
    .map(
      (acc, index) => `<tr data-index="${index}">
        <td>${acc.name || ""}</td>
        <td>${acc.email || ""}</td>
        <td>${acc.role || ""}</td>
        <td>${acc.verified ? "✓" : "✗"}</td>
        <td>
          <div class="action-buttons">
            <button type="button" class="btn-edit" data-action="edit" data-index="${index}">Edit</button>
            <button type="button" class="btn-delete" data-action="delete" data-index="${index}">Delete</button>
          </div>
        </td>
      </tr>`
    ) 
    .join("");
}

// Request CRUD functionality
function getRequests() {
  try {
    return JSON.parse(localStorage.getItem("requests") || "[]");
  } catch {
    return [];
  }
}

function saveRequests(list) {
  localStorage.setItem("requests", JSON.stringify(list));
}

function renderRequests() {
  const requestsContent = document.getElementById("requestsContent");
  if (!requestsContent) return;
  
  const reqList = getRequests();
  const isUserAdmin = isAdmin();
  
  if (!reqList.length) {
    requestsContent.innerHTML = `
      <p>You have no requests yet.</p>
      <button type="button" class="btn btn-success" id="createFirstRequest">Create One</button>
    `;
    const createBtn = document.getElementById("createFirstRequest");
    createBtn?.addEventListener("click", () => openModal("newRequestModal"));
    return;
  }
  
  requestsContent.innerHTML = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 2px solid #eee;">
          <th style="padding: 0.75rem; text-align: left;">Type</th>
          <th style="padding: 0.75rem; text-align: left;">Items</th>
          <th style="padding: 0.75rem; text-align: left;">Status</th>
          <th style="padding: 0.75rem; text-align: left;">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${reqList.map((req, index) => {
          const status = req.status || "Pending";
          const statusClass = status === "Approved" ? "text-success" : status === "Not Approved" ? "text-danger" : "";
          
          let actionsHtml = '';
          if (isUserAdmin) {
            // Admin sees approve/not approve buttons
            actionsHtml = `
              <div class="action-buttons">
                <button type="button" class="btn btn-success btn-sm" data-action="approve" data-index="${index}" ${status === "Approved" ? "disabled" : ""}>Approve</button>
                <button type="button" class="btn btn-danger btn-sm" data-action="not-approve" data-index="${index}" ${status === "Not Approved" ? "disabled" : ""}>Not Approve</button>
              </div>
            `;
          } else {
            // Regular users see edit and delete buttons
            actionsHtml = `
              <div class="action-buttons">
                <button type="button" class="btn-edit" data-action="edit" data-index="${index}">Edit</button>
                <button type="button" class="btn-delete" data-action="delete" data-index="${index}">Delete</button>
              </div>
            `;
          }
          
          return `
            <tr data-index="${index}">
              <td>${req.type || ""}</td>
              <td>${req.items ? req.items.map(i => `${i.name} (${i.quantity})`).join(", ") : ""}</td>
              <td class="${statusClass}">${status}</td>
              <td>${actionsHtml}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

// Helper function for removing request items
window.removeRequestItem = function(button) {
  button.parentElement.remove();
};

// Modal functions
function openModal(modalId, data = {}) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  // Hide all modals first
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
  
  // Show the requested modal
  modal.classList.remove('hidden');
  
  // Handle specific modal data
  if (modalId === 'addDepartmentModal') {
    // Clear the form when opening add modal
    const addDeptName = document.getElementById("add-dept-name");
    const addDeptDescription = document.getElementById("add-dept-description");
    if (addDeptName) addDeptName.value = '';
    if (addDeptDescription) addDeptDescription.value = '';
    window.editingDepartmentIndex = null;
  } else if (modalId === 'addEmployeeModal') {
    // Clear employee form
    const empId = document.getElementById("add-emp-id");
    const empEmail = document.getElementById("add-emp-email");
    const empPosition = document.getElementById("add-emp-position");
    const empDept = document.getElementById("add-emp-dept");
    const empHireDate = document.getElementById("add-emp-hire-date");
    if (empId) empId.value = '';
    if (empEmail) empEmail.value = '';
    if (empPosition) empPosition.value = '';
    if (empDept) empDept.value = '';
    if (empHireDate) empHireDate.value = '';
    window.editingEmployeeIndex = null;
  } else if (modalId === 'editEmployeeModal' && data.employee) {
    // Populate edit employee form
    const editEmpId = document.getElementById("edit-emp-id");
    const editEmpEmail = document.getElementById("edit-emp-email");
    const editEmpPosition = document.getElementById("edit-emp-position");
    const editEmpDept = document.getElementById("edit-emp-dept");
    const editEmpHireDate = document.getElementById("edit-emp-hire-date");
    if (editEmpId) editEmpId.value = data.employee.id || '';
    if (editEmpEmail) editEmpEmail.value = data.employee.email || '';
    if (editEmpPosition) editEmpPosition.value = data.employee.position || '';
    if (editEmpDept) editEmpDept.value = data.employee.department || '';
    if (editEmpHireDate) editEmpHireDate.value = data.employee.hireDate || '';
    window.editingEmployeeIndex = data.index;
  } else if (modalId === 'addAccountModal') {
    // Clear account form
    const accFirstName = document.getElementById("add-acc-first-name");
    const accLastName = document.getElementById("add-acc-last-name");
    const accEmail = document.getElementById("add-acc-email");
    const accPassword = document.getElementById("add-acc-password");
    const accRole = document.getElementById("add-acc-role");
    const accVerified = document.getElementById("add-acc-verified");
    if (accFirstName) accFirstName.value = '';
    if (accLastName) accLastName.value = '';
    if (accEmail) accEmail.value = '';
    if (accPassword) accPassword.value = '';
    if (accRole) accRole.value = 'User';
    if (accVerified) accVerified.checked = false;
    window.editingAccountIndex = null;
  } else if (modalId === 'editAccountModal' && data.account) {
    // Populate edit account form
    const firstName = data.account.firstName || (data.account.name || '').split(' ')[0] || '';
    const lastName = data.account.lastName || (data.account.name || '').split(' ').slice(1).join(' ') || '';
    const editAccFirstName = document.getElementById("edit-acc-first-name");
    const editAccLastName = document.getElementById("edit-acc-last-name");
    const editAccEmail = document.getElementById("edit-acc-email");
    const editAccPassword = document.getElementById("edit-acc-password");
    const editAccRole = document.getElementById("edit-acc-role");
    const editAccVerified = document.getElementById("edit-acc-verified");
    if (editAccFirstName) editAccFirstName.value = firstName;
    if (editAccLastName) editAccLastName.value = lastName;
    if (editAccEmail) editAccEmail.value = data.account.email || '';
    if (editAccPassword) editAccPassword.value = '';
    if (editAccRole) editAccRole.value = data.account.role || 'User';
    if (editAccVerified) editAccVerified.checked = data.account.verified || false;
    window.editingAccountIndex = data.index;
  } else if (modalId === 'newRequestModal') {
    // Reset request form
    const requestType = document.getElementById("request-type");
    const itemsContainer = document.getElementById("request-items-container");
    if (requestType) requestType.value = 'Equipment';
    if (itemsContainer) {
      itemsContainer.innerHTML = `
        <div class="request-item" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
          <input type="text" class="form-control" placeholder="Item name" style="flex: 1;" required>
          <input type="number" class="form-control" value="1" min="1" style="width: 80px;" required>
          <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()">×</button>
        </div>
      `;
    }
    window.editingRequestIndex = null;
  } else if (modalId === 'editRequestModal' && data.request) {
    // Populate edit request form (only type and items are editable)
    const editRequestType = document.getElementById("edit-request-type");
    const editItemsContainer = document.getElementById("edit-request-items-container");
    if (editRequestType) editRequestType.value = data.request.type || 'Equipment';
    if (editItemsContainer) {
      const items = data.request.items || [{ name: '', quantity: 1 }];
      editItemsContainer.innerHTML = items.map(item => `
        <div class="request-item" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
          <input type="text" class="form-control" placeholder="Item name" style="flex: 1;" value="${item.name || ''}" required>
          <input type="number" class="form-control" value="${item.quantity || 1}" min="1" style="width: 80px;" required>
          <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()">×</button>
        </div>
      `).join('');
      if (items.length === 0) {
        editItemsContainer.innerHTML = `
          <div class="request-item" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
            <input type="text" class="form-control" placeholder="Item name" style="flex: 1;" required>
            <input type="number" class="form-control" value="1" min="1" style="width: 80px;" required>
            <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()">×</button>
          </div>
        `;
      }
    }
    window.editingRequestIndex = data.index;
  } else if (modalId === 'editDepartmentModal' && data.department) {
    const editDeptName = document.getElementById("edit-dept-name");
    const editDeptDescription = document.getElementById("edit-dept-description");
    if (editDeptName) editDeptName.value = data.department.name || '';
    if (editDeptDescription) editDeptDescription.value = data.department.description || '';
    window.editingDepartmentIndex = data.index;
  } else if (modalId === 'deleteDepartmentModal' && data.department) {
    const deleteDeptName = document.getElementById("delete-dept-name");
    if (deleteDeptName) deleteDeptName.textContent = data.department.name || '';
    window.editingDepartmentIndex = data.index;
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
  window.editingDepartmentIndex = null;
  window.editingAccountIndex = null;
  window.editingEmployeeIndex = null;
  window.editingRequestIndex = null;
}

// Set up department table event listener and ensure modals are hidden
document.addEventListener('DOMContentLoaded', function() {
  // Ensure all modals are hidden by default
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.add('hidden');
  });
  const departmentsTableBody = document.getElementById("departmentsTableBody");
  if (departmentsTableBody) {
    departmentsTableBody.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLButtonElement)) return;
      const action = target.dataset.action;
      const index = target.dataset.index;
      if (index === undefined) return;

      const list = getDepartments();
      const idx = Number(index);
      if (idx < 0 || idx >= list.length) return;

      if (action === "edit") {
        const dept = list[idx];
        openModal("editDepartmentModal", { department: dept, index: idx });
      } else if (action === "delete") {
        const dept = list[idx];
        openModal("deleteDepartmentModal", { department: dept, index: idx });
      }
    });
  }

  // Set up Add buttons
  const addDepartmentBtn = document.getElementById("addDepartmentBtn");
  addDepartmentBtn?.addEventListener("click", () => {
    openModal("addDepartmentModal");
  });

  const addEmployeeBtn = document.getElementById("addEmployeeBtn");
  addEmployeeBtn?.addEventListener("click", () => {
    if (!isAdmin()) {
      alert('Access denied. Admin only.');
      return;
    }
    openModal("addEmployeeModal");
  });

  const addAccountBtn = document.getElementById("addAccountBtn");
  addAccountBtn?.addEventListener("click", () => {
    openModal("addAccountModal");
  });

  const addRequestBtn = document.getElementById("addRequestBtn");
  addRequestBtn?.addEventListener("click", () => {
    openModal("newRequestModal");
  });

  // Set up modal event listeners
  const closeAddDepartmentModal = document.getElementById("closeAddDepartmentModal");
  const closeEditDepartmentModal = document.getElementById("closeEditDepartmentModal");
  const closeDeleteDepartmentModal = document.getElementById("closeDeleteDepartmentModal");
  const cancelAddDepartment = document.getElementById("cancelAddDepartment");
  const cancelEditDepartment = document.getElementById("cancelEditDepartment");
  const cancelDeleteDepartment = document.getElementById("cancelDeleteDepartment");
  const saveAddDepartment = document.getElementById("saveAddDepartment");
  const saveEditDepartment = document.getElementById("saveEditDepartment");
  const confirmDeleteDepartment = document.getElementById("confirmDeleteDepartment");

  closeAddDepartmentModal?.addEventListener("click", () => closeModal("addDepartmentModal"));
  closeEditDepartmentModal?.addEventListener("click", () => closeModal("editDepartmentModal"));
  closeDeleteDepartmentModal?.addEventListener("click", () => closeModal("deleteDepartmentModal"));
  cancelAddDepartment?.addEventListener("click", () => closeModal("addDepartmentModal"));
  cancelEditDepartment?.addEventListener("click", () => closeModal("editDepartmentModal"));
  cancelDeleteDepartment?.addEventListener("click", () => closeModal("deleteDepartmentModal"));

  saveAddDepartment?.addEventListener("click", () => {
    const addDeptName = document.getElementById("add-dept-name");
    const addDeptDescription = document.getElementById("add-dept-description");
    if (!addDeptName || !addDeptDescription) return;
    
    const name = addDeptName.value.trim();
    const description = addDeptDescription.value.trim();
    
    if (!name || !description) {
      alert("Please fill in both Name and Description.");
      return;
    }
    
    const list = getDepartments();
    list.push({ name, description });
    saveDepartments(list);
    renderDepartments();
    
    // Clear the form
    addDeptName.value = "";
    addDeptDescription.value = "";
    
    closeModal("addDepartmentModal");
  });

  saveEditDepartment?.addEventListener("click", () => {
    const editDeptName = document.getElementById("edit-dept-name");
    const editDeptDescription = document.getElementById("edit-dept-description");
    if (!editDeptName || !editDeptDescription) return;
    
    const name = editDeptName.value.trim();
    const description = editDeptDescription.value.trim();
    
    if (!name || !description) {
      alert("Please fill in both Name and Description.");
      return;
    }
    
    const list = getDepartments();
    const idx = window.editingDepartmentIndex;
    if (idx !== null && idx >= 0 && idx < list.length) {
      list[idx] = { name, description };
      saveDepartments(list);
      renderDepartments();
    }
    
    closeModal("editDepartmentModal");
  });

  confirmDeleteDepartment?.addEventListener("click", () => {
    const list = getDepartments();
    const idx = window.editingDepartmentIndex;
    if (idx !== null && idx >= 0 && idx < list.length) {
      list.splice(idx, 1);
      saveDepartments(list);
      renderDepartments();
    }
    
    closeModal("deleteDepartmentModal");
  });

  // Employees table event listeners
  const employeesTableBody = document.getElementById("employeesTableBody");
  if (employeesTableBody) {
    employeesTableBody.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLButtonElement)) return;
      const action = target.dataset.action;
      const index = target.dataset.index;
      if (index === undefined) return;

      const list = getEmployees();
      const idx = Number(index);
      if (idx < 0 || idx >= list.length) return;

      // Only allow admin to edit/delete employees
      if (!isAdmin()) {
        alert('Access denied. Admin only.');
        return;
      }

      if (action === "edit") {
        const employee = list[idx];
        openModal("editEmployeeModal", { employee: employee, index: idx });
      } else if (action === "delete") {
        if (confirm("Are you sure you want to delete this employee?")) {
          list.splice(idx, 1);
          saveEmployees(list);
          renderEmployees();
        }
      }
    });
  }

  // Accounts table event listeners
  const accountsTableBody = document.getElementById("accountsTableBody");
  if (accountsTableBody) {
    accountsTableBody.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLButtonElement)) return;
      const action = target.dataset.action;
      const index = target.dataset.index;
      if (index === undefined) return;

      const list = getAccounts();
      const idx = Number(index);
      if (idx < 0 || idx >= list.length) return;

      if (action === "edit") {
        const account = list[idx];
        openModal("editAccountModal", { account: account, index: idx });
      } else if (action === "delete") {
        if (confirm("Are you sure you want to delete this account?")) {
          const accountToDelete = list[idx];
          // Remove from users list by email
          const users = JSON.parse(localStorage.getItem("users") || "[]");
          const updatedUsers = users.filter(u => u.email !== accountToDelete.email);
          localStorage.setItem("users", JSON.stringify(updatedUsers));
          renderAccounts();
        }
      }
    });
  }

  // Requests event listeners
  document.addEventListener("click", (e) => {
    if (e.target.closest("#requestsContent")) {
      const target = e.target;
      if (!(target instanceof HTMLButtonElement)) return;
      const action = target.dataset.action;
      const index = target.dataset.index;
      if (index === undefined) return;

      const list = getRequests();
      const idx = Number(index);
      if (idx < 0 || idx >= list.length) return;

      if (action === "edit") {
        // Only allow users (not admin) to edit requests
        if (isAdmin()) {
          alert('Only regular users can edit requests.');
          return;
        }
        const request = list[idx];
        openModal("editRequestModal", { request: request, index: idx });
      } else if (action === "delete") {
        if (confirm("Are you sure you want to delete this request?")) {
          list.splice(idx, 1);
          saveRequests(list);
          renderRequests();
        }
      } else if (action === "approve") {
        // Admin action: approve request
        if (!isAdmin()) {
          alert('Access denied. Admin only.');
          return;
        }
        list[idx].status = "Approved";
        saveRequests(list);
        renderRequests();
      } else if (action === "not-approve") {
        // Admin action: not approve request
        if (!isAdmin()) {
          alert('Access denied. Admin only.');
          return;
        }
        list[idx].status = "Not Approved";
        saveRequests(list);
        renderRequests();
      }
    }
  });

  // Employee modal handlers
  const closeAddEmployeeModal = document.getElementById("closeAddEmployeeModal");
  const cancelAddEmployee = document.getElementById("cancelAddEmployee");
  const saveAddEmployee = document.getElementById("saveAddEmployee");

  closeAddEmployeeModal?.addEventListener("click", () => closeModal("addEmployeeModal"));
  cancelAddEmployee?.addEventListener("click", () => closeModal("addEmployeeModal"));

  saveAddEmployee?.addEventListener("click", () => {
    const empId = document.getElementById("add-emp-id");
    const empEmail = document.getElementById("add-emp-email");
    const empPosition = document.getElementById("add-emp-position");
    const empDept = document.getElementById("add-emp-dept");
    const empHireDate = document.getElementById("add-emp-hire-date");
    
    if (!empId || !empEmail || !empPosition || !empDept || !empHireDate) return;
    
    const employee = {
      id: empId.value.trim(),
      email: empEmail.value.trim(),
      position: empPosition.value.trim(),
      department: empDept.value.trim(),
      hireDate: empHireDate.value,
      name: empEmail.value.split("@")[0] // Simple name from email
    };
    
    if (!employee.id || !employee.email || !employee.position || !employee.department) {
      alert("Please fill in all required fields.");
      return;
    }
    
    const list = getEmployees();
    list.push(employee);
    saveEmployees(list);
    renderEmployees();
    
    // Clear form
    empId.value = "";
    empEmail.value = "";
    empPosition.value = "";
    empDept.value = "";
    empHireDate.value = "";
    
    closeModal("addEmployeeModal");
  });

  // Edit Employee modal handlers
  const closeEditEmployeeModal = document.getElementById("closeEditEmployeeModal");
  const cancelEditEmployee = document.getElementById("cancelEditEmployee");
  const saveEditEmployee = document.getElementById("saveEditEmployee");

  closeEditEmployeeModal?.addEventListener("click", () => closeModal("editEmployeeModal"));
  cancelEditEmployee?.addEventListener("click", () => closeModal("editEmployeeModal"));

  saveEditEmployee?.addEventListener("click", () => {
    const editEmpId = document.getElementById("edit-emp-id");
    const editEmpEmail = document.getElementById("edit-emp-email");
    const editEmpPosition = document.getElementById("edit-emp-position");
    const editEmpDept = document.getElementById("edit-emp-dept");
    const editEmpHireDate = document.getElementById("edit-emp-hire-date");
    
    if (!editEmpId || !editEmpEmail || !editEmpPosition || !editEmpDept || !editEmpHireDate) return;
    
    const list = getEmployees();
    const idx = window.editingEmployeeIndex;
    if (idx === null || idx === undefined || idx < 0 || idx >= list.length) {
      alert("Error: Employee not found.");
      return;
    }
    
    const updatedEmployee = {
      id: editEmpId.value.trim(),
      email: editEmpEmail.value.trim(),
      position: editEmpPosition.value.trim(),
      department: editEmpDept.value.trim(),
      hireDate: editEmpHireDate.value,
      name: editEmpEmail.value.split("@")[0] // Simple name from email
    };
    
    if (!updatedEmployee.id || !updatedEmployee.email || !updatedEmployee.position || !updatedEmployee.department) {
      alert("Please fill in all required fields.");
      return;
    }
    
    list[idx] = updatedEmployee;
    saveEmployees(list);
    renderEmployees();
    
    closeModal("editEmployeeModal");
  });

  // Account modal handlers
  const closeAddAccountModal = document.getElementById("closeAddAccountModal");
  const cancelAddAccount = document.getElementById("cancelAddAccount");
  const saveAddAccount = document.getElementById("saveAddAccount");

  closeAddAccountModal?.addEventListener("click", () => closeModal("addAccountModal"));
  cancelAddAccount?.addEventListener("click", () => closeModal("addAccountModal"));

  saveAddAccount?.addEventListener("click", () => {
    const accFirstName = document.getElementById("add-acc-first-name");
    const accLastName = document.getElementById("add-acc-last-name");
    const accEmail = document.getElementById("add-acc-email");
    const accPassword = document.getElementById("add-acc-password");
    const accRole = document.getElementById("add-acc-role");
    const accVerified = document.getElementById("add-acc-verified");
    
    if (!accFirstName || !accLastName || !accEmail || !accPassword || !accRole) return;
    
    // Check if email already exists
    const existingList = getAccounts();
    if (existingList.some(acc => acc.email === accEmail.value.trim())) {
      alert("An account with this email already exists.");
      return;
    }
    
    const account = {
      name: `${accFirstName.value.trim()} ${accLastName.value.trim()}`,
      email: accEmail.value.trim(),
      password: accPassword.value.trim(),
      role: accRole.value,
      verified: accVerified?.checked || false,
      firstName: accFirstName.value.trim(),
      lastName: accLastName.value.trim()
    };
    
    if (!account.name || !account.email || !account.password) {
      alert("Please fill in all required fields.");
      return;
    }
    
    const list = getAccounts();
    list.push(account);
    saveAccounts(list);
    renderAccounts();
    
    // Clear form
    accFirstName.value = "";
    accLastName.value = "";
    accEmail.value = "";
    accPassword.value = "";
    accRole.value = "User";
    if (accVerified) accVerified.checked = false;
    
    closeModal("addAccountModal");
  });

  // Edit Account modal handlers
  const closeEditAccountModal = document.getElementById("closeEditAccountModal");
  const cancelEditAccount = document.getElementById("cancelEditAccount");
  const saveEditAccount = document.getElementById("saveEditAccount");

  closeEditAccountModal?.addEventListener("click", () => closeModal("editAccountModal"));
  cancelEditAccount?.addEventListener("click", () => closeModal("editAccountModal"));

  saveEditAccount?.addEventListener("click", () => {
    const editAccFirstName = document.getElementById("edit-acc-first-name");
    const editAccLastName = document.getElementById("edit-acc-last-name");
    const editAccEmail = document.getElementById("edit-acc-email");
    const editAccPassword = document.getElementById("edit-acc-password");
    const editAccRole = document.getElementById("edit-acc-role");
    const editAccVerified = document.getElementById("edit-acc-verified");
    
    if (!editAccFirstName || !editAccLastName || !editAccEmail || !editAccRole) return;
    
    const list = getAccounts();
    const idx = window.editingAccountIndex;
    if (idx === null || idx === undefined || idx < 0 || idx >= list.length) {
      alert("Error: Account not found.");
      return;
    }
    
    const existingAccount = list[idx];
    
    // Check if email is being changed and if new email already exists
    if (editAccEmail.value.trim() !== existingAccount.email) {
      if (list.some(acc => acc.email === editAccEmail.value.trim() && list.indexOf(acc) !== idx)) {
        alert("An account with this email already exists.");
        return;
      }
    }
    
    const updatedAccount = {
      name: `${editAccFirstName.value.trim()} ${editAccLastName.value.trim()}`,
      email: editAccEmail.value.trim(),
      password: editAccPassword?.value.trim() || existingAccount.password,
      role: editAccRole.value,
      verified: editAccVerified?.checked || false,
      firstName: editAccFirstName.value.trim(),
      lastName: editAccLastName.value.trim()
    };
    
    if (!updatedAccount.name || !updatedAccount.email) {
      alert("Please fill in all required fields.");
      return;
    }
    
    list[idx] = updatedAccount;
    saveAccounts(list);
    renderAccounts();
    
    closeModal("editAccountModal");
  });

  // Request modal handlers
  const closeNewRequestModal = document.getElementById("closeNewRequestModal");
  const cancelNewRequest = document.getElementById("cancelNewRequest");
  const submitRequest = document.getElementById("submitRequest");
  const addRequestItem = document.getElementById("addRequestItem");

  closeNewRequestModal?.addEventListener("click", () => closeModal("newRequestModal"));
  cancelNewRequest?.addEventListener("click", () => closeModal("newRequestModal"));

  addRequestItem?.addEventListener("click", () => {
    const container = document.getElementById("request-items-container");
    if (!container) return;
    
    const newItem = document.createElement("div");
    newItem.className = "request-item";
    newItem.style.cssText = "display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;";
    newItem.innerHTML = `
      <input type="text" class="form-control" placeholder="Item name" style="flex: 1;" required>
      <input type="number" class="form-control" value="1" min="1" style="width: 80px;" required>
      <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(newItem);
  });

  submitRequest?.addEventListener("click", () => {
    const requestType = document.getElementById("request-type");
    const itemsContainer = document.getElementById("request-items-container");
    
    if (!requestType || !itemsContainer) return;
    
    const items = Array.from(itemsContainer.querySelectorAll(".request-item")).map(item => {
      const nameInput = item.querySelector('input[type="text"]');
      const qtyInput = item.querySelector('input[type="number"]');
      return {
        name: nameInput?.value.trim() || "",
        quantity: parseInt(qtyInput?.value || "1")
      };
    }).filter(item => item.name);
    
    if (!items.length) {
      alert("Please add at least one item.");
      return;
    }
    
    const request = {
      type: requestType.value,
      items: items,
      status: "Pending",
      date: new Date().toISOString()
    };
    
    const list = getRequests();
    list.push(request);
    saveRequests(list);
    renderRequests();
    
    // Clear form
    requestType.value = "Equipment";
    itemsContainer.innerHTML = `
      <div class="request-item" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
        <input type="text" class="form-control" placeholder="Item name" style="flex: 1;" required>
        <input type="number" class="form-control" value="1" min="1" style="width: 80px;" required>
        <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()">×</button>
      </div>
    `;
    
    closeModal("newRequestModal");
  });

  // Edit Request modal handlers
  const closeEditRequestModal = document.getElementById("closeEditRequestModal");
  const cancelEditRequest = document.getElementById("cancelEditRequest");
  const saveEditRequest = document.getElementById("saveEditRequest");
  const addEditRequestItem = document.getElementById("addEditRequestItem");

  closeEditRequestModal?.addEventListener("click", () => closeModal("editRequestModal"));
  cancelEditRequest?.addEventListener("click", () => closeModal("editRequestModal"));

  addEditRequestItem?.addEventListener("click", () => {
    const container = document.getElementById("edit-request-items-container");
    if (!container) return;
    
    const newItem = document.createElement("div");
    newItem.className = "request-item";
    newItem.style.cssText = "display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;";
    newItem.innerHTML = `
      <input type="text" class="form-control" placeholder="Item name" style="flex: 1;" required>
      <input type="number" class="form-control" value="1" min="1" style="width: 80px;" required>
      <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(newItem);
  });

  saveEditRequest?.addEventListener("click", () => {
    const editRequestType = document.getElementById("edit-request-type");
    const editItemsContainer = document.getElementById("edit-request-items-container");
    
    if (!editRequestType || !editItemsContainer) return;
    
    const list = getRequests();
    const idx = window.editingRequestIndex;
    if (idx === null || idx === undefined || idx < 0 || idx >= list.length) {
      alert("Error: Request not found.");
      return;
    }
    
    const items = Array.from(editItemsContainer.querySelectorAll(".request-item")).map(item => {
      const nameInput = item.querySelector('input[type="text"]');
      const qtyInput = item.querySelector('input[type="number"]');
      return {
        name: nameInput?.value.trim() || "",
        quantity: parseInt(qtyInput?.value || "1")
      };
    }).filter(item => item.name);
    
    if (!items.length) {
      alert("Please add at least one item.");
      return;
    }
    
    // Update only type and items (preserve status and date)
    list[idx].type = editRequestType.value;
    list[idx].items = items;
    
    saveRequests(list);
    renderRequests();
    
    closeModal("editRequestModal");
  });
});
