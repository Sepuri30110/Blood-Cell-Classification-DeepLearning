import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import { getPreviousPage } from "../../helpers/auth";
import {errorToast} from "../../helpers/toast"
import "./main.css";

// Environment variables
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost";
const PORT = import.meta.env.VITE_PORT || "9001";
const ENDPOINT = import.meta.env.VITE_ENDPOINT || "api";

console.log("Environment Variables:", { SERVER_URL, PORT, ENDPOINT });

function Auth() {

    const navigate = useNavigate();

    // Read URL query parameter to set initial mode
    const getInitialMode = () => {
        const params = new URLSearchParams(window.location.search);
        const type = params.get("type");
        return type === "signup" ? "signup" : "login";
    };

    const [mode, setMode] = useState(getInitialMode());
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({});

    /* ================= CHECK FOR EXISTING TOKEN ================= */
    useEffect(() => {
        const checkExistingAuth = () => {
            const localStorageToken = localStorage.getItem('token');

            // If token exists in localStorage, redirect back
            if (localStorageToken) {
                console.log('User already authenticated, redirecting...');
                // Get the previous page or default to dashboard
                const previousPage = getPreviousPage();
                navigate(previousPage, { replace: true });
            }
        };

        checkExistingAuth();
    }, [navigate]);

    /* ================= SYNC MODE WITH URL ================= */
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const type = params.get("type");
        if (type === "signup" || type === "login") {
            setMode(type);
        }
    }, []);

    // Function to change mode and update URL
    const changeMode = (newMode) => {
        setMode(newMode);
        setErrors({});
        const newUrl = `${window.location.pathname}?type=${newMode}`;
        window.history.pushState({}, '', newUrl);
    };

    /* ================= FORM HANDLERS ================= */

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value
        });
        // Clear error for this field when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    /* ================= VALIDATION ================= */

    const validateForm = () => {
        const newErrors = {};

        // Username validation
        if (!form.username.trim()) {
            newErrors.username = "Username required";
        } else if (form.username.length < 3) {
            newErrors.username = "Minimum 3 characters";
        }

        // Email validation (only for signup)
        if (mode === "signup") {
            if (!form.email.trim()) {
                newErrors.email = "Email required";
            } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
                newErrors.email = "Invalid email format";
            }
        }

        // Password validation
        if (!form.password.trim()) {
            newErrors.password = "Password required";
        } else if (form.password.length < 8) {
            newErrors.password = "Minimum 8 characters";
        }

        // Confirm password validation (only for signup)
        if (mode === "signup") {
            if (!form.confirmPassword) {
                newErrors.confirmPassword = "Please confirm password";
            } else if (form.confirmPassword !== form.password) {
                newErrors.confirmPassword = "Passwords do not match";
            }
        }

        return newErrors;
    };

    /* ================= SUBMIT HANDLER ================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const validationErrors = validateForm();
        
        // If there are errors, set them and stop
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Clear errors if validation passed
        setErrors({});

        try {
            // Prepare data for API
            const apiData = {
                username: form.username,
                password: form.password
            };

            // Add email if signup mode
            if (mode === "signup") {
                apiData.email = form.email;
            }

            // Make API request
            const endpoint = mode === "login" ? "login" : "signup";
            const apiUrl = `${SERVER_URL}:${PORT}/${ENDPOINT}/auth/${endpoint}`;
            console.log("API URL:", apiUrl);
            
            const response = await axios.post(apiUrl,apiData,{
                    withCredentials: true // Enable sending/receiving cookies
                }
            );

            // Handle success
            console.log("Response:", response.data);
            
            // Store token in localStorage
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                console.log("Token stored in localStorage:", localStorage.getItem('token'));
            }

            // Defer navigation to next event loop tick to ensure localStorage has persisted
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (error) {
            console.error("Error:", error);
            
            // Handle error response
            if (error.response?.data?.message) {
                errorToast(error.response.data.message);
            } else {
                alert(
                    mode === "login"
                        ? "Login failed. Please try again."
                        : "Signup failed. Please try again."
                );
            }
        }
    };


    /* ================= UI ================= */
    return (

        <div className="auth">
            <div className="auth-container">
            {/* ================= LEFT 45% ================= */}
            <div className="auth-left background-image">
                {/* Back Button */}
                <div
                    className="back-home-btn"
                    onClick={() => window.location.href = "/"}
                >
                    ← Back
                </div>

                <div className="left-content">
                    <h1>HemoVision AI</h1>
                    <p>
                        Advanced Blood Cell Classification Platform
                        engineered for modern healthcare ecosystems.
                    </p>
                </div>
            </div>



            {/* ================= RIGHT 55% ================= */}

            <div className="auth-right">
                <div className="auth-card">
                    <h2>
                        {mode === "login"
                            ? "Login Form"
                            : "Signup Form"}
                    </h2>

                    {/* Toggle */}
                    <div className="toggle-container">

                        <button
                            className={
                                mode === "login"
                                    ? "active"
                                    : ""
                            }
                            onClick={() => changeMode("login")}
                            type="button"
                        >
                            Login
                        </button>

                        <button
                            className={
                                mode === "signup"
                                    ? "active"
                                    : ""
                            }
                            onClick={() => changeMode("signup")}
                            type="button"
                        >
                            Signup
                        </button>
                    </div>
                    {/* FORM */}

                    <form onSubmit={handleSubmit} noValidate>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                        />

                        {errors.username && (
                            <span className="error">
                                {errors.username}
                            </span>
                        )}

                        {mode === "signup" && (
                            <>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={form.email}
                                    onChange={handleChange}
                                />

                                {errors.email && (
                                    <span className="error">
                                        {errors.email}
                                    </span>
                                )}
                            </>
                        )}

                        <div className="password-field">
                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                            />

                            <span
                                className="show-btn"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                {showPassword
                                    ? <FiEyeOff />
                                    : <FiEye />}
                            </span>
                        </div>

                        {errors.password && (
                            <span className="error">
                                {errors.password}
                            </span>
                        )}

                        {mode === "signup" && (
                            <>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                />
                                {errors.confirmPassword && (
                                    <span className="error">
                                        {
                                            errors.confirmPassword
                                        }
                                    </span>
                                )
                                }
                            </>
                        )}

                        {mode === "login" && (
                            <div className="forgot">
                                Forgot password?
                            </div>
                        )}

                        <button
                            type="submit"
                            className="submit-btn"
                        >
                            {mode === "login"
                                ? "Login"
                                : "Signup"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
        </div>
    );
}

export default Auth;