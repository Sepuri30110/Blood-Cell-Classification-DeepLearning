import { Routes, Route, BrowserRouter } from "react-router-dom"
import { ToastContainer } from 'react-toastify';

import PrivateRoute from './PrivateRoutes/PrivateRoute';

import Home from "./Pages/Home/main"
import Auth from "./Pages/Authenticate/main"
import Dashboard from "./Pages/Dashboard/main";

import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/authenticate" element={<Auth />} />
        <Route element={<PrivateRoute/>}>
          <Route exact path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route exact path="*" element={<>404 Page Not Found</>} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
