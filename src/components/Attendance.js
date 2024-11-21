import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useSwipeable } from 'react-swipeable'; 
import { useCookies } from 'react-cookie';

const Attendance = () => {
    const navigate = useNavigate();
    const [attendanceType, setAttendanceType] = useState('');
    const [message, setMessage] = useState('');
    const [isSwiped, setIsSwiped] = useState(false);
    const [buttonSubmitted, setButtonSubmitted] = useState(false);
    const [cookies, setCookie] = useCookies(['hasMarkedLogin', 'hasMarkedLunch', 'hasMarkedTea']);

    useEffect(() => {
        // Fetch the user's attendance status for the day
        const fetchAttendanceStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    'https://scanqr-jdez.onrender.com/api/attendance/status',
                    {
                      headers: { Authorization: `Bearer ${token}` }

                    }
                );
                const { loginMarked, lunchMarked, teaMarked } = response.data;
                const expires = new Date();
                expires.setHours(23, 59, 59, 999); 

                setCookie('hasMarkedLogin', loginMarked, { path: '/', expires: new Date().setHours(23, 59, 59, 999) });
                setCookie('hasMarkedLunch', lunchMarked, { path: '/', expires: new Date().setHours(23, 59, 59, 999) });
                setCookie('hasMarkedTea', teaMarked, { path: '/', expires: new Date().setHours(23, 59, 59, 999) });
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
        const expires = new Date();
        expires.setHours(23, 59, 59, 999);

        // Morning login time (9 AM to 9:30 AM)
        if (attendanceType === 'login') {
            console.log(currentHour)
            if (currentHour < 6|| currentHour > 7) {
                setMessage("Morning login is only available between 9 AM and 9:30 AM.");
                navigate('/login'); // Redirect on failure
                return;
            }
            if (cookies.hasMarkedLogin) {
                setMessage("You have already marked your morning login for today.");
                navigate('/login'); // Redirect on failure
                return;
            }
            setCookie('hasMarkedLogin', true, { path: '/', expires });
        }

        // Lunch attendance time (12:30 PM to 2:30 PM)
        if (attendanceType === 'lunch') {
            if (currentHour <= 12.5 || currentHour >= 14.5) {
                setMessage("Lunch attendance can only be marked between 12:30 PM and 1:30 PM.");
                navigate('/login'); // Redirect on failure
                return;
            }
            if (cookies.hasMarkedLunch) {
                setMessage("Lunch attendance can only be marked once per day.");
                navigate('/login'); // Redirect on failure
                return;
            }
            setCookie('hasMarkedLunch', true, { path: '/', expires });
        }

        // Tea attendance time (4:00 PM to 4:30 PM)
        if (attendanceType === 'tea') {
            if (currentHour >=16 || currentHour <= 17.5) {
                setMessage("Tea attendance can only be marked between 4:00 PM and 4:30 PM.");
                navigate('/login'); // Redirect on failure
                return;
            }
            if (cookies.hasMarkedTea) {
                setMessage("Tea attendance can only be marked once per day.");
                return;
            }
            setCookie('hasMarkedTea', true, { path: '/', expires });
        }
        // if (attendanceType === 'logout') {
        //     if (currentHour >=19 || currentHour <= 19.5) {
        //         setMessage("logout attendance can only be marked between 7 PM and 7:30 PM.");
        //         return;
        //     }
        //     if (cookies.hasMarkedLogout) {
        //         setMessage("logout attendance can only be marked once per day.");
        //         return;
        //     }
        //     setCookie('hasMarkedLogout', true, { path: '/', expires });
        // }

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

    const onSwipedRight = () => {
        if (!buttonSubmitted) {
            setIsSwiped(true);
            setButtonSubmitted(true);
            setTimeout(() => {
                handleAttendance();
            }, 500);
        }
    };

    const swipeHandlers = useSwipeable({
        onSwipedRight,
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

                <div className="relative w-64 h-12 bg-gray-200 rounded-full overflow-hidden cursor-pointer">
                    {!isSwiped ? (
                        <div
                            className="absolute top-0 left-0 h-full bg-red-500 text-white flex items-center justify-center rounded-full transition-all duration-300 ease-in-out"
                            style={{ width: '50%' }}
                            onClick={onSwipedRight}
                        >
                            Slide to Send
                        </div>
                    ) : (
                        <div
                            className="absolute top-0 right-0 h-full w-full bg-green-500 text-white flex items-center justify-center rounded-full transition-all duration-300 ease-in-out"
                        >
                            Sending...
                        </div>
                    )}
                </div>

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
