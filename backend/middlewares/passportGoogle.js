import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "https://optiprofile-resumeanalyzer.onrender.com/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let email = profile.emails[0].value;

        let user = await userModel.findOne({ email });

        if (!user) {
          user = await userModel.create({
            name: profile.displayName,
            email: email,
            password: "google_oauth_user",
          });
        }

        const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        user.token = token;

        return done(null, user);
      } catch (error) {
        console.log("Google Auth Error:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const user = await userModel.findById(id);
  done(null, user);
});
