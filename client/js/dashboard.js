const token = localStorage.getItem("token");
const totalEl = document.getElementById("totalExpense");
const monthlyEl = document.getElementById("monthlyExpense");

let allExpenses = [];

// Add jsPDF plugin if needed
if (window.jspdf && window.jspdf.autoTable === undefined) {
  console.warn("jsPDF autoTable plugin is required for table export");
}

if (!token) window.location.href = "login.html";

document.getElementById("addExpenseBtn").addEventListener("click", function () {
  window.location.href = "add-expense.html";
});

const expenseList = document.getElementById("expenseList");

const fetchExpenses = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/expenses", {
      headers: { Authorization: "Bearer " + token },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch");

    allExpenses = data; // Store expenses globally

    updateCategoryDropdown(data);
    applyFilters(); // Filter based on current selection

    renderExpenses(data);
    renderCharts(data);

    // 💡 CALCULATE total and monthly totals here
    let total = 0;
    let monthlyTotal = 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    data.forEach((exp) => {
      total += exp.amount;
      const expDate = new Date(exp.date);
      if (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      ) {
        monthlyTotal += exp.amount;
      }
    });

    if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
    if (monthlyEl) monthlyEl.textContent = `₹${monthlyTotal.toFixed(2)}`;
  } catch (err) {
    expenseList.innerHTML = `<p class="text-red-500 text-center">${err.message}</p>`;
  }
};

// 🔽 Populate dropdown with unique categories
function updateCategoryDropdown(expenses) {
  const categories = Array.from(
    new Set(expenses.map((exp) => exp.category).filter(Boolean))
  );
  categoryFilter.innerHTML =
    `<option value="">-- All Categories --</option>` +
    categories.map((cat) => `<option value="${cat}">${cat}</option>`).join("");
}

// 🧠 Filter and display expenses by selected category
function applyFilters() {
  const selectedCategory = categoryFilter.value;
  let filtered = allExpenses;

  if (selectedCategory) {
    filtered = allExpenses.filter((exp) => exp.category === selectedCategory);
  }

  renderExpenses(filtered);

  const totalFiltered = filtered.reduce((sum, exp) => sum + exp.amount, 0);

  // ✅ Calculate this month's total for selected category
  const now = new Date();
  const thisMonthTotal = filtered.reduce((sum, exp) => {
    const expDate = new Date(exp.date);
    if (
      expDate.getMonth() === now.getMonth() &&
      expDate.getFullYear() === now.getFullYear()
    ) {
      return sum + exp.amount;
    }
    return sum;
  }, 0);

  // Check if already exists
  let totalBox = document.getElementById("filteredTotalBox");

  if (!selectedCategory) {
    if (totalBox) totalBox.remove();
    return;
  }

  // Create if not exists
  if (!totalBox) {
    totalBox = document.createElement("div");
    totalBox.id = "filteredTotalBox";
    totalBox.className =
      "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mt-4 rounded shadow";
    expenseList.parentNode.insertBefore(totalBox, expenseList.nextSibling);
  }

  // Update box content
  totalBox.innerHTML = `
    <strong>Total for "<span class="text-blue-700">${selectedCategory}</span>" Category: ₹${totalFiltered.toFixed(
    2
  )}</strong><br />
    <strong><span>This Month: ₹${thisMonthTotal.toFixed(2)}</span></strong>
  `;
}

// 🛑 Update when dropdown changes
categoryFilter.addEventListener("change", applyFilters);

const renderExpenses = (expenses) => {
  if (!expenses.length) {
    expenseList.innerHTML = `<p class="text-gray-500 text-center">No expenses found.</p>`;
    return;
  }

  expenseList.innerHTML = expenses
    .map(
      (exp) => `
    <div class="flex justify-between items-center bg-white px-4 py-3 rounded-lg shadow border">
      <div>
        <h3 class="text-lg font-semibold text-indigo-700">${exp.title}</h3>
        <p class="text-sm text-gray-500">${new Date(
          exp.date
        ).toLocaleDateString()} • ${exp.category || "Other"}</p>
      </div>
      <div class="flex items-center space-x-3 text-right">
        <span class="font-bold text-blue-600 text-lg">₹${exp.amount}</span>
        <button title="Edit" onclick="editExpense('${exp._id}')">
          <i class="fa-regular fa-pen-to-square text-green-600 text-lg hover:text-indigo-800 transition"></i>
        </button>
        <button title="Delete" onclick="deleteExpense('${exp._id}')">
          <i class="fas fa-trash text-red-600 text-lg hover:text-red-800 transition"></i>
        </button>
      </div>
    </div>
  `
    )
    .join("");
};

