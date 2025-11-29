import express from 'express';
import multer from 'multer'; 
import { analyzeResumeController } from '../controllers/resumeControllers.js'; 
import { protect } from '../middlewares/authMiddlewares.js';

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post('/resume/analyze',protect, upload.single("resume"), analyzeResumeController);

export default router;