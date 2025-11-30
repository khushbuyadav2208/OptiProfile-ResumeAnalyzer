import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/userModel.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await userModel.findOne({ googleId: profile.id });

        if (!user) {
          user = await userModel.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            await user.save();
          } else {
            user = await userModel.create({
              name: profile.displayName,
              email: email,
              googleId: profile.id,
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await userModel.findById(id);
  done(null, user);
});

export default passport;
