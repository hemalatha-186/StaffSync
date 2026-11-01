import { useEffect, useState } from 'react';
import api from './api';

const initialFormData = {
    user: '',
    employeeId: '',
    name: '',
    email: '',
    department: '',
    designation: '',
    phone: '',
    joiningDate: '',
    employmentStatus: 'Active'
};

function EmployeeManagement({ user }) {
    const [employees, setEmployees] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState(initialFormData);

    const token = localStorage.getItem('staffsyncToken');

    const headers = {
        Authorization: `Bearer ${token}`
    };

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get('/employees', { headers });
            setEmployees(response.data);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                'Failed to load employees.'
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableUsers = async () => {
        try {
            const response = await api.get('/employees/available-users', {
                headers
            });

            setAvailableUsers(response.data);
        } catch (error) {
            setFormError(
                error.response?.data?.message ||
                'Failed to load available employee accounts.'
            );
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    const handleUserSelection = (event) => {
        const selectedUser = availableUsers.find(
            (account) => account._id === event.target.value
        );

        setFormData((previousData) => ({
            ...previousData,
            user: selectedUser?._id || '',
            name: selectedUser?.name || '',
            email: selectedUser?.email || '',
            department: selectedUser?.department || ''
        }));
    };

    const openAddForm = async () => {
        setEditingId(null);
        setFormData(initialFormData);
        setFormError('');
        setSuccess('');
        setShowForm(true);

        await fetchAvailableUsers();
    };

    const openEditForm = (employee) => {
        setEditingId(employee._id);
        setFormError('');
        setSuccess('');

        setFormData({
            user: employee.user?._id || '',
            employeeId: employee.employeeId || '',
            name: employee.name || '',
            email: employee.email || '',
            department: employee.department || '',
            designation: employee.designation || '',
            phone: employee.phone || '',
            joiningDate: employee.joiningDate
                ? new Date(employee.joiningDate).toISOString().split('T')[0]
                : '',
            employmentStatus: employee.employmentStatus || 'Active'
        });

        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData(initialFormData);
        setFormError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setFormError('');
            setSuccess('');

            if (editingId) {
                await api.put(
                    `/employees/${editingId}`,
                    formData,
                    { headers }
                );

                setSuccess('Employee updated successfully!');
            } else {
                await api.post('/employees', formData, { headers });

                setSuccess('Employee added successfully!');
            }

            await fetchEmployees();

            if (!editingId) {
                await fetchAvailableUsers();
                setFormData(initialFormData);
            } else {
                setShowForm(false);
                setEditingId(null);
            }
        } catch (error) {
            setFormError(
                error.response?.data?.message ||
                'Failed to save employee details.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (employeeId) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this employee record?'
        );

        if (!confirmed) return;

        try {
            setError('');
            setSuccess('');

            await api.delete(`/employees/${employeeId}`, { headers });

            setSuccess('Employee deleted successfully!');

            await fetchEmployees();
            await fetchAvailableUsers();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                'Failed to delete employee.'
            );
        }
    };

    return (
        <div className="employee-management">
            <h2>Employee Management</h2>
            <p>View and manage employee records.</p>

            {user?.role === 'HR' && (
                <button type="button" onClick={openAddForm}>
                    Add Employee
                </button>
            )}

            {success && (
                <p className="success-message">{success}</p>
            )}

            {showForm && (
                <div className="employee-form-container">
                    <h3>
                        {editingId ? 'Edit Employee' : 'Add New Employee'}
                    </h3>

                    {formError && (
                        <p className="error-message">{formError}</p>
                    )}

                    <form onSubmit={handleSubmit}>
                        {!editingId && (
                            <>
                                <label>Select Employee Account</label>
                                <select
                                    value={formData.user}
                                    onChange={handleUserSelection}
                                    required
                                >
                                    <option value="">
                                        Choose an account
                                    </option>

                                    {availableUsers.map((account) => (
                                        <option
                                            key={account._id}
                                            value={account._id}
                                        >
                                            {account.name} ({account.email})
                                        </option>
                                    ))}
                                </select>

                                {availableUsers.length === 0 && (
                                    <p>
                                        No unlinked Employee accounts are
                                        available.
                                    </p>
                                )}
                            </>
                        )}

                        <label>Employee ID</label>
                        <input
                            type="text"
                            name="employeeId"
                            value={formData.employeeId}
                            onChange={handleInputChange}
                            required
                        />

                        <label>Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            readOnly
                        />

                        <label>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            readOnly
                        />

                        <label>Department</label>
                        <input
                            type="text"
                            value={formData.department}
                            readOnly
                        />

                        <label>Designation</label>
                        <input
                            type="text"
                            name="designation"
                            value={formData.designation}
                            onChange={handleInputChange}
                            required
                        />

                        <label>Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />

                        <label>Joining Date</label>
                        <input
                            type="date"
                            name="joiningDate"
                            value={formData.joiningDate}
                            onChange={handleInputChange}
                            required
                        />

                        <label>Employment Status</label>
                        <select
                            name="employmentStatus"
                            value={formData.employmentStatus}
                            onChange={handleInputChange}
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>

                        <button
                            type="submit"
                            disabled={saving || (
                                !editingId && availableUsers.length === 0
                            )}
                        >
                            {saving
                                ? 'Saving...'
                                : editingId
                                    ? 'Update Employee'
                                    : 'Save Employee'}
                        </button>

                        <button
                            type="button"
                            onClick={closeForm}
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            )}

            {loading && <p>Loading employees...</p>}

            {error && <p className="error-message">{error}</p>}

            {!loading && !error && employees.length === 0 && (
                <p>No employee records found.</p>
            )}

            {!loading && employees.length > 0 && (
                <div className="employee-table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Designation</th>
                                <th>Status</th>
                                {user?.role === 'HR' && <th>Actions</th>}
                            </tr>
                        </thead>

                        <tbody>
                            {employees.map((employee) => (
                                <tr key={employee._id}>
                                    <td>{employee.employeeId}</td>
                                    <td>{employee.name}</td>
                                    <td>{employee.email}</td>
                                    <td>{employee.department}</td>
                                    <td>{employee.designation}</td>
                                    <td>{employee.employmentStatus}</td>

                                    {user?.role === 'HR' && (
                                        <td className="employee-actions">
                                            <button
                                                type="button"
                                                className="edit-employee-button"
                                                onClick={() =>
                                                    openEditForm(employee)
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="delete-employee-button"
                                                onClick={() =>
                                                    handleDelete(employee._id)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default EmployeeManagement;