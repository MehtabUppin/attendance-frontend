import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { useSwipeable } from 'react-swipeable';
import { useCookies } from 'react-cookie';

const Attendance = () => {
    const navigate = useNavigate();
    const [attendanceType, setAttendanceType] = useState('');
    const [message, setMessage] = useState('');
    const [isSwiped, setIsSwiped] = useState(false);
    const [buttonSubmitted, setButtonSubmitted] = useState(false);
    const [cookies, setCookie] = useCookies(['hasMarkedLogin', 'hasMarkedLunch', 'hasMarkedTea', 'hasMarkedLogout']);

    useEffect(() => {
        const fetchAttendanceStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    'https://scanqr-jdez.onrender.com/api/attendance/status',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const { loginMarked, lunchMarked, teaMarked } = response.data;
                const expires = new Date();
                expires.setHours(23, 59, 59, 999);

                setCookie('hasMarkedLogin', loginMarked, { path: '/', expires });
                setCookie('hasMarkedLunch', lunchMarked, { path: '/', expires });
                setCookie('hasMarkedTea', teaMarked, { path: '/', expires });
                setCookie('hasMarkedLogout', false, { path: '/', expires });
            } catch (error) {
                console.error("Failed to fetch attendance status:", error);
            }
        };
        fetchAttendanceStatus();
    }, [setCookie]);

    const handleAttendance = async () => {
        const token = localStorage.getItem('token');
        const id = localStorage.getItem('id');

        if (!token) {
            alert("Please log in again.");
            navigate('/login');
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            const isTokenExpired = decodedToken.exp * 1000 < Date.now();
            if (isTokenExpired) {
                alert("Session expired. Please log in again.");
                navigate('/login');
                return;
            }
        } catch (error) {
            console.error("Invalid token:", error);
            alert("Invalid session. Please log in again.");
            navigate('/login');
            return;
        }

        const currentHour = new Date().getHours();
        const currentMinute = new Date().getMinutes();
        const timeInMinutes = currentHour * 60 + currentMinute; // Calculate the total minutes elapsed in the day
        const expires = new Date();
        expires.setHours(23, 59, 59, 999);

        // Attendance type validations
        if (!attendanceType) {
            setMessage("Please select an attendance type.");
            navigate('/attendancetype'); // Redirect to attendance type selection
            return;
        }

        if (attendanceType === 'login') {
            if (timeInMinutes < 540 || timeInMinutes > 570) { // 9:00 AM to 9:30 AM
                setMessage("Morning login is only available between 9:00 AM and 9:30 AM.");
                return;
            }
            if (cookies.hasMarkedLogin) {
                setMessage("You have already marked your morning login for today.");
                return;
            }
            setCookie('hasMarkedLogin', true, { path: '/', expires });
        } else if (attendanceType === 'lunch') {
            if (timeInMinutes < 750 || timeInMinutes > 870) { // 12:30 PM to 2:30 PM
                setMessage("Lunch attendance can only be marked between 12:30 PM and 2:30 PM.");
                return;
            }
            if (cookies.hasMarkedLunch) {
                setMessage("You have already marked your lunch for today.");
                return;
            }
            setCookie('hasMarkedLunch', true, { path: '/', expires });
        } else if (attendanceType === 'tea') {
            if (timeInMinutes < 960 || timeInMinutes > 1020) { // 4:00 PM to 5:00 PM
                setMessage("Tea attendance can only be marked between 4:00 PM and 5:00 PM.");
                return;
            }
            if (cookies.hasMarkedTea) {
                setMessage("You have already marked your tea break for today.");
                return;
            }
            setCookie('hasMarkedTea', true, { path: '/', expires });
        } else if (attendanceType === 'logout') {
            if (timeInMinutes < 1080 || timeInMinutes > 1110) { // 6:00 PM to 6:30 PM
                setMessage("Logout attendance can only be marked between 6:00 PM and 6:30 PM.");
                return;
            }
            if (cookies.hasMarkedLogout) {
                setMessage("You have already marked your logout for today.");
                return;
            }
            setCookie('hasMarkedLogout', true, { path: '/', expires });
        }

        const payload = {
            loginOption: attendanceType,
            user: { id: id },
            instituteName: "apteknow",
            instituteLatitude: 12.9165,
            instituteLongitude: 77.6014,
        };

        try {
            const response = await axios.post(
                'https://scanqr-jdez.onrender.com/api/attendance/add',
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data && response.data.message) {
                setMessage(response.data.message);
            } else {
                setMessage('Attendance marked successfully.');
            }

            navigate('/success');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                alert("Session expired. Please log in again.");
                navigate('/login');
            } else {
                setMessage('Attendance marking failed: ' + (error.response?.data.message || error.message));
            }
        }
    };

    const swipeHandlers = useSwipeable({
        onSwipedRight: () => {
            if (!buttonSubmitted) {
                setIsSwiped(true);
                setButtonSubmitted(true);
                setTimeout(() => {
                    handleAttendance();
                }, 500);
            }
        },
        trackMouse: true,
    });

    return (
        <div
            {...swipeHandlers}
            className="min-h-screen bg-gradient-to-tr from-teal-100 via-teal-50 to-gray-100 flex items-center justify-center"
        >
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-teal-700 mb-6">Mark Attendance</h2>

                <select
                    value={attendanceType}
                    onChange={(e) => setAttendanceType(e.target.value)}
                    required
                    className="block w-full p-3 mb-5 border border-gray-300 rounded-md bg-gray-50 text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                    <option value="">Select Attendance Type</option>
                    <option value="login">Morning Login</option>
                    <option value="lunch">Lunch</option>
                    <option value="tea">Tea Break</option>
                    <option value="logout">Logout</option>
                </select>

                <button
                    className="block w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-all"
                    onClick={handleAttendance}
                >
                    Mark Attendance
                </button>

                {message && (
                    <p className="mt-4 text-center text-teal-600 font-semibold">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Attendance;
