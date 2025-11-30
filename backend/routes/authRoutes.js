import express from 'express';
import {registerController , loginController, currentUserController } from '../controllers/authControllers.js'; 
import { protect } from '../middlewares/authMiddlewares.js';

//route object
const router = express.Router()

//routing

//register || method post
router.post('/register',registerController);

//login
router.post('/login',loginController);

// Protected Route to get current user details
router.get('/current-user', protect, currentUserController);

export default router