import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const USER = "admin";
const PASS = "coupon123"; // change this

export function middleware(req: NextRequest) {
  const auth = req.headers.get("authorization");

  if (auth) {
    const base64 = auth.split(" ")[1];
    const [user, pass] = atob(base64).split(":");

    if (user === USER && pass === PASS) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Auth required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  matcher: "/:path*",
};