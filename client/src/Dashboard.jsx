import { useState } from 'react';
import Attendance from './Attendance';
import LeaveManagement from './LeaveManagement';
import Training from './Training';
import Announcement from './Announcements';
import EmployeeManagement from './EmployeeManagement';


function Dashboard({ user, onLogout }) {
    const [activePage, setActivePage] = useState('Dashboard');
    const allModules = [
    { name: 'Employees', icon: '👥', description: 'Manage employee records', roles: ['HR', 'Manager'] },
    { name: 'Attendance', icon: '🕒', description: 'Track daily attendance', roles: ['HR', 'Manager', 'Employee'] },
    { name: 'Leave Management', icon: '📅', description: 'Apply for and review leave', roles: ['HR', 'Manager', 'Employee'] },
    { name: 'Training', icon: '🎓', description: 'View training programs', roles: ['HR', 'Manager', 'Employee'] },
    { name: 'Announcements', icon: '📢', description: 'Workplace updates', roles: ['HR', 'Manager', 'Employee'] }
];

const modules = allModules.filter(module =>
    module.roles.includes(user?.role)
);

    return (
        <div className="dashboard">
            <aside className="sidebar">
                <h2>StaffSync</h2>
                <p className="sidebar-label">WORKSPACE</p>
                <button
    className={`nav-item ${activePage === 'Dashboard' ? 'active' : ''}`}
    onClick={() => setActivePage('Dashboard')}
>
    🏠 Dashboard
</button>

                {modules.map((module) => (
                    <button
    className={`nav-item ${activePage === module.name ? 'active' : ''}`}
    key={module.name}
    onClick={() => setActivePage(module.name)}
>
    {module.icon} {module.name}
</button>
                ))}

                <button className="logout-button" onClick={onLogout}>
                    ↪ Log Out
                </button>
            </aside>

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p>Here's what's happening in your workspace.</p>
                    </div>
                    <div className="user-badge">
                        <span className="avatar">
                            {(user?.name || 'U').charAt(0).toUpperCase()}
                        </span>
                        <div>
                            <strong>{user?.name || 'User'}</strong>
                            <p>{user?.role || 'Employee'}</p>
                        </div>
                    </div>
                </header>

            {activePage === 'Dashboard' ? (
    <>
        <section className="welcome-panel">
            <h2>Welcome back, {user.name}!</h2>
            <p>Here's what's happening in your workspace.</p>
        </section>

        <section className="module-grid">
            {modules.map((module) => (
                <article className="module-card" key={module.name}>
                    <div className="module-icon">{module.icon}</div>
                    <h3>{module.name}</h3>
                    <p>{module.description}</p>
                    <button
    className="module-open-button"
    onClick={() => setActivePage(module.name)}
>
    Open Module →
</button>
                </article>
            ))}
        </section>
    </>
) : activePage === 'Attendance' ? (
    <Attendance user={user} />
) : activePage === 'Leave Management' ? (
    <LeaveManagement user={user} />
) : activePage === 'Training' ? (
    <Training user={user} />
) : activePage === 'Announcements' ? (
    <Announcement user={user} />
) : activePage === 'Employees' ? (
    <EmployeeManagement user={user} />
) : ( 


    <section className="welcome-panel">
        <h2>{activePage}</h2>
        <p>This module is coming soon. We're building StaffSync step by step!</p>
    </section>
)}

                
                
            </main>
        </div>
    );
}

export default Dashboard;