/*
 * Project: IIS project - Garage sale website
 * @file LoginPage.js
 * @brief ReactJS component of the login page of the website
 * @author Maksym Podhornyi - xpodho08
*/

// Importing React and other necessary libraries and CSS modules.
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeaderImage from '../images/header_img.png';
import LoginPageStyle from './LoginPage.module.css';
import { API_BASE_URL, fixElementHeight, GetUserInformation } from '../Utils';
import '../GlobalStyles.css';

// Variable to store the timer for password visibility toggle.
let timer: ReturnType<typeof setTimeout>

// Functional component definition for LoginPage.
const LoginPage: React.FC = () => {
    
    // State variables for managing user input and authentication error messages.
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const headerRef = useRef<HTMLDivElement | null>(null);

    // useRef hook for referencing DOM elements.
    const elementRef = useRef(null);

    // Hook to programmatically navigate to different routes.
    const navigate = useNavigate();

    const validateEmail = (email : string) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    const emailValidation = (e : React.ChangeEvent<HTMLInputElement>) => {
		const email = e.target.value;

		setEmail(email);

        if (email === "admin") {
            e.target.style.border = '';
			e.target.style.outline = '';
            return;
        }

		if (!validateEmail(email)) {
			e.target.style.outline = 'none';
			e.target.style.border = '2px solid red';
		} else {
			e.target.style.border = '';
			e.target.style.outline = '';
		}
	}

    // useEffect hook for performing side effects, in this case, fixing element height on component mount.
    useEffect(() => {

        const cookies = document.cookie.split(';');
        const user_id = cookies.find(cookie => cookie.includes('user_id'));
        const vKey = cookies.find(cookie => cookie.includes('vKey'));

        const checkIfLoggedIn = async () => {
            await GetUserInformation().then((data) => {
                if (data) {
                    navigate('/');
                }
            }
        );};

        if (cookies && user_id && vKey) {
            checkIfLoggedIn();
        }

        if (elementRef.current) {
            fixElementHeight(elementRef.current);
        }

    }, [navigate]);

    function handleInput() {
        const input = document.getElementById('password') as HTMLInputElement | null;
        if (input) {
            input.type = 'text';
            clearTimeout(timer);
            timer = setTimeout(() => {
                input.type = 'password';
            }, 500);
        }
    }

    useEffect(() => {
        if (headerRef.current) {
            fixElementHeight(headerRef.current);
        }
    }, []);

    // Async function to handle the login process.
    const login = async () => {
        const data = {
            email : email,
            password: password,
        };
    
        try {
            // POST request to login endpoint with user credentials.
            const response = await fetch(API_BASE_URL + "/login", {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
    
            // Handling responses based on different HTTP status codes.
            if (response.ok) {
                // Successful login: navigating to home page.
                navigate('/');
            } else if (response.status === 401) {
                // Handling authentication failure.
                setError("Incorrect username or password");
            } else if (response.status === 404) {
                // Handling case where user is not found.
                setError("User not found");
            } else if (response.status === 500) {
                // Handling server errors.
                setError("Server error");
            } else if (response.status === 403) {
                // Handling case where user is not verified.
                setError("User is banned");
            } else {
                // Handling other unspecified errors.
                throw new Error('Something went wrong');
            }
        } catch (error) {
            // Catching and logging any errors during the login process.
            console.error('Error:', error);
            setError('An error occurred while logging in');
        }
    }

    // Render function for the component, using JSX.
    return (
        <div>

            <div className="header" ref={headerRef}>
                <div className="header-item">
                    <Link to="/" className="home">
                        <img className="header-logo" alt="Header Logo" src={HeaderImage} id="logo" />
                    </Link>
                </div>
            </div>

            {/* Login form container */}
            <div className={LoginPageStyle['login-form']} id="login-form"></div>

            {/* Username input field */}
            <label htmlFor="email"
                    className={LoginPageStyle['username-label']}>Email:</label>
            <input type="email" name="email"
                    className={LoginPageStyle['username-input']} id="username"
                    onChange={emailValidation} />

            {/* Password input field with dynamic visibility feature */}
            <label htmlFor="password" 
                    className={LoginPageStyle['password-label']}>Password:</label>
            <input type="password" name="password" 
                    className={LoginPageStyle['password-input']} 
                    id="password" onInput={handleInput}
                    onChange={e => setPassword(e.target.value)} />

            {/* Login button to initiate the login process */}
            <input type="button" value="Log In" id="log-in-btn" 
                    className={LoginPageStyle['log-in-btn']} onClick={login} />

            {/* Displaying error messages if any during the login process */}
            {error && <div id="error" 
                        className={LoginPageStyle['error-message']}>{error}</div>}

            {/* Link to navigate to the registration page */}
            <Link to="/register" className={LoginPageStyle['sign-up-btn']}>Create Account</Link>

            {/* Forgot password link/button */}
            <Link to="/forgot-password" className={LoginPageStyle['forgot-password-btn']}>Forgot password?</Link>
        </div>
    );
};

// Exporting the LoginPage component for use in other parts of the application.
export default LoginPage;
