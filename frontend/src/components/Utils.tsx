/*
 * Project: ITU project - Garage sale website
 * @file Utils.js

 * @brief ReactJS functions used in multiple components

 * @author Maksym Podhornyi - xpodho08
*/

// Importing assets and necessary libraries.
import InstagramIcon from "./images/instagram_icon.png";
import FacebookIcon from "./images/facebook_icon.png";
import TwitterIcon from "./images/twitter_icon.png";
import HeaderImage from "./images/header_img.png";
import Vector from "./images/vector.png";
import UserAvatar from "./images/user_avatar.png";
import { Link } from "react-router-dom";
import React, { forwardRef, Ref, MutableRefObject } from "react";

// API base URL constant for server requests.
export const API_BASE_URL = "http://localhost:8080/api/v1.0";

// Function to fix the height of an element based on its computed style.
export const fixElementHeight = (element: HTMLElement | null): void => {
    if (element) {
        const computedStyle = window.getComputedStyle(element);
        element.style.height = computedStyle.height;
    }
}

// Similar function for fixing the width of an element.
export const fixElementWidth = (element: HTMLElement | null): void => {
    if (element) {
        const computedStyle = window.getComputedStyle(element);
        element.style.width = computedStyle.width;
    }
}

// Function to check if a user is logged in by examining cookies.
export const ifUserLoggedIn = async () => {
    const cookies = document.cookie.split(';');
    if (!cookies) {
        return false;
    }
    const userId = cookies.find(cookie => cookie.includes('user_id'));
    if (userId) {
        try {
            // Fetching user data from the server.
            const response = await fetch(API_BASE_URL + "/user/" + userId.split('=')[1], {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (response.ok) {
                const userData = await response.json();
                return userData.username;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    }
    return false;
}

export const checkLogin = async (
    loggedInElement: MutableRefObject<HTMLAnchorElement | null>,
    logInElement: MutableRefObject<HTMLAnchorElement | null>
): Promise<boolean> => {

    if (!loggedInElement.current && !logInElement.current) {
        console.warn("Logged-in or login elements are not defined.");
        return false;
    }
    
    try {
        const username = await ifUserLoggedIn();

        if (!loggedInElement.current || !logInElement.current) {
            console.warn("Logged-in or login elements are not defined.");
            return false;
        }

        if (username) {
            // Show the logged-in UI with the username
            loggedInElement.current.style.display = 'flex';
            loggedInElement.current.children[0].textContent =
                username.length > 6 ? `Logged in as ${username.slice(0, 6)}...` : `Logged in as ${username}`;
            fixElementWidth(loggedInElement.current);

            // Hide the login element when logged in
            return true;
        } else {
            // Show the login element if not logged in
            logInElement.current.style.display = 'flex';
            fixElementWidth(logInElement.current);

            // Inform the server about unauthorized access
            const response = await fetch(`${API_BASE_URL}/user/unauthorized`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                console.error('Unauthorized access log failed:', response.status, response.statusText);
            } else {
                console.info('Unauthorized access successfully logged.');
            }

            return false;
        }
    } catch (error) {
        console.error('An error occurred during the login check:', error);
        return false;
    }
};

// Contacts component using forwardRef for better reusability and reference passing.
export const Contacts = forwardRef((props, ref) => {
    return (
        // Social media contacts and address information for the website
        <div className="contacts">
            <b className='contacts-container'>
                {/* Contact information */}
                <p className='contacts-text'>
                    Contacts: <br />
                    +420987654321 <br />
                    garage.sale@gmail.com
                </p>
            </b>

            <i className='address-container'>
                {/* Physical address details */}
                <p className='address'>Address:<br />
                nám. Svobody 72/8 <br />
                602 00 Brno-střed <br />
                Czech Republic</p>
            </i>

            {/* Social media icons with links */}
            <a href="https://www.instagram.com/">
                <img className='instagram-icon' alt="Instagram" src={InstagramIcon} />
            </a>
            <a href="https://www.facebook.com/">
                <img className='facebook-icon' alt="Facebook" src={FacebookIcon} />
            </a>
            <a href="https://twitter.com/">
                <img className="twitter-icon" alt="Twitter" src={TwitterIcon} />
            </a>
        </div>
    )
})

interface HeaderProps {
    headerRef: Ref<HTMLDivElement>;
    logInRef: Ref<HTMLAnchorElement>;
    loggedIn: Ref<HTMLAnchorElement>;
}

// Header component with navigation and user login state handling.
export const Header = forwardRef<HTMLDivElement, HeaderProps>((props, ref) => {
    const { headerRef, logInRef, loggedIn } = props;
    
    return (
        // Website header with navigation links and user login/logout status
        <div className="header" ref={headerRef}>
            <div className="header-item"></div>
            {/* Navigation links to different sections of the site */}
            <Link to="/" className="home">
                <img className="header-logo" alt="Header Logo" src={HeaderImage} id="logo" />
            </Link>
            <Link to="/men" className="men">Men</Link>
            <Link to="/women" className="women">Women</Link>
            <Link to="/kids" className="kids">Kids</Link>

            {/* Log in/out buttons and user information display */}
            <Link
                className="logged-in-container"
                to="/profile"
                ref={loggedIn}>
                <b className="logged-in-as">Logged in as John</b>
                <img className="user-icon" alt="User Avatar" src={UserAvatar} />
            </Link>

            <Link
                className="log-in-container"
                id="log-in-container"
                ref={logInRef}
                to="/login">
                <b className="log-in-text">Log In</b>
                <img className="log-in-icon" alt="Log In Icon" src={Vector} />
            </Link>
        </div>
    );
});

// Function to upload an image file.
export const uploadImage = async (image: File): Promise<{ url: string } | false> => {
    const formData = new FormData();
    formData.append('image', image);

    try {
        // POST request to upload the image.
        const response = await fetch(`${API_BASE_URL}/image/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            return { url: data.url };
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
};

// Function to retrieve user information based on stored cookies.
export const GetUserInformation = async () => {
    const cookies = document.cookie.split(';');
    if (!cookies) {
        return false;
    }
    const userId = cookies.find(cookie => cookie.includes('user_id'));
    if (!userId) {
        return false;
    }
    try {
        // Fetching user data from the server.
        const response = await fetch(API_BASE_URL + "/user/" + userId.split('=')[1], {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if (response.ok) {
            const userData = await response.json();
            return userData;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

// Function to retrieve a specific item details from the server.
export const GetItem = async (item_id: string) => {
    try {
        // GET request to fetch item details.
        const response = await fetch(API_BASE_URL + "/items/" + item_id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if (response.ok) {
            const items = await response.json();
            return items;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}
