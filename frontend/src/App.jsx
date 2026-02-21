import { Routes, Route, BrowserRouter } from "react-router-dom"
import { ToastContainer } from 'react-toastify';

import PrivateRoute from './PrivateRoutes/PrivateRoute';

import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<>Home Page</>} />
        <Route exact path="/login" element={<>Login Page</>} />
        <Route exact path="/signup" element={<>Signup Page</>} />
        <Route element={<PrivateRoute/>}>
          <Route exact path="/user" element={<>User Page</>} />
          <Route exact path="/profile" element={<>Profile Page</>} />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
