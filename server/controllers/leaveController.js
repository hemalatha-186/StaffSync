const Leave = require('../models/Leave');

// Apply for leave
const applyLeave = async (req, res) => {
    try {
        const { startDate, endDate, reason } = req.body;

        if (!startDate || !endDate || !reason) {
            return res.status(400).json({
                message: 'Start date, end date and reason are required'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime()) ||
            end < start
        ) {
            return res.status(400).json({
                message: 'Please provide valid leave dates'
            });
        }

        const leave = await Leave.create({
            user: req.user._id,
            startDate: start,
            endDate: end,
            reason,
            status: 'Pending'
        });

        res.status(201).json({
            message: 'Leave request submitted successfully',
            leave
        });
    } catch (error) {
        console.error('Apply leave error:', error.message);
        res.status(500).json({
            message: 'Failed to submit leave request'
        });
    }
};

// Get leave requests
const getLeaves = async (req, res) => {
    try {
        const filter = {};

        // Employees can view only their own requests
        if (req.user.role === 'Employee') {
            filter.user = req.user._id;
        }

        const leaves = await Leave.find(filter)
            .populate('user', 'name email department')
            .sort({ createdAt: -1 });

        res.status(200).json(leaves);
    } catch (error) {
        console.error('Get leaves error:', error.message);
        res.status(500).json({
            message: 'Failed to retrieve leave requests'
        });
    }
};

// Approve or reject a leave request
const updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({
                message: 'Status must be Approved or Rejected'
            });
        }

        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                message: 'Leave request not found'
            });
        }

        leave.status = status;
        leave.approverRole = req.user.role;

        await leave.save();

        res.status(200).json({
            message: `Leave request ${status.toLowerCase()}`,
            leave
        });
    } catch (error) {
        console.error('Update leave status error:', error.message);
        res.status(500).json({
            message: 'Failed to update leave request'
        });
    }
};

// Cancel a pending leave request
const cancelLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                message: 'Leave request not found'
            });
        }

        if (leave.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You can only cancel your own leave request'
            });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({
                message: 'Only pending leave requests can be cancelled'
            });
        }

        await leave.deleteOne();

        res.status(200).json({
            message: 'Leave request cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel leave error:', error.message);
        res.status(500).json({
            message: 'Failed to cancel leave request'
        });
    }
};

module.exports = {
    applyLeave,
    getLeaves,
    updateLeaveStatus,
    cancelLeave
};