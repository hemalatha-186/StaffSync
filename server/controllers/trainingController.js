const Training = require('../models/Training');
const User = require('../models/User');



const createTraining = async (req, res) => {
    try {
        const { title, description, date, trainer, assignedUsers = [] } = req.body;

        if (!title || !description || !date || !trainer) {
            return res.status(400).json({
                message: 'Title, description, date and trainer are required'
            });
        }

        if (Number.isNaN(Date.parse(date))) {
            return res.status(400).json({ message: 'Invalid training date' });
        }

        if (!Array.isArray(assignedUsers)) {
            return res.status(400).json({
                message: 'assignedUsers must be an array'
            });
        }

        const usersExist = await User.countDocuments({
            _id: { $in: assignedUsers }
        });

        if (usersExist !== new Set(assignedUsers.map(String)).size) {
            return res.status(400).json({
                message: 'One or more assigned users do not exist'
            });
        }

        const training = await Training.create({
            title,
            description,
            date,
            trainer,
            assignedUsers,
            createdBy: req.user._id
        });

        return res.status(201).json({
            message: 'Training created successfully',
            training
        });
    } catch (error) {
        console.error('Create training error:', error.message);
        return res.status(500).json({ message: 'Failed to create training' });
    }
};


const getAvailableUsersForTraining = async (req, res) => {
    try {
        const users = await User.find({ role: 'Employee' })
            .select('name email')
            .sort({ name: 1 });

        return res.status(200).json(users);
    } catch (error) {
        console.error('Get training users error:', error.message);
        return res.status(500).json({
            message: 'Failed to fetch employee accounts'
        });
    }
};

const getTrainings = async (req, res) => {
    try {
        const filter = req.user.role === 'Employee'
            ? { assignedUsers: req.user._id }
            : {};

        const trainings = await Training.find(filter)
            .populate('assignedUsers', 'name email')
            .populate('createdBy', 'name email')
            .sort({ date: 1 });

        return res.status(200).json(trainings);
    } catch (error) {
        console.error('Get trainings error:', error.message);
        return res.status(500).json({ message: 'Failed to fetch trainings' });
    }
};

const updateTraining = async (req, res) => {
    try {
        const allowedFields = [
            'title',
            'description',
            'date',
            'trainer',
            'assignedUsers'
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: 'No valid fields provided for update'
            });
        }

        if (updates.date && Number.isNaN(Date.parse(updates.date))) {
            return res.status(400).json({ message: 'Invalid training date' });
        }

        if (updates.assignedUsers !== undefined) {
            if (!Array.isArray(updates.assignedUsers)) {
                return res.status(400).json({
                    message: 'assignedUsers must be an array'
                });
            }

            const usersExist = await User.countDocuments({
                _id: { $in: updates.assignedUsers }
            });

            if (usersExist !== new Set(updates.assignedUsers.map(String)).size) {
                return res.status(400).json({
                    message: 'One or more assigned users do not exist'
                });
            }
        }

        const training = await Training.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!training) {
            return res.status(404).json({ message: 'Training not found' });
        }

        return res.status(200).json({
            message: 'Training updated successfully',
            training
        });
    } catch (error) {
        console.error('Update training error:', error.message);
        return res.status(500).json({ message: 'Failed to update training' });
    }
};

const deleteTraining = async (req, res) => {
    try {
        const training = await Training.findByIdAndDelete(req.params.id);

        if (!training) {
            return res.status(404).json({ message: 'Training not found' });
        }

        return res.status(200).json({
            message: 'Training deleted successfully'
        });
    } catch (error) {
        console.error('Delete training error:', error.message);
        return res.status(500).json({ message: 'Failed to delete training' });
    }
};

module.exports = {
    createTraining,
    getTrainings,
    getAvailableUsersForTraining,
    updateTraining,
    deleteTraining
};