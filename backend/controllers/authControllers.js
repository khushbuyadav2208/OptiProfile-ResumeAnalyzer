import userModel from "../models/userModel.js";
import { hashPassword } from "../helpers/authHelper.js";
import { comparePassword } from "../helpers/authHelper.js";
import { setJwtCookie } from "../utils/authUtils.js";

export const registerController = async(req,res)=>{
    try{
        const {name,email,password}=req.body;
        //validation
        if(!name){
            return res.send({message:"name is required"});
        }
        if(!email){
            return res.send({message:"email is required"});
        }
        if(!password){
            return res.send({message:"password is required"});
        }

        //check user
        const existinguser = await userModel.findOne({email});
        //existing user
        if(existinguser){
            return res.status(200).send({
                success:false,
                message:"already resgistered user"
            })
        }

        //register user
        const hashedPassword=await hashPassword(password);
        //save
        // console.log(hashedPassword);
        const user = await new userModel({name,email,password:hashedPassword}).save()

        res.status(201).send({
            success:true,
            message:"user registered successfully",
            user,
        });
    }
    catch(error){
        console.log(error);
        res.send(500).send({
            success:false,
            message:"error in registration",
            error,
        });
    }
};

export const loginController = async(req,res)=>{
    try{
        const {email,password}=req.body;
        //validation
        if(!email || !password){
            return res.status(404).send({
                success:false,
                message:'invalid email or password'
            })
        }

        //check user
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(404).send({
                success:false,
                message:"email is not registered"
            })
        }
        // console.log(password);
        // console.log(user);
        const match = await comparePassword(password,user.password);

        if(!match){
            return res.status(200).send({
                success:false,
                message:"invalid password"
            })
        }

        setJwtCookie(user, res);

        res.status(200).send({
            success:true,
            message:'login successfully',
            user:{
                name:user.name,
                email:user.email,
            },
            
        })
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:"error in login",
            error
        })
    }
};


export const currentUserController = async (req, res) => {
    if (!req.user) {
        return res.status(404).json({
            success: false,
            message: 'User data not found after authentication.'
        });
    }
    res.status(200).json({
        success: true,
        message: 'Current user data fetched successfully.',
        user: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role:req.user.role,
            profilePicture: req.user.profilePicture || null,
        }
    });
};