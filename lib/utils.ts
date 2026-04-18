import { supabase } from "@/lib/supabase";

// 🔥 GOOGLE SAFE CHECK
const checkIfSafe = async (url: string) => {
  try {
    const res = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.NEXT_PUBLIC_GOOGLE_SAFE_BROWSING_API_KEY}`,
      {
        method: "POST",
        body: JSON.stringify({
          client: {
            clientId: "coupon-wolve",
            clientVersion: "1.0",
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

    return !data.matches;
  } catch (err) {
    console.error("Safe check failed:", err);
    return false;
  }
};

export const submitCoupon = async (form: any) => {
  // ===== VALIDATION =====
  if (!form.title || !form.code || !form.link) {
    return { success: false, message: "Missing fields ❌" };
  }

  // ===== BLOCK SHORT LINKS =====
  const blockedDomains = [
    "bit.ly",
    "tinyurl.com",
    "goo.gl",
    "t.co",
    "shorturl",
  ];

  let domain = "";

  try {
    const url = new URL(form.link);
    domain = url.hostname.toLowerCase();

    if (blockedDomains.some((d) => domain.includes(d))) {
      return { success: false, message: "Short/unsafe links not allowed ❌" };
    }
  } catch {
    return { success: false, message: "Invalid URL ❌" };
  }

  // ===== GOOGLE SAFE CHECK =====
  const isSafe = await checkIfSafe(form.link);

  if (!isSafe) {
    return { success: false, message: "Unsafe link detected ❌" };
  }

  // ===== INSERT =====
  const { error } = await supabase.from("pending_coupons").insert({
    title: form.title,
    code: form.code,
    discount: form.discount,
    link: form.link,
    expires_at: form.expires || null,
    category: null,
    status: "pending",
  });

  if (error) {
    console.error(error.message);
    return { success: false, message: "Failed to submit ❌" };
  }

  return { success: true, message: "Submitted safely ✅" };
};