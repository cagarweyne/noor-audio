import prisma from "@/lib/prisma";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { Account, Profile, User } from "next-auth";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // On first Google sign-in, create the user row (mirrors the template).
    async signIn({
      user,
    }: {
      user: User;
      account: Account | null;
      profile?: Profile;
      email?: { verificationRequest?: boolean };
      credentials?: Record<string, unknown>;
    }) {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email!,
            name: user.name || user.email!,
          },
        });
      }

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
