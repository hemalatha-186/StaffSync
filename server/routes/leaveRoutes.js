const express = require('express');
const router = express.Router();

const {
    applyLeave,
    getLeaves,
    updateLeaveStatus,
    cancelLeave
} = require('../controllers/leaveController');

const {
    protect,
    authorizeRoles
} = require('../middleware/authMiddleware');

// Apply for leave: any logged-in user
router.post('/', protect, applyLeave);

// View leave requests
router.get(
    '/',
    protect,
    getLeaves
);

// Approve or reject leave: HR or Manager only
router.patch(
    '/:id/status',
    protect,
    authorizeRoles('HR', 'Manager'),
    updateLeaveStatus
);

// Cancel your own pending leave request
router.delete(
    '/:id',
    protect,
    cancelLeave
);

module.exports = router;