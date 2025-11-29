import toast,{Toaster} from 'react-hot-toast';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const BACKEND_URL =  import.meta.env.VITE_BACKEND_API 

    const handleGoogleRegister = () => {
        window.location.href = `${BACKEND_URL}/api/v1/auth/google`;
    };

     const handleTraditionalRegister =async (e)=>{
        e.preventDefault();
        try{
            const res=await axios.post
            (`${import.meta.env.VITE_BACKEND_API}/api/v1/auth/register`,
                {name,email,password}
            );
            if(res.data.success){
                toast.success(res.data.message);
                navigate('/login');
            }
            else{
                toast.error(res.data.message);
                console.log(res.data.message);
            }
        }catch(error){
            console.log(error)
            toast.error("Something went wrong");
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Join Resume Master!</h2>

                {/* Google OAuth Button */}
                <button 
                    onClick={handleGoogleRegister}
                    className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out mb-6"
                >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M44.5 20H24V28.5H35.5C34.7 32.7 32.1 35.8 28.1 38.2L28.1 38.3L34.6 43.1C38.9 39.2 41.8 33.7 43.4 27.5L44.5 20Z" fill="#4285F4"/>
                        <path d="M24 44C30.6 44 36.2 41.8 40.5 38.2L34.6 33.3C32.1 34.9 29.2 36 26 36C20.9 36 16.5 32.7 14.8 27.9L14.7 27.9L8.1 32.8C10.7 37.9 16.8 41.5 24 44Z" fill="#34A853"/>
                        <path d="M8.1 32.8L14.7 27.9C13.2 23.1 13.2 17.9 14.7 13.1L14.8 13.1L8.1 8.2C5.5 13.3 4 18.6 4 24C4 29.4 5.5 34.7 8.1 39.8L8.1 32.8Z" fill="#FBBC05"/>
                        <path d="M24 8C27.6 8 30.9 9.3 33.5 11.7L39.8 5.4C35.8 1.9 30.2 0 24 0C16.8 0 10.7 3.5 8.1 8.6L14.7 13.5C16.5 8.7 20.9 5.4 26 5.4C29.2 5.4 32.1 6.5 34.6 8.1L24 8Z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                </button>

                <div className="relative flex items-center justify-center mb-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500">Or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* Traditional Registration Form */}
                <form onSubmit={handleTraditionalRegister}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            placeholder="your@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm italic mb-4 text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-indigo-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-300 ease-in-out"
                    >
                        Register
                    </button>
                </form>

                <p className="text-center text-gray-600 text-sm mt-6">
                    Already have an account?{' '}
                    <button
                        onClick={() => navigate('/login')} 
                        className="text-blue-600 hover:underline font-semibold focus:outline-none"
                    >
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Register;