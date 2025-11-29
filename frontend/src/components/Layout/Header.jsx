import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/auth'; 
import toast from 'react-hot-toast'; // For notifications

const Header = () => {
    const [auth, setAuth] = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu toggle
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for user dropdown toggle

    const handleLogout = () => {
        setAuth({
            user: null, 
            token: ''  
        });
        // Clear all relevant localStorage keys to ensure complete logout
        localStorage.removeItem('auth'); // If you store {user, token} under 'auth'
        localStorage.removeItem('auth_user_data'); // If you store just user data under 'auth_user_data'
        // You might have other keys, clear them here too if necessary

        toast.success("Logout Successfully");
        // No need to navigate here, as AuthContext will handle redirect if user is not authenticated
        // or you can explicitly navigate if desired: navigate('/login');
    };

    return (
        <header className=" navbar sticky fixed top-0 left-0 w-full bg-white shadow-md z-50 h-16 items-center justify-between">
            <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Brand Logo/Name */}
                <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition duration-300">
                    Resume-Master
                </Link>

                {/* Mobile Menu Toggler (Hamburger Icon) */}
                <div className="lg:hidden">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2"
                        aria-label="Toggle navigation"
                    >
                        {/* Hamburger or Close Icon */}
                        {isMenuOpen ? (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Navigation Links (Collapsible for Mobile) */}
                <div
                    className={`absolute top-full left-0 w-full bg-white shadow-lg lg:shadow-none lg:relative lg:flex lg:items-center lg:w-auto lg:top-auto ${
                        isMenuOpen ? 'block' : 'hidden'
                    }`}
                >
                    <ul className="flex flex-col lg:flex-row lg:ml-auto lg:space-x-4 p-4 lg:p-0">
                        <li className="nav-item mb-2 lg:mb-0">
                            <NavLink
                                to="/"
                                className="block text-gray-700 hover:text-blue-600 py-2 px-4 rounded-md transition duration-300"
                                onClick={() => setIsMenuOpen(false)} // Close menu on click
                            >
                                Home
                            </NavLink>
                            
                        </li>

                        {/* Conditional Rendering for Auth Links */}
                        {!auth.user ? (
                            <>
                                <li className="nav-item mb-2 lg:mb-0">
                                    <NavLink
                                        to="/register"
                                        className="block text-gray-700 hover:text-blue-600 py-2 px-4 rounded-md transition duration-300"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Register
                                    </NavLink>
                                </li>
                                <li className="nav-item mb-2 lg:mb-0">
                                    <NavLink
                                        to="/login"
                                        className="block text-gray-700 hover:text-blue-600 py-2 px-4 rounded-md transition duration-300"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </NavLink>
                                </li>
                            </>
                        ) : (
                            // User is logged in: Dropdown for User Name and Logout
                            <li className="relative nav-item">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center text-gray-700 hover:text-blue-600 py-2 px-4 rounded-md transition duration-300 focus:outline-none"
                                >
                                    {auth?.user?.name}
                                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <ul className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20">
                                        {/* Example Dashboard Link (uncomment if needed) */}
                                        <li>
                                            <NavLink
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                to={`/dashboard/${auth?.user?.role === 1 ? 'admin' : 'user'}`}
                                                onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                                            >
                                                Dashboard
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsDropdownOpen(false); // Close dropdown on click
                                                    setIsMenuOpen(false); // Close mobile menu too
                                                }}
                                                to="/"
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            >
                                                Logout
                                            </NavLink>
                                        </li>
                                    </ul>
                                )}
                            </li>
                        )}
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;
