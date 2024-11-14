import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="min-h-screen bg-gray-100 w-64 shadow-lg">
            <div className="p-4 bg-teal-600 text-white text-center font-semibold">
                Admin Panel
            </div>
            <ul className="mt-6 space-y-4">
                <li className="px-4 py-2 hover:bg-teal-200 transition duration-200">
                    <Link to="/admin/dashboard" className="text-gray-700 font-medium">Admin Dashboard</Link>
                </li>
                <li className="px-4 py-2 hover:bg-teal-200 transition duration-200">
                    <Link to="/admin/profile" className="text-gray-700 font-medium">Admin Profile</Link>
                </li>
                <li className="px-4 py-2 hover:bg-teal-200 transition duration-200">
                    <Link to="/admin/manage-users" className="text-gray-700 font-medium">Manage Users</Link>
                </li>
                <li className="px-4 py-2 hover:bg-teal-200 transition duration-200">
                    <Link to="/admin/view-attendance" className="text-gray-700 font-medium">View Attendance</Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
