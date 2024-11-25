/*
 * Project: IIS project - Garage sale website
 * @file ItemPage.tsx

 * @brief ReactJS component of the item page of the website

 * @author Maksym Podhornyi - xpodho08
*/

import React, { useEffect, useRef, useState } from "react";
import ItemPageStyle from "./ItemPage.module.css";
import { fixElementHeight, checkLogin, Contacts, Header, GetItem, API_BASE_URL } from "../Utils";
import "../GlobalStyles.css";
import { useNavigate, useLocation } from "react-router-dom";

const ItemPage: React.FC = () => {
    const headerRef = useRef(null);
    const logInRef = useRef(null);
    const loggedIn = useRef(null);
    const contactRef = useRef(null);
    const reportRef = useRef(null);  // Ref for the report button

    const [ItemName, setItemName] = useState("");
    const [ItemSize, setItemSize] = useState("");
    const [ItemCondition, setItemCondition] = useState("");
    const [ItemDescription, setItemDescription] = useState("");
    const [ItemPrice, setItemPrice] = useState("");
    const [ItemImage, setItemImage] = useState("");
    const [ItemSeller, setItemSeller] = useState("");
    const [ReportReason, setReportReason] = useState("");
    const [ReportReasonUser, setReportReasonUser] = useState("");
    const [ReportResolve, setReportResolve] = useState("");
    const [ReportCreated, setReportCreated] = useState("");
    const [adminLoggedIn, setAdminLoggedIn] = useState(false);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [isReport, setIsReport] = useState(false);
    const [banDuration, setBanDuration] = useState<string | null>(null);
    const [isModerator, setIsModerator] = useState(false);
    const [yours, setYours] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const item_id = queryParams.get('item_id');
    const report_id = queryParams.get('report_id');

    const CreateChat = async () => {
        const cookies = document.cookie.split(';');
        if (!cookies) {
            navigate('/login');
            return;
        }

        const user = cookies.find(cookie => cookie.includes('user_id'));
        const vKey = cookies.find(cookie => cookie.includes('vKey'));

        if(!user || !vKey) {
            navigate('/login');
            return;
        }

        const data = {
            item_id: item_id,
            user_to: ItemSeller,
            user_from: user.split('=')[1],
            vKey: vKey.split('=')[1]
        };

        if (parseInt(user.split('=')[1]) === parseInt(ItemSeller)) {
            navigate('/profile');
            return;
        }

        try {
            const response = await fetch(API_BASE_URL + "/chat/create", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const chatData = await response.json();
                navigate('/user/chats?chat_id=' + chatData + '&item_id=' + item_id);
            } else if (response.status === 401) {
                navigate('/login');
            } else if (response.status === 500) {
                throw new Error('Server error');
            } else {
                throw new Error('Something went wrong');
            }
        } catch (err) {
            console.log(err);
        }
    };

    const resolveAction = async (action: string) => {
        setReportResolve(action);

        if (action === "ban") {
            const dur = window.prompt("Enter duration of ban in days(0 for permanent):")

            if (dur && !isNaN(parseInt(dur))) {
                setBanDuration(dur);
            } else {
                alert("Invalid duration");
            }

        }

    };

    const handleAction = async () => {
            
        if (!ReportResolve) {
            alert("Please select an action.");
            return;
        }

        const cookies = document.cookie.split(';');

        if (!cookies) {
            return;
        }

        const user_id = cookies.find(cookie => cookie.includes('user_id'));
        const vKey = cookies.find(cookie => cookie.includes('vKey'));

        if (!user_id || !vKey) {
            return;
        }

        const data = {
            item_id: item_id,
            action: ReportResolve,
            user_id: user_id.split('=')[1],
            vKey: vKey.split('=')[1]
        };

        try {
            const response = await fetch(API_BASE_URL + "/item/action", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert("Action taken successfully.");
                navigate('/admin');
            } else {
                alert("An error occurred while taking the action.");
            }
        } catch (err) {
            alert("An error occurred. Please try again.");
        }

    };

    const handleResolve = async () => {

        if (!ReportResolve) {
            alert("Please select a resolve action.");
            return;
        }

        const cookies = document.cookie.split(';');

        if (!cookies) {
            navigate('/login');
            return;
        }

        const user_id = cookies.find(cookie => cookie.includes('user_id'));
        const vKey = cookies.find(cookie => cookie.includes('vKey'));

        if (!user_id || !vKey) {
            navigate('/login');
            return;
        }

        const data = {
            report_id: report_id,
            action: ReportResolve,
            ban_duration: banDuration,
            user_id: user_id.split('=')[1],
            vKey: vKey.split('=')[1]
        };

        try {
            const response = await fetch(API_BASE_URL + "/report/resolve", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert("Report resolved successfully.");
                navigate('/admin');
            } else {
                alert("An error occurred while resolving the report.");
            }
        } catch (err) {
            alert("An error occurred. Please try again.");
        }
    };

    const handleReport = async () => {

        if (!ReportReasonUser) {
            alert("Please select a reason for reporting.");
            return;
        }

        const data = {
            item_id: item_id,
            reason: ReportReasonUser
        };

        try {
            const response = await fetch(API_BASE_URL + "/report/create", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert("Thank you for reporting. We will review the item.");
                navigate('/');
            } else {
                alert("An error occurred while submitting your report.");
            }
        } catch (err) {
            console.log(err);
            alert("An error occurred. Please try again.");
        }
    };

    useEffect(() => {
        if (headerRef.current) {
            fixElementHeight(headerRef.current);
        }

        if (!item_id) {
            navigate('*');
            return;
        }

        if (report_id) {
            setIsReport(true);
        }

        GetItem(item_id).then((item) => {
            if (!item) {
                navigate('*');
                return;
            }
            setItemName(item.name);
            setItemSize(item.size);
            if (item.condition_id === "new") {
                setItemCondition("Brand new");
            } else if (item.condition_id === "likeNew") {
                setItemCondition("Like new");
            } else if (item.condition_id === "gentlyUsed") {
                setItemCondition("Gently used");
            } else if (item.condition_id === "used") {
                setItemCondition("Used");
            } else if (item.condition_id === "vintage") {
                setItemCondition("Vintage or retro");
            } else if (item.condition_id === "forParts") {
                setItemCondition("For parts or repair");
            }
            setItemDescription(item.description);
            setItemPrice(item.price);
            setItemImage(item.image_path);
            setItemSeller(item.author_id);

            const cookies = document.cookie.split(';');

            const user_id = cookies.find(cookie => cookie.includes('user_id'));

            if (user_id && Number(user_id.split('=')[1]) === item.author_id) {
                navigate("/user/edit-item?item_id=" + item_id);
                setYours(true);
            }

        });

        const loggedInCheck = async () => {
            await checkLogin(loggedIn, logInRef).then((result) => {
                if (result === true) {
                    setUserLoggedIn(true);
                } else if (result === 'admin') {
                    setAdminLoggedIn(true);
                } else if (result === 'moderator') {
                    setIsModerator(true);
                } else {
                    setUserLoggedIn(false);
                    setAdminLoggedIn(false);
                    setIsModerator(false);
                }
            }
        );}

        loggedInCheck();

        if (adminLoggedIn) {

            const cookies = document.cookie.split(';');

            if (!cookies) {
                navigate('/login');
                return;
            }

            const user_id = cookies.find(cookie => cookie.includes('user_id'));
            const vKey = cookies.find(cookie => cookie.includes('vKey'));

            if (!user_id || !vKey) {
                navigate('/login');
                return;
            }
            
            if (report_id) {
                const response = fetch(API_BASE_URL + "/report", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ report_id: report_id, user_id: user_id.split('=')[1], vKey: vKey.split('=')[1] })
                });

                response.then(res => {
                    if (res.ok) {

                        res.json().then(data => {

                            setReportReason(data.reason);
                            const date = new Date(data.time);
                            setReportCreated(date.toLocaleString('en-GB', { timeZone: 'Europe/Prague' }));

                        });

                    } else {
                        console.log("Failed to fetch report reason");
                    }

                });
            }
        }

                
    }, [navigate, location, item_id, ItemSeller, loggedIn, logInRef, adminLoggedIn]);

    return (
        <div>
            <Header headerRef={headerRef} logInRef={logInRef} loggedIn={loggedIn} />

            <div className={ItemPageStyle["main-container"]}>
                <div className={ItemPageStyle['image-container']}>
                    <img src={ItemImage} alt="Preview" className={ItemPageStyle["image-preview"]} />
                </div>

                <div className={ItemPageStyle["item-price"]}>Price: €{ItemPrice}</div>

                <div className={ItemPageStyle["item-name"]}>
                    Name:<br />
                    {ItemName}
                </div>

                <div className={ItemPageStyle["item-size"]}>
                    Size: <br />
                    {ItemSize}
                </div>

                <div className={ItemPageStyle["item-condition"]}>
                    Condition: <br />
                    {ItemCondition}
                </div>

                <div className={ItemPageStyle["item-description-container"]}>
                    <div className={ItemPageStyle["item-description-label"]}>Description:</div>
                    <div className={ItemPageStyle["item-description"]}>
                        {ItemDescription}
                    </div>
                </div>

                {!yours && (
                <input type="submit" className={ItemPageStyle["contact-seller-button"]} ref={contactRef}
                    onClick={CreateChat} value="Contact seller" />
                )}


                {userLoggedIn && !isReport && !yours && (
                    <div className={ItemPageStyle["report-section"]}>
                        <label htmlFor="report-reason" className={ItemPageStyle["report-label"]}>Report this item:</label>
                        <select
                            id="report-reason"
                            ref={reportRef}
                            className={ItemPageStyle["report-dropdown"]}
                            onChange={(e) => setReportReasonUser(e.target.value)}
                        >
                            <option value="">Select reason</option>
                            <option value="Inappropriate content">Inappropriate content</option>
                            <option value="Fake item">Fake item</option>
                            <option value="Spam or scam">Spam or scam</option>
                            <option value="Other">Other</option>
                        </select>
                        <button className={ItemPageStyle["report-button"]} onClick={handleReport}>
                            Report Item
                        </button>
                    </div>
                )}

                {(adminLoggedIn || isModerator) && isReport && !yours && (
                    <div className={ItemPageStyle["report-section"]}>

                        <div className={ItemPageStyle["report-reason"]}>Reason: {ReportReason}</div>

                        <div className={ItemPageStyle["report-created"]}>Reported at: {ReportCreated}</div>
                        
                        <label htmlFor="report-reason" className={ItemPageStyle["report-label"]}>Resolve:</label>
                        <select
                            id="report-reason"
                            ref={reportRef}
                            className={ItemPageStyle["report-dropdown"]}
                            onChange={(e) => resolveAction(e.target.value)}
                        >
                            <option value="">Select resolve action</option>
                            <option value="delete">Delete item</option>
                            <option value="ignore">Ignore report</option>
                            <option value="ban">Ban user and delete item</option>
                        </select>
                        <button className={ItemPageStyle["resolve-button"]} onClick={handleResolve}>
                            Resolve Report
                        </button>
                    </div>
                )}

                {((adminLoggedIn && !isReport) || (isModerator && !isReport)) && !yours && (
                    <div className={ItemPageStyle["report-section"]}>
                        
                        <select
                            id="report-reason"
                            ref={reportRef}
                            className={ItemPageStyle["report-dropdown"]}
                            onChange={(e) => resolveAction(e.target.value)}
                        >
                            <option value="">Select action</option>
                            <option value="delete">Delete item</option>
                            <option value="ban">Ban user and delete item</option>
                        </select>
                        <button className={ItemPageStyle["resolve-button"]} onClick={handleAction}>
                            Take Action
                        </button>
                    </div>
                )}

            </div>
            <Contacts />
        </div>
    );
}

export default ItemPage;
