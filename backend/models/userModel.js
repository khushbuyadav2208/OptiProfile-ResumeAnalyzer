import mongoose from "mongoose";
import JWT from 'jsonwebtoken'

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    googleId: { type: String, unique: true, sparse: true },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true, 
        lowercase: true, 
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },

    password: {
        type: String,
     
    },

    oauth_provider: {
        type: String,
        enum: ['google', null], 
        default: null
    },
    oauth_provider_id: {
        type: String,
        sparse: true, 
        required: function() {
            return this.oauth_provider !== null;
        }
    },
    profilePicture: {
        type: String, 
        default: null
    },
    role:{
        type:Number,
        default:0//user //  1 for admin
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true 
});

UserSchema.methods.getSignedJwtToken = function() {
    return JWT.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: 7 + 'd',
    });
};

export default mongoose.model('User', UserSchema);