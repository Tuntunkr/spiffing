/** Clerk is optional. The gallery stays public when keys are not set. */
export const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
