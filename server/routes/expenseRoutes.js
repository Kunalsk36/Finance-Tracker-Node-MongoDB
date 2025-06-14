const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const expenseController = require('../controllers/expenseController');

router.post('/', authMiddleware, expenseController.addExpense);
router.get('/', authMiddleware, expenseController.getExpenses);
router.get('/:id', authMiddleware, expenseController.getExpenseById); // ✅ Add this route
router.put('/:id', authMiddleware, expenseController.updateExpense);
router.delete('/:id', authMiddleware, expenseController.deleteExpense);

module.exports = router;
