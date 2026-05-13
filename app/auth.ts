import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import connectDB from "./lib/mongodb";
import { getUserModel, getOperatorModel } from "./lib/dynamicDb";
import bcrypt from "bcryptjs";

const mongoClient = new MongoClient(process.env.MONGODB_URI!);

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

        await connectDB();
        const email = (credentials.email as string).toLowerCase();
        
        // Check in Udhetaret (Users)
        const UserModel = getUserModel();
        let user = await UserModel.findOne({ email });
        let role = "user";

        // Check in Operatoret (Staff) if not found in Users
        let operator = null;
        if (!user) {
          const OperatorModel = getOperatorModel();
          operator = await OperatorModel.findOne({ email });
          if (operator) {
            role = (operator as any).role || "operator";
          }
        }

        if (!user && !operator) return null;

        const passwordHash = user ? user.password : (operator as any).password;
        const isMatch = await bcrypt.compare(credentials.password as string, passwordHash);
        if (!isMatch) return null;

        const userData = user || operator;
        // Update lastLogin for credentials login
        if (user) {
          await UserModel.findByIdAndUpdate(
            user._id,
            { lastLogin: new Date() },
            { new: true }
          );
        } else if (operator) {
          const OperatorModel = getOperatorModel();
          await OperatorModel.findByIdAndUpdate(
            operator._id,
            { lastLogin: new Date() },
            { new: true }
          );
        }
        return {
          id: (userData as any)._id.toString(),
          name: (userData as any).name,
          email: (userData as any).email,
          role: role,
          phone: (userData as any).phone,
          savedLocations: (userData as any).savedLocations,
          travelHistory: (userData as any).travelHistory,
          subscriptionPhoto: (userData as any).subscriptionPhoto,
          idNumber: (userData as any).idNumber,
          university: (userData as any).university,
          serialNumber: (userData as any).serialNumber,
          selectedLine: (userData as any).selectedLine,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token?.user) {
        session.user = token.user;
        // Update lastLogin in MongoDB
        try {
          await connectDB();
          const UserModel = getUserModel();
          await UserModel.findByIdAndUpdate(
            (token.user as any).id,
            { lastLogin: new Date() },
            { new: true }
          );
        } catch (err) {
          console.error('Error updating lastLogin:', err);
        }
      }
      return session;
    }
  },
  pages: {
    signIn: "/", // Since login is a modal/view in the main page
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
});
