const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        employeeId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        department: {
            type: String,
            required: true,
            trim: true
        },
        designation: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            default: ''
        },
        joiningDate: {
            type: Date,
            required: true
        },
        employmentStatus: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active'
        }
    },
    { timestamps: true }
);

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;