/*
 * Project: IIS project - Garage sale website
 * @file MenCategories.js

 * @brief ReactJS component of the men categories page

 * @author Neonila Mashlai - xmashl00
*/

import React, {useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import MenCategoriesStyle from "./MenCategories.module.css";
import manClothing from "../images/men_clothing.webp";
import manBags from "../images/men_bags.webp";
import manJewelry from "../images/men_jewelry.webp";
import menAccessories from "../images/men_accesories.webp";
import { fixElementHeight, checkLogin, Contacts, Header } from "../Utils";
import "../GlobalStyles.css";

const MenCategoriesPage:React.FC = () => {

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
            
            <div className={MenCategoriesStyle['main-container']}>
                <div className={MenCategoriesStyle['categories']}>Categories</div>

                <div className="categories-container">
                    <Link className="category-item" to="/items?categoryId=menClothing">
                        <img src={manClothing} alt="Clothing"/>
                        <div className="centered-text" style = {{color: "#093825"}}>Clothing</div>
                    </Link>
                    <Link className="category-item" to = "/items?categoryId=menShoes">
                        <img src="https://donabees.co.uk/cdn/shop/products/mnz-v13tnV6D9lw-unsplash.jpg?v=1682244843&width=1946" alt="Shoes"/>
                        <div className="centered-text" style = {{color: "var(--titanium)"}}>Shoes</div>
                    </Link>
                    <Link className="category-item" to = "/items?categoryId=menAccessories">
                        <img src={menAccessories} alt="Accessories"/>
                        <div className="centered-text" style = {{color: "var(--titanium)"}}>Accessories</div>
                    </Link>
                    <Link className="category-item" to = "/items?categoryId=menBags">
                        <img src={manBags} alt="Bags and Luggage"/>
                        <div className="centered-text" style = {{color: "var(--titanium)"}}>Bags and Luggage</div>
                    </Link>
                    <Link className="category-item" to = "/items?categoryId=menJewelry">
                        <img src={manJewelry} alt="Jewelry and watches"/>
                        <div className="centered-text" style = {{color: "var(--titanium)"}}>Jewelry and watches</div>
                    </Link>
                    <Link className="category-item" to = "/items?categoryId=menVintage">
                        <img src="https://okrok.cz/wp-content/uploads/2021/12/typewriter-g7715445ec_1280.jpg" alt="Vintage and collectibles"/>
                        <div className="centered-text" >
                            <span style={{color: "var(--blue)"}}>Vintage</span>
                            <span style={{color: "var(--titanium)"}}> and collectibles</span>
                        </div>
                    </Link>
                </div>
            </div>

            <Contacts />
        </div>
    );
}

export default MenCategoriesPage;