import fs from 'fs/promises'; 
import PdfParse from 'pdf-parse-new';
import axios from 'axios';
import userSkills from '../models/userSkills.js';

export const analyzeResumeController = async (req, res) => {

    if (!req.file || !req.body.jobDescription || !req.body.jobTitle) {
        return res.status(400).json({ success: false, message: 'Missing resume file, job description, or job title.' });
    }
                                                                                                                                       
    const { jobDescription, jobTitle } = req.body;
    const resumePath = req.file.path; 
    // console.log(resumePath);

    const userId = req.user._id; 
    const userEmail = req.user.email;
    console.log(userId);
    console.log(userEmail);

    let resumeText = '';
    try {
        const dataBuffer = await fs.readFile(resumePath);
        resumeText = (await PdfParse(dataBuffer)).text;
        // console.log(resumeText);
        
        if (!resumeText.trim()) {
            return res.status(400).json({ success: false, message: 'Could not extract text from the PDF. Please ensure it is not an image-only PDF.' });
        }

        // Prompt for Gemini API
        const prompt = `You are an expert resume analyst. Your task is to evaluate a candidate's
        resume against a specific job description and title. Provide a comprehensive analysis in 
        JSON format, strictly following the provided schema.
        
        ---
        Job Title: ${jobTitle}

        Job Description:
        ${jobDescription}

        ---
        Candidate's Resume Text:
        ${resumeText}
        `;

        console.log("Sending prompt to Gemini API...");
        
        const apiKey = process.env.GEMINI_API_KEY; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],

            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: { 
                type: "OBJECT",
                properties:{
                is_eligible: {
                    type: "STRING",
                    description: "A string indicating if the candidate is eligible for the job (e.g., 'Eligible', 'Potentially Eligible', 'Not Eligible','Can Not Determine')."
                },
                ats_score: {
                    type: "NUMBER",
                    description: "An ATS (Applicant Tracking System) score out of 100, indicating how well the resume matches the job description based on keywords and formatting."
                },
                strengths: {
                    type: "ARRAY",
                    items: { type: "STRING" },
                    description: "An array of bullet points highlighting the resume's strengths relevant to the job."
                },
                weaknesses: {
                    type: "ARRAY",
                    items: { type: "STRING" },
                    description: "An array of bullet points highlighting the resume's weaknesses or gaps compared to the job description."
                },
                
                skill_gaps: {
                    type: "ARRAY",
                    items: { type: "STRING" },
                    description: "An array of specific skills mentioned in the job description that are missing or not clearly evident in the resume."
                },
                missing_keywords: {
                    type: "ARRAY",
                    items: { type: "STRING" },
                    description: " An array of strings, containing all missing keywords (eg: skills,techstack,soft skills,tools etc.) , keywords must be of one words. Give as many keywords you found (max 20)"
                },
                five_steps_to_stand_out: {
                    type: "ARRAY",
                    items: { type: "STRING" },
                    description: "An array of 5 actionable steps the candidate can follow right now to make their resume stand out for this job description."
                },
                extracted_skills: {
                type: "ARRAY",
                items: { type: "STRING" },
                description: "A comprehensive list of all technical and soft skills explicitly mentioned or strongly implied in the candidate's resume, normalized to common terms (e.g., 'React.js' to 'React', 'Node.js' to 'Node')."
                },
                    },
                propertyOrdering: [
                    "is_eligible",
                    "ats_score",
                    "strengths",
                    "weaknesses",
                    "skill_gaps",
                    "missing_keywords",
                    "five_steps_to_stand_out"
                ]
                },
            }
        };

        const response = await fetch(apiUrl, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        let geminiAnalysis = 'No analysis provided by AI.';
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            geminiAnalysis = result.candidates[0].content.parts[0].text;
        } else {
            console.error('Gemini API response structure unexpected:', JSON.stringify(result, null, 2));
            throw new Error('Server overload. Please try again after sometime.');
        }

        geminiAnalysis = JSON.parse(geminiAnalysis);
        console.log(geminiAnalysis);
        console.log("333333333333333333333333");
        const { extracted_skills, ats_score } = geminiAnalysis;

        const normalizedSkills = Array.isArray(extracted_skills)
            ? extracted_skills.map(skill => String(skill).toLowerCase().trim())
            : [];

        let UserSkills = await userSkills.findOne({ user: userId });

        if (UserSkills) {
            UserSkills.skills = [...new Set([...UserSkills.skills, ...normalizedSkills])];
            UserSkills.highestAtsScore = Math.max(UserSkills.highestAtsScore, ats_score);
            UserSkills.lastUpdated = Date.now();
        } else {
            UserSkills = new userSkills({
                user: userId,
                userEmail: userEmail,
                skills: normalizedSkills,
                highestAtsScore: ats_score,
                lastUpdated: Date.now(),
            });
        }
        console.log(UserSkills.userEmail);
        console.log(UserSkills.skills);
        console.log(UserSkills.highestAtsScore);
        console.log("00000000000000000000");

        await UserSkills.save();

        res.status(200).json({
            success: true,
            message: 'Resume analysis complete.',
            analysis: geminiAnalysis,
        });

    } catch (error) {
        console.error('Backend analysis error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to analyze resume on the server. Please check backend logs.'
        });
    } finally {
        if (resumePath) {
            await fs.unlink(resumePath).catch(err => console.error('Error deleting temp file:', err));
        }
    }
};

// Do NOT include any text outside the JSON object. 

//         The JSON schema requires the following properties:
//         - "is_eligible": A string ('Eligible', 'Potentially Eligible', 'Not Eligible').
//         - "ats_score": A number (0-100).
//         - "strengths": An array of strings (bullet points).
//         - "weaknesses": An array of strings (bullet points).
//         - "extracted_skills": A comprehensive list of all technical and soft skills explicitly mentioned or strongly implied in the candidate's resume, normalized to common terms (e.g., 'React.js' to 'React', 'Node.js' to 'Node').
//         - "skill_gaps": An array of strings (missing skills).
//         - "missing_keywords": An array of strings.
//         - "five_steps_to_stand_out": An array of 5 strings (actionable steps).

//         Ensure all arrays are populated with relevant information. (must)

//         Also if you are not able to identify something, give a reason to the user why you can not identify something. 
//         make the response to fulfil user expectations. Always ensure every key in json object is populated 
