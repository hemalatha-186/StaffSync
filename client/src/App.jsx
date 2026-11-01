import { useState } from 'react';
import api from './api';
import './App.css';
import Dashboard from './Dashboard';

function App() {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        department: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);


    const [currentUser, setCurrentUser] = useState(
    () => JSON.parse(localStorage.getItem('staffsyncUser') || 'null')
);

const handleLogout = () => {
    localStorage.removeItem('staffsyncToken');
    localStorage.removeItem('staffsyncUser');
    setCurrentUser(null);
    setMessage('');
    setError('');
    setIsLogin(true);
};

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin
                ? { email: form.email, password: form.password }
                : form;

            const response = await api.post(endpoint, payload);

            setMessage(response.data.message || 'Success!');

            if (response.data.token) {
                localStorage.setItem('staffsyncToken', response.data.token);
                localStorage.setItem(
                    'staffsyncUser',
                    JSON.stringify(response.data.user)
                );

                setCurrentUser(response.data.user);
            }

            setForm({
                name: '',
                email: '',
                password: '',
                department: ''
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to connect. Please check whether the backend is running.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (currentUser) {
    return <Dashboard user={currentUser} onLogout={handleLogout} />;
}

    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="brand-mark">S</div>
                <h1>StaffSync</h1>
                <p className="subtitle">Your people. Your workplace. In sync.</p>

                <div className="auth-tabs">
                    <button
                        type="button"
                        className={isLogin ? 'active' : ''}
                        onClick={() => {
                            setIsLogin(true);
                            setMessage('');
                            setError('');
                        }}
                    >
                        Log In
                    </button>
                    <button
                        type="button"
                        className={!isLogin ? 'active' : ''}
                        onClick={() => {
                            setIsLogin(false);
                            setMessage('');
                            setError('');
                        }}
                    >
                        Create Account
                    </button>
                </div>

                <h2>{isLogin ? 'Welcome back!' : 'Join StaffSync'}</h2>
                <p className="form-description">
                    {isLogin
                        ? 'Log in to continue to your workspace.'
                        : 'Create your employee account to get started.'}
                </p>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <label htmlFor="name">Full name</label>
                            <input
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />

                            <label htmlFor="department">Department</label>
                            <input
                                id="department"
                                name="department"
                                value={form.department}
                                onChange={handleChange}
                                placeholder="e.g. Engineering"
                            />
                        </>
                    )}

                    <label htmlFor="email">Email address</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                        minLength={6}
                        required
                    />

                    <button className="submit-button" disabled={loading}>
                        {loading
                            ? 'Please wait...'
                            : isLogin
                                ? 'Log In'
                                : 'Create Account'}
                    </button>
                </form>

                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}

                <p className="security-note">
                    Secure access to your StaffSync workspace.
                </p>
            </section>
        </main>
    );
}

export default App;