import './App.css';
import React from 'react';
import './index.css';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import QRCodeScanner from './components/QRCodeScanner';
import Attendance from './components/Attendance';
import Success from './components/Success';
import AdminDashboard from './components/AdminDashboard';
import ViewAttendance from './components/ViewAttendance';
import ManageUsers from './components/ManageUsers';

function App() {
    return (
        <Router>
          
            
            <Routes>
                {/* Set Home as the default route */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/qr-scanner" element={<QRCodeScanner />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/success" element={<Success />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/manage-users" element={<ManageUsers />} />
                <Route path="/admin/view-attendance" element={<ViewAttendance />} />
            </Routes>
        </Router>
    );
}

export default App;
