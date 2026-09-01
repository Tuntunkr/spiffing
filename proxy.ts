import { clerkMiddleware } from "@clerk/nextjs/server";

// The gallery is public; Clerk only attaches auth context so components like
// <SignedIn> and useUser() work. Add createRouteMatcher + auth.protect() here
// when a route actually needs a signed-in user.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
