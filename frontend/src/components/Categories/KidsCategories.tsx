/*
 * Project: ITU project - Garage sale website
 * @file KidsCategories.js

 * @brief ReactJS component of the kids categories page

 * @author Maksym Podhornyi - xpodho08
*/

import React, {useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import kidsClothing from "../images/kids_clothing.webp";
import kidsShoes from "../images/kids_shoes.webp";
import kidsAccessories from "../images/kids_accessories.webp";
import kidsBags from "../images/kids_bags.webp";
import kidsToys from "../images/kids_toys.webp";
import kidsEducational from "../images/kids_educational.webp";
import KidsCategoriesStyle from "./KidsCategories.module.css";
import { fixElementHeight, checkLogin, Contacts, Header } from "../Utils";
import "../GlobalStyles.css";

const KidsCategoriesPage: React.FC = () => {

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
    }, []);

    return (
        <div>
            
            <Header headerRef={headerRef} logInRef={logInRef} loggedIn={loggedIn} />
            
            <div className={KidsCategoriesStyle['main-container']}>
                <div className={KidsCategoriesStyle['categories']}>Categories</div>

                <div className="categories-container">
                    <Link className="category-item" to="/items?categoryId=kidsClothing">
                        <img src={kidsClothing} alt="Clothing"/>
                        <div className="centered-text" style = {{color: "var(--white)"}}>Clothing</div>
                    </Link>
                    <Link className="category-item" to = "/items?categoryId=kidsShoes">
                        <img src={kidsShoes} alt="Shoes"/>
                        <div className="centered-text" style = {{color: "var(--white)"}}>Shoes</div>
                    </Link>
                    <Link className="category-item" to = "/items?categoryId=kidsAccessories">
                        <img src={kidsAccessories} alt="Accessories"/>
                        <div className="centered-text" style = {{color: "var(--white)"}}>Accessories</div>
                    </Link>
                    <Link className="category-item" to = "/items?categoryId=kidsBags">
                        <img src={kidsBags} alt="Bags and Luggage"/>
                        <div className="centered-text" style = {{color: "var(--white)"}}>Bags and Luggage</div>
                    </Link>
                    <Link className="category-item" to = "/items?categoryId=kidsToys">
                        <img src={kidsToys} alt="Toys"/>
                        <div className="centered-text" style = {{color: "var(--white)"}}>Toys</div>
                    </Link>
                    <Link className="category-item" to = "/items?categoryId=kidsEducational">
                        <img src={kidsEducational} alt="Educational and Craft Supplies"/>
                        <div className="centered-text" style = {{color: "var(--white)"}}>Educational and Craft Supplies</div>
                    </Link>
                </div>
            </div>

            <Contacts />
        </div>
    );
}

export default KidsCategoriesPage;