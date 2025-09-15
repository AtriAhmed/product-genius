import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

// For more information on each option (and a full list of options) go to
// https://authjs.dev/reference/configuration/auth-config
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
