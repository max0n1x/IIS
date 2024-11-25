/*
 * Project: IIS project - Garage sale website
 * @file AdminPage.tsx
 * 
 * @brief ReactTS component for the admin page of the website
 * 
 * @author Maksym Podhornyi - xpodho08
 */

import React, { useEffect, useRef, useState, startTransition, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fixElementHeight, checkLogin, Header, API_BASE_URL } from "../Utils";
import AdminPageStyles from "./AdminPage.module.css"; // Admin-specific styles
import "../GlobalStyles.css";

const AdminPage: React.FC = () => {
    const headerRef = useRef<HTMLDivElement>(null);
    const logInRef = useRef<HTMLAnchorElement>(null);
    const loggedIn = useRef<HTMLAnchorElement>(null);
    const navigate = useNavigate();

    const [websiteStats, setWebsiteStats] = useState<{
        totalVisits: number;
        visits24h: number;
        registeredUsers: number;
        itemsForSale: number;
        errorsLogged: number;
    }>({
        totalVisits: 0,
        visits24h: 0,
        registeredUsers: 0,
        itemsForSale: 0,
        errorsLogged: 0,
    });

    interface Report {
        id: number;
        item_id: number;
        reason: string;
        time : string;
    }

    interface User {
        id: number;
        email: string;
        status: string;
        username: string;
        role: string;
        ban_duration: number;
        banned_at: string;
    }

    const [reports, setReports] = useState<Report[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    const [importantMsg, setImportantMsg] = useState<string | boolean>("");
    const [error, setError] = useState<string>("");

    const generateReport = (link : string, title : string, content : string) => {
        return (
            <div key={title}
                className={AdminPageStyles["report"]}
                onClick={() => navigate(link)}
            >
                <label>{title}</label>
                <div className={AdminPageStyles["report-value"]}>
                    {content}
                </div>
            </div>
        );
    };   

    const validateEmail = (email : string) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    const changeUserEmail = (e : React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();

        const userId = e.currentTarget.getAttribute('data-user-id');

        if (!userId) {
            return;
        }

        const newEmail = prompt("Enter new email for this user");

        if (!newEmail) {
            return;
        }

        if (!validateEmail(newEmail)) {
            setError('Invalid email address');
            setTimeout(() => setError(''), 5000);
            return;
        }

        const cookies = document.cookie.split(';');

        if(!cookies){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const adminId = cookies.find(cookie => cookie.includes('user_id'));
        const vKey = cookies.find(cookie => cookie.includes('vKey'));

        if(!adminId || !vKey){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const data = {
            admin_id: adminId.split('=')[1],
            vKey: vKey.split('=')[1],
            new_email: newEmail,
            user_id: userId
        };

        fetch(API_BASE_URL + "/admin/change_email", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then((response) => {
            if (response.ok) {
                fetchUsers();
                return;
            } else {
                throw new Error('Failed to change email');
            }
        }).catch((error) => {
            console.error("Error changing email:", error);
            setError("Failed to change email");
            setTimeout(() => setError(''), 5000);
        });

    }

    const promoteUser = (e : React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();

        const userId = e.currentTarget.getAttribute('data-user-id');

        if (!userId) {
            return;
        }

        if (e.currentTarget.getAttribute('data-user-role') === 'moderator') {
            setError('User is already a moderator');
            setTimeout(() => setError(''), 5000);
            return;
        }

        const cookies = document.cookie.split(';');

        if(!cookies){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const adminId = cookies.find(cookie => cookie.includes('user_id'));
        const vKey = cookies.find(cookie => cookie.includes('vKey'));

        if(!adminId || !vKey){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const data = {
            admin_id: adminId.split('=')[1],
            vKey: vKey.split('=')[1],
            user_id: userId
        };

        fetch(API_BASE_URL + "/user/promote", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then((response) => {
            if (response.ok) {
                fetchUsers();
                return;
            } else {
                throw new Error('Failed to promote user');
            }
        }).catch((error) => {
            console.error("Error promoting user:", error);
            setError("Failed to promote user");
            setTimeout(() => setError(''), 5000);
        });

    }

    const demoteUser = (e : React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();

        const userId = e.currentTarget.getAttribute('data-user-id');

        if (!userId) {
            return;
        }

        if (e.currentTarget.getAttribute('data-user-role') === 'user') {
            setError('User is already a user');
            setTimeout(() => setError(''), 5000);
            return;
        }

        const cookies = document.cookie.split(';');

        if(!cookies){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const adminId = cookies.find(cookie => cookie.includes('user_id'));
        const vKey = cookies.find(cookie => cookie.includes('vKey'));

        if(!adminId || !vKey){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const data = {
            admin_id: adminId.split('=')[1],
            vKey: vKey.split('=')[1],
            user_id: userId
        };

        fetch(API_BASE_URL + "/user/demote", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then((response) => {
            if (response.ok) {
                fetchUsers();
                return;
            } else {
                throw new Error('Failed to demote user');
            }
        }).catch((error) => {
            console.error("Error demoting user:", error);
            setError("Failed to demote user");
            setTimeout(() => setError(''), 5000);
        });

    }

    const banUser = (e : React.MouseEvent<HTMLDivElement>) => {

        const userId = e.currentTarget.getAttribute('data-user-id');

        if (!userId) {
            return;
        }

        const previousStatus = e.currentTarget.getAttribute('data-previous-status');

        if (previousStatus === 'banned') {
            setError('User is already banned');
            setTimeout(() => setError(''), 5000);
            return;
        }

        const duration = prompt("Enter ban duration in hours, 0 for permanent ban");

        if (!duration) {
            return;
        }

        const cookies = document.cookie.split(';');

        if(!cookies){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const adminId = cookies.find(cookie => cookie.includes('user_id'));
        const vKey = cookies.find(cookie => cookie.includes('vKey'));

        if(!adminId || !vKey){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const data = {
            admin_id: adminId.split('=')[1],
            vKey: vKey.split('=')[1],
            user_id: userId,
            duration: duration
        };

        fetch(API_BASE_URL + "/user/ban", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then((response) => {
            if (response.ok) {
                fetchUsers();
                return;
            } else {
                throw new Error('Failed to ban user');
            }
        }).catch((error) => {
            console.error("Error banning user:", error);
            setError("Failed to ban user");
            setTimeout(() => setError(''), 5000);
        });

    }

    const unbanUser = (e : React.MouseEvent<HTMLDivElement>) => {

        const userId = e.currentTarget.getAttribute('data-user-id');

        if (!userId) {
            return;
        }

        const previousStatus = e.currentTarget.getAttribute('data-previous-status');

        if (previousStatus === 'active') {
            setError('User is already active');
            setTimeout(() => setError(''), 5000);
            return;
        }

        const cookies = document.cookie.split(';');

        if(!cookies){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const adminId = cookies.find(cookie => cookie.includes('user_id'));
        const vKey = cookies.find(cookie => cookie.includes('vKey'));

        if(!adminId || !vKey){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const data = {
            admin_id: adminId.split('=')[1],
            vKey: vKey.split('=')[1],
            user_id: userId
        };

        fetch(API_BASE_URL + "/user/unban", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then((response) => {
            if (response.ok) {
                fetchUsers();
                return;
            } else {
                throw new Error('Failed to unban user');
            }
        }).catch((error) => {
            console.error("Error unbanning user:", error);
            setError("Failed to unban user");
            setTimeout(() => setError(''), 5000);
        });

    }

    const banTimeLocal = useMemo(() => {
        return (time : string) => {
            const date = new Date(time);
            return date.toLocaleString('en-GB', { timeZone: 'Europe/Prague' });
        }
    }, []);
    
    const generateUser = (email : string, status : string, id : number, username : string, role : string, ban_duration : number, ban_time : string) => {
        return (
            <div key={id} className={AdminPageStyles["action"]}>
                <label>{username} (email: {email}):</label>
                <div className={AdminPageStyles["action-value"]}>Status: {status}</div>
                {status === 'banned' && <div className={AdminPageStyles["action-value"]}>Banned at: {banTimeLocal(ban_time)}</div>}
                {status === 'banned' && <div className={AdminPageStyles["action-value"]}>Ban duration: {ban_duration} hours</div>}
                <div className={AdminPageStyles["action-value"]}>Role: {role}</div>
                <div className={AdminPageStyles["btns-container"]}>
                    <div className={AdminPageStyles["action-btn"]} data-user-id={id} onClick={changeUserEmail}></div>
                    <div className={AdminPageStyles["action-btn"]} data-user-id={id} data-user-role={role} onClick={promoteUser}></div>
                    <div className={AdminPageStyles["action-btn"]} data-user-id={id} data-user-role={role} onClick={demoteUser}></div>
                    <div className={AdminPageStyles["action-btn"]} data-user-id={id} data-previous-status={status} onClick={banUser}></div>
                    <div className={AdminPageStyles["action-btn"]} data-user-id={id} data-previous-status={status} onClick={unbanUser}></div>
                </div>
            </div>
        );
    }

    const handleLogOutClick = async () => {
        const cookies = document.cookie.split(';');

        if(!cookies){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const userId = cookies.find(cookie => cookie.includes('user_id'));
        const vKey = cookies.find(cookie => cookie.includes('vKey'));

        if(!userId || !vKey){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const data = {
            user_id : userId.split('=')[1],
            vKey : vKey.split('=')[1]
        };

        try {
            const response = await fetch(API_BASE_URL + "/user/logout", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "vKey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                navigate('/');
            } else {
                throw new Error('Something went wrong');
            }

        } catch (err) {
            console.error('Error:', err);
            setError("Failed to connect to the server");
            setTimeout(() => setError(''), 5000);
        }

        startTransition(() => { navigate('/'); });
    };

    const fetchUsers = useCallback(async () => {

        const cookies = document.cookie.split(';');

        if(!cookies){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const userId = cookies.find(cookie => cookie.includes('user_id'));
        const vKey = cookies.find(cookie => cookie.includes('vKey'));

        if(!userId || !vKey){
            startTransition(() => { navigate('/login'); });
            return;
        }
        
        try {

            const response = await fetch(`${API_BASE_URL}/admin/get_users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId.split('=')[1],
                    vKey: vKey.split('=')[1]
                })
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                throw new Error('Failed to fetch users');
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Failed to fetch users");
            setTimeout(() => setError(''), 5000);
        }

    }, []);

    const fetchReports = useCallback(async () => {
        
        const cookies = document.cookie.split(';');

        if(!cookies){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const userId = cookies.find(cookie => cookie.includes('user_id'));
        const vKey = cookies.find(cookie => cookie.includes('vKey'));

        if(!userId || !vKey){
            startTransition(() => { navigate('/login'); });
            return;
        }

        try {

            const response = await fetch(`${API_BASE_URL}/reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId.split('=')[1],
                    vKey: vKey.split('=')[1]
                })
            });

            if (response.ok) {
                const data = await response.json();
                setReports(data);
            } else {
                throw new Error('Failed to fetch reports');
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
            setError("Failed to fetch reports");
            setTimeout(() => setError(''), 5000);
        }

    }, [navigate]);

    const fetchWebsiteStats = useCallback(async () => {

        const cookies = document.cookie.split(';');

        if(!cookies){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const userId = cookies.find(cookie => cookie.includes('user_id'));
        const vKey = cookies.find(cookie => cookie.includes('vKey'));

        if(!userId || !vKey){
            startTransition(() => { navigate('/login'); });
            return;
        }

        try {

            const response = await fetch(`${API_BASE_URL}/admin/stats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId.split('=')[1],
                    vKey: vKey.split('=')[1]
                })
            });

            if (response.ok) {
                const data = await response.json();
                setWebsiteStats(
                    {
                        totalVisits: data.visitors,
                        registeredUsers: data.users,
                        itemsForSale: data.items,
                        errorsLogged: data.errors,
                        visits24h: data.visitors_day
                    }
                );
            } else {
                throw new Error('Failed to fetch stats');
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
            setError("Failed to fetch website statistics");
            setTimeout(() => setError(''), 5000);
        }
    }, [navigate]);

    useEffect(() => {
        if (headerRef.current) {
            fixElementHeight(headerRef.current);
        }

        checkLogin(loggedIn, logInRef).then((result) => {
            
            if (!result) {
                startTransition(() => { navigate('/login'); });
                return;
            } else  if (result !== "admin") {
                setImportantMsg("You are not authorized to access this page");
                navigate('/');
            }

            loggedIn.current!.style.display = "none";
        });

        fetchWebsiteStats();
        fetchReports();
        fetchUsers();

        const interv2 = setInterval(() => {
            fetchWebsiteStats();
        }, 60000);

        const interv1 = setInterval(() => {
            fetchReports();
        }, 60000);

        const interv3 = setInterval(() => {
            fetchUsers();
        }, 60000);

        return () => {
            clearInterval(interv1);
            clearInterval(interv2);
            clearInterval(interv3);
        }

    }, [fetchWebsiteStats, navigate, fetchReports]);

    return (
        <div>
            <Header headerRef={headerRef} logInRef={logInRef} loggedIn={loggedIn} />

            <div className={AdminPageStyles["main-container"]}>

                <h1 className={AdminPageStyles["page-title"]}>Admin Dashboard</h1>

                {/* Website Statistics */}
                <div className={AdminPageStyles["stats-column"]}>
                    <div className={AdminPageStyles["stat"]}>
                        <label>Total visits:</label>
                        <div className={AdminPageStyles["stat-value"]}>{websiteStats.totalVisits}</div>
                    </div>
                    <div className={AdminPageStyles["stat"]}>
                        <label>Visits (Last 24h):</label>
                        <div className={AdminPageStyles["stat-value"]}>{websiteStats.visits24h}</div>
                    </div>
                    <div className={AdminPageStyles["stat"]}>
                        <label>Registered Users:</label>
                        <div className={AdminPageStyles["stat-value"]}>{websiteStats.registeredUsers}</div>
                    </div>
                    <div className={AdminPageStyles["stat"]}>
                        <label>Items for Sale:</label>
                        <div className={AdminPageStyles["stat-value"]}>{websiteStats.itemsForSale}</div>
                    </div>
                    <div className={AdminPageStyles["stat"]}>
                        <label>Errors Logged:</label>
                        <div className={AdminPageStyles["stat-value"]}>{websiteStats.errorsLogged}</div>
                    </div>
                </div>
    
                <div className={AdminPageStyles["reports-column"]}>
                    <h2 className={AdminPageStyles["reports-title"]}>Reports</h2>
                    {reports?.map((report) => generateReport(`/item?item_id=${report.item_id}&report_id=${report.id}`, `Report ${report.id}`, report.reason + " on item " + report.item_id))}
                </div>

                <div className={AdminPageStyles["actions-column"]}>
                    <h2 className={AdminPageStyles["actions-title"]}>Users</h2>
                    {users?.map((user) => generateUser(user.email, user.status, user.id, user.username, user.role, user.ban_duration, user.banned_at))}
                </div>

                <div className={AdminPageStyles["actions-container"]}>
                    <button onClick={handleLogOutClick} className={AdminPageStyles["action-button"]}>
                        Log Out
                    </button>
                </div>

                {importantMsg && <div className={AdminPageStyles["important-message"]}>{importantMsg}</div>}
                {error && <div id="error" className={AdminPageStyles["error"]}>{error}</div>}
            </div>
        </div>
    );
};

export default AdminPage;
