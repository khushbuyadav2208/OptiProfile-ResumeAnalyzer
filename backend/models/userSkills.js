import mongoose from 'mongoose';

const userSkills = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, 
    },
    userEmail: {
        type: String,
        required: true,
        unique: true, 
    },
    skills: [{ 
        type: String,
        lowercase: true,
        trim: true,
    }],
    highestAtsScore: {
        type: Number,
        default: 0,
    },
    experience:{
        type: Number,
        default: 0,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

export default mongoose.model('userSkills', userSkills);