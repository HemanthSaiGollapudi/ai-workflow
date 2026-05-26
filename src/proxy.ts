import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

const authMiddleware = withAuth({
  pages: {
    signIn: "/login",
  },
});

export default async function proxy(req: NextRequest, event: any) {
  return (authMiddleware as any)(req, event);
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/builder/:path*",
    "/test/:path*",
  ],
};
