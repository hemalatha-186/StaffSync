const express = require('express');
const router = express.Router();

const {
    createTraining,
    getTrainings,
    getAvailableUsersForTraining,
    updateTraining,
    deleteTraining
} = require('../controllers/trainingController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// View training programs
router.get('/', protect, getTrainings);

// Create a training program
router.post('/', protect, authorizeRoles('HR', 'Manager'), createTraining);

// Update a training program
router.put('/:id', protect, authorizeRoles('HR', 'Manager'), updateTraining);

// Delete a training program
router.delete('/:id', protect, authorizeRoles('HR', 'Manager'), deleteTraining);

router.get(
    '/available-users',
    protect,
    authorizeRoles('HR', 'Manager'),
    getAvailableUsersForTraining
);

module.exports = router;