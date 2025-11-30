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
import session from 'express-session';
import "./middlewares/passportGoogle.js";      // IMPORTANT
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

// Database
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

/* -----------------------------------------
   ✅ FIXED CORS CONFIGURATION (MAIN ISSUE)
-------------------------------------------- */
app.use(cors({
    origin: [
        process.env.FRONTEND_API,                 // Netlify
        "http://localhost:5173"                   // Local dev
    ],
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middlewares
app.use(express.json());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

/* -----------------------------------------
   Sessions (Required for Passport)
-------------------------------------------- */
app.use(
    session({
        secret: process.env.JWT_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        }
    })
);

/* -----------------------------------------
   Passport
-------------------------------------------- */
app.use(passport.initialize());
app.use(passport.session());

/* -----------------------------------------
   API Routes
-------------------------------------------- */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/auth", resumeRoutes);
app.use("/api/v1/auth", adminRoutes);

/* -----------------------------------------
   Google Auth Routes
-------------------------------------------- */
app.get(
    "/api/v1/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
    "/api/v1/auth/google/callback",
    passport.authenticate("google", { failureRedirect: process.env.FRONTEND_API }),
    (req, res) => {
        // Google successful → set Token
        const token = req.user.getSignedJwtToken();

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        // Redirect to frontend
        return res.redirect(process.env.FRONTEND_API);
    }
);

/* -----------------------------------------
   Root Route
-------------------------------------------- */
app.get("/", (req, res) => {
    res.send({ message: 'Welcome to Resume Master backend' });
});

/* -----------------------------------------
   Server
-------------------------------------------- */
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
