// components/AdminDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';




const AdminDashboard = () => {
    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <nav>
                <ul>
                    <li><Link to="/admin/manage-users">Manage Users</Link></li>
                    <li><Link to="/admin/view-attendance">View Attendance Records</Link></li>
                </ul>
            </nav>
        </div>
    );
};

export default AdminDashboard;

