import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  debug: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        console.log("--- AUTH ATTEMPT ---");
        try {
          const email = (credentials?.email as string || "").trim().toLowerCase();
          const password = credentials?.password as string || "";

          if (!email || !password) {
            console.log("AUTH FAILURE: Missing fields");
            return null;
          }

          console.log(`Login attempt for: [${email}]`);

          // 1. HARDCODED BYPASS CHECK (Emergency Access)
          if (email === "admin@inchallah.ci" && password === "Admin@1234") {
            console.log("AUTH SUCCESS: Admin bypass triggered");
            return {
              id: "system-admin-bypass",
              name: "Administrateur Principal",
              email: "admin@inchallah.ci",
              role: Role.ADMIN,
            };
          }

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.log("AUTH FAILURE: User not found in database:", email);
            return null;
          }
          
          if (!user.isActive) {
            console.log("AUTH FAILURE: User account is inactive:", email);
            return null;
          }

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            console.log("AUTH FAILURE: Password mismatch for user:", email);
            return null;
          }

          console.log("AUTH SUCCESS: Valid credentials for:", email);
          return {
            id: user.id,
            name: `${user.prenom} ${user.nom}`,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("CRITICAL AUTH ERROR:", error);
          return null;
        } finally {
          console.log("--- AUTH ATTEMPT END ---");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: process.env.AUTH_SECRET || "fallback_secret_for_dev_only_123",
  basePath: "/api/auth",
});
