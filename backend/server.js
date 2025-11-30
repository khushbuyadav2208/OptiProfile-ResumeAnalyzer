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
import adminRoutes from './routes/adminRoutes.js'

dotenv.config();// load env variables 
//dbconfig
connectDB();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();


// =====================
// CORS FIX (CHANGE #1)
// =====================
app.use(cors({
    origin: [
        process.env.FRONTEND_API,   // Netlify URL from .env
        "http://localhost:5173"      // Local development
    ],
    credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
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
app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/auth',resumeRoutes);
app.use('/api/v1/auth',adminRoutes);

// ==============================
// GOOGLE STRATEGY (NO CHANGE)
// ==============================
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,

    // Callback URL comes from Render ENV (DO NOT CHANGE HERE)
    callbackURL: process.env.GOOGLE_CALLBACK_URL,

    scope: ['profile', 'email'] 
},

async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value; 

        let user = await userModel.findOne({ googleId: profile.id });

        if (user) {
            console.log("User found by Google ID:", user.email);
            return done(null, user); 
        }

        user = await userModel.findOne({ email });

        if (user) {
            console.log("User found by email (linking Google ID):", user.email);
            user.googleId = profile.id;
            user.profilePicture = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : user.profilePicture; 
            await user.save();
            return done(null, user); 
        }

        else {
            user = new userModel({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
            });
            await user.save();
            done(null, user);
        }
    } catch (error) {
        done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken(); 

    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax', 
    };
    
    res.cookie('token', token, cookieOptions)
};


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

        // ============================
        // FRONTEND REDIRECT FIX (CHANGE #3)
        // ============================
        return res.redirect(process.env.FRONTEND_API);

    },
    (err, req, res, next) => {
        console.error("Passport authentication error:", err);
        res.status(500).send('Authentication failed');
    }
);

//rest api
app.get('/',(req,res)=>{
    res.send({
        message:'Welcome to Resume Master backend'
    })
})

const port = process.env.port || 8080;

app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
});
