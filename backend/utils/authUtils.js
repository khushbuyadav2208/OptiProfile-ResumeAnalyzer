import JWT from 'jsonwebtoken';

export const setJwtCookie = (user, res) => {
    // const token = user.getSignedJwtToken(); // Assuming this method exists on your User model
    const token = JWT.sign({_id:user._id},process.env.JWT_SECRET,{
            expiresIn:"7d",}
        );
    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // e.g., 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax', // Adjust as needed, 'None' for cross-domain but requires secure:true
    };

    res.cookie('token', token, cookieOptions)
};