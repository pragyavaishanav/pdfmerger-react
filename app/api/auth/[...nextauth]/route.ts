export const runtime = "nodejs"; // Required on Vercel for env vars

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET, // Required in production

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "email profile https://www.googleapis.com/auth/drive.file",
        },
      },
    }),
    AzureADProvider({
        clientId: process.env.MICROSOFT_CLIENT_ID!,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
        tenantId: "common",
        authorization: {
          params: {
            scope: "openid profile email User.Read Files.Read",
          },
        },
      }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      if (account) token.accessToken = account.access_token;
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
});

export { handler as GET, handler as POST };