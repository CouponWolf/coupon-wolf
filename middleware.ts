import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ✅ allow homepage for verification
  if (path === "/") {
    return NextResponse.next();
  }

  // ✅ allow static files
  if (path.startsWith("/_next") || path === "/favicon.ico") {
    return NextResponse.next();
  }

  // 🔒 protect everything else
  const auth = req.headers.get("authorization");

  const USER = "admin";
  const PASS = "coupon123";

  if (auth) {
    const base64 = auth.split(" ")[1];
    const decoded = atob(base64);
    const [user, pass] = decoded.split(":");

    if (user === USER && pass === PASS) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Protected", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};