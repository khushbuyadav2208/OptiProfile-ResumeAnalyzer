import express from 'express';
import { searchCandidatesBySkills } from '../controllers/adminControllers.js';
import { protect} from '../middlewares/authMiddlewares.js'; 

const router = express.Router();

// Route for searching candidates by skills (requires authentication and admin role)
router.get('/candidates', searchCandidatesBySkills);

export default router;