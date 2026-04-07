const pool = require("./db");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UAParser = require("ua-parser-js");
const getClientIp = require("../utils/getClientIp");
const getLocationFromIp = require("../utils/getLocationFromIp");

const initializePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const ip = getClientIp(req);
          const ip_location = await getLocationFromIp(ip);
          const parser = new UAParser(req.headers["user-agent"]);
          const os = parser.getOS().name || "Unknown";
          const browser = parser.getBrowser().name || "Unknown";

          const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
          );

          let user;

          if (existingUser.rows.length > 0) {
            const currentUser = existingUser.rows[0];
            await pool.query(
              `UPDATE users 
               SET last_login = NOW(), 
                   login_count = COALESCE(login_count, 0) + 1
               WHERE id = $1`,
              [currentUser.id]
            );
            user = currentUser;
          } else {
            const insertQuery = `
              INSERT INTO users (email, password, role, ip_location, os, browser_type, last_login, login_count)
              VALUES ($1, $2, $3, $4, $5, $6, NOW(), 1)
              RETURNING id, email
            `;
            const values = [
              email,
              "google-oauth",
              "user",
              ip_location,
              os,
              browser,
            ];
            const result = await pool.query(insertQuery, values);
            user = result.rows[0];
          }
          const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );

          done(null, { user, token });
        } catch (error) {
          console.error("Error in Google OAuth:", error);
          done(error, null);
        }
      }
    )
  );

  passport.serializeUser((data, done) => {
    done(null, data);
  });

  passport.deserializeUser((data, done) => {
    done(null, data);
  });
};

module.exports = { initializePassport, passport };
