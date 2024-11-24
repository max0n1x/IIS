/*
 * Project: IIS project - Garage sale website
 * @file ForgotPasswordPage.tsx
 * @brief ReactJS component for the "Forgot Password" page
 * @author Maksym Podhornyi - xpodho08
*/

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordPageStyle from './ForgotPasswordPage.module.css';
import { fixElementHeight, API_BASE_URL, GetUserInformation } from '../Utils';
import '../GlobalStyles.css';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const headerRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!email) {
            setError('Email cannot be empty');
            return;
        }

        const data = { email };

        const validateEmail = (email : string) => {
            const re = /\S+@\S+\.\S+/;
            return re.test(email);
        }

        try {
            const response = await fetch(API_BASE_URL + "/forgot-password", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setSuccessMessage("Password reset link has been sent to your email!");
                setError('');
                setTimeout(() => navigate('/login'), 2000); // Redirect after 2 seconds
            } else {
                setError('Failed to send reset email');
            }
        } catch (err) {
            setError('Failed to connect to the server');
        }
    };

    return (
        <div className={ForgotPasswordPageStyle['page-container']}>

            <div className="header" ref={headerRef}>
                <div className="header-item"></div>
            </div>

            <div className={ForgotPasswordPageStyle['forgot-password-box']}>
                <h2 className={ForgotPasswordPageStyle['title']}>Forgot Your Password?</h2>

                {successMessage && <div className={ForgotPasswordPageStyle['success-message']}>{successMessage}</div>}
                {error && <div className={ForgotPasswordPageStyle['error-message']}>{error}</div>}

                <label htmlFor="email" className={ForgotPasswordPageStyle['email-label']}>Enter your email address:</label>
                <input
                    type="email"
                    name="email"
                    className={ForgotPasswordPageStyle['email-input']}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <div className={ForgotPasswordPageStyle['button-container']}>
                    <input
                        type="submit"
                        value="Send Reset Link"
                        className={ForgotPasswordPageStyle['submit-btn']}
                        onClick={handleSubmit}
                    />
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
