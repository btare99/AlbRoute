import NextAuth, { type Account, type User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { db } from "./lib/firebaseAdmin";
import { sendWelcomeEmail } from "./lib/mail";

// ── Tipet ─────────────────────────────────────────────────────────────────────

interface DbUser {
  _id: string;
  name?: string;
  email: string;
  password?: string;
  role?: string;
  phone?: string;
  savedLocations?: { home: string; work: string };
  travelHistory?: unknown[];
  lastLogin?: string;
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
    id: dbUser._id,
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

    Apple({
      clientId: process.env.APPLE_CLIENT_ID ?? "",
      clientSecret: process.env.APPLE_CLIENT_SECRET ?? "",
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        idToken: { label: "idToken", type: "text" },
        provider: { label: "provider", type: "text" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (credentials?.provider === "google-native") {
          const idToken = credentials?.idToken as string;
          if (!idToken) return null;
          try {
            const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
            if (!verifyRes.ok) {
              console.error("[Auth] Google native token verification failed");
              return null;
            }
            const payload = await verifyRes.json();
            const email = payload.email?.toLowerCase().trim();
            if (!email) return null;

            const usersRef = db.collection("users");
            const snapshot = await usersRef.where("email", "==", email).limit(1).get();
            let dbUser: DbUser;
            let userId = "";
            const role = "user";

            if (snapshot.empty) {
              const userDocRef = usersRef.doc();
              userId = userDocRef.id;
              dbUser = {
                _id: userId,
                name: payload.name ?? "",
                email,
                savedLocations: { home: "", work: "" },
                travelHistory: [],
                lastLogin: new Date().toISOString(),
              };
              await userDocRef.set(dbUser);
            } else {
              const doc = snapshot.docs[0];
              userId = doc.id;
              dbUser = { ...doc.data(), _id: userId } as DbUser;
              await doc.ref.update({ lastLogin: new Date().toISOString() });
            }
            return buildAuthUser(dbUser, role);
          } catch (err) {
            console.error("[Auth] Google native authorize error:", err);
            return null;
          }
        }

        const email = (credentials?.email as string | undefined)?.toLowerCase().trim();
        const password = credentials?.password as string | undefined;

        console.log("[AuthDebug] Authorize called with email:", email, "password provided:", !!password);

        if (!email || !password) {
          console.log("[AuthDebug] Missing email or password");
          return null;
        }

        try {
          const usersRef = db.collection("users");
          const userSnapshot = await usersRef.where("email", "==", email).limit(1).get();
          let dbUser: DbUser | null = null;
          let userId = "";
          let role = "user";

          if (!userSnapshot.empty) {
            const doc = userSnapshot.docs[0];
            userId = doc.id;
            dbUser = { ...doc.data(), _id: userId } as DbUser;
            console.log("[AuthDebug] Found user in 'users' collection. ID:", userId);
          } else {
            console.log("[AuthDebug] User not found in 'users', checking 'operators'...");
            // Check operators
            const operatorsRef = db.collection("operators");
            const opSnapshot = await operatorsRef.where("email", "==", email).limit(1).get();
            if (!opSnapshot.empty) {
              const doc = opSnapshot.docs[0];
              userId = doc.id;
              dbUser = { ...doc.data(), _id: userId } as DbUser;
              role = dbUser.role ?? "operator";
              console.log("[AuthDebug] Found user in 'operators' collection. ID:", userId, "role:", role);
            } else {
              console.log("[AuthDebug] User not found in 'operators' either.");
            }
          }

          if (!dbUser) {
            console.log("[AuthDebug] No user found in either collection for email:", email);
            return null;
          }

          if (!dbUser.password) {
            console.log("[AuthDebug] User has no password set in database.");
            return null;
          }

          console.log("[AuthDebug] Comparing passwords...");
          const passwordMatch = await bcrypt.compare(password, dbUser.password);
          console.log("[AuthDebug] Password match result:", passwordMatch);
          if (!passwordMatch) return null;

          // Background update — non-blocking
          const targetRef = db.collection(role === "user" ? "users" : "operators").doc(userId);
          targetRef.update({ lastLogin: new Date().toISOString() }).catch(() => {});

          const authUser = buildAuthUser(dbUser, role);
          console.log("[AuthDebug] Authorization successful. Returning user:", authUser);
          return authUser;
        } catch (err) {
          console.error("[Auth] Credentials authorize error:", err);
          return null;
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: User; account?: Account | null }) {
      const extendedToken = token as ExtendedToken;
      if (user) {
        const authUser = user as unknown as AuthUser;
        attachUserToToken(extendedToken, authUser);

        const email = user.email?.toLowerCase() ?? "";

        // Google / Apple — sync ose krijo user në DB
        if (account?.provider === "google" || account?.provider === "apple") {
          try {
            const usersRef = db.collection("users");
            const snapshot = await usersRef.where("email", "==", email).limit(1).get();
            let dbUser: DbUser | null = null;
            let userId = "";

            if (snapshot.empty) {
              const userDocRef = usersRef.doc();
              userId = userDocRef.id;
              dbUser = {
                _id: userId,
                name: user.name ?? "",
                email,
                savedLocations: { home: "", work: "" },
                travelHistory: [],
                lastLogin: new Date().toISOString(),
              };
              await userDocRef.set(dbUser);
            } else {
              const doc = snapshot.docs[0];
              userId = doc.id;
              dbUser = { ...doc.data(), _id: userId } as DbUser;
              await doc.ref.update({ lastLogin: new Date().toISOString() });
            }

            extendedToken.id = userId;
            extendedToken.phone = dbUser.phone ?? "";
            extendedToken.role = dbUser.role ?? "user";
            extendedToken.savedLocations = dbUser.savedLocations ?? { home: "", work: "" };
            extendedToken.travelHistory = dbUser.travelHistory ?? [];
          } catch (err) {
            console.error(`[Auth] ${account.provider} sync error:`, err);
          }
        }

        // Email mirëseardhjeje — jo-bllokues
        sendWelcomeEmail(email, user.name ?? "Udhëtar").catch(err =>
          console.error("[Auth] Welcome email error:", err)
        );
      }

      return token;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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