import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      // Function that verifies credentials and returns a user object
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        console.log("reached credentials", credentials);

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        // Here you would implement your own logic to check if the credentials are valid
        const { email, password } = credentials;
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          throw new Error("UserNotFound");
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (passwordMatch) {
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
          };
        }

        throw new Error("WrongPassword");
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    // Set it as jwt instead of database
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: parseInt(token.id as string) },
          include: {
            agentProfile: true,
          },
        });

        if (dbUser) {
          session.user.id = dbUser.id.toString();
          session.user.name = dbUser.name;
          session.user.email = dbUser.email;
          // Add any additional user properties you need from the Prisma User model
          session.user.role = dbUser.role;
        }
      }

      return session;
    },
  },
};
