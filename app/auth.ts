import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from "./lib/mongodb";
import connectDB from "./lib/mongodb";
import { getUserModel, getOperatorModel } from "./lib/dynamicDb";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.NEXTAUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.NEXTAUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          await connectDB();
          const User = getUserModel();
          const Operator = getOperatorModel();

          const emailStr = (credentials.email as string).toLowerCase();

          let user = await User.findOne({ email: emailStr });
          let role = 'user';

          if (!user) {
            user = await Operator.findOne({ email: emailStr });
            role = (user as any)?.role || 'operator';
          }

          if (!user || !user.password) return null;

          const isMatch = await bcrypt.compare(credentials.password as string, user.password);
          if (!isMatch) return null;

          // Update lastLogin
          user.lastLogin = new Date();
          await user.save();

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: role,
            phone: user.phone,
            savedLocations: user.savedLocations || { home: '', work: '' },
            travelHistory: user.travelHistory || [],
            subscriptionPhoto: user.subscriptionPhoto,
            idNumber: user.idNumber,
            university: user.university,
            serialNumber: user.serialNumber,
            selectedLine: user.selectedLine,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Handle Google OAuth user data
        if ((user as any).backendData) {
          token.user = {
            id: (user as any).backendData.id,
            name: user.name,
            email: user.email,
            role: (user as any).backendData.role,
            phone: (user as any).backendData.phone,
            savedLocations: (user as any).backendData.savedLocations,
            travelHistory: (user as any).backendData.travelHistory,
            subscriptionPhoto: (user as any).backendData.subscriptionPhoto,
            idNumber: (user as any).backendData.idNumber,
            university: (user as any).backendData.university,
            serialNumber: (user as any).backendData.serialNumber,
            selectedLine: (user as any).backendData.selectedLine,
          };
        } else {
          // Handle credentials login
          token.user = user;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token?.user) {
        session.user = token.user;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign-in
      if (account?.provider === "google") {
        try {
          await connectDB();
          const User = getUserModel();

          const emailStr = user.email?.toLowerCase();
          if (!emailStr) return false;

          let existingUser = await User.findOne({ email: emailStr });

          if (!existingUser) {
            existingUser = await User.create({
              name: user.name,
              email: emailStr,
              image: user.image,
              savedLocations: { home: '', work: '' },
              travelHistory: [],
              createdAt: new Date()
            });
          }

          // Store backend user data in the user object for JWT callback
          (user as any).backendData = {
            id: existingUser._id.toString(),
            role: 'user',
            phone: existingUser.phone,
            savedLocations: existingUser.savedLocations || { home: '', work: '' },
            travelHistory: existingUser.travelHistory || [],
            subscriptionPhoto: existingUser.subscriptionPhoto,
            idNumber: existingUser.idNumber,
            university: existingUser.university,
            serialNumber: existingUser.serialNumber,
            selectedLine: existingUser.selectedLine,
          };
        } catch (error) {
          console.error('Google sign-in DB error:', error);
          return false;
        }
      }
      return true;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/", // Since login is a modal/view in the main page
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
});
