import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { Session } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}

export default NextAuth({
   providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'repo,user,write:discussion,read:user,read:org,read:installation',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/', // Error code passed in query string as ?error=
  },
}); 