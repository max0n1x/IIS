/*
 * Project: IIS project - Garage sale website
 * @file UserPage.js

 * @brief ReactJS component of the user page of the website

 * @author Maksym Podhornyi - xpodho08
*/

import React, {useEffect, useRef, useState, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { fixElementHeight, checkLogin, Header, GetUserInformation, API_BASE_URL } from "../Utils";
import user_svg from "../images/user.svg";
import UserPageStyles from "./UserPage.module.css";
import "../GlobalStyles.css";
import { Link, useLocation } from "react-router-dom";

const UserPage: React.FC = () => {
    const headerRef = useRef<HTMLDivElement>(null);
    const logInRef = useRef<HTMLAnchorElement>(null);
    const loggedIn = useRef<HTMLAnchorElement>(null);
    const navigate = useNavigate();

    const NameInputRef = useRef<HTMLInputElement>(null);
    const SurnameInputRef = useRef<HTMLInputElement>(null);
    const EmailInputRef = useRef<HTMLInputElement>(null);
    const PhoneNumberInputRef = useRef<HTMLInputElement>(null);
    const AddressInputRef = useRef<HTMLInputElement>(null);
    const DateOfBirthInputRef = useRef<HTMLInputElement>(null);

    const [importantMsg, setImportantMsg] = useState<string | boolean>("");

    const [isModerator, setIsModerator] = useState(false);

    const[error, setError] = useState("");

    type Item = {
        id: number;
        image_path: string;
        name: string;
        price: number;
    };    

    const [items, setItems] = useState<Item[]>([]);

    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const action_id = queryParams.get('action_id');

    const createItem = (item_id : number, image_path : string, name : string, price : number) => {
        var link = "/user/edit-item?item_id=" + item_id;
        return (
            <Link key = {item_id} to = {link} className={UserPageStyles['item-container']}>
                <img src={image_path} alt="preview" className={UserPageStyles['item-image']} />
                <div className={UserPageStyles['item-name']}>{name}</div>
                <div className={UserPageStyles['item-price']}>€{price}</div>
            </Link>
        );
    }

    const validateEmail = (email : string) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    const validatePhoneNumber = (phone : string) => {
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
        return re.test(phone);
    }

    const inputAbort = (e : React.FocusEvent<HTMLInputElement>) => {
        e.preventDefault();
        e.target.disabled = true;
    }

    const HandleKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            
            if ((e.target as HTMLInputElement).type === "email" && !validateEmail((e.target as HTMLInputElement).value)) {
                setError("Invalid email format");
                setTimeout(() => { setError(''); }, 2000);
                return;
            }

            if ((e.target as HTMLInputElement).type === "tel" && !validatePhoneNumber((e.target as HTMLInputElement).value)) {
                setError("Invalid phone number format");
                setTimeout(() => { setError(''); }, 2000);
                return;
            }

            (e.target as HTMLInputElement).disabled = true;
        }
    };    

    const setUnlock = (e : React.MouseEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        if(target.name === "edit-name" && NameInputRef.current) {
            NameInputRef.current.disabled = false;
            NameInputRef.current.focus();
        }
        else if(target.name === "edit-surname" && SurnameInputRef.current) {
            SurnameInputRef.current.disabled = false;
            SurnameInputRef.current.focus();
        }
        else if(target.name === "edit-email" && EmailInputRef.current) {
            EmailInputRef.current.disabled = false;
            EmailInputRef.current.focus();
        }
        else if(target.name === "edit-phone" && PhoneNumberInputRef.current) {
            PhoneNumberInputRef.current.disabled = false;
            PhoneNumberInputRef.current.focus();
        }
        else if(target.name === "edit-address" && AddressInputRef.current) {
            AddressInputRef.current.disabled = false;
            AddressInputRef.current.focus();
        }
        else if(target.name === "edit-date-of-birth" && DateOfBirthInputRef.current) {
            DateOfBirthInputRef.current.disabled = false;
            DateOfBirthInputRef.current.focus();
        }
    }

    const [UserData, setUserData] = useState({
        name: "",
        surname: "",
        email: "",
        phone: "",
        address: "",
        date_of_birth: "",
    });

    const handleInputChange = (e : React.FormEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const updatedUserData = {
            ...UserData,
            [target.name]: target.value
        };
        setUserData(updatedUserData);
    };

    const handleLogOutClick = async () => {
        const cookies = document.cookie.split(';');

        if(!cookies){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const userId = cookies.find(cookie => cookie.includes('user_id'));
        const vKey = cookies.find(cookie => cookie.includes('vKey'));

        if(!userId || !vKey){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const data = {
            user_id : userId.split('=')[1],
            vKey : vKey.split('=')[1]
        };

        try {
            const response = await fetch(API_BASE_URL + "/user/logout", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "vKey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                navigate('/');
            } else {
                throw new Error('Something went wrong');
            }

        } catch (err) {
            console.error('Error:', err);
            setError("Failed to connect to the server");
        }

        startTransition(() => { navigate('/'); });
    }
    
    const handleDoneClick = async () => {

        if (!validateEmail(UserData.email)) {
            setError("Invalid email format");
            setTimeout(() => { setError(''); }, 2000);
            return;
        }

        if (!validatePhoneNumber(UserData.phone)) {
            setError("Invalid phone number format");
            setTimeout(() => { setError(''); }, 2000);
            return;
        }

        const cookies = document.cookie.split(';');

        if(!cookies){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const userId = cookies.find(cookie => cookie.includes('user_id'));
        const vKey = cookies.find(cookie => cookie.includes('vKey'));

        if(!userId || !vKey){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const data = {
            user_id : userId.split('=')[1],
            vKey : vKey.split('=')[1],
            name: UserData.name,
            surname: UserData.surname,
            phone: UserData.phone,
            address: UserData.address,
            date_of_birth: UserData.date_of_birth,
        };
    
        try {
            const response = await fetch(API_BASE_URL + "/user/update", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
    
            if (response.ok) {
                if (NameInputRef.current) {
                    NameInputRef.current.disabled = true;
                }
                if (SurnameInputRef.current) {
                    SurnameInputRef.current.disabled = true;
                }
                if (EmailInputRef.current) {
                    EmailInputRef.current.disabled = true;
                }
                if (PhoneNumberInputRef.current) {
                    PhoneNumberInputRef.current.disabled = true;
                }
                if (AddressInputRef.current) {
                    AddressInputRef.current.disabled = true;
                }
                if (DateOfBirthInputRef.current) {
                    DateOfBirthInputRef.current.disabled = true;
                }
                setImportantMsg("User data updated successfully");
                setTimeout(() => {
                    setImportantMsg(false);
                }, 2000);  
            } else if (response.status === 409) {
                setError("Username already exists");
                setTimeout(() => { setError(''); }, 2000);
            } else if (response.status === 500) {
                setError("Server error");
                setTimeout(() => { setError(''); }, 2000);
            } else if (response.status === 400) {
                setError("Username or password cannot be empty");
                setTimeout(() => { setError(''); }, 2000);
            } else {
                throw new Error('Something went wrong');
            }
        } catch (err) {
            console.error('Error:', err);
            setError("Failed to connect to the server");
            setTimeout(() => { setError(''); }, 2000);
        }
    };

    const handleDeleteClick = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            return;
        }
    
        const cookies = document.cookie.split(';');
        const userId = cookies.find(cookie => cookie.includes('user_id'))?.split('=')[1];
        const vKey = cookies.find(cookie => cookie.includes('vKey'))?.split('=')[1];
    
        if (!userId || !vKey) {
            setImportantMsg("Unable to verify your account. Please log in again.");
            navigate('/login');
            return;
        }
    
        const data = {
            user_id: userId,
            vKey: vKey,
        };
    
        try {
            const response = await fetch(`${API_BASE_URL}/user/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
    
            if (response.ok) {
                alert("Your account has been successfully deleted.");
                document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "vKey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                navigate('/');
            } else {
                const errorMsg = await response.text();
                setImportantMsg(`Failed to delete account: ${errorMsg}`);
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            setImportantMsg("An error occurred while deleting your account. Please try again.");
        }
    };
    

    useEffect(() => {
        if (headerRef.current) {
            fixElementHeight(headerRef.current);
        }
    
        checkLogin(loggedIn, logInRef).then((result) => {
            if (!result) {
                startTransition(() => { navigate('/login'); });
                return;
            } else if (result === "admin") {
                startTransition(() => { navigate('/admin'); });
                return;
            } else if (result === "moderator") {
                setIsModerator(true);
                return;
            }
            
            if (loggedIn.current) {
                loggedIn.current.style.display = "none";
            }
        }
        );

        const fetchItems = async (user_id : string, vKey : string) => {
            const response = await fetch(API_BASE_URL + "/user/items", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({user_id: user_id, vKey: vKey})
            });
            const data = await response.json();

            if (!data) {
                startTransition(() => { navigate('/login'); });
                return;
            }

            for (const item of data) {
                if (item.name.length > 15) {
                    item.name = item.name.substring(0, 15) + "...";
                }
            }
            setItems(data);
        }

        const cookies = document.cookie.split(';');

        if(!cookies){
            startTransition(() => { navigate('/login'); });
            return;
        }

        const userId = cookies.find(cookie => cookie.includes('user_id'));
        const vKey = cookies.find(cookie => cookie.includes('vKey'));
        
        if(userId && vKey){
            fetchItems(userId.split('=')[1], vKey.split('=')[1]);
        } else {
            startTransition(() => { navigate('/login'); });
            return;
        }

        GetUserInformation().then((user) => {
            if(!user) {
                startTransition(() => { navigate('/login'); });
                return;
            } else {
                const updatedUserData = {
                    name: user.name ?? "",
                    surname: user.surname ?? "",
                    email: user.email ?? "",
                    phone: user.phone ?? "",
                    address: user.address ?? "",
                    date_of_birth: user.date_of_birth ?? "",
                };
        
                setUserData(updatedUserData);

            }
        }
        );  

        if(action_id === "add"){
            setImportantMsg("Item added successfully");
        } else if(action_id === "edit"){
            setImportantMsg("Item edited successfully");
        } else if(action_id === "delete"){
            setImportantMsg("Item deleted successfully");
        }

        const timer = setTimeout(() => {
            setImportantMsg(false);
        }, 2000);  

        return () => {
            clearTimeout(timer);
        }
    }
    , [navigate, action_id]);

    useEffect(() => {
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, document.title, url.toString());
    }, []);

    return(

        <div>

            <Header headerRef={headerRef} logInRef={logInRef} loggedIn={loggedIn} />

            <div className={UserPageStyles["main-container"]} >

                <img src={user_svg} alt="Upload" className={UserPageStyles["user-image"]} />


                <div className={UserPageStyles["name-input-container"]}>
                    <label htmlFor="name" className={UserPageStyles["name-label"]}>Name:</label>
                    <input type="text" name="name" className={UserPageStyles["name-input"]} id="name" onKeyDown={HandleKeys} onBlur={inputAbort}
                    placeholder="set name" value = {UserData.name} onChange = {handleInputChange} ref={NameInputRef} disabled/>
                    <input type="button" value="EDIT" name = "edit-name" className={UserPageStyles["edit-name-button"]} onClick = {setUnlock} />
                </div>

                <div className={UserPageStyles["surname-input-container"]}>
                    <label htmlFor="surname" className={UserPageStyles["surname-label"]}>Surname:</label>
                    <input type="text" name="surname" className={UserPageStyles["surname-input"]} id="surname" onKeyDown={HandleKeys} onBlur={inputAbort} onChange={handleInputChange}
                    placeholder="set surname" value = {UserData.surname} ref={SurnameInputRef} disabled/>
                    <input type="button" value="EDIT" name = "edit-surname" className={UserPageStyles["edit-surname-button"]} onClick = {setUnlock} />
                </div>

                <div className={UserPageStyles["email-input-container"]}>
                    <label htmlFor="email" className={UserPageStyles["email-label"]}>E-mail:</label>
                    <input type="email" name="email" className={UserPageStyles["email-input"]} id="email" onKeyDown={HandleKeys} onBlur={inputAbort}
                    placeholder="set email" value = {UserData.email} onChange = {handleInputChange} ref={EmailInputRef} disabled/>
                </div>

                <div className={UserPageStyles["phone-input-container"]}>
                    <label htmlFor="phone" className={UserPageStyles["phone-label"]}>Phone number:</label>
                    <input type="tel" name="phone" className={UserPageStyles["phone-input"]} id="phone" onKeyDown={HandleKeys} onBlur={inputAbort}
                    placeholder="set phone number" value = {UserData.phone} onChange = {handleInputChange} ref={PhoneNumberInputRef} disabled/>
                    <input type="button" value="EDIT" name = "edit-phone" className={UserPageStyles["edit-phone-button"]} onClick = {setUnlock} />
                </div>

                <div className={UserPageStyles["address-input-container"]}>
                    <label htmlFor="address" className={UserPageStyles["address-label"]}>Address:</label>
                    <input type="text" name="address" className={UserPageStyles["address-input"]} id="address" onKeyDown={HandleKeys} onBlur={inputAbort}
                    placeholder="set address" value = {UserData.address} onChange = {handleInputChange} ref={AddressInputRef} disabled/>
                    <input type="button" value="EDIT" name = "edit-address" className={UserPageStyles["edit-address-button"]} onClick = {setUnlock} />
                </div>

                <div className={UserPageStyles["date_of_birth-input-container"]}>
                    <label htmlFor="date_of_birth" className={UserPageStyles["date_of_birth-label"]}>Date of birth:</label>
                    <input type="date" name="date_of_birth" className={UserPageStyles["date_of_birth-input"]} id="date_of_birth" onKeyDown={HandleKeys} onBlur={inputAbort}
                    placeholder="set date of birth" value = {UserData.date_of_birth} onChange = {handleInputChange} ref={DateOfBirthInputRef} disabled/>
                    <input type="button" value="EDIT" name = "edit-date-of-birth" className={UserPageStyles["edit-date-of-birth-button"]} onClick = {setUnlock} />
                </div>

                <div className={UserPageStyles["full-height-line"]}></div>

                <div className={UserPageStyles["user-items-label"]}>My items for sale</div>

                <div className={UserPageStyles["user-items-container"]}>
                    {items.map(item => createItem(item.id, item.image_path, item.name, item.price))}
                </div>

                <input type="submit" value="DONE" className={UserPageStyles["submit-button"]} onClick = {handleDoneClick} />
                <input type="submit" value="Log out" className={UserPageStyles["log-out-button"]} onClick = {handleLogOutClick} />
                <input type="button" value="Delete account" className={UserPageStyles["delete-button"]} onClick = {handleDeleteClick} />
                {isModerator && <Link to = "/moderator" className={UserPageStyles["moderator-button"]}>MODERATOR</Link>}
                <Link to = "/user/add-item" className={UserPageStyles["add-item-button"]}>ADD ITEM</Link>
                <Link to = "/user/chats" className={UserPageStyles["chat-button"]}>CHATS</Link>

                {importantMsg && <div className={UserPageStyles["important-message"]}>{importantMsg}</div>}

                {error && <div id="error" className={UserPageStyles['error']}>{error}</div>}


            </div>

        </div>
    );
}
export default UserPage;