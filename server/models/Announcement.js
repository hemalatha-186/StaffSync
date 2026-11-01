const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        targetAudience: {
            type: String,
            enum: ['All', 'Employees', 'Managers'],
            default: 'All'
        }
    },
    { timestamps: true }
);

const Announcement = mongoose.model(
    'Announcement',
    announcementSchema
);

module.exports = Announcement;