const editExpense = (id) => {
  window.location.href = `add-expense.html?id=${id}`;
};

const deleteExpense = async (id) => {
  if (!confirm("Are you sure you want to delete this expense?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/expenses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete expense");
    location.reload();
    //fetchExpenses(); // Refresh list
  } catch (err) {
    alert(err.message);
  }
};

// Initial load
fetchExpenses();

// Toggle export dropdown
document.getElementById("exportBtn").addEventListener("click", () => {
  const menu = document.getElementById("exportMenu");
  menu.classList.toggle("hidden");
});

// PDF Export
function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20;

  const total = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const now = new Date();
  const monthTotal = allExpenses
    .filter((exp) => {
      const expDate = new Date(exp.date);
      return (
        expDate.getMonth() === now.getMonth() &&
        expDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  doc.setFont("times");
  doc.setFontSize(16);
  doc.text("Expense Report", 14, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`Total Expense: Rs. ${total.toFixed(2)}`, 14, y);
  y += 7;
  doc.text(`This Month's Expense: Rs. ${monthTotal.toFixed(2)}`, 14, y);
  y += 10;

  // ✅ Use autoTable plugin (global scope version)
  doc.autoTable({
    head: [["Title", "Amount", "Category", "Date"]],
    body: allExpenses.map((exp) => [
      exp.title,
      `Rs. ${exp.amount}`,
      exp.category || "Other",
      new Date(exp.date).toLocaleDateString(),
    ]),
    startY: y,
  });

  doc.save("Expenses_Report.pdf");
}

// Excel Export
function exportToExcel() {
  const total = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const now = new Date();
  const monthTotal = allExpenses
    .filter((exp) => {
      const expDate = new Date(exp.date);
      return (
        expDate.getMonth() === now.getMonth() &&
        expDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  const data = [
    ["Total Expense", `₹${total.toFixed(2)}`],
    ["This Month's Expense", `₹${monthTotal.toFixed(2)}`],
    [],
    ["Title", "Amount", "Category", "Date"],
    ...allExpenses.map((exp) => [
      exp.title,
      `₹${exp.amount}`,
      exp.category || "Other",
      new Date(exp.date).toLocaleDateString(),
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
  XLSX.writeFile(workbook, "Expenses_Report.xlsx");
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
});

let globalExpenses = [];
let pieChartInstance = null;

const renderCharts = (expenses) => {
  const categoryTotals = {};
  const monthlyTotals = {};

  // Destroy existing chart if it exists
  if (pieChartInstance) {
    pieChartInstance.destroy();
  }

  expenses.forEach((exp) => {
    // Category Totals for Pie
    const category = exp.category || "Other";
    categoryTotals[category] = (categoryTotals[category] || 0) + exp.amount;

    // Monthly Totals for Bar
    const date = new Date(exp.date);
    const monthKey = `${date.toLocaleString("default", {
      month: "short",
    })}-${date.getFullYear()}`;
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + exp.amount;
  });

  // Pie Chart
  const pieCtx = document.getElementById("pieChart").getContext("2d");
  new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [
        {
          data: Object.values(categoryTotals),
          backgroundColor: [
            "#3b82f6",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#ec4899",
            "#14b8a6",
            "#f43f5e",
            "#facc15",
          ],
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: "right",
          labels: {
            font: {
              size: 16, // Increase legend font size
            },
            boxWidth: 20,
            padding: 15,
          },
        },
      },
    },
  });

  // Bar Chart
  const barCtx = document.getElementById("barChart").getContext("2d");
  new Chart(barCtx, {
    type: "bar",
    data: {
      labels: Object.keys(monthlyTotals),
      datasets: [
        {
          label: "Total Expense ₹",
          data: Object.values(monthlyTotals),
          backgroundColor: "#3b82f6",
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          labels: {
            font: {
              size: 16, // Optional: Increase legend font size
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            font: {
              size: 16,
            },
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              size: 16,
            },
          },
        },
      },
    },
  });
};


// Show/hide the scroll button on scroll
window.addEventListener("scroll", () => {
  const scrollBtn = document.getElementById("scrollTopBtn");
  if (window.scrollY > 200) {
    scrollBtn.classList.remove("hidden");
  } else {
    scrollBtn.classList.add("hidden");
  }
});

// Scroll to top on click
document.getElementById("scrollTopBtn").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
