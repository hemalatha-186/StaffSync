const Announcement = require('../models/Announcement');

// Create an announcement
const createAnnouncement = async (req, res) => {
    try {
        const { title, message, targetAudience } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                message: 'Title and message are required'
            });
        }

        const allowedAudiences = ['All', 'Employees', 'Managers'];

        if (
            targetAudience &&
            !allowedAudiences.includes(targetAudience)
        ) {
            return res.status(400).json({
                message: 'Invalid target audience'
            });
        }

        const announcement = await Announcement.create({
            title,
            message,
            targetAudience: targetAudience || 'All',
            createdBy: req.user._id
        });

        res.status(201).json({
            message: 'Announcement created successfully',
            announcement
        });
    } catch (error) {
        console.error('Create announcement error:', error.message);
        res.status(500).json({
            message: 'Failed to create announcement'
        });
    }
};

// Get announcements visible to the logged-in user
const getAnnouncements = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === 'Employee') {
            filter.targetAudience = {
                $in: ['All', 'Employees']
            };
        } else if (req.user.role === 'Manager') {
            filter.targetAudience = {
                $in: ['All', 'Managers']
            };
        }

        const announcements = await Announcement.find(filter)
            .populate('createdBy', 'name email role')
            .sort({ createdAt: -1 });

        res.status(200).json(announcements);
    } catch (error) {
        console.error('Get announcements error:', error.message);
        res.status(500).json({
            message: 'Failed to retrieve announcements'
        });
    }
};

// Update an announcement
const updateAnnouncement = async (req, res) => {
    try {
        const allowedFields = ['title', 'message', 'targetAudience'];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (
            updates.targetAudience !== undefined &&
            !['All', 'Employees', 'Managers'].includes(
                updates.targetAudience
            )
        ) {
            return res.status(400).json({
                message: 'Invalid target audience'
            });
        }

        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!announcement) {
            return res.status(404).json({
                message: 'Announcement not found'
            });
        }

        res.status(200).json({
            message: 'Announcement updated successfully',
            announcement
        });
    } catch (error) {
        console.error('Update announcement error:', error.message);
        res.status(500).json({
            message: 'Failed to update announcement'
        });
    }
};

// Delete an announcement
const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(
            req.params.id
        );

        if (!announcement) {
            return res.status(404).json({
                message: 'Announcement not found'
            });
        }

        res.status(200).json({
            message: 'Announcement deleted successfully'
        });
    } catch (error) {
        console.error('Delete announcement error:', error.message);
        res.status(500).json({
            message: 'Failed to delete announcement'
        });
    }
};

module.exports = {
    createAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    deleteAnnouncement
};