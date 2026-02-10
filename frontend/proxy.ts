import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/",
    "/landing",
    "/sign-in(.*)", 
    "/sign-up(.*)",
    "/chat(.*)" ,// Chat page is public as per requirement
    "/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)",
  ],
};

// import { authMiddleware } from "@clerk/nextjs";

// export default authMiddleware({
//   publicRoutes: [
//     "/",
//     "/landing",
//     "/sign-in(.*)", 
//     "/sign-up(.*)",
//     "/chat(.*)" // Chat page is public as per requirement
//   ],
// });

// export const config = {
//   matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
// };