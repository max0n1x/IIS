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
import ModeratorPageStyles from "./ModeratorPage.module.css";
import "../GlobalStyles.css";

const ModeratorPage: React.FC = () => {
    const headerRef = useRef<HTMLDivElement>(null);
    const logInRef = useRef<HTMLAnchorElement>(null);
    const loggedIn = useRef<HTMLAnchorElement>(null);
    const navigate = useNavigate();

    interface Report {
        id: number;
        item_id: number;
        reason: string;
        time : string;
    }

    const [reports, setReports] = useState<Report[]>([]);

    const [importantMsg, setImportantMsg] = useState<string | boolean>("");
    const [error, setError] = useState<string>("");

    const generateReport = (link : string, title : string, content : string) => {
        return (
            <div key={title}
                className={ModeratorPageStyles["report"]}
                onClick={() => navigate(link)}
            >
                <label>{title}</label>
                <div className={ModeratorPageStyles["report-value"]}>
                    {content}
                </div>
            </div>
        );
    };   

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

    useEffect(() => {
        if (headerRef.current) {
            fixElementHeight(headerRef.current);
        }

        checkLogin(loggedIn, logInRef).then((result) => {
            
            if (!result) {
                startTransition(() => { navigate('/login'); });
                return;
            } else  if (result !== "admin" && result !== "moderator") {
                setImportantMsg("You are not authorized to access this page");
                navigate('/');
            } else if (result === "admin") {
                navigate('/admin');
            } else {
                setImportantMsg(false);
            }

            loggedIn.current!.style.display = "none";
        });

        fetchReports();

        const interv1 = setInterval(() => {
            fetchReports();
        }, 60000);

        return () => {
            clearInterval(interv1);
        }

    }, [navigate, fetchReports]);

    return (
        <div>
            <Header headerRef={headerRef} logInRef={logInRef} loggedIn={loggedIn} />

            <div className={ModeratorPageStyles["main-container"]}>

                <h1 className={ModeratorPageStyles["page-title"]}>Moderator Dashboard</h1>
    
                <div className={ModeratorPageStyles["reports-column"]}>
                    <h2 className={ModeratorPageStyles["reports-title"]}>Reports</h2>
                    {reports?.map((report) => generateReport(`/item?item_id=${report.item_id}&report_id=${report.id}`, `Report ${report.id}`, report.reason + " on item " + report.item_id))}
                </div>

                {importantMsg && <div className={ModeratorPageStyles["important-message"]}>{importantMsg}</div>}
                {error && <div id="error" className={ModeratorPageStyles["error"]}>{error}</div>}
            </div>
        </div>
    );
};

export default ModeratorPage;
