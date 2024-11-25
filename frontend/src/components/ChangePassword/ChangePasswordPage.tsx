/*
 * Project: IIS project - Garage sale website
 * @file ChangePasswordPage.tsx
 * @brief ReactJS component for the "Change Password" page
 * @author Maksym Podhornyi - xpodho08
*/

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChangePasswordPageStyle from './ChangePasswordPage.module.css';
import { fixElementHeight, API_BASE_URL, GetUserInformation } from '../Utils';
import '../GlobalStyles.css';

const ChangePasswordPage: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [repeatPassword, setRepeatPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const headerRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();
    const { token } = useParams<{ token: string }>(); // Get the token from the URL

    // Check if the user is logged in
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

    const handleSubmit = async () => {
        if (!email || !newPassword || !repeatPassword) {
            setError('All fields are required');
            return;
        }

        if (newPassword !== repeatPassword) {
            setError('Passwords do not match');
            return;
        }

        const data = { email, newPassword, token };

        try {
            const response = await fetch(API_BASE_URL + "/change-password", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setSuccessMessage('Password changed successfully!');
                setError('');
                setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2 seconds
            } else {
                setError('Failed to change password');
            }
        } catch (err) {
            setError('Failed to connect to the server');
        }
    };

    return (
        <div className={ChangePasswordPageStyle['page-container']}>
            <div className="header" ref={headerRef}>
                <div className="header-item"></div>
            </div>

            <div className={ChangePasswordPageStyle['change-password-box']}>
                <h2 className={ChangePasswordPageStyle['title']}>Change Your Password</h2>

                {successMessage && <div className={ChangePasswordPageStyle['success-message']}>{successMessage}</div>}
                {error && <div className={ChangePasswordPageStyle['error-message']}>{error}</div>}

                <label htmlFor="email" className={ChangePasswordPageStyle['email-label']}>Enter your email address:</label>
                <input
                    type="email"
                    name="email"
                    className={ChangePasswordPageStyle['email-input']}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />

                <label htmlFor="newPassword" className={ChangePasswordPageStyle['password-label']}>New Password:</label>
                <input
                    type="password"
                    name="newPassword"
                    className={ChangePasswordPageStyle['password-input']}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />

                <label htmlFor="repeatPassword" className={ChangePasswordPageStyle['password-label']}>Repeat New Password:</label>
                <input
                    type="password"
                    name="repeatPassword"
                    className={ChangePasswordPageStyle['password-input']}
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />

                <div className={ChangePasswordPageStyle['button-container']}>
                    <input
                        type="submit"
                        value="Submit"
                        className={ChangePasswordPageStyle['submit-btn']}
                        onClick={handleSubmit}
                    />
                </div>
            </div>
        </div>
    );
}

export default ChangePasswordPage;
