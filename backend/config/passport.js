import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error('No email from Google'), null);

    // Check if user exists by googleId or email
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        // Link Google to existing email account
        user.googleId = profile.id;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          role: 'patient',
        });
      }
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

export default passport;
