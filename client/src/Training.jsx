import { useEffect, useState } from 'react';
import api from './api';

function Training({ user }) {
    const [trainings, setTrainings] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const canManage = ['HR', 'Manager'].includes(user?.role);

    const [form, setForm] = useState({
        title: '',
        description: '',
        date: '',
        trainer: '',
        assignedUsers: []
    });

    const authConfig = {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('staffsyncToken')}`
        }
    };

    const resetForm = () => {
        setForm({
            title: '',
            description: '',
            date: '',
            trainer: '',
            assignedUsers: []
        });
        setEditingId(null);
    };

    const loadTrainings = async () => {
        try {
            const response = await api.get('/training', authConfig);
            setTrainings(Array.isArray(response.data) ? response.data : []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Could not load training programs.');
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableUsers = async () => {
        try {
            const response = await api.get('/training/available-users', authConfig);
            setAvailableUsers(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not load employee accounts.');
        }
    };

    useEffect(() => {
        loadTrainings();

        if (canManage) {
            loadAvailableUsers();
        }
    }, []);

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleUserSelection = (userId) => {
        setForm((previous) => ({
            ...previous,
            assignedUsers: previous.assignedUsers.includes(userId)
                ? previous.assignedUsers.filter((id) => id !== userId)
                : [...previous.assignedUsers, userId]
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        setSaving(true);

        try {
            if (editingId) {
                await api.put(`/training/${editingId}`, form, authConfig);
                setMessage('Training program updated successfully!');
            } else {
                await api.post('/training', form, authConfig);
                setMessage('Training program created successfully!');
            }

            resetForm();
            await loadTrainings();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save the training program.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (training) => {
        setEditingId(training._id);

        setForm({
            title: training.title,
            description: training.description,
            date: training.date ? new Date(training.date).toISOString().split('T')[0] : '',
            trainer: training.trainer,
            assignedUsers: (training.assignedUsers || []).map((person) =>
                typeof person === 'string' ? person : person._id
            )
        });

        setError('');
        setMessage('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this training program?')) {
            return;
        }

        try {
            await api.delete(`/training/${id}`, authConfig);
            setMessage('Training program deleted successfully!');

            if (editingId === id) {
                resetForm();
            }

            await loadTrainings();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not delete the training program.');
        }
    };

    return (
        <section className="training-page">
            <div className="training-heading">
                <h2>Training &amp; Development</h2>
                <p>Explore training programs and develop your skills.</p>
            </div>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            {canManage && (
                <form className="training-form" onSubmit={handleSubmit}>
                    <h3>{editingId ? 'Edit Training Program' : 'Add Training Program'}</h3>

                    <label htmlFor="training-title">Title</label>
                    <input
                        id="training-title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. Communication Skills"
                        required
                    />

                    <label htmlFor="training-description">Description</label>
                    <textarea
                        id="training-description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Describe the training program"
                        rows="3"
                        required
                    />

                    <label htmlFor="training-date">Training Date</label>
                    <input
                        id="training-date"
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="training-trainer">Trainer</label>
                    <input
                        id="training-trainer"
                        name="trainer"
                        value={form.trainer}
                        onChange={handleChange}
                        placeholder="Trainer's name"
                        required
                    />

                    <div className="training-assignment">
                        <h4>Assign Employees</h4>
                        {availableUsers.length === 0 ? (
                            <p>No Employee accounts available.</p>
                        ) : (
                            availableUsers.map((person) => (
                                <label className="training-user-option" key={person._id}>
                                    <input
                                        type="checkbox"
                                        checked={form.assignedUsers.includes(person._id)}
                                        onChange={() => handleUserSelection(person._id)}
                                    />
                                    <span>{person.name} ({person.email})</span>
                                </label>
                            ))
                        )}
                    </div>

                    <button type="submit" disabled={saving}>
                        {saving
                            ? 'Saving...'
                            : editingId
                                ? 'Update Training'
                                : 'Add Training'}
                    </button>

                    {editingId && (
                        <button type="button" onClick={resetForm}>
                            Cancel Edit
                        </button>
                    )}
                </form>
            )}

            <div className="training-list">
                <h3>Available Training Programs</h3>

                {loading ? (
                    <p>Loading training programs...</p>
                ) : trainings.length === 0 ? (
                    <div className="training-empty">
                        <h3>No training programs yet</h3>
                        <p>New training opportunities will appear here.</p>
                    </div>
                ) : (
                    trainings.map((training) => (
                        <article className="training-card" key={training._id}>
                            <h3>{training.title}</h3>
                            <p>{training.description || 'No description provided.'}</p>
                            <p>
                                <strong>Date:</strong>{' '}
                                {training.date
                                    ? new Date(training.date).toLocaleDateString('en-IN')
                                    : 'Not scheduled'}
                            </p>
                            <p>
                                <strong>Trainer:</strong> {training.trainer || 'Not specified'}
                            </p>

                            {canManage && (
                                <>
                                    <p>
                                        <strong>Assigned Employees:</strong>{' '}
                                        {training.assignedUsers?.length
                                            ? training.assignedUsers
                                                .map((person) =>
                                                    typeof person === 'string'
                                                        ? person
                                                        : person.name
                                                )
                                                .join(', ')
                                            : 'None'}
                                    </p>

                                    <div className="training-actions">
                                        <button type="button" onClick={() => handleEdit(training)}>
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(training._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </article>
                    ))
                )}
            </div>
        </section>
    );
}

export default Training;