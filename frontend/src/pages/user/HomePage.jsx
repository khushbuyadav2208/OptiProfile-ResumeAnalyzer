import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/auth';

const HomePage = () => {
    // State for form inputs
    const [resumeFile, setResumeFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [jobTitle, setJobTitle] = useState('');

    // State for API response and loading
    const [analysisResult, setAnalysisResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [auth, setAuth] = useAuth();

    const BACKEND_URL = import.meta.env.VITE_BACKEND_API;

    // Handler for file input change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setResumeFile(file);
            setError(''); 
        } else {
            setResumeFile(null);
            setError('Please upload a valid PDF file.');
            toast.error('Please upload a valid PDF file.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setAnalysisResult('');

        if(!auth || !auth.user){
            toast.error("Please login to continue");
            return ;
        }
        if (!resumeFile) {
            setError('Please upload your resume PDF.');
            toast.error('Please upload your resume PDF.');
            return;
        }
        if (!jobDescription.trim()) {
            setError('Please provide a job description.');
            toast.error('Please provide a job description.');
            return;
        }
        if (!jobTitle.trim()) {
            setError('Please provide a job title.');
            toast.error('Please provide a job title.');
            return;
        }

        setLoading(true); 

        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('jobDescription', jobDescription);
        formData.append('jobTitle', jobTitle);

        try {

            const response = await axios.post(`${BACKEND_URL}/api/v1/auth/resume/analyze`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
                withCredentials: true,
            });

            if (response.data.success) {
                setAnalysisResult(response.data.analysis || 'No analysis provided.');
                toast.success('Resume analyzed successfully!');
            } else {
                setError(response.data.message || 'Analysis failed.');
                toast.error(response.data.message || 'Analysis failed.');
            }
        } catch (err) {
            console.error('Error during resume analysis:', err);
            const errorMessage = err.response?.data?.message || 'Failed to connect to the server or analyze resume.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false); // End loading state
        }
    };

    return (
        <Layout>
        <div className="container mx-auto p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="bg-white shadow-xl rounded-2xl p-6 md:p-10 lg:p-12 w-full max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-12 transition-all duration-300 ease-in-out max-h-screen overflow-hidden">

                {/* Left Column: Input Form */}
                <div className="w-full lg:w-1/2 space-y-6 overflow-y-auto">
                    <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-6">
                        Resume <span className="text-gray-900">Analyzer</span>
                    </h1>
                    <p className="text-gray-600 text-center mb-8">
                        Upload your resume, provide a job description, and get instant feedback!
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Resume PDF Upload */}
                        <div>
                            <label htmlFor="resumeFile" className="block text-lg font-semibold text-gray-700 mb-2">
                                Upload Resume (PDF only)
                            </label>
                            <input
                                type="file"
                                id="resumeFile"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {resumeFile && (
                                <p className="text-sm text-gray-500 mt-2">Selected: {resumeFile.name}</p>
                            )}
                        </div>

                        {/* Job Title Input */}
                        <div>
                            <label htmlFor="jobTitle" className="block text-lg font-semibold text-gray-700 mb-2">
                                Job Title
                            </label>
                            <input
                                type="text"
                                id="jobTitle"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                placeholder="e.g., Senior Software Engineer"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                required
                            />
                        </div>

                        {/* Job Description Textarea */}
                        <div>
                            <label htmlFor="jobDescription" className="block text-lg font-semibold text-gray-700 mb-2">
                                Job Description
                            </label>
                            <textarea
                                id="jobDescription"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                rows="8"
                                placeholder="Paste the full job description here..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-y"
                                required
                            ></textarea>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <p className="text-red-600 text-center font-medium">{error}</p>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-bold text-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
                            disabled={loading} // Disable button while loading
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analyzing...
                                </span>
                            ) : (
                                'Analyze Resume'
                            )}
                        </button>
                    </form>
                </div>

                {/* Right Column: Analysis Result */}
                <div className="w-full lg:w-1/2 p-6 bg-blue-50 rounded-xl shadow-inner flex flex-col">
                    <h2 className="text-3xl font-bold text-grey-800 text-center mb-6">
                        Analysis <span className="text-gray-900">Results</span>
                    </h2>
                    {loading && analysisResult === '' && (
                        <p className="text-center text-blue-600 text-lg">
                            Your resume is being analyzed. This may take a moment...
                        </p>
                    )}
                    {analysisResult ? (
                      
                        <div className="prose max-w-none text-gray-800 leading-relaxed overflow-y-auto flex-grow">
                            {/* Eligibility and ATS Score */}
                            <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-lg shadow-md mb-6">
                                <div className="text-center md:text-left mb-4 md:mb-0">
                                    <h3 className="text-xl font-bold text-gray-800">Eligibility: <span className="text-blue-700">{analysisResult.is_eligible}</span></h3>
                                </div>

                                {/* ATS Score Circle */}
                                <div
                                    className="relative w-24 h-24 rounded-full flex items-center justify-center font-bold text-xl text-gray-800 bg-gray-200 shadow-inner"
                                    style={{
                                        background: `conic-gradient(
                                            #22c55e 0% ${analysisResult.ats_score}%,
                                            #e5e7eb ${analysisResult.ats_score}% 100%
                                        )`
                                    }}
                                >
                                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                                        ATS:{analysisResult.ats_score}<span className="text-sm"></span>
                                    </div>
                                </div>
                            </div>

                            {/* Strengths */}
                            {analysisResult.strengths && analysisResult.strengths.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-2">Strengths:</h4>
                                    <ul className="list-disc list-inside ml-4 space-y-1">
                                        {analysisResult.strengths.map((item, index) => (
                                            <li key={`strength-${index}`}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Weaknesses */}
                            {analysisResult.weaknesses && analysisResult.weaknesses.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-2">Weaknesses:</h4>
                                    <ul className="list-disc list-inside ml-4 space-y-1">
                                        {analysisResult.weaknesses.map((item, index) => (
                                            <li key={`weakness-${index}`}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Skill Gaps */}
                            {analysisResult.skill_gaps && analysisResult.skill_gaps.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-2">Skill Gaps:</h4>
                                    <ul className="list-disc list-inside ml-4 space-y-1">
                                        {analysisResult.skill_gaps.map((item, index) => (
                                            <li key={`skill-gap-${index}`}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {analysisResult.skill_gaps && analysisResult.skill_gaps.length === 0 && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-2">Skill Gaps:</h4>
                                    <p className="text-gray-600">No significant skill gaps identified based on the provided job description.</p>
                                </div>
                            )}

                            {/* missing_keywords */}
                            {analysisResult.missing_keywords && analysisResult.missing_keywords.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-2">Missing keywords:</h4>
                                    <ul className="list-disc list-inside ml-4 space-y-1">
                                        {analysisResult.missing_keywords.map((item, index) => (
                                            <li key={`link-${index}`}>
                        
                                                    {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                             {analysisResult.links_to_learn_skills && analysisResult.links_to_learn_skills.length === 0 && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-2">Links to Learn Skills:</h4>
                                    <p className="text-gray-600">No specific learning links suggested at this time.</p>
                                </div>
                            )}


                            {/* 5 Steps to Make Your Resume Stand Out */}
                            {analysisResult.five_steps_to_stand_out && analysisResult.five_steps_to_stand_out.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-2">5 Steps to Make Your Resume Stand Out:</h4>
                                    <ol className="list-decimal list-inside ml-4 space-y-1">
                                        {analysisResult.five_steps_to_stand_out.map((item, index) => (
                                            <li key={`step-${index}`}>{item}</li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                        </div>
                    ) : (
                        !loading && (
                            <p className="text-center text-gray-500 text-lg mt-4">
                              Your results would be shown here after analyses
                            </p>
                        )
                    )}
                    {error && analysisResult === '' && !loading && (
                        <p className="text-red-600 text-center font-medium mt-4 ">
                            Please check the form again or try again after sometime.
                        </p>
                    )}
                </div>
            </div>
        </div>
        </Layout>
    );
};

export default HomePage;
