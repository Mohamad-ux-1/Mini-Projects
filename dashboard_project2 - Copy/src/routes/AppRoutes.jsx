import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Dashboard from '../pages/Dashboard.jsx';
import Analytics from '../pages/Analytics';
import Notes from '../pages/Notes.jsx';
import ProductModeration from '../pages/Products.jsx';
import Settings from '../pages/Settings';
import CreateAdminAccount from '../pages/CreateAdminAccount';
import useFetch from "../hooks/useFetch.js";
import FAQPage from "../pages/FAQPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import ForgotPasswordPage from "../pages/ForgotPasswordPage.jsx";
import Orders from "../pages/Orders.jsx";
import OurPro from '../pages/OurPro.jsx';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true' || sessionStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const AppRoutes = ({ mode, toggleTheme }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true' || sessionStorage.getItem('isAuthenticated') === 'true';
    return (
        <Routes>
            <Route path="/login" element={<LoginPage mode={mode} toggleTheme={toggleTheme} />} />
            <Route path="/create-admin-account" element={<CreateAdminAccount mode={mode} toggleTheme={toggleTheme} />} />
            <Route path="/forgetpassword" element={<ForgotPasswordPage />} />

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <MainLayout mode={mode} toggleTheme={toggleTheme} />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="orders" element={<Orders />} />
                <Route path="ourproducts" element={<OurPro />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="notes" element={<Notes />} />
                <Route path="team" element={<ProductModeration/>} />
                <Route path="faq" element={<FAQPage />} />
                <Route path="settings" element={<Settings />} />

                <Route path="*" element={<Navigate to="/analytics" replace />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
