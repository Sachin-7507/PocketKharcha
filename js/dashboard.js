// dashboard.js

window.onload = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "login.html"; // redirect if not logged in
    return;
  }

  const welcomeElem = document.getElementById("welcome");
  if (welcomeElem) {
    welcomeElem.innerText = `Welcome, ${currentUser.name} 😎`;
  }

  displayAllExpenses();
  calculateSummary();
};

const expenseForm = document.getElementById("expenseForm");
let editIndex = null;

// Helper to get current user's key
function getUserKey() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  return currentUser ? `expenses_${currentUser.email}` : "expenses_default";
}

// ------------------- EDIT EXPENSE -------------------
function editExpense(index) {
  const userKey = getUserKey();
  const expenses = JSON.parse(localStorage.getItem(userKey)) || [];
  const expense = expenses[index];
  if (!expense) return Swal.fire("Error: expense not found");

  document.getElementById("expenseDate").value = expense.date || "";
  document.getElementById("expenseName").value = expense.name || "";
  document.getElementById("expenseDescription").value =
    expense.description || "";
  document.getElementById("expenseCategory").value = expense.category || "";
  document.getElementById("expenseAmount").value = expense.amount || "";

  editIndex = index;

  const modalEl = document.getElementById("addExpenseModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

// ------------------- ADD/UPDATE EXPENSE -------------------
expenseForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const date = document.getElementById("expenseDate").value;
  const name = document.getElementById("expenseName").value.trim();
  const description = document
    .getElementById("expenseDescription")
    .value.trim();
  const category = document.getElementById("expenseCategory").value;
  const amount = document.getElementById("expenseAmount").value;

  if (!date || !name || !category || !amount) {
    Swal.fire("Fill all the details");
    return;
  }

  const userKey = getUserKey();
  let expenses = JSON.parse(localStorage.getItem(userKey)) || [];

  if (editIndex !== null) {
    expenses[editIndex] = { date, name, description, category, amount };
    Swal.fire("Expense Updated Successfully!");
    editIndex = null;
  } else {
    expenses.push({ date, name, description, category, amount });
    Swal.fire("Expense Added Successfully!");
  }

  localStorage.setItem(userKey, JSON.stringify(expenses));

  const addExpenseModal = bootstrap.Modal.getInstance(
    document.getElementById("addExpenseModal")
  );
  addExpenseModal.hide();
  expenseForm.reset();

  displayAllExpenses();
  calculateSummary();
});

// ------------------- DISPLAY ALL EXPENSES -------------------
function displayAllExpenses() {
  const userKey = getUserKey();
  const expenseList = JSON.parse(localStorage.getItem(userKey)) || [];
  const tableBody = document.querySelector("table tbody");
  tableBody.innerHTML = "";

  if (expenseList.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No expenses found</td></tr>`;
    return;
  }

  for (let i = expenseList.length - 1; i >= 0; i--) {
    const expense = expenseList[i];
    const tableRow = document.createElement("tr");
    tableRow.innerHTML = `
      <td>${expense.date}</td>
      <td>${expense.name}</td>
      <td>${expense.description}</td>
      <td>${expense.category}</td>
      <td>${expense.amount}</td>
      <td>
        <button class="btn btn-sm btn-primary me-1" onclick="editExpense(${i})">Update</button>
        <button class="btn btn-sm btn-danger" onclick="deleteExpense(${i})">Delete</button>
      </td>
    `;
    tableBody.appendChild(tableRow);
  }
}

// ------------------- DELETE EXPENSE -------------------
function deleteExpense(index) {
  const userKey = getUserKey();
  Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to delete this expense?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      let expenses = JSON.parse(localStorage.getItem(userKey)) || [];
      expenses.splice(index, 1);
      localStorage.setItem(userKey, JSON.stringify(expenses));
      Swal.fire("Deleted!", "Your expense has been deleted.", "success");
      displayAllExpenses();
      calculateSummary();
    }
  });
}

// ------------------- FILTER LOGIC -------------------
document.getElementById("filterSearchBtn").addEventListener("click", () => {
  const fromDate = document.getElementById("filterFromDate").value;
  const toDate = document.getElementById("filterToDate").value;
  const category = document.getElementById("filterCategory").value;

  const userKey = getUserKey();
  let expenses = JSON.parse(localStorage.getItem(userKey)) || [];

  const filtered = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    const isAfterFrom =
      !fromDate || expDate >= new Date(fromDate + "T00:00:00");
    const isBeforeTo = !toDate || expDate <= new Date(toDate + "T23:59:59");
    const isCategoryMatch =
      !category || exp.category.toLowerCase() === category.toLowerCase();

    return isAfterFrom && isBeforeTo && isCategoryMatch;
  });

  displayFilteredExpenses(filtered);
});

function displayFilteredExpenses(filteredExpenses) {
  const tableBody = document.querySelector("table tbody");
  tableBody.innerHTML = "";

  if (filteredExpenses.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No matching expenses found</td></tr>`;
    return;
  }

  for (let i = filteredExpenses.length - 1; i >= 0; i--) {
    const expense = filteredExpenses[i];
    const tableRow = document.createElement("tr");
    tableRow.innerHTML = `
      <td>${expense.date}</td>
      <td>${expense.name}</td>
      <td>${expense.description}</td>
      <td>${expense.category}</td>
      <td>${expense.amount}</td>
      <td>
        <button class="btn btn-sm btn-primary me-1" onclick="editExpense(${i})">Update</button>
        <button class="btn btn-sm btn-danger" onclick="deleteExpense(${i})">Delete</button>
      </td>
    `;
    tableBody.appendChild(tableRow);
  }
}

