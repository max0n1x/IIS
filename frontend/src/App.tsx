/*
 * Project: IIS project - Garage sale website
 * @file App.js

 * @brief root ReactJS component of the website(routing)

 * @author Neonila Mashlai - xmashl00
*/

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage/LoginPage';
import RegisterPage from './components/RegisterPage/RegisterPage';
import HomePage from './components/HomePage/HomePage';
import UserPage from './components/UserPage/UserPage';
import KidsCategoriesPage from './components/Categories/KidsCategories';
import MenCategoriesPage from './components/Categories/MenCategories';
import WomenCategoriesPage from './components/Categories/WomenCategories';
import ItemPage from './components/ItemPage/ItemPage';
import ItemsList from './components/ItemsList/ItemsList';
import AddItemPage from './components/AddItem/AddItemPage';
import EditItemPage from './components/EditItem/EditItemPage';
import ChatsPage from './components/Chats/ChatsPage'
import VerifyPage from './components/MailVerify/VerifyPage';
import ForgotPasswordPage from './components/ForgotPassword/ForgotPasswordPage';
import ChangePasswordPage from './components/ChangePassword/ChangePasswordPage';
import AdminPage from './components/Admin/AdminPage';
import ResetPasswordPage from './components/ResetPassword/ResetPasswordPage';
import ModeratorPage from './components/Moderator/ModeratorPage';
import Page404 from './components/ErrorPages/Page404';
import './components/GlobalStyles.css';
import './App.css';


const App = () => {
  return (
    <BrowserRouter
    // remove warning about deprecation
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<UserPage />} />
        <Route path="/men" element={<MenCategoriesPage />} />
        <Route path="/women" element={<WomenCategoriesPage />} /> 
        <Route path="/kids" element={<KidsCategoriesPage />} />
        <Route path="/items" element={<ItemsList />} /> 
        <Route path="/user/add-item" element={<AddItemPage />} />
        <Route path="/user/edit-item" element={<EditItemPage />} />
        <Route path="/item" element={<ItemPage />} />
        <Route path="/user/chats" element={<ChatsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/moderator" element={<ModeratorPage />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

