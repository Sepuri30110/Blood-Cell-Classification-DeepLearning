import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import { errorToast } from '../helpers/toast';
import { clearAuth, savePreviousPage } from '../helpers/auth';

// Environment variables
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost";
const PORT = import.meta.env.VITE_PORT || "9001";
const ENDPOINT = import.meta.env.VITE_ENDPOINT || "api";

function PrivateRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateAuthentication = async () => {
      try {
        // Save current page before redirecting
        savePreviousPage(location.pathname);

        // Step 1: Check localStorage for token
        const localStorageToken = localStorage.getItem('token');
        
        if (!localStorageToken || localStorageToken.trim() === '') {
          errorToast("Not Authorized - Please login");
          clearAuth();
          navigate('/authenticate?type=login', { replace: true });
          return;
        }

        // Step 2: Validate with backend (backend will check httpOnly cookie)
        const response = await axios.post(
          `${SERVER_URL}:${PORT}/${ENDPOINT}/validate-token`,
          { token: localStorageToken },
          {
            withCredentials: true // Send httpOnly cookies with request
          }
        );

        if (response.data.success) {
          // Token is valid
          setIsAuthenticated(true);
        } else {
          errorToast("Invalid session - Please login again");
          clearAuth();
          navigate('/authenticate?type=login', { replace: true });
        }

      } catch (error) {
        console.error('Authentication validation error:', error);
        
        if (error.response?.status === 401) {
          errorToast(error.response.data.message || "Session expired");
        } else {
          errorToast("Authentication failed - Please login");
        }
        
        clearAuth();
        navigate('/authenticate?type=login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    validateAuthentication();
  }, [navigate, location]);

  // Show loading state while validating
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Validating authentication...
      </div>
    );
  }

  // Render protected content if authenticated
  return isAuthenticated ? <Outlet /> : null;
}

export default PrivateRoute
