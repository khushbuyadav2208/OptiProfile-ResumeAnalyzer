import express from 'express';
import { 
    registerController, 
    loginController, 
    currentUserController 
} from '../controllers/authControllers.js'; 

import { protect } from '../middlewares/authMiddlewares.js';

import passport from 'passport';
import "../middlewares/passportGoogle.js";  // IMPORTANT

const router = express.Router();

// ===============================
// 🌟 AUTH ROUTES
// ===============================

// REGISTER
router.post('/register', registerController);

// LOGIN
router.post('/login', loginController);

// CURRENT USER (PROTECTED)
router.get('/current-user', protect, currentUserController);

// ===============================
// 🌟 GOOGLE AUTH ROUTES
// ===============================

// STEP 1 — Redirect user to Google Login Page
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// STEP 2 — Google redirects back to your backend
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://lively-hotteok-bcdf61.netlify.app/Login",
  }),
  (req, res) => {
    const token = req.user.token;

    // Redirect user to frontend WITH TOKEN
    res.redirect(
      `https://lively-hotteok-bcdf61.netlify.app/?token=${token}`
    );
  }
);

export default router;
