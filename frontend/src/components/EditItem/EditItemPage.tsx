/*
 * Project: IIS project - Garage sale website
 * @file EditItemPage.js

 * @brief ReactJS component of page for editing item

 * @author Neonila Mashlai - xmashl00
*/

import React, {useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fixElementHeight, Contacts, checkLogin, Header, GetItem, API_BASE_URL, uploadImage } from "../Utils";
import img_svg from "../images/photo_img.svg";
import EditItemPageStyles from "./EditItemPage.module.css";
import "../GlobalStyles.css";

const EditItemPage: React.FC = () => {

    const headerRef = useRef<HTMLDivElement>(null);
    const logInRef = useRef<HTMLAnchorElement>(null);
    const loggedIn = useRef<HTMLAnchorElement>(null);

    const PriceInputRef = useRef<HTMLInputElement>(null);
    const NameInputRef = useRef<HTMLInputElement>(null);
    const SizeInputRef = useRef<HTMLInputElement>(null);
    const DescriptionInputRef = useRef<HTMLTextAreaElement>(null);
    
    const uploadContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef(null);
    const [error, setError] = useState('');

    const location = useLocation();

    const [ItemData, setItemData] = useState({
        name: "",
        description: "",
        price: "",
        size: "",
        conditionId: "",
        categoryId: "",
        image_path: "",
    });

    const setUnlock = (e : React.MouseEvent<HTMLInputElement>) => {
        e.preventDefault();

        const target = e.target as HTMLInputElement;

        if(PriceInputRef.current && NameInputRef.current && SizeInputRef.current && DescriptionInputRef.current){
            if(target.name === "edit-Price"){
                PriceInputRef.current.disabled = false;
                PriceInputRef.current.focus();
            } else if(target.name === "edit-Name"){
                NameInputRef.current.disabled = false;
                NameInputRef.current.focus();
            } else if(target.name === "edit-Size"){
                SizeInputRef.current.disabled = false;
                SizeInputRef.current.focus();
            } else if(target.name === "edit-Description"){
                DescriptionInputRef.current.disabled = false;
                DescriptionInputRef.current.focus();
            }
        }
    }

    const inputAbort = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.preventDefault();
        e.target.disabled = true;
    }

    const HandleKeys = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if(e.key === "Enter"){
            e.preventDefault();
            (e.target as HTMLInputElement | HTMLTextAreaElement).disabled = true;
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setItemData({
            ...ItemData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFiles = (file : File) => {
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(URL.createObjectURL(file));
            if (uploadContainerRef.current) {
                uploadContainerRef.current.style.background = 'none';
            }
            setFile(file);
        } else {
            setError('File type not supported');
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        handleFiles(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) handleFiles(file); 
    };

    const handleClick = () => {
        if (fileInputRef.current) (fileInputRef.current as HTMLInputElement).click();
    };

    const EditItem = async (e: React.MouseEvent<HTMLInputElement>) => {
        e.preventDefault();
        const target = e.target as HTMLInputElement;
        target.disabled = true;
        const queryParams = new URLSearchParams(location.search);
        const item_id = queryParams.get('item_id');
        const user_id = document.cookie.split(';').find(cookie => cookie.includes('user_id'));
        const vKey = document.cookie.split(';').find(cookie => cookie.includes('vKey'));
        if (!user_id || !vKey) {
            setError('User not found');
            navigate('/login');
            return;
        }

        if (!item_id) {
            setError('Item not found');
            navigate('/');
            return;
        }

        if(target.value === "DONE" && selectedFile){
            let responseUrl: string | { url: string } | null = "";
            if(selectedFile.includes('imgur')){
                responseUrl = {url: selectedFile};
            }else if (file) {
                const result = await uploadImage(file);
                responseUrl = result ? result : null;
                if(!responseUrl){
                    setError('Failed to upload image');
                    return;
                }
            }

            const image_path = typeof responseUrl === 'object' && responseUrl !== null ? responseUrl.url : responseUrl;

            if (!image_path) {
                setError('Failed to upload image');
                return;
            }

            const data = {
                item_id: parseInt(item_id),
                name: ItemData.name,
                description: ItemData.description,
                price: parseFloat(ItemData.price),
                size: ItemData.size,
                conditionId: ItemData.conditionId,
                categoryId: ItemData.categoryId,
                image_path: image_path,
                author_id: parseInt(user_id.split('=')[1]),
                vKey: vKey.split('=')[1],
            };

            try {
                const response = await fetch(API_BASE_URL + "/item/update", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    navigate('/profile?action_id=edit');
                } else if (response.status === 401) {
                    setError("Unauthorized");
                    target.disabled = false;
                } else if (response.status === 404) {
                    setError("Item not found");
                    target.disabled = false;
                } else if (response.status === 500) {
                    setError("Server error");
                    target.disabled = false;
                } else {
                    throw new Error('Something went wrong');
                }

            } catch (error) {
                console.error('Error:', error);
                setError('An error occurred while editing item');
                target.disabled = false;
            }
        } else if(target.value === "DELETE"){
            try {
                const response = await fetch(API_BASE_URL + "/item/delete", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({item_id: item_id, 
                        vKey: vKey.split('=')[1],
                        author_id: parseInt(user_id.split('=')[1])})
                });

                if (response.ok) {
                    navigate('/profile?action_id=delete');
                } else if (response.status === 401) {
                    setError("Unauthorized");
                    target.disabled = false;
                } else if (response.status === 404) {
                    setError("Item not found");
                    target.disabled = false;
                } else if (response.status === 500) {
                    setError("Server error");
                    target.disabled = false;
                } else {
                    target.disabled = false;
                    throw new Error('Something went wrong');
                }

            } catch (error) {
                console.error('Error:', error);
                setError('An error occurred while deleting item');
                target.disabled = false;
            }
        }
    };

    useEffect(() => {

        if (headerRef.current) {
            fixElementHeight(headerRef.current);
        }

        const queryParams = new URLSearchParams(location.search);
        const item_id = queryParams.get('item_id');

        if (!item_id) {
            navigate('*');
            return;
        }

        GetItem(item_id).then((data) => {
            if(data){
                setItemData({
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    size: data.size,
                    conditionId: data.condition_id,
                    categoryId: data.category_id,
                    image_path: data.image_path,
                });
                if(data.image_path){
                    setSelectedFile(data.image_path);
                    if (uploadContainerRef.current) {
                        uploadContainerRef.current.style.background = 'none';
                    }
                }
                const cookies = document.cookie.split(';');
                const userId = cookies.find(cookie => cookie.includes('user_id'))
                if(userId){
                    if(parseInt(userId.split('=')[1]) !== data.author_id){
                        setTimeout(() => {
                            navigate('/');
                        }, 100);
                    }
                } else {
                    setTimeout(() => {
                        navigate('/login');
                    }, 100);
                }


            } else {
                setError("Item not found");
            }
        });

        const verifyLoginStatus = async () => {
            await checkLogin(loggedIn, logInRef).then((result) => {
                if (!result) {
                    navigate('/login');
                } else if (result === "admin") {
                    navigate('/');
                }
            });
        };

        if(logInRef.current && loggedIn.current){
            verifyLoginStatus();
        }

    }
    , [navigate, headerRef, logInRef, loggedIn, location]);

    return (
        <div>

            <Header headerRef={headerRef} logInRef={logInRef} loggedIn={loggedIn} />

            <div className={EditItemPageStyles["main-container"]} >
                <div onDragOver={handleDragOver} onDrop={handleDrop} 
                onClick={handleClick} className={EditItemPageStyles['image-upload-container']} 
                ref = {uploadContainerRef}>

                    {selectedFile ? (

                        <img src={selectedFile} alt="Preview" className={EditItemPageStyles["image-preview"]}/>

                    ) : (
                        <>

                            <img src={img_svg} alt="Upload" className={EditItemPageStyles["image-upload-icon"]} />

                        </>
                    )}

                    <input
                        type="file"
                        onChange={handleChange}
                        accept=".jpg,.jpeg,.png"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                    />

                </div>

                <div className={EditItemPageStyles["price-input-container"]}>
                    <label htmlFor="price" className={EditItemPageStyles["price-label"]}>Price:</label>
                    <input type="text" name="price" className={EditItemPageStyles["price-input"]} id="price" 
                    placeholder="Set new item price" value = {ItemData.price} onChange = {handleInputChange} ref={PriceInputRef} onKeyDown = {HandleKeys} onBlur = {inputAbort} disabled/>
                    <input type="button" value="EDIT" name = "edit-Price" className={EditItemPageStyles["edit-button-price"]} onClick = {setUnlock} />
                </div>

                <div className={EditItemPageStyles["name-input-container"]}>
                    <label htmlFor="name" className={EditItemPageStyles["name-label"]}>Name:</label>
                    <input type="text" name="name" className={EditItemPageStyles["name-input"]} id="name" 
                    placeholder="Add new item naming here..." value = {ItemData.name} onChange = {handleInputChange} ref = {NameInputRef} onKeyDown = {HandleKeys} onBlur = {inputAbort} disabled/>
                    <input type="button" value="EDIT" name = "edit-Name" className={EditItemPageStyles["edit-button-name"]} onClick = {setUnlock} />
                </div>

                <div className={EditItemPageStyles["size-input-container"]}>
                    <label htmlFor="size" className={EditItemPageStyles["size-label"]}>Size:</label>
                    <input type="text" name="size" className={EditItemPageStyles["size-input"]} id="size" 
                    placeholder="Add new item size here..." value = {ItemData.size} onChange = {handleInputChange} ref = {SizeInputRef} onKeyDown = {HandleKeys} onBlur = {inputAbort} disabled/>
                    <input type="button" value="EDIT" name = "edit-Size" className={EditItemPageStyles["edit-button-size"]} onClick = {setUnlock} />
                </div>

                <div className={EditItemPageStyles["condition-input-container"]}>
                    <label htmlFor="condition" className={EditItemPageStyles["condition-label"]}>Condition:</label>
                    <select name="conditionId" className={EditItemPageStyles["condition-input"]} id="condition" 
                    value={ItemData.conditionId} onChange = {handleInputChange}>
                        <option value="-none-">--none--</option>
                        <option value="new">Brand new</option>
                        <option value="likeNew">Like new</option>
                        <option value="gentlyUsed">Gently used</option>
                        <option value="used">Used</option>
                        <option value="vintage">Vintage or retro</option>
                        <option value="forParts">For parts or repair</option>
                    </select>
                </div>

                <div className={EditItemPageStyles["category-input-container"]}>
                    <label htmlFor="category" className={EditItemPageStyles["category-label"]}>Category:</label>
                    <select name="categoryId" className={EditItemPageStyles["category-input"]} id="category"
                    value={ItemData.categoryId} onChange = {handleInputChange}>
                        <option value="-none-">--none--</option>
                        <optgroup label="Men">
                            <option value="menClothing">Clothing</option>
                            <option value="menShoes">Shoes</option>
                            <option value="menAccessories">Accessories</option>
                            <option value="menBags">Bags and Luggage</option>
                            <option value="menJewelry">Jewelry and watches</option>
                            <option value="menVintage">Vintage and collectibles</option>
                        </optgroup>
                        <optgroup label="Women">
                            <option value="womenClothing">Clothing</option>
                            <option value="womenShoes">Shoes</option>
                            <option value="womenAccessories">Accessories</option>
                            <option value="womenBags">Bags and Luggage</option>
                            <option value="womenJewelry">Jewelry and watches</option>
                            <option value="womenVintage">Vintage and collectibles</option>
                        </optgroup>
                        <optgroup label="Kids">
                            <option value="kidsClothing">Clothing</option>
                            <option value="kidsShoes">Shoes</option>
                            <option value="kidsAccessories">Accessories</option>
                            <option value="kidsBags">Bags and Luggage</option>
                            <option value="kidsToys">Toys</option>
                            <option value="kidsEducational">Educational and craft supplies</option>
                        </optgroup>
                    </select>
                </div>

                <div className={EditItemPageStyles["description-input-container"]}>
                    <label htmlFor="description" className={EditItemPageStyles["description-label"]}>Description:</label>
                    <textarea name="description" className={EditItemPageStyles["description-input"]} id="description" 
                    placeholder="Add new item description here..." value = {ItemData.description} onChange = {handleInputChange} ref = {DescriptionInputRef} onBlur = {inputAbort} disabled/>
                    <input type="button" value="EDIT" name = "edit-Description" className={EditItemPageStyles["edit-button-description"]} onClick = {setUnlock} />
                </div>

                <input type="submit" value="DONE" className={EditItemPageStyles["submit-button"]} onClick = {EditItem} />
                <input type="submit" value="DELETE" className={EditItemPageStyles["delete-button"]} onClick = {EditItem} />
                {error && <div className={EditItemPageStyles["error"]}>{error}</div>}

            </div>

            <Contacts />

        </div>
    );
}

export default EditItemPage;   
