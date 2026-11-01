const Attendance = require('../models/Attendance');

const markAttendance = async (req, res) => {
    try {
        const date = new Date();
        date.setHours(0, 0, 0, 0);

        const tomorrow = new Date(date);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingAttendance = await Attendance.findOne({
            user: req.user._id,
            date: {
                $gte: date,
                $lt: tomorrow
            }
        });

        if (existingAttendance) {
            return res.status(409).json({
                message: 'You have already checked in today'
            });
        }

        const attendance = await Attendance.create({
            user: req.user._id,
            date,
            checkIn: new Date(),
            checkOut: null,
            status: 'Present'
        });

        return res.status(201).json({
            message: 'Check-in successful',
            attendance
        });
    } catch (error) {
        console.error('Mark attendance error:', error.message);

        return res.status(500).json({
            message: 'Failed to check in'
        });
    }
};

// Get attendance records
const getAttendance = async (req, res) => {
    try {
        const filter = {};

        // Employees can see only their own records
        if (req.user.role === 'Employee') {
            filter.user = req.user._id;
        }

        const records = await Attendance.find(filter)
            .populate('user', 'name email department')
            .sort({ date: -1 });

        res.status(200).json(records);
    } catch (error) {
        console.error('Get attendance error:', error.message);
        res.status(500).json({
            message: 'Failed to retrieve attendance'
        });
    }
};

// Get attendance for a specific user
const getAttendanceByUser = async (req, res) => {
    try {
        const records = await Attendance.find({
            user: req.params.userId
        }).populate('user', 'name email department')
          .sort({ date: -1 });

        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve user attendance'
        });
    }
};

// Update attendance record
const updateAttendance = async (req, res) => {
    try {
        const allowedFields = ['checkIn', 'checkOut', 'status'];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!attendance) {
            return res.status(404).json({
                message: 'Attendance record not found'
            });
        }

        res.status(200).json({
            message: 'Attendance updated successfully',
            attendance
        });
    } catch (error) {
        console.error('Update attendance error:', error.message);
        res.status(500).json({
            message: 'Failed to update attendance'
        });
    }
};

const checkOutAttendance = async (req, res) => {
    try {
        const date = new Date();
        date.setHours(0, 0, 0, 0);

        const tomorrow = new Date(date);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const attendance = await Attendance.findOne({
            user: req.user._id,
            date: { $gte: date, $lt: tomorrow }
        });

        if (!attendance) {
            return res.status(404).json({
                message: 'Please check in before checking out'
            });
        }

        if (attendance.checkOut) {
            return res.status(409).json({
                message: 'You have already checked out today'
            });
        }

        attendance.checkOut = new Date();
        await attendance.save();

        return res.status(200).json({
            message: 'Check-out successful',
            attendance
        });
    } catch (error) {
        console.error('Check-out error:', error.message);

        return res.status(500).json({
            message: 'Failed to check out'
        });
    }
};

module.exports = {
    markAttendance,
    checkOutAttendance,
    getAttendance,
    getAttendanceByUser,
    updateAttendance
};