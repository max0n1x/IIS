/*
 * Project: ITU project - Garage sale website
 * @file WomenCategories.js

 * @brief ReactJS component of the women categories page

 * @author Maksym Podhornyi - xpodho08
*/

import React, {useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import WomenCategoriesStyle from "./WomenCategories.module.css";
import womenClothing from "../images/women_clothing.webp";
import womenShoes from "../images/women_shoes.webp";
import womenAccessories from "../images/women_accessories.webp";
import womenBags from "../images/women_bags.webp";
import womenJewelry from "../images/women_watch.webp";
import womenVintage from "../images/women_vintage.webp";
import { fixElementHeight, checkLogin, Contacts, Header } from "../Utils";
import "../GlobalStyles.css";

const WomenCategoriesPage: React.FC = () => {

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
            
            <div className={WomenCategoriesStyle['main-container']}>
                <div className={WomenCategoriesStyle['categories']}>Categories</div>

                <div className="categories-container">
                    <Link className="category-item" to = "/items?categoryId=womenClothing">
                        <img src={womenClothing} alt="Clothing"/>
                        <div className="centered-text" style = {{color: "var(--green)"}}>Clothing</div>
                    </Link>
                    <Link className="category-item" to = "/items?categoryId=womenShoes">
                        <img src={womenShoes} alt="Shoes"/>
                        <div className="centered-text" style = {{color: "var(--green)"}}>Shoes</div>
                    </Link>
                    <Link className="category-item" to = "/items?categoryId=womenAccessories">
                        <img src={womenAccessories} alt="Accessories"/>
                        <div className="centered-text" style = {{color: "var(--green)"}}>Accessories</div>
                    </Link>
                    <Link className="category-item" to = "/items?categoryId=womenBags">
                        <img src={womenBags} alt="Bags and luggage"/>
                        <div className="centered-text" style = {{color: "var(--green)"}}>Bags and Luggage</div>
                    </Link>
                    <Link className="category-item" to = "/items?categoryId=womenJewelry">
                        <img src={womenJewelry} alt="Jewelry and watches"/>
                        <div className="centered-text" style = {{color: "var(--titanium)"}}>Jewelry and watches</div>
                    </Link>
                    <Link className="category-item" to = "/items?categoryId=womenVintage">
                        <img src={womenVintage} alt="Vintage and Collectibles"/>
                        <div className="centered-text" style = {{color: "var(--green)"}}>Vintage and Collectibles</div>
                    </Link>
                </div>
            </div>

            <Contacts />
        </div>
    );
}

export default WomenCategoriesPage;