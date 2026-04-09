export const DEMO_USER_ID = "user_demo";
export const DEMO_SESSION_COOKIE = "agenthub_session";
export const DEMO_SESSION_VALUE = "session_demo";

export function getDemoSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  };
}
