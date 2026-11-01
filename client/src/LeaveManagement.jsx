import { useEffect, useState } from 'react';
import api from './api';

function LeaveManagement({ user }) {
    const [leaves, setLeaves] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    const isEmployee = user?.role === 'Employee';
    const isHRorManager = ['HR', 'Manager'].includes(user?.role);

    const authConfig = {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('staffsyncToken')}`
        }
    };

    const loadLeaves = async () => {
        setLoading(true);

        try {
            const response = await api.get('/leaves', authConfig);
            setLeaves(Array.isArray(response.data) ? response.data : []);
            setError('');
        } catch (err) {
            setError(
                err.response?.data?.message || 'Could not load leave requests.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaves();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');

        if (endDate < startDate) {
            setError('End date cannot be before the start date.');
            return;
        }

        setSubmitting(true);

        try {
            const response = await api.post(
                '/leaves',
                { startDate, endDate, reason: reason.trim() },
                authConfig
            );

            setMessage(response.data.message || 'Leave request submitted.');
            setStartDate('');
            setEndDate('');
            setReason('');

            await loadLeaves();
        } catch (err) {
            setError(
                err.response?.data?.message || 'Could not submit leave request.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (leaveId) => {
        setMessage('');
        setError('');

        try {
            const response = await api.delete(
                `/leaves/${leaveId}`,
                authConfig
            );

            setMessage(response.data.message || 'Leave request cancelled.');
            await loadLeaves();
        } catch (err) {
            setError(
                err.response?.data?.message || 'Could not cancel leave request.'
            );
        }
    };

    const handleStatusUpdate = async (leaveId, status) => {
        setMessage('');
        setError('');
        setUpdatingId(leaveId);

        try {
            const response = await api.patch(
                `/leaves/${leaveId}/status`,
                { status },
                authConfig
            );

            setMessage(
                response.data.message || `Leave request ${status.toLowerCase()}.`
            );

            await loadLeaves();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Could not update leave request.'
            );
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <section className="leave-page">
            <div className="leave-heading">
                <div>
                    <h2>Leave Management</h2>
                    <p>
                        {isEmployee
                            ? 'Apply for leave and track your request status.'
                            : 'Review and manage employee leave requests.'}
                    </p>
                </div>
            </div>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            {isEmployee && (
                <form className="leave-form" onSubmit={handleSubmit}>
                    <h3>Apply for Leave</h3>

                    <div className="leave-form-grid">
                        <label>
                            Start Date
                            <input
                                type="date"
                                value={startDate}
                                onChange={(event) =>
                                    setStartDate(event.target.value)
                                }
                                required
                            />
                        </label>

                        <label>
                            End Date
                            <input
                                type="date"
                                value={endDate}
                                min={startDate || undefined}
                                onChange={(event) =>
                                    setEndDate(event.target.value)
                                }
                                required
                            />
                        </label>
                    </div>

                    <label className="leave-reason-label">
                        Reason for Leave
                        <textarea
                            value={reason}
                            onChange={(event) =>
                                setReason(event.target.value)
                            }
                            placeholder="Enter your reason for leave"
                            rows={3}
                            maxLength={500}
                            required
                        />
                    </label>

                    <button type="submit" disabled={submitting}>
                        {submitting
                            ? 'Submitting...'
                            : 'Submit Leave Request'}
                    </button>
                </form>
            )}

            <div className="leave-records-card">
                <h3>
                    {isEmployee
                        ? 'My Leave Requests'
                        : 'Employee Leave Requests'}
                </h3>

                {loading ? (
                    <p>Loading leave requests...</p>
                ) : leaves.length === 0 ? (
                    <p>
                        {isEmployee
                            ? "You haven't submitted any leave requests yet."
                            : 'No leave requests found.'}
                    </p>
                ) : (
                    <div className="leave-table-wrap">
                        <table className="leave-table">
                            <thead>
                                <tr>
                                    {isHRorManager && <th>Employee</th>}
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {leaves.map((leave) => (
                                    <tr key={leave._id}>
                                        {isHRorManager && (
                                            <td>
                                                <div className="leave-employee-info">
                                                    <strong>
                                                        {leave.user?.name || 'Unknown'}
                                                    </strong>
                                                    <small>
                                                        {leave.user?.email || ''}
                                                    </small>
                                                </div>
                                            </td>
                                        )}

                                        <td>
                                            {new Date(
                                                leave.startDate
                                            ).toLocaleDateString('en-IN')}
                                        </td>

                                        <td>
                                            {new Date(
                                                leave.endDate
                                            ).toLocaleDateString('en-IN')}
                                        </td>

                                        <td>{leave.reason}</td>

                                        <td>
                                            <span
                                                className={`leave-status ${leave.status.toLowerCase()}`}
                                            >
                                                {leave.status}
                                            </span>
                                        </td>

                                        <td>
                                            {isEmployee &&
                                            leave.status === 'Pending' ? (
                                                <button
                                                    type="button"
                                                    className="leave-cancel-button"
                                                    onClick={() =>
                                                        handleCancel(leave._id)
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            ) : isHRorManager &&
                                              leave.status === 'Pending' ? (
                                                <div className="leave-actions">
                                                    <button
                                                        type="button"
                                                        className="leave-approve-button"
                                                        disabled={updatingId !== null}
                                                        onClick={() =>
                                                            handleStatusUpdate(
                                                                leave._id,
                                                                'Approved'
                                                            )
                                                        }
                                                    >
                                                        {updatingId === leave._id
                                                            ? 'Updating...'
                                                            : 'Approve'}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="leave-reject-button"
                                                        disabled={updatingId !== null}
                                                        onClick={() =>
                                                            handleStatusUpdate(
                                                                leave._id,
                                                                'Rejected'
                                                            )
                                                        }
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}

export default LeaveManagement;