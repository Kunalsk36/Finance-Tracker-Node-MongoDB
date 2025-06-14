const Expense = require('../models/Expense');

// Create a new expense
exports.addExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    const newExpense = new Expense({
      title,
      amount,
      category,
      date,
      user: req.userId, // from middleware
    });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ error: 'Server error while adding expense' });
  }
};

// ✅ Get a single expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.userId });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching expense' });
  }
};

// Get all expenses for logged-in user
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching expenses' });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  try {
    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Expense not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error updating expense' });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deleted) return res.status(404).json({ error: 'Expense not found' });
    res.json({ msg: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting expense' });
  }
};
