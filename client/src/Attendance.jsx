import { useEffect, useState } from 'react';
import api from './api';

function Attendance() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const loadAttendance = async () => {
        setLoading(true);
        try {
            const response = await api.get('/attendance', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('staffsyncToken')}`
                }
            });
            setRecords(Array.isArray(response.data) ? response.data : []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Could not load attendance.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAttendance();
    }, []);

    const handleCheckIn = async () => {
        setMessage('');
        setError('');
        try {
            const response = await api.post('/attendance', {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('staffsyncToken')}`
                }
            });
            setMessage(response.data.message || 'Check-in successful!');
            await loadAttendance();
        } catch (err) {
            setError(err.response?.data?.message || 'Check-in failed.');
        }
    };

    const handleCheckOut = async () => {
        setMessage('');
        setError('');
        try {
            const response = await api.patch('/attendance/checkout', {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('staffsyncToken')}`
                }
            });
            setMessage(response.data.message || 'Check-out successful!');
            await loadAttendance();
        } catch (err) {
            setError(err.response?.data?.message || 'Check-out failed.');
        }
    };

    return (
        <section className="attendance-page">
            <div className="attendance-heading">
                <div>
                    <h2>Attendance</h2>
                    <p>Record your daily check-in and check-out.</p>
                </div>
                <span className="attendance-date">
                    {new Date().toLocaleDateString()}
                </span>
            </div>

            <div className="attendance-actions">
                <button onClick={handleCheckIn}>Check In</button>
                <button className="checkout-button" onClick={handleCheckOut}>
                    Check Out
                </button>
            </div>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <div className="attendance-table-card">
                <h3>My Attendance Records</h3>
                {loading ? (
                    <p>Loading attendance...</p>
                ) : records.length === 0 ? (
                    <p>No attendance records yet. Check in to record today.</p>
                ) : (
                    <div className="attendance-table-wrap">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record) => (
                                    <tr key={record._id}>
                                        <td>{new Date(record.date).toLocaleDateString()}</td>
                                        <td>
                                            {record.checkIn
                                                ? new Date(record.checkIn).toLocaleTimeString()
                                                : '—'}
                                        </td>
                                        <td>
                                            {record.checkOut
                                                ? new Date(record.checkOut).toLocaleTimeString()
                                                : 'Not checked out'}
                                        </td>
                                        <td>{record.status}</td>
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

export default Attendance;