import type { NextConfig } from "next";
import { createCivicAuthPlugin } from "@civic/auth/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: `${process.env.CLIENT_ID}`, 
  loginSuccessUrl: '/dashboard',
  oauthServer: 'https://auth.civic.com/oauth',
  basePath: ''
});

export default withCivicAuth(nextConfig);
