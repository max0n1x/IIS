/*
 * Project: IIS project - Garage sale website
 * @file RegisterPage.tsx

 * @brief ReactJS component of the register page of the website

 * @author Maksym Podhornyi - xpodho08
*/

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterPageStyle from './RegisterPage.module.css';
import { fixElementHeight, API_BASE_URL, GetUserInformation } from '../Utils';
import '../GlobalStyles.css';

const RegisterPage: React.FC = () => {

    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [error, setError] = useState<string>('');
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

    const handleRegister = async () => {

        if (!username || !password || !email) {
          setError("Username, password, and email cannot be empty");
          return;
        } 

        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }
    
        const data = {
          username: username,
          password: password,
          email: email,
        };
    
        try {
          const response = await fetch(API_BASE_URL + "/code", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
    
          if (response.ok) {
            navigate('/verify?email=' + email + '&username=' + username);
          } else if (response.status === 409) {
            setError("Username already exists");
          } else if (response.status === 500) {
            setError("Server error");
          } else if (response.status === 400) {
            setError("Username, password, or email cannot be empty");
          } else {
            throw new Error('Something went wrong');
          }
        } catch (err) {
          setError("Failed to connect to the server");
        }
    };

    return (
        <div>

            <div className="header" ref={headerRef}>
                <div className="header-item"></div>
            </div>

            <div className={RegisterPageStyle['register-form']}></div>

            <label htmlFor="username" className={RegisterPageStyle['username-label']}>Login:</label>
            <input type="text" name="username" className={RegisterPageStyle['username-input']}
                    onChange={e => setUsername(e.target.value)} />

            <label htmlFor="email" className={RegisterPageStyle['email-label']}>Email:</label>
            <input type="email" name="email" className={RegisterPageStyle['email-input']}
                    onChange={e => setEmail(e.target.value)} />

            <label htmlFor="password" className={RegisterPageStyle['password-label']}>Password:</label>
            <input type="password" name="password" className={RegisterPageStyle['password-input']}
                    onChange={e => setPassword(e.target.value)} />

            <label htmlFor="confirm-password" className={RegisterPageStyle['password-label1']}>Confirm password:</label>
            <input type="password" name="confirm-password" className={RegisterPageStyle['password-input1']}
                    onChange={e => setConfirmPassword(e.target.value)} />

            <input type="submit" value="Create Account" className={RegisterPageStyle['sign-up-btn']}
                    onClick={handleRegister} />
                    
            {error && <div className={RegisterPageStyle['error']}>{error}</div>}
        </div>
    );
}

export default RegisterPage;
