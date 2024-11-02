/*
 * Project: ITU project - Garage sale website
 * @file HomePage.js

 * @brief ReactJS component of the main page of the website

 * @author Neonila Mashlai - xmashl00
*/

import React, {useEffect, useRef } from "react";
import HomePageStyle from "./HomePage.module.css";
import BackgroundImage from "../images/background.png";
import { HomeImages, MapImages } from "../images/ImageMaps";
import { fixElementHeight, checkLogin, Contacts, Header } from "../Utils";
import "../GlobalStyles.css";

const HomePage:React.FC = () => {

    const headerRef = useRef<HTMLDivElement>(null);
    const logInRef = useRef<HTMLAnchorElement>(null);
    const loggedIn = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        if (headerRef.current) {
            fixElementHeight(headerRef.current);
        }
        
        const verifyLoginStatus = async () => {
            await checkLogin(loggedIn, logInRef);
        };

        verifyLoginStatus();
    }, [logInRef, loggedIn]);

    return (
        <div>

            <Header headerRef={headerRef} logInRef={logInRef} loggedIn={loggedIn} />

            <div className={HomePageStyle['main-container']}>

                <img className={HomePageStyle['background-image']} alt="" src={BackgroundImage} />

                <p className={HomePageStyle['main-text']}>New Year Sale!! <br /> 28.12 </p>

                <div className={HomePageStyle['line']}></div>

                <div className={HomePageStyle['gallery']}>
                    <MapImages images={HomeImages} />
                </div>

            </div>

            <Contacts />

        </div>
    );
}

export default HomePage;