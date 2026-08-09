import type { NextAuthConfig } from "next-auth";
import type { User } from "next-auth";

export type AppUser = User & {
  role?: "ADMIN" | "CUSTOMER";
};

declare module "next-auth" {
  interface Session {
    user: AppUser;
  }
  interface User {
    role?: "ADMIN" | "CUSTOMER";
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as AppUser).role ?? "CUSTOMER";
        token.image = user.image ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "CUSTOMER";
        session.user.image = (token.image as string | null) ?? null;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
