/*
 * Project: IIS project - Garage sale website
 * @file RegisterPage.tsx

 * @brief ReactJS component of the register page of the website

 * @author Neonila Mashlai - xmashl00
*/

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import HeaderImage from '../images/header_img.png';
import ResetPasswordStyles from './ResetPasswordPage.module.css';
import { fixElementHeight, API_BASE_URL } from '../Utils';
import '../GlobalStyles.css';

const ResetPasswordPage: React.FC = () => {

	const [password, setPassword] = useState<string>('');
	const [confirmPassword, setConfirmPassword] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [msg, setSuccessMessage] = useState<string>('');
	const [error, setError] = useState<string>('');
	const headerRef = useRef<HTMLDivElement | null>(null);
	const navigate = useNavigate();

	const showErrorMessage = (message: string) => {
		setError(message);
		setTimeout(() => setError(''), 2000);
	}

	const checkPassword = (password : string) => {
		const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
		return re.test(password);
	}

	const handlePasswordStrength = (e : React.ChangeEvent<HTMLInputElement>) => {
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

	const handleResetPassword = async () => {

		if (!password || !confirmPassword) {
			showErrorMessage('Password cannot be empty');
			return;
		}

		if (password !== confirmPassword) {
			showErrorMessage('Passwords do not match');
			return;
		}

		const urlParams = new URLSearchParams(window.location.search);
		const token = urlParams.get('token');

		const data = {
			token: token,
			password: password
		};

		const response = fetch(API_BASE_URL + '/reset-password', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		response.then(res => {
			if (res.ok) {
				setSuccessMessage('Password reset successful, redirecting to login page...');
				setTimeout(() => navigate('/login'), 5000);
			} else {
				setError('Failed to reset password');
			}
		});

	};

    useEffect(() => {

        if (headerRef.current) {
            fixElementHeight(headerRef.current);
        }

		const urlParams = new URLSearchParams(window.location.search);
		const token = urlParams.get('token');

		if (!token) {
			showErrorMessage('Invalid reset token');
			return;
		}

		const response = fetch(API_BASE_URL + '/reset-password/check', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ token: token }),
		});

		response.then(res => {
			if (res.ok) {
				res.json().then(data => {
					setEmail(data.email);
				});
			} else {
				setError('Invalid reset token, redirecting to login page...');
				setTimeout(() => navigate('/login'), 2000);
			}
		});

    }, [navigate]);

    return (
        <div>

			<div className="header" ref={headerRef}>
                <div className="header-item">
                    <Link to="/" className="home">
                        <img className="header-logo" alt="Header Logo" src={HeaderImage} id="logo" />
                    </Link>
                </div>
            </div>

            <div className={ResetPasswordStyles['register-form']}></div>

            <label htmlFor="email" className={ResetPasswordStyles['email-label']}>Email:</label>
            <input type="email" name="email" className={ResetPasswordStyles['email-input']} value={email} disabled />

            <label htmlFor="password" className={ResetPasswordStyles['password-label']}>New password:</label>
            <input type="password" name="password" className={ResetPasswordStyles['password-input']}
                    onChange={handlePasswordStrength} />
			<div>?</div>

            <label htmlFor="confirm-password" className={ResetPasswordStyles['password-label1']}>Confirm password:</label>
            <input type="password" name="confirm-password" className={ResetPasswordStyles['password-input1']}
                    onChange={handlePasswordStrength} />

            <input type="submit" value="Reset password" className={ResetPasswordStyles['sign-up-btn']} onClick={handleResetPassword} />
                    
            {error && <div className={ResetPasswordStyles['error']}>{error}</div>}
			{msg && <div className={ResetPasswordStyles['success']}>{msg}</div>}

        </div>
    );
}

export default ResetPasswordPage;