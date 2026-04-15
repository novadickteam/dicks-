import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "dummy",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
      callbackURL: process.env.CALLBACK_URL || "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!db) {
           // Mock user for dev without DB
           return done(null, { id: 1, name: profile.displayName, email: profile.emails?.[0].value, role: "user" });
        }

        const email = profile.emails?.[0].value;
        if (!email) return done(new Error("No email found in Google profile"));

        const [existingUser] = await db.select().from(users).where(eq(users.email, email));

        if (existingUser) {
          return done(null, existingUser);
        }

        // Create new user if doesn't exist
        const [newUser] = await db
          .insert(users)
          .values({
            name: profile.displayName,
            email: email,
            password: "google_account", // No password needed for OAuth users
            avatar: profile.photos?.[0].value,
            role: "user",
          })
          .returning();

        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    if (!db) return done(null, { id, name: "Google User", role: "user" });
    const [user] = await db.select().from(users).where(eq(users.id, id));
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
