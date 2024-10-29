import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "@utils/database";
import User from "@models/user";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async session({ session }) {
      // Ensure the database connection is established
      await connectToDB();

      const sessionUser = await User.findOne({
        email: session.user.email,
      });

      if (sessionUser) {
        session.user.id = sessionUser._id.toString(); // Attach the user ID to the session
      }

      return session;
    },

    async signIn({ profile }) {
      try {
        console.log("Connecting to DB...");
        await connectToDB(); // Ensure you connect to the DB here

        console.log("Checking for user...");
        const userExists = await User.findOne({ email: profile.email });
        console.log("User exists:", userExists);

        // If user doesn't exist, create one
        if (!userExists) {
          console.log("Creating new user with:", {
            email: profile.email,
            username: profile.name.replace(" ", "").toLowerCase(),
          });

          // Create a new user
          const newUser = await User.create({
            email: profile.email,
            username: profile.name.replace(" ", "").toLowerCase(),
            image: profile.picture,
          });

          console.log("User created successfully:", newUser);
        }

        return true; // Sign-in is successful
      } catch (error) {
        console.error("Sign-in error:", error);
        return false; // Sign-in failed
      }
    },
  },
});

export { handler as GET, handler as POST };
