const express = require('express');
const router = express.Router();

const {
    markAttendance,
    checkOutAttendance,
    getAttendance,
    getAttendanceByUser,
    updateAttendance
} = require('../controllers/attendanceController');

const {
    protect,
    authorizeRoles
} = require('../middleware/authMiddleware');

// Mark attendance for the logged-in user
router.post(
    '/',
    protect,
    authorizeRoles('HR', 'Manager', 'Employee'),
    markAttendance
);

router.patch('/checkout', protect,
     authorizeRoles('HR', 'Manager', 'Employee'),
     checkOutAttendance);

// View attendance records
router.get(
    '/',
    protect,
    getAttendance
);

// View attendance for a specific user: HR or Manager
router.get(
    '/user/:userId',
    protect,
    authorizeRoles('HR'),
    getAttendanceByUser
);

// Update attendance: HR only
router.patch(
    '/:id',
    protect,
    authorizeRoles('HR'),
    updateAttendance
);

module.exports = router;