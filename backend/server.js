import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from "url";
import authRoutes from './routes/authRoutes.js'
import resumeRoutes from './routes/resumeRoutes.js'
import cors from 'cors'
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import userModel from './models/userModel.js';
import adminRoutes from './routes/adminRoutes.js';

// ⭐⭐⭐ ADD THIS LINE — YOUR MISSING FIX ⭐⭐⭐
import "./middlewares/passportGoogle.js";

dotenv.config();

//dbconfig
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// =====================
// CORS
// =====================
app.use(cors({
    origin: [
        process.env.FRONTEND_API,
        "http://localhost:5173",
    ],
    credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Session Middleware
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/auth', resumeRoutes);
app.use('/api/v1/auth', adminRoutes);

// ==============================
// GOOGLE ROUTES
// ==============================
app.get('/api/v1/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/v1/auth/google/callback',
    passport.authenticate('google'),
    (req, res) => {
        sendTokenResponse(req.user, 200, res);
        return res.redirect(process.env.FRONTEND_API);
    },
    (err, req, res, next) => {
        console.error("Passport authentication error:", err);
        res.status(500).send('Authentication failed');
    }
);

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
    };

    res.cookie('token', token, cookieOptions);
};

// Default route
app.get('/', (req, res) => {
    res.send({
        message: 'Welcome to Resume Master backend'
    })
})

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
