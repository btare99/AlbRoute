import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import connectDB from "./lib/mongodb";
import { getUserModel, getOperatorModel } from "./lib/dynamicDb";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // NO adapter — we manage our own DB with Mongoose.
  // JWT strategy is self-contained and does not need MongoDBAdapter.
  providers: [
    Google({
      clientId:     process.env.NEXTAUTH_GOOGLE_ID     ?? process.env.GOOGLE_CLIENT_ID     ?? "",
      clientSecret: process.env.NEXTAUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email    = (credentials?.email    as string | undefined)?.toLowerCase().trim();
        const password = (credentials?.password as string | undefined);

        if (!email || !password) return null;

        try {
          await connectDB();

          const UserModel     = getUserModel();
          const OperatorModel = getOperatorModel();

          // Search in passengers first, then staff
          let dbUser: any = await UserModel.findOne({ email }).lean();
          let role = "user";

          if (!dbUser) {
            dbUser = await OperatorModel.findOne({ email }).lean();
            if (dbUser) role = dbUser.role ?? "operator";
          }

          if (!dbUser || !dbUser.password) {
            console.log("[Auth] User not found or no password:", email);
            return null;
          }

          const ok = await bcrypt.compare(password, dbUser.password);
          if (!ok) {
            console.log("[Auth] Wrong password for:", email);
            return null;
          }

          console.log("[Auth] Login success:", email, "role:", role);

          // Update lastLogin in background
          UserModel.findByIdAndUpdate(dbUser._id, { lastLogin: new Date() }).exec().catch(() => {});

          return {
            id:                String(dbUser._id),
            name:              dbUser.name              ?? "",
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
          console.error("[Auth] authorize error:", err);
          return null;
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user, account }) {
      // On first sign-in, attach all user fields to the token
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
        token.subscriptions    = (user as any).subscriptions    ?? [];
      }

      // Handle data synchronization and email notification on first sign-in
      if (user) {
        const emailStr = user.email?.toLowerCase() || "";
        
        // 1. Google-specific synchronization
        if (account?.provider === "google") {
          try {
            await connectDB();
            const UserModel = getUserModel();
            let dbUser: any = await UserModel.findOne({ email: emailStr }).lean();

            if (!dbUser) {
              const created = await UserModel.create({
                name:           user.name ?? "",
                email:          emailStr,
                savedLocations: { home: "", work: "" },
                travelHistory:  [],
                lastLogin:      new Date(),
                subscriptions:  []
              });
              dbUser = created.toObject();
            } else {
              await UserModel.findByIdAndUpdate(dbUser._id, { lastLogin: new Date() });
            }

            token.id = String(dbUser._id);
            token.phone = dbUser.phone || "";
            token.subscriptions = dbUser.subscriptions || [];
          } catch (err) {
            console.error("[Auth] Google sync error:", err);
          }
        }

        // 2. Send email for ANY login (Google or Credentials)
        try {
          const { sendWelcomeEmail } = await import("./lib/mail");
          await sendWelcomeEmail(emailStr, user.name ?? "Udhëtar");
        } catch (mailErr) {
          console.error("[Auth] Login email error:", mailErr);
        }
      }

      return token;
    },

    async session({ session, token }: any) {
      session.user = {
        id:                token.id,
        name:              token.name,
        email:             token.email,
        image:             token.picture ?? null,
        role:              token.role,
        phone:             token.phone,
        savedLocations:    token.savedLocations,
        travelHistory:     token.travelHistory,
        subscriptionPhoto: token.subscriptionPhoto,
        idNumber:          token.idNumber,
        university:        token.university,
        serialNumber:      token.serialNumber,
        selectedLine:      token.selectedLine,
        subscriptions:     token.subscriptions ?? [],
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