// ------------------- CLEAR FILTERS -------------------
document.getElementById("filterClearBtn").addEventListener("click", () => {
  document.getElementById("filterFromDate").value = "";
  document.getElementById("filterToDate").value = "";
  document.getElementById("filterCategory").value = "";
  displayAllExpenses();
});

// ------------------- SEARCH -------------------
const searchInput = document.getElementById("searchExpenseInput");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const searchText = e.target.value.toLowerCase();
    const userKey = getUserKey();
    const expenses = JSON.parse(localStorage.getItem(userKey)) || [];

    const filtered = expenses.filter(
      (exp) =>
        exp.name.toLowerCase().includes(searchText) ||
        exp.description.toLowerCase().includes(searchText) ||
        exp.category.toLowerCase().includes(searchText)
    );

    displayFilteredExpenses(filtered);
  });
}

// ------------------- SUMMARY -------------------
function calculateSummary() {
  const userKey = getUserKey();
  const expenses = JSON.parse(localStorage.getItem(userKey)) || [];

  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthTotal = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date);
      return (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, exp) => sum + Number(exp.amount), 0);

  const totalCount = expenses.length;

  let highestExpense = expenses.length
    ? expenses.reduce((max, exp) =>
        Number(exp.amount) > Number(max.amount) ? exp : max
      )
    : null;

  const cards = document.querySelectorAll(".summary .card h4");
  if (cards.length >= 4) {
    cards[0].innerText = `₹${totalSpent}`;
    cards[1].innerText = `₹${thisMonthTotal}`;
    cards[2].innerText = totalCount;
    cards[3].innerText = highestExpense
      ? `₹${highestExpense.amount} (${highestExpense.category})`
      : "₹0";
  }

  const totalElem = document.querySelector(".container strong");
  if (totalElem) {
    totalElem.innerText = `💰 Total Expenses: ₹${totalSpent}`;
  }
}

// ------------------- CLEAR ALL -------------------
document.getElementById("clearAllBtn").addEventListener("click", function () {
  const userKey = getUserKey();
  Swal.fire({
    title: "Are you sure?",
    text: "This will permanently delete all your expenses.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, clear all!",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem(userKey);
      document.querySelector("tbody").innerHTML = "";
      Swal.fire("Cleared!", "All your expenses have been deleted.", "success");
      calculateSummary();
    }
  });
});

// ------------------- LOGOUT FUNCTIONALITY -------------------
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      Swal.fire({
        title: "Logout?",
        text: "Are you sure you want to log out?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Logout",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          // ✅ Remove current user only (not their expenses)
          localStorage.removeItem("currentUser");
          Swal.fire("Logged out!", "You have been logged out.", "success").then(
            () => {
              window.location.href = "login.html";
            }
          );
        }
      });
    });
  }
});
