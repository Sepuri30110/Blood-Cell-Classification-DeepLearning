import React from "react";
import "./main.css";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import Card from "./card";

function Home() {
    return (
        <div className="home">

            {/* NAVBAR */}
            <nav className="navbar">

                {/* LEFT SECTION */}
                <div className="navbar-left">
                    <img src={logo} alt="HemoVision Logo" className="logo-img" />

                    <div className="brand-container">
                        <div className="brand-name">HemoVision</div>
                        <div className="brand-tagline">
                            Microscopic Blood Cell Analysis Platform
                        </div>
                    </div>
                </div>

                {/* CENTER SECTION */}
                <div className="navbar-center">
                    <h1 className="project-title">
                        Multi-Class Classification of Blood Cell Types<br />
                        Through Image Recognition
                    </h1>
                </div>

                {/* RIGHT SECTION */}
                <ul className="navbar-right">
                    <li><Link to="/authenticate?type=signup">Signup</Link></li>
                    <li><Link to="/authenticate?type=login">Login</Link></li>
                </ul>
            </nav>

            {/* HERO SECTION */}
            <section className="hero">
                <video
                    className="hero-video"
                    src="/videos/background.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                />
                <div className="hero-overlay"></div>

                <div className="hero-content">
                    <h1>
                        Structured Classification of <br />
                        <span>Peripheral Blood Cells</span>
                    </h1>
                    <p>
                        A clinically inspired, image-based decision support system designed
                        to assist hematological analysis by delivering consistent,
                        reproducible interpretation of microscopic blood smear images.
                    </p>
                </div>

                {/* PROJECT INFO CARD */}
                <Card />
            </section>

        </div>
    );
}

export default Home;