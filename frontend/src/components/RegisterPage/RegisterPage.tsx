/*
 * Project: IIS project - Garage sale website
 * @file RegisterPage.tsx

 * @brief ReactJS component of the register page of the website

 * @author Maksym Podhornyi - xpodho08
*/

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import HeaderImage from '../images/header_img.png';
import RegisterPageStyle from './RegisterPage.module.css';
import { fixElementHeight, API_BASE_URL } from '../Utils';
import '../GlobalStyles.css';

const RegisterPage: React.FC = () => {

    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [error, setError] = useState<string>('');
    const headerRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

	const validateEmail = (email : string) => {
			const re = /\S+@\S+\.\S+/;
			return re.test(email);
	};

	const checkPassword = (password : string) => {
		const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
		return re.test(password);
	}

	const passwordStrength = (e : React.ChangeEvent<HTMLInputElement>) => {
		const password = e.target.value;

		if (e.target.name === 'password') {
			setPassword(password);
		} else {
			setConfirmPassword(password);
		}

		if (!checkPassword(password)) {
			e.target.style.outline = 'none';
			e.target.style.border = '2px solid red';
		} else {
			e.target.style.border = '';
			e.target.style.outline = '';
		}

	}

	const emailValidation = (e : React.ChangeEvent<HTMLInputElement>) => {
		const email = e.target.value;

		setEmail(email);

		if (!validateEmail(email)) {
			e.target.style.outline = 'none';
			e.target.style.border = '2px solid red';
		} else {
			e.target.style.border = '';
			e.target.style.outline = '';
		}
	}

    useEffect(() => {

        if (headerRef.current) {
            fixElementHeight(headerRef.current);
        }

    }, [navigate]);

    const handleRegister = async () => {

        if (!username || !password || !email) {
			setError("Username, password, and email cannot be empty");
			return;
        } 

		console.log(email);

        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        if (!validateEmail(email)) {
          setError("Invalid email address");
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
            navigate('/verify?email=' + email);
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
                <div className="header-item">
                    <Link to="/" className="home">
                        <img className="header-logo" alt="Header Logo" src={HeaderImage} id="logo" />
                    </Link>
                </div>
            </div>

			<div className={RegisterPageStyle['mandatory-fields']}>Fields marked with <span style={{ color: "red" }}>*</span> are mandatory</div>

            <div className={RegisterPageStyle['register-form']}></div>

            <label htmlFor="username" className={RegisterPageStyle['username-label']}>Login<span style={{ color: "red" }}>*</span></label>
            <input type="text" name="username" className={RegisterPageStyle['username-input']}
                    onChange={e => setUsername(e.target.value)} />

            <label htmlFor="email" className={RegisterPageStyle['email-label']}>Email<span style={{ color: "red" }}>*</span></label>
            <input type="email" name="email" className={RegisterPageStyle['email-input']}
                    onChange={emailValidation} />

            <label htmlFor="password" className={RegisterPageStyle['password-label']}>Password<span style={{ color: "red" }}>*</span></label>
            <input type="password" name="password" className={RegisterPageStyle['password-input']}
                    onChange={passwordStrength} />
			<div className={RegisterPageStyle['password-strength']}>Password must contain at least 8 characters, including uppercase, lowercase letters, special characters and numbers</div>

            <label htmlFor="confirm-password" className={RegisterPageStyle['password-label1']}>Confirm password<span style={{ color: "red" }}>*</span></label>
            <input type="password" name="confirm-password" className={RegisterPageStyle['password-input1']}
                    onChange={passwordStrength} />

            <input type="submit" value="Create Account" className={RegisterPageStyle['sign-up-btn']}
                    onClick={handleRegister} />
                    
            {error && <div className={RegisterPageStyle['error']}>{error}</div>}
        </div>
    );
}

export default RegisterPage;
