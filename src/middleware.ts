import { NextResponse } from "next/server";
import { authMiddleware, redirectToSignIn, clerkClient } from "@clerk/nextjs/server";

export default authMiddleware({
  // publicRoutes are accessible without authentication
  publicRoutes: [
    "/", 
    "/sign-in", 
    "/sign-up", 
    "/401", 
    "/403",
    "/api/webhooks(.*)"
  ],
  
  async afterAuth(auth, req) {
    const { userId, sessionClaims } = auth;
    const isPublicRoute = auth.isPublicRoute;

    // 1. If not signed in and trying to access a protected route, redirect to sign-in
    if (!userId && !isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // 2. If signed in, ensure the user has a role.
    // NOTE: We prefer checking sessionClaims for performance, but we add a 
    // FALLBACK check via the Clerk SDK to break redirect loops caused by stale JWTs.
    let role = (sessionClaims?.publicMetadata as any)?.role;
    
    // EMERGENCY FALLBACK: If role is missing from claims, fetch live from Clerk once.
    if (userId && !role && !isPublicRoute && req.nextUrl.pathname !== "/onboarding") {
      try {
        const user = await clerkClient.users.getUser(userId);
        role = user.publicMetadata.role;
      } catch (err) {
        console.error("Clerk SDK Fallback failed:", err);
      }
    }

    if (userId && !role && !isPublicRoute && req.nextUrl.pathname !== "/onboarding") {
      // Small optimization: don't redirect if we're hitting an API that needs to set the role
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // 3. Prevent non-admins from accessing /admin paths at the edge
    if (userId && role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/403", req.url));
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
