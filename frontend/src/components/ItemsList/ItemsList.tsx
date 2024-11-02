/*
 * Project: ITU project - Garage sale website
 * @file ItemsList.js

 * @brief ReactJS component of the items list page of the website

 * @author Neonila Mashlai - xmashl00
*/

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Header, checkLogin, fixElementHeight, API_BASE_URL } from '../Utils';
import ItemsListStyles from './ItemsList.module.css';
import InstagramIcon from '../images/instagram_icon.png';
import FacebookIcon from '../images/facebook_icon.png';
import TwitterIcon from '../images/twitter_icon.png';
import '../GlobalStyles.css';

const ItemsList: React.FC = () => {

    const headerRef = useRef<HTMLDivElement>(null);
    const logInRef = useRef<HTMLAnchorElement>(null);
    const loggedIn = useRef<HTMLAnchorElement>(null);
    
    const itemsContainerRef = useRef<HTMLDivElement>(null);
    const captionRef = useRef<HTMLDivElement>(null);
    const contactsRef = useRef<HTMLDivElement>(null);

    interface Item {
        id: number;
        image_path: string;
        name: string;
        price: number;
    }
    const [items, setItems] = useState<Item[]>([]);

    const location = useLocation();

    const addItem = (item_id : number, image_path : string, name : string, price : number) => {
        var link = "/item?item_id=" + item_id;
        return (
            <Link key = {item_id} to = {link} className={ItemsListStyles['item-container']}>
                <img src={image_path} alt="preview" className={ItemsListStyles['item-image']} />
                <div className={ItemsListStyles['item-name']}>{name}</div>
                <div className={ItemsListStyles['item-price']}>€{price}</div>
            </Link>
        );
    }

    const fetchItems = async (category_id : string) => {
        const response = await fetch(API_BASE_URL + "/items/" + category_id + "/category", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const data = await response.json();

        if(data.length <= 4 && contactsRef.current) {
            contactsRef.current.style.position = "absolute";
            contactsRef.current.style.bottom = "0";
        } else if(contactsRef.current) {
            contactsRef.current.style.position = "relative";
        }

        for (const item of data) {
            if (item.name.length > 15) {
                item.name = item.name.substring(0, 15) + "...";
            }
        }

        setItems(data);
    }

    useEffect(() => {
        if (headerRef.current) {
            fixElementHeight(headerRef.current);
        }
    
        checkLogin(loggedIn, logInRef);

        const queryParams = new URLSearchParams(location.search);
        const categoryId = queryParams.get('categoryId');

        if(categoryId === null){
            return;
        }

        if(categoryId.includes("women") && headerRef.current && captionRef.current){
            (headerRef.current.childNodes[3] as HTMLElement).style.borderBottom = "2px solid var(--blue)";
            captionRef.current.textContent = categoryId.replace("women", "")
        } else if (categoryId.includes("men") && headerRef.current && captionRef.current){
            (headerRef.current.childNodes[2] as HTMLElement).style.borderBottom = "2px solid var(--blue)";
            captionRef.current.textContent = categoryId.replace("men", "")
        } else if (categoryId.includes("kids") && headerRef.current && captionRef.current){
            (headerRef.current.childNodes[4] as HTMLElement).style.borderBottom = "2px solid var(--blue)";
            captionRef.current.textContent = categoryId.replace("kids", "")
        }

        fetchItems(categoryId);
        
        const interval = setInterval(() => {
            fetchItems(categoryId);
        }, 3000); 

        return () => clearInterval(interval);
    }
    , [location]);

    return (
        <div>

            <Header headerRef={headerRef} logInRef={logInRef} loggedIn={loggedIn} />

            <div className={ItemsListStyles['main-container']}>

                <div className={ItemsListStyles['caption']} ref = {captionRef}>Men : Clothing</div>

                <div className={ItemsListStyles['items-container']} ref = {itemsContainerRef}>

                    {items.map(item => addItem(item.id, item.image_path, item.name, item.price))}

                </div>

                <div className={ItemsListStyles['contacts']} ref = {contactsRef}>
                    <b className={ItemsListStyles['contacts-container']}>
                        <p className={ItemsListStyles['contacts-text']}>
                            Contacts: <br />
                            +420987654321 <br />
                            garage.sale@gmail.com
                        </p>
                    </b>

                    <i className={ItemsListStyles['address-container']}>
                        <p className={ItemsListStyles['address']}>Address:<br />
                        nám. Svobody 72/8 <br />
                        602 00 Brno-střed <br />
                        Czech Republic</p>
                    </i>

                    <a href="https://www.instagram.com/">
                        <img
                            className={ItemsListStyles['instagram-icon']}
                            alt="Instagram"
                            src={InstagramIcon}
                        />
                    </a>

                    <a href="https://www.facebook.com/">
                        <img
                            className={ItemsListStyles['facebook-icon']}
                            alt="Facebook"
                            src={FacebookIcon}
                        />
                    </a>

                    <a href="https://twitter.com/">
                        <img
                            className={ItemsListStyles['twitter-icon']}
                            alt="Twitter"
                            src={TwitterIcon}
                        />
                    </a>

                </div>

            </div>
        </div>
    );
}

export default ItemsList;