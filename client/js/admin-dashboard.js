document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    alert('Unauthorized access');
    window.location.href = 'admin-login.html';
    return;
  }

  loadTotalUsers();
  loadUsers();
  loadContacts();
  loadTotalContacts();

  document.getElementById('addAdminForm').addEventListener('submit', addNewAdmin);

  // Logout button
  document.getElementById('adminLogout').addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    window.location.href = 'admin-login.html';
  });
});

async function loadTotalUsers() {
  const res = await fetch('http://localhost:5000/api/admin/total-users', {
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });
  const data = await res.json();
  document.getElementById('totalUsersCount').textContent = data.totalUsers;
}

async function loadTotalContacts() {
  const res = await fetch('http://localhost:5000/api/admin/total-contacts', {
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });
  const data = await res.json();
  document.getElementById('totalSubmissions').textContent = data.totalContact;
}

async function loadUsers() {
  const res = await fetch('http://localhost:5000/api/admin/users', {
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });
  const users = await res.json();
  const tbody = document.getElementById('userTableBody');
  tbody.innerHTML = '';
  users.forEach((user, index) => {
    tbody.innerHTML += `
      <tr>
        <td class="px-3 py-2 border">${index + 1}</td>
        <td class="px-3 py-2 border">${user.name}</td>
        <td class="px-3 py-2 border">${user.email}</td>
      </tr>
    `;
  });
}

async function loadContacts() {
  const res = await fetch('http://localhost:5000/api/admin/contacts', {
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });
  const contacts = await res.json();
  const tbody = document.getElementById('contactTableBody');
  tbody.innerHTML = '';
  contacts.forEach((contact, index) => {
    tbody.innerHTML += `
      <tr>
        <td class="px-3 py-2 border">${index + 1}</td>
        <td class="px-3 py-2 border">${contact.name}</td>
        <td class="px-3 py-2 border">${contact.email}</td>
        <td class="px-3 py-2 border">${contact.message}</td>
      </tr>
    `;
  });
}

async function addNewAdmin(e) {
  e.preventDefault();
  const username = document.getElementById('newAdminUsername').value;
  const password = document.getElementById('newAdminPassword').value;

  const res = await fetch('http://localhost:5000/api/admin/add-admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('adminToken')}`
    },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (res.ok) {
    alert('New admin added successfully!');
    e.target.reset();
  } else {
    alert(data.error || 'Failed to add admin');
  }
}