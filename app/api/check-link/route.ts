import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { url } = await req.json();

  try {
    const res = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_KEY}`,
      {
        method: "POST",
        body: JSON.stringify({
          client: {
            clientId: "coupon-wolve",
            clientVersion: "1.0.0",
          },
          threatInfo: {
            threatTypes: [
              "MALWARE",
              "SOCIAL_ENGINEERING",
              "UNWANTED_SOFTWARE",
            ],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }],
          },
        }),
      }
    );

    const data = await res.json();

    // ❌ If threats found → NOT SAFE
    if (data.matches) {
      return NextResponse.json({ safe: false });
    }

    // ✅ SAFE
    return NextResponse.json({ safe: true });

  } catch (err) {
    return NextResponse.json({ safe: false });
  }
}