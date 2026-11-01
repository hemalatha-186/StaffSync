const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        date: {
            type: Date,
            required: true,
            default: Date.now
        },
        checkIn: {
            type: Date,
            default: null
        },
        checkOut: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Late', 'Half-day'],
            default: 'Present'
        }
    },
    { timestamps: true }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;