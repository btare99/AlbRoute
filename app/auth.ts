import NextAuth, { type Account, type User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "./lib/mongodb";
import { getUserModel, getOperatorModel } from "./lib/dynamicDb";
import { sendWelcomeEmail } from "./lib/mail"; // ✅ import statik

// ── Tipet ─────────────────────────────────────────────────────────────────────

interface DbUser {
  _id: unknown;
  name?: string;
  email: string;
  password?: string;
  role?: string;
  phone?: string;
  savedLocations?: { home: string; work: string };
  travelHistory?: unknown[];
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  savedLocations: { home: string; work: string };
  travelHistory: unknown[];
}

interface ExtendedToken extends JWT {
  id: string;
  role: string;
  phone: string;
  savedLocations: { home: string; work: string };
  travelHistory: unknown[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildAuthUser(dbUser: DbUser, role: string): AuthUser {
  return {
    id: String(dbUser._id),
    name: dbUser.name ?? "",
    email: dbUser.email,
    role,
    phone: dbUser.phone ?? "",
    savedLocations: dbUser.savedLocations ?? { home: "", work: "" },
    travelHistory: dbUser.travelHistory ?? [],
  };
}

function attachUserToToken(token: ExtendedToken, user: AuthUser): void {
  token.id = user.id;
  token.role = user.role;
  token.phone = user.phone;
  token.savedLocations = user.savedLocations;
  token.travelHistory = user.travelHistory;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.NEXTAUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.NEXTAUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: { prompt: "consent", access_type: "offline", response_type: "code" },
      },
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        const email = (credentials?.email as string | undefined)?.toLowerCase().trim();
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        try {
          await connectDB();

          const UserModel = getUserModel();
          const OperatorModel = getOperatorModel();

          let dbUser = await UserModel.findOne({ email }).lean<DbUser>();
          let role = "user";

          if (!dbUser) {
            dbUser = await OperatorModel.findOne({ email }).lean<DbUser>();
            if (dbUser) role = dbUser.role ?? "operator";
          }

          if (!dbUser?.password) return null;

          const passwordMatch = await bcrypt.compare(password, dbUser.password);
          if (!passwordMatch) return null;

          // Background update — non-blocking
          UserModel.findByIdAndUpdate(dbUser._id, { lastLogin: new Date() })
            .exec()
            .catch(() => { });

          return buildAuthUser(dbUser, role);
        } catch (err) {
          console.error("[Auth] Credentials authorize error:", err);
          return null;
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: any; account?: any }) {
      const extendedToken = token as ExtendedToken;
      if (user) {
        const authUser = user as unknown as AuthUser;
        attachUserToToken(extendedToken, authUser);

        const email = user.email?.toLowerCase() ?? "";

        // Google — sync ose krijo user në DB
        if (account?.provider === "google") {
          try {
            await connectDB();
            const UserModel = getUserModel();

            let dbUser = await UserModel.findOne({ email }).lean<DbUser>();

            if (!dbUser) {
              const created = await UserModel.create({
                name: user.name ?? "",
                email,
                savedLocations: { home: "", work: "" },
                travelHistory: [],
                lastLogin: new Date(),
              });
              dbUser = created.toObject() as DbUser;
            } else {
              UserModel.findByIdAndUpdate(dbUser._id, { lastLogin: new Date() })
                .exec()
                .catch(() => { });
            }

            extendedToken.id = String(dbUser!._id);
            extendedToken.phone = dbUser!.phone ?? "";
            extendedToken.role = dbUser!.role ?? "user";
          } catch (err) {
            console.error("[Auth] Google sync error:", err);
          }
        }

        // Email mirëseardhjeje — jo-bllokues
        sendWelcomeEmail(email, user.name ?? "Udhëtar").catch(err =>
          console.error("[Auth] Welcome email error:", err)
        );
      }

      return token;
    },

    async session({ session, token }: { session: any; token: JWT }) {
      const extendedToken = token as ExtendedToken;
      session.user = {
        id: extendedToken.id,
        name: extendedToken.name,
        email: extendedToken.email,
        image: extendedToken.picture ?? null,
        role: extendedToken.role,
        phone: extendedToken.phone,
        savedLocations: extendedToken.savedLocations,
        travelHistory: extendedToken.travelHistory,
      };
      return session;
    },
  },

  pages: { signIn: "/", error: "/" },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
});