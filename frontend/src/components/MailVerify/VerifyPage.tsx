/*
 * Project: IIS project - Garage sale website
 * @file VerifyPage.tsx

 * @brief ReactJS component of the verification page of the website

 * @author Maksym Podhornyi - xpodho08
*/

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import VerifyPageStyle from './VerifyPage.module.css';
import { fixElementHeight, API_BASE_URL, GetUserInformation } from '../Utils';
import '../GlobalStyles.css';

const VerifyPage: React.FC = () => {

    const [code, setCode] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const headerRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    useEffect(() => {

        const checkIfLoggedIn = async () => {
            await GetUserInformation().then((data) => {
                if (data) {
                    navigate('/');
                }
            });
        };

        const cookies = document.cookie.split(';');
        const user_id = cookies.find(cookie => cookie.includes('user_id'));
        const vKey = cookies.find(cookie => cookie.includes('vKey'));

        if (cookies && user_id && vKey) {
            checkIfLoggedIn();
        }

        if (headerRef.current) {
            fixElementHeight(headerRef.current);
        }

    }, [navigate]);

    const handleVerify = async () => {
        if (!code) {
            setError("Code cannot be empty");
            return;
        }

        const data = { code };

        try {
            const response = await fetch(API_BASE_URL + "/verify", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setSuccessMessage("Verification successful!");
                setError('');
                setTimeout(() => navigate('/login'), 2000); // Redirect after 2 seconds
            } else {
                setError("Invalid verification code");
            }
        } catch (err) {
            setError("Failed to connect to the server");
        }
    };

    const handleResendCode = async () => {
        try {
            const response = await fetch(API_BASE_URL + "/resend-code", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setSuccessMessage("Verification code has been resent!");
                setError('');
            } else {
                setError("Failed to resend code");
            }
        } catch (err) {
            setError("Failed to connect to the server");
        }
    };

    return (
        <div className={VerifyPageStyle['page-container']}>

            <div className="header" ref={headerRef}>
                <div className="header-item"></div>
            </div>

            <div className={VerifyPageStyle['verify-box']}>
                <h2 className={VerifyPageStyle['title']}>Verify Your Email</h2>

                {successMessage && <div className={VerifyPageStyle['success-message']}>{successMessage}</div>}
                {error && <div className={VerifyPageStyle['error-message']}>{error}</div>}

                <label htmlFor="verification-code" className={VerifyPageStyle['code-label']}>Enter the code from your email:</label>
                <input
                    type="text"
                    name="verification-code"
                    className={VerifyPageStyle['code-input']}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />

                <div className={VerifyPageStyle['button-container']}>
                    <input
                        type="submit"
                        value="Submit"
                        className={VerifyPageStyle['submit-btn']}
                        onClick={handleVerify}
                    />
                    <button className={VerifyPageStyle['resend-btn']} onClick={handleResendCode}>Resend Code</button>
                </div>
            </div>
        </div>
    );
}

export default VerifyPage;
