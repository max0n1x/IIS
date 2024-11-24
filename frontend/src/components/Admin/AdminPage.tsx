/*
 * Project: IIS project - Garage sale website
 * @file AdminPage.tsx
 * 
 * @brief ReactTS component for the admin page of the website
 * 
 * @author Maksym Podhornyi - xpodho08
 */

import React, { useEffect, useRef, useState, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { fixElementHeight, checkLogin, Header, API_BASE_URL } from "../Utils";
import AdminPageStyles from "./AdminPage.module.css"; // Admin-specific styles
import "../GlobalStyles.css";

const AdminPage: React.FC = () => {
    const headerRef = useRef<HTMLDivElement>(null);
    const logInRef = useRef<HTMLAnchorElement>(null);
    const loggedIn = useRef<HTMLAnchorElement>(null);
    const navigate = useNavigate();

    // State to manage website statistics
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

    const [importantMsg, setImportantMsg] = useState<string | boolean>("");
    const [error, setError] = useState<string>("");

    // Logout functionality
    const handleLogOutClick = async () => {
        const cookies = document.cookie.split(';');
        const userId = cookies.find(cookie => cookie.includes('user_id'))?.split('=')[1];
        const vKey = cookies.find(cookie => cookie.includes('vKey'))?.split('=')[1];

        if (!userId || !vKey) {
            startTransition(() => { navigate('/login'); });
            return;
        }

        const data = { user_id: userId, vKey: vKey };

        try {
            const response = await fetch(`${API_BASE_URL}/admin/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "vKey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                navigate('/login');
            } else {
                throw new Error('Failed to log out');
            }
        } catch (err) {
            console.error("Error:", err);
            setError("Failed to connect to the server");
        }
    };

    // Fetch website statistics
    const fetchWebsiteStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/stats`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data = await response.json();
                setWebsiteStats(data);
            } else {
                throw new Error('Failed to fetch stats');
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
            setError("Failed to fetch website statistics");
        }
    };

    // Component initialization
    useEffect(() => {
        if (headerRef.current) {
            fixElementHeight(headerRef.current);
        }

        checkLogin(loggedIn, logInRef).then((result) => {
            if (!result) {
                startTransition(() => { navigate('/login'); });
                return;
            }
            loggedIn.current!.style.display = "none";
        });

        fetchWebsiteStats();
    }, []);

    return (
        <div>
            {/* Header Component */}
            <Header headerRef={headerRef} logInRef={logInRef} loggedIn={loggedIn} />

            <div className={AdminPageStyles["main-container"]}>

                <h1 className={AdminPageStyles["page-title"]}>Admin Dashboard</h1>

                {/* Left-Side Statistics */}
                <div className={AdminPageStyles["stats-column"]}>
                    <div className={AdminPageStyles["stat"]}>
                        <label>Total Visits:</label>
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

                {/* Admin Actions */}
                <div className={AdminPageStyles["actions-container"]}>
                    <button onClick={handleLogOutClick} className={AdminPageStyles["action-button"]}>
                        Log Out
                    </button>
                </div>

                {/* Messages */}
                {importantMsg && <div className={AdminPageStyles["important-message"]}>{importantMsg}</div>}
                {error && <div id="error" className={AdminPageStyles["error"]}>{error}</div>}
            </div>
        </div>
    );
};

export default AdminPage;
