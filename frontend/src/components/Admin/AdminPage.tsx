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

    const [websiteStats, setWebsiteStats] = useState<{
        visits: number;
        registeredUsers: number;
        itemsForSale: number;
    }>({
        visits: 0,
        registeredUsers: 0,
        itemsForSale: 0,
    });

    const [importantMsg, setImportantMsg] = useState<string | boolean>("");
    const [error, setError] = useState<string>("");

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

    const fetchWebsiteStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/stats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data = await response.json();
                setWebsiteStats(
                    {
                        visits: data.visitors,
                        registeredUsers: data.users,
                        itemsForSale: data.items,
                    }
                );
            } else {
                throw new Error('Failed to fetch stats');
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
            setError("Failed to fetch website statistics");
        }
    };

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
    }, []);

    return (
        <div>
            <Header headerRef={headerRef} logInRef={logInRef} loggedIn={loggedIn} />

            <div className={AdminPageStyles["main-container"]}>

                <h1 className={AdminPageStyles["page-title"]}>Admin Dashboard</h1>

                <div className={AdminPageStyles["stats-container"]}>
                    <div className={AdminPageStyles["stat"]}>
                        <label>Website Visits:</label>
                        <div className={AdminPageStyles["stat-value"]}>{websiteStats.visits}</div>
                    </div>
                    <div className={AdminPageStyles["stat"]}>
                        <label>Registered Users:</label>
                        <div className={AdminPageStyles["stat-value"]}>{websiteStats.registeredUsers}</div>
                    </div>
                    <div className={AdminPageStyles["stat"]}>
                        <label>Items for Sale:</label>
                        <div className={AdminPageStyles["stat-value"]}>{websiteStats.itemsForSale}</div>
                    </div>
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
