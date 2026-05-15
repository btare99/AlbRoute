import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from "./lib/mongodb";
import connectDB from "./lib/mongodb";
import { getUserModel, getOperatorModel } from "./lib/dynamicDb";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("authorize: missing credentials");
          return null;
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        try {
          await connectDB();

          const UserModel     = getUserModel();
          const OperatorModel = getOperatorModel();

          // 1. Look in passengers collection first
          let dbUser: any = await UserModel.findOne({ email });
          let role = "user";

          // 2. Fall back to staff/operators collection
          if (!dbUser) {
            dbUser = await OperatorModel.findOne({ email });
            if (dbUser) role = dbUser.role ?? "operator";
          }

          if (!dbUser) {
            console.log("authorize: user not found →", email);
            return null;
          }

          if (!dbUser.password) {
            console.log("authorize: account has no password (OAuth account?)");
            return null;
          }

          const passwordOk = await bcrypt.compare(password, dbUser.password);
          if (!passwordOk) {
            console.log("authorize: wrong password for →", email);
            return null;
          }

          // Update last login (non-blocking)
          UserModel.findByIdAndUpdate(dbUser._id, { lastLogin: new Date() }).catch(() => {});

          console.log("authorize: success →", email, "role:", role);

          return {
            id:                dbUser._id.toString(),
            name:              dbUser.name,
            email:             dbUser.email,
            role,
            phone:             dbUser.phone             ?? "",
            savedLocations:    dbUser.savedLocations    ?? { home: "", work: "" },
            travelHistory:     dbUser.travelHistory     ?? [],
            subscriptionPhoto: dbUser.subscriptionPhoto ?? null,
            idNumber:          dbUser.idNumber          ?? null,
            university:        dbUser.university        ?? null,
            serialNumber:      dbUser.serialNumber      ?? null,
            selectedLine:      dbUser.selectedLine      ?? null,
          };
        } catch (err) {
          console.error("authorize error:", err);
          return null;
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    // Persist extra fields into the JWT token
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id               = (user as any).id;
        token.role             = (user as any).role             ?? "user";
        token.phone            = (user as any).phone            ?? "";
        token.savedLocations   = (user as any).savedLocations   ?? { home: "", work: "" };
        token.travelHistory    = (user as any).travelHistory    ?? [];
        token.subscriptionPhoto= (user as any).subscriptionPhoto?? null;
        token.idNumber         = (user as any).idNumber         ?? null;
        token.university       = (user as any).university       ?? null;
        token.serialNumber     = (user as any).serialNumber     ?? null;
        token.selectedLine     = (user as any).selectedLine     ?? null;

        // For Google sign-in, look up or create the user in our own DB
        if (account?.provider === "google") {
          try {
            await connectDB();
            const UserModel = getUserModel();
            const emailStr  = user.email!.toLowerCase();

            let dbUser = await UserModel.findOne({ email: emailStr });
            if (!dbUser) {
              dbUser = await UserModel.create({
                name:           user.name,
                email:          emailStr,
                savedLocations: { home: "", work: "" },
                travelHistory:  [],
              });
            }

            token.id            = dbUser._id.toString();
            token.role          = "user";
            token.phone         = dbUser.phone          ?? "";
            token.savedLocations= dbUser.savedLocations ?? { home: "", work: "" };
          } catch (err) {
            console.error("jwt google upsert error:", err);
          }
        }
      }

      // Allow client-side session updates
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }: any) {
      session.user = {
        id:                token.id,
        name:              token.name,
        email:             token.email,
        image:             token.picture,
        role:              token.role,
        phone:             token.phone,
        savedLocations:    token.savedLocations,
        travelHistory:     token.travelHistory,
        subscriptionPhoto: token.subscriptionPhoto,
        idNumber:          token.idNumber,
        university:        token.university,
        serialNumber:      token.serialNumber,
        selectedLine:      token.selectedLine,
      };
      return session;
    },
  },

  pages: {
    signIn: "/",
    error:  "/",
  },

  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
});
