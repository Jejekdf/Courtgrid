import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/zod";
import bcrypt from "bcrypt";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // 1. Check if environment Admin credentials match
        const envAdminEmail = process.env.ADMIN_EMAIL;
        const envAdminPassword = process.env.ADMIN_PASSWORD;
        const envAdminNama = process.env.ADMIN_NAMA || "Admin CourtGrid";

        if (
          envAdminEmail &&
          envAdminPassword &&
          email === envAdminEmail &&
          password === envAdminPassword
        ) {
          // Upsert Admin into Supabase PostgreSQL to ensure record exists
          const hashedPassword = await bcrypt.hash(password, 10);
          const adminUser = await prisma.user.upsert({
            where: { email: envAdminEmail },
            update: {
              name: envAdminNama,
              role: "ADMIN",
              passwordHash: hashedPassword,
            },
            create: {
              email: envAdminEmail,
              name: envAdminNama,
              role: "ADMIN",
              passwordHash: hashedPassword,
            },
          });

          return {
            id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            image: adminUser.image,
            role: adminUser.role,
          };
        }

        // 2. Standard Database User Validation
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
});
