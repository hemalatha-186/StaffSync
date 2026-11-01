const express = require('express');
const router = express.Router();

const {
    createAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    deleteAnnouncement
} = require('../controllers/announcementController');

const {
    protect,
    authorizeRoles
} = require('../middleware/authMiddleware');

// HR can create announcements
router.post(
    '/',
    protect,
    authorizeRoles('HR', 'Manager'),
    createAnnouncement
);

// Logged-in users can view announcements intended for them
router.get(
    '/',
    protect,
    getAnnouncements
);

// HR can update announcements
router.put(
    '/:id',
    protect,
    authorizeRoles('HR', 'Manager'),
    updateAnnouncement
);

// HR can delete announcements
router.delete(
    '/:id',
    protect,
    authorizeRoles('HR', 'Manager'),
    deleteAnnouncement
);

module.exports = router;