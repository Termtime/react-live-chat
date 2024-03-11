import NextAuth from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";
import {AuthOptions} from "next-auth";

export const authOptions: AuthOptions = {
  secret: process.env.AUTH_SECRET,
  // Configure one or more authentication providers
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER,
    }),
  ],
  callbacks: {
    async session({session, token, user}) {
      return {...session, ...token};
    },
    async jwt({token, user, account, profile, isNewUser}) {
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
};

export default NextAuth(authOptions);
