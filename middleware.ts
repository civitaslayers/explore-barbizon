import { NextRequest, NextResponse } from "next/server";

/**
 * Minimal password gate for /command-center and /dashboard in production.
 * Uses HTTP Basic Auth — browser shows a native password dialog.
 *
 * Set COMMAND_CENTER_PASSWORD in your production env vars.
 * The username field is ignored; only the password is checked.
 * Has no effect in development (NODE_ENV !== "production").
 */
export function middleware(req: NextRequest) {
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

  const password = process.env.COMMAND_CENTER_PASSWORD;
  if (!password) return NextResponse.next(); // no password configured → open

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    const decoded = atob(auth.slice(6)); // atob available in Edge runtime
    const colonIndex = decoded.indexOf(":");
    const supplied = decoded.slice(colonIndex + 1);
    if (supplied === password) return NextResponse.next();
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Command Center"' },
  });
}

export const config = {
  matcher: ["/command-center/:path*", "/dashboard/:path*"],
};
