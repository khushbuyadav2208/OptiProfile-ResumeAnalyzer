import UserSkills from '../models/userSkills.js';
import User from '../models/userModel.js'; 

export const searchCandidatesBySkills = async (req, res) => {
    try {
        const { skills } = req.query; 

        if (!skills) {
            return res.status(400).json({ success: false, message: 'Please provide skills to search for.' });
        }

        const searchSkillsArray = skills.split(',').map(s => s.trim().toLowerCase());

        const allUserSkills = await UserSkills.find({});

        const candidates = [];

        for (const userSkillProfile of allUserSkills) {
            const matchedSkills = userSkillProfile.skills.filter(skill =>
                searchSkillsArray.includes(skill)
            );

            if (matchedSkills.length > 0) {
                // Fetch user details (name) from the User model
                const user = await User.findById(userSkillProfile.user).select('name'); 

                if (user) {
                    candidates.push({
                        userId: userSkillProfile.user,
                        userName: user.name,
                        userEmail: userSkillProfile.userEmail,
                        matchedSkills: matchedSkills,
                        matchedSkillsCount: matchedSkills.length,
                        highestAtsScore: userSkillProfile.highestAtsScore,
                        lastUpdated: userSkillProfile.lastUpdated,
                    });
                }
            }
        }

        // Sort candidates:
        candidates.sort((a, b) => {
            if (b.matchedSkillsCount !== a.matchedSkillsCount) {
                return b.matchedSkillsCount - a.matchedSkillsCount;
            }
            return b.highestAtsScore - a.highestAtsScore;
        });

        res.status(200).json({
            success: true,
            message: 'Candidates retrieved successfully.',
            candidates: candidates,
        });

    } catch (error) {
        console.error('Error searching candidates:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to search candidates on the server.'
        });
    }
};