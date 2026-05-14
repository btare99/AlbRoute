import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import connectDB from "./lib/mongodb";
import { getUserModel, getOperatorModel } from "./lib/dynamicDb";
import bcrypt from "bcryptjs";

const mongoClient = new MongoClient(process.env.MONGODB_URI!);

const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(mongoClient as any),
  providers: [
    GoogleProvider({
      clientId: process.env.NEXTAUTH_GOOGLE_ID || "",
      clientSecret: process.env.NEXTAUTH_GOOGLE_SECRET || "",
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
          // Make API call to Render backend for authentication
          const response = await fetch(`${getBaseUrl()}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const userData = await response.json();
          return {
            id: userData.user.id,
            name: userData.user.name,
            email: userData.user.email,
            role: userData.user.role,
            phone: userData.user.phone,
            savedLocations: userData.user.savedLocations,
            travelHistory: userData.user.travelHistory,
            subscriptionPhoto: userData.user.subscriptionPhoto,
            idNumber: userData.user.idNumber,
            university: userData.user.university,
            serialNumber: userData.user.serialNumber,
            selectedLine: userData.user.selectedLine,
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
          // Create or update user via backend API
          const response = await fetch(`${getBaseUrl()}/api/auth/google-signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
            }),
          });

          if (!response.ok) {
            console.error('Failed to create/update Google user');
            return false;
          }

          const userData = await response.json();
          // Store backend user data in the user object for JWT callback
          (user as any).backendData = userData.user;
        } catch (error) {
          console.error('Google sign-in error:', error);
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
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
});
