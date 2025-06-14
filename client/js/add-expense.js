document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) window.location.href = 'index.html';

  const urlParams = new URLSearchParams(window.location.search);
  const expenseId = urlParams.get('id');

  const formTitle = document.getElementById('formTitle');
  const expenseForm = document.getElementById('expenseForm');
  const errorP = document.getElementById('error');

  const titleInput = document.getElementById('title');
  const amountInput = document.getElementById('amount');
  const categoryInput = document.getElementById('category');
  const dateInput = document.getElementById('date');

  // ✅ If no expenseId, it means "Add" mode – set today's date
  if (!expenseId) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  // ✅ If editing, fetch and populate existing expense data
  if (expenseId) {
    formTitle.textContent = 'Edit Expense';

    fetch(`http://localhost:5000/api/expenses/${expenseId}`, {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then((res) => res.json())
      .then((expense) => {
        titleInput.value = expense.title || '';
        amountInput.value = expense.amount || '';
        categoryInput.value = expense.category || '';
        dateInput.value = expense.date ? expense.date.split('T')[0] : '';
      })
      .catch(() => {
        errorP.textContent = 'Failed to load expense details.';
      });
  }

  // ✅ Handle Form Submit (Add or Edit)
  expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorP.textContent = '';

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value.trim();
    const date = dateInput.value;

    if (!title || !amount || !date) {
      errorP.textContent = 'Please fill all required fields.';
      return;
    }

    const expenseData = { title, amount, category, date };

    try {
      const res = await fetch(
        `http://localhost:5000/api/expenses${expenseId ? '/' + expenseId : ''}`,
        {
          method: expenseId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify(expenseData),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save expense');

      window.location.href = 'index.html';
    } catch (err) {
      errorP.textContent = err.message;
    }
  });
});
