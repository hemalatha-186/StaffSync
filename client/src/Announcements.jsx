import { useEffect, useState } from 'react';
import api from './api';

function Announcements({ user }) {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        title: '',
        message: '',
        targetAudience: 'All'
    });

    const canManage = ['HR', 'Manager'].includes(user?.role);

    const getConfig = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('staffsyncToken')}`
        }
    });

    const loadAnnouncements = async () => {
        setLoading(true);
        try {
            const response = await api.get('/announcements', getConfig());
            setAnnouncements(
                Array.isArray(response.data) ? response.data : []
            );
            setError('');
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Could not load announcements.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const resetForm = () => {
        setForm({
            title: '',
            message: '',
            targetAudience: 'All'
        });
        setEditingId(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');

        try {
            if (editingId) {
                await api.put(
                    `/announcements/${editingId}`,
                    form,
                    getConfig()
                );
                setMessage('Announcement updated successfully!');
            } else {
                await api.post(
                    '/announcements',
                    form,
                    getConfig()
                );
                setMessage('Announcement published successfully!');
            }

            resetForm();
            await loadAnnouncements();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Could not save the announcement.'
            );
        }
    };

    const handleEdit = (announcement) => {
        setEditingId(announcement._id);
        setForm({
            title: announcement.title,
            message: announcement.message,
            targetAudience: announcement.targetAudience || 'All'
        });
        setError('');
        setMessage('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) {
            return;
        }

        setMessage('');
        setError('');

        try {
            const response = await api.delete(
                `/announcements/${id}`,
                getConfig()
            );
            setMessage(
                response.data.message || 'Announcement deleted successfully!'
            );
            if (editingId === id) resetForm();
            await loadAnnouncements();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Could not delete the announcement.'
            );
        }
    };

    return (
        <section className="announcements-page">
            <div className="announcements-heading">
                <div>
                    <h2>Announcements</h2>
                    <p>Stay updated with the latest workplace news.</p>
                </div>
            </div>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            {canManage && (
                <form className="announcement-form" onSubmit={handleSubmit}>
                    <h3>
                        {editingId ? 'Edit Announcement' : 'Create Announcement'}
                    </h3>

                    <label htmlFor="announcement-title">Title</label>
                    <input
                        id="announcement-title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Enter announcement title"
                        required
                    />

                    <label htmlFor="announcement-message">Message</label>
                    <textarea
                        id="announcement-message"
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Write your announcement..."
                        rows="4"
                        required
                    />

                    <label htmlFor="announcement-audience">
                        Target Audience
                    </label>
                    <select
                        id="announcement-audience"
                        name="targetAudience"
                        value={form.targetAudience}
                        onChange={handleChange}
                    >
                        <option value="All">Everyone</option>
                        <option value="Employees">Employees</option>
                        <option value="Managers">Managers</option>
                    </select>

                    <div className="announcement-form-actions">
                        <button type="submit">
                            {editingId ? 'Update Announcement' : 'Publish Announcement'}
                        </button>

                        {editingId && (
                            <button type="button" className="cancel-edit-button"
                                onClick={resetForm}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            )}

            <div className="announcement-list">
                <h3>Latest Announcements</h3>

                {loading ? (
                    <p>Loading announcements...</p>
                ) : announcements.length === 0 ? (
                    <div className="announcement-empty">
                        <h4>No announcements yet</h4>
                        <p>New workplace updates will appear here.</p>
                    </div>
                ) : (
                    announcements.map((announcement) => (
                        <article
                            className="announcement-card"
                            key={announcement._id}
                        >
                            <div className="announcement-card-heading">
                                <h4>{announcement.title}</h4>
                                <span>{announcement.targetAudience}</span>
                            </div>

                            <p>{announcement.message}</p>

                            <div className="announcement-meta">
                                <span>
                                    Posted by: {announcement.createdBy?.name || 'StaffSync HR'}
                                </span>
                                <span>
                                    {announcement.createdAt
                                        ? new Date(announcement.createdAt).toLocaleDateString()
                                        : ''}
                                </span>
                            </div>

                            {canManage && (
                                <div className="announcement-actions">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(announcement)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="delete-announcement-button"
                                        onClick={() => handleDelete(announcement._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </article>
                    ))
                )}
            </div>
        </section>
    );
}

export default Announcements;