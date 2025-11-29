import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js'; 

export const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log("Auth: Token found in Authorization header.");
    }
    
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
        console.log("Auth: Token found in HTTP-only cookie.");
    }

    if (!token) {
        console.log("Auth: No token found. Access denied.");
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Auth: Token decoded:", decoded);

        req.user = await userModel.findById(decoded.id).select('-password');

        if (!req.user) {
            console.log("Auth: User not found for provided token ID.");
            return res.status(401).json({
                success: false,
                message: 'Not authorized, user not found for this token.'
            });
        }

        next(); 
    } catch (error) {
        console.error("Auth: Token verification failed:", error);
        // If token is invalid or expired
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token failed or expired.'
        });
    }
};