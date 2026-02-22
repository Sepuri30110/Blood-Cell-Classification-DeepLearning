import React from "react";

const Header = ({ currentTime, title, subtitle }) => {
    return (
        <div className="header-row">
            <div>
                <div className="page-title">{title}</div>
                <div className="page-subtitle">{subtitle}</div>
            </div>

            <div className="datetime-box">
                {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
            </div>
        </div>
    );
};

export default Header;
