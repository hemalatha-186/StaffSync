const express = require('express');
const router = express.Router();

const {
    getEmployees,
    getAvailableUsers,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');

const {
    protect,
    authorizeRoles
} = require('../middleware/authMiddleware');

// HR and Managers can view employees
router.get(
    '/',
    protect,
    authorizeRoles('HR', 'Manager'),
    getEmployees
);


// HR can view available Employee accounts
router.get(
    '/available-users',
    protect,
    authorizeRoles('HR', 'Manager'),
    getAvailableUsers
);

router.get(
    '/:id',
    protect,
    authorizeRoles('HR', 'Manager'),
    getEmployeeById
);

// Only HR can create, update, or delete employee records
router.post(
    '/',
    protect,
    authorizeRoles('HR'),
    createEmployee
);

router.put(
    '/:id',
    protect,
    authorizeRoles('HR'),
    updateEmployee
);

router.delete(
    '/:id',
    protect,
    authorizeRoles('HR'),
    deleteEmployee
);

module.exports = router;