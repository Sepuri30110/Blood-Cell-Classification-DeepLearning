import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../helpers/auth";
import { successToast, errorToast } from "../../helpers/toast";
import logo from "../../assets/logo.png";

const Sidebar = ({ activePage, onPageChange }) => {
    const navigate = useNavigate();

    const navItems = [
        { id: "dashboard", label: "Dashboard" },
        { id: "predict", label: "Predict" },
        { id: "history", label: "History" },
        { id: "models", label: "Models Summary" }
    ];

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await logout();
            successToast("Logged out successfully");
            // Redirect to authenticate page
            navigate('/authenticate');
        } catch (error) {
            console.error('Logout error:', error);
            errorToast("Logout failed. Please try again.");
        }
    };

    return (
        <aside className="sidebar">
            <div>
                <div className="navbar-left">
                    <img src={logo} alt="Logo" className="logo-img" />
                    <div>
                        <div className="brand-name">HemoVision</div>
                        <div className="brand-tagline">
                            Microscopic Blood Cell Analysis Platform
                        </div>
                    </div>
                </div>

                <nav className="nav">
                    {navItems.map((item) => (
                        <a
                            key={item.id}
                            className={`nav-link ${activePage === item.id ? "active" : ""}`}
                            onClick={(e) => {
                                e.preventDefault();
                                onPageChange(item.id);
                            }}
                            href="#"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="sidebar-bottom">
                <a className="nav-link logout-link" href="#" onClick={handleLogout}>Logout</a>
            </div>
        </aside>
    );
};

export default Sidebar;
