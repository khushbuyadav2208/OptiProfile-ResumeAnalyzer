import { useState } from 'react';
import './App.css';
import { BrowserRouter,Routes,Route } from "react-router-dom";
import Login from './pages/Auth/login';
import Register from './pages/Auth/Register';
import HomePage from './pages/user/HomePage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard'; 
import { Toaster } from 'react-hot-toast';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <BrowserRouter>
     <Toaster/>
      <Routes>
        
        <Route path="/" element={<HomePage/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/dashboard/admin' element={<AdminDashboard/>} ></Route>
        <Route path='/dashboard/user' element={<UserDashboard/>} ></Route>
        
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
