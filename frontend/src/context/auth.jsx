import { useState, useContext, createContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        user: null,
        token: "",
    });

    axios.defaults.withCredentials = true;

    axios.defaults.baseURL = import.meta.env.VITE_BACKEND_API;

    useEffect(() => {
        if (auth.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [auth.token]); 

    useEffect(() => {
        const checkAuthStatus = async () => {
            let userFromLocalStorage = null;

            const storedUserData = localStorage.getItem('auth_user_data');
            if (storedUserData) {
                try {
                    userFromLocalStorage = JSON.parse(storedUserData);
                    setAuth(prevAuth => ({
                        ...prevAuth, 
                        user: userFromLocalStorage, 
                    }));
                    console.log("Auth: User data partially initialized from localStorage.");
                } catch (e) {
                    console.error("Auth: Error parsing localStorage 'auth_user_data':", e);
                    localStorage.removeItem('auth_user_data'); 
                }
            }

            try {
                const { data } = await axios.get('/api/v1/auth/current-user'); 

                if (data?.success && data?.user) {
                    console.log("Auth: Backend validation successful. User is authenticated.");
                    setAuth(prevAuth => ({
                        user: data.user,
                        token: prevAuth.token || "", 
                    }));
                    localStorage.setItem('auth_user_data', JSON.stringify(data.user));
                } else {
                    console.log("Auth: Backend validation failed. Clearing auth state.");
                    setAuth({ user: null, token: "" }); 
                    localStorage.removeItem('auth_user_data');
                    localStorage.removeItem('auth');
                }
            } catch (error) {
                console.error("Auth: Backend auth validation failed:", error.response?.data?.message || error.message);
                setAuth({ user: null, token: "" });
                localStorage.removeItem('auth_user_data');
                localStorage.removeItem('auth');
            }
        };

        checkAuthStatus();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    return (
        <AuthContext.Provider value={[auth, setAuth]}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };