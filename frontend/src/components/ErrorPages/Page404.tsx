/*
 * Project: IIS project - Garage sale website
 * @file Page404.js

 * @brief ReactJS component of the 404 page of the website

 * @author Neonila Mashlai - xmashl00
*/

import React, { } from "react";
import { Link } from "react-router-dom";
import Page404Styles from "./Page404.module.css";

const Page404: React.FC = () => {
    return(
        <div>
            <div className={Page404Styles['header']}>404 Not Found</div>
            <div className={Page404Styles['main-container']}>
                <div className={Page404Styles['text']}>The page you are looking for does not exist.</div>
                <Link className={Page404Styles['link']} to="/">Go to home page</Link>
            </div>
        </div>
    );
}

export default Page404;