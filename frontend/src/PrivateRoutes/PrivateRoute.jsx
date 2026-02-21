import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { errorToast } from '../helpers/toast'

function PrivateRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token.trim() === '') {
      errorToast("Not Authorized")
      navigate('/');
    }
  }, [navigate]);

  return (
    <>
      {localStorage.getItem('token') ? <Outlet /> : null}
    </>
  );
}

export default PrivateRoute
