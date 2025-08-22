const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const jwt = require('jsonwebtoken');
const { userHelpers } = require('../utils/prismaHelpers');
const { JWT_SECRET } = require('./jwt');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userHelpers.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user information from Google profile
        const { id, emails, name, photos } = profile;
        const email = emails[0].value;
        const fullName = `${name.givenName} ${name.familyName}`;
        const photo = photos && photos[0] ? photos[0].value : null;

        // Check if user already exists
        let user = await userHelpers.findByEmail(email);
        
        if (user) {
          // User exists, update Google ID if not set
          if (!user.googleId) {
            user = await userHelpers.updateById(user.id, {
              googleId: id,
              profileImage: photo || user.profileImage,
            });
          }
        } else {
          // Create new user
          // Note: We'll need to get school context from session or request
          // For now, we'll create the user without a school and handle it in the callback
          user = await userHelpers.create({
            googleId: id,
            name: fullName,
            email: email,
            profileImage: photo,
            role: 'student', // Default role
            isActive: true,
            // schoolId will be set later based on subdomain or user selection
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// LinkedIn OAuth Strategy
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: '/api/auth/linkedin/callback',
      scope: ['r_emailaddress', 'r_liteprofile'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user information from LinkedIn profile
        const { id, emails, name, photos } = profile;
        const email = emails[0].value;
        const fullName = `${name.givenName} ${name.familyName}`;
        const photo = photos && photos[0] ? photos[0].value : null;

        // Check if user already exists
        let user = await userHelpers.findByEmail(email);
        
        if (user) {
          // User exists, update LinkedIn ID if not set
          if (!user.linkedinId) {
            user = await userHelpers.updateById(user.id, {
              linkedinId: id,
              profileImage: photo || user.profileImage,
            });
          }
        } else {
          // Create new user
          user = await userHelpers.create({
            linkedinId: id,
            name: fullName,
            email: email,
            profileImage: photo,
            role: 'teacher', // Default role for LinkedIn users
            isActive: true,
            // schoolId will be set later based on subdomain or user selection
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
