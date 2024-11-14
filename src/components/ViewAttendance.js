// components/ViewAttendance.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewAttendance = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        // Fetch list of users for selection dropdown
        const fetchUsers = async () => {
            try {
                const response = await axios.get('/api/users');
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    const fetchAttendance = async () => {
        try {
            const response = await axios.get(`/api/attendance/user/${selectedUser}`, {
                params: {
                    startDate: dateRange.start,
                    endDate: dateRange.end
                }
            });
            setAttendanceRecords(response.data);
        } catch (error) {
            console.error("Error fetching attendance:", error);
        }
    };

    return (
        <div>
            <h2>View Attendance Records</h2>
            <label>
                Select User:
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                    <option value="">Select a User</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                </select>
            </label>

            <label>
                Start Date:
                <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
            </label>
            <label>
                End Date:
                <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
            </label>

            <button onClick={fetchAttendance}>View Attendance</button>

            <div>
                <h3>Attendance Records</h3>
                <ul>
                    {attendanceRecords.map((record) => (
                        <li key={record.id}>{record.date}: {record.status}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ViewAttendance;
