const Employee = require('../models/Employee');
const User = require('../models/User');

// Get all employees
const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find()
            .populate('user', 'name email role');

        res.status(200).json(employees);
    } catch (error) {
        console.error('Get employees error:', error.message);
        res.status(500).json({
            message: 'Failed to retrieve employees'
        });
    }
};


// Get user accounts that can be linked to employee records
const getAvailableUsers = async (req, res) => {
    try {
        const users = await User.find({
            role: 'Employee'
        }).select('name email department');

        const linkedEmployees = await Employee.find()
            .distinct('user');

        const availableUsers = users.filter(
            (user) => !linkedEmployees.some(
                (linkedUserId) => linkedUserId.equals(user._id)
            )
        );

        res.status(200).json(availableUsers);
    } catch (error) {
        console.error('Get available users error:', error.message);

        res.status(500).json({
            message: 'Failed to retrieve available user accounts'
        });
    }
};

// Get a single employee
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate('user', 'name email role');

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }

        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve employee'
        });
    }
};

// Create an employee
const createEmployee = async (req, res) => {
    try {
        const {
            user,
            employeeId,
            name,
            email,
            department,
            designation,
            phone,
            joiningDate,
            employmentStatus
        } = req.body;

        if (
            !user ||
            !employeeId ||
            !name ||
            !email ||
            !department ||
            !designation ||
            !joiningDate
        ) {
            return res.status(400).json({
                message: 'Please provide all required employee details'
            });
        }

        // Check whether the user account exists
        const existingUser = await User.findById(user);

        if (!existingUser) {
            return res.status(404).json({
                message: 'User account not found'
            });
        }

        // Only Employee accounts can be linked
        if (existingUser.role !== 'Employee') {
            return res.status(400).json({
                message: 'Only Employee accounts can be linked'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check duplicate employee ID or email
        const existingEmployee = await Employee.findOne({
            $or: [
                { employeeId: employeeId.trim() },
                { email: normalizedEmail },
                { user }
            ]
        });

        if (existingEmployee) {
            return res.status(409).json({
                message: 'Employee ID, email, or user account is already assigned'
            });
        }

        const employee = await Employee.create({
            user,
            employeeId: employeeId.trim(),
            name: name.trim(),
            email: normalizedEmail,
            department,
            designation,
            phone,
            joiningDate,
            employmentStatus
        });

        res.status(201).json({
            message: 'Employee created successfully',
            employee
        });
    } catch (error) {
        console.error('Create employee error:', error.message);
        res.status(500).json({
            message: 'Failed to create employee'
        });
    }
};
           
// Update an employee
const updateEmployee = async (req, res) => {
    try {
        const allowedFields = [
            'employeeId',
            'name',
            'email',
            'department',
            'designation',
            'phone',
            'joiningDate',
            'employmentStatus'
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (updates.email) {
            updates.email = updates.email.toLowerCase().trim();
        }

        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }

        res.status(200).json({
            message: 'Employee updated successfully',
            employee
        });
    } catch (error) {
        console.error('Update employee error:', error.message);
        res.status(500).json({
            message: 'Failed to update employee'
        });
    }
};

// Delete an employee
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }

        res.status(200).json({
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to delete employee'
        });
    }
};

module.exports = {
    getEmployees,
    getAvailableUsers,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
};