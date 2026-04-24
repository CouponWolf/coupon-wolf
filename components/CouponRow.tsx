"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CouponRow({ title, category }: any) {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [affiliateRules, setAffiliateRules] = useState<any[]>([]);

  const [popup, setPopup] = useState({ show: false, x: 0, y: 0 });

  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});
  const [adLoading, setAdLoading] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchCoupons();
    fetchAffiliateRules();
  }, []);

  const fetchCoupons = async () => {
    const now = new Date().toISOString();

    const { data } = await supabase
      .from("coupons")
      .select("*")
      .eq("category", category)
      .or(`expires_at.gt.${now},expires_at.is.null`);

    if (data) setCoupons(data);
  };

  const fetchAffiliateRules = async () => {
    const { data } = await supabase
      .from("affiliate_rules")
      .select("*");

    if (data) setAffiliateRules(data);
  };

  const loopedCoupons = [...coupons, ...coupons, ...coupons];

  // ===== HELPERS =====

  const hasCode = (c: any) => {
    return c.code && c.code.trim() !== "";
  };

  const isFreeCoupon = (c: any) => {
    const text = `${c.title} ${c.discount}`.toLowerCase();

    const percentMatch = text.match(/(\d+)%/);
    const dollarMatch = text.match(/\$(\d+)/);

    const percent = percentMatch ? parseInt(percentMatch[1]) : 0;
    const dollars = dollarMatch ? parseInt(dollarMatch[1]) : 0;

    return percent <= 15 && dollars <= 10;
  };

  const buildAffiliateLink = (url: string) => {
    try {
      const parsed = new URL(url);
      const domain = parsed.hostname.replace("www.", "");

      const rule = affiliateRules.find((r) =>
        domain.includes(r.domain)
      );

      if (!rule) return url;

      if (url.includes("?")) {
        return url + "&" + rule.affiliate_param.replace("?", "");
      }

      return url + rule.affiliate_param;
    } catch {
      return url;
    }
  };

  // ===== AD =====
  const watchAd = (couponId: string) => {
    if (adLoading) return;

    setAdLoading(couponId);

    setTimeout(() => {
      setUnlocked((prev) => ({
        ...prev,
        [couponId]: true,
      }));
      setAdLoading(null);
    }, 2000);
  };

  // ===== CLICK =====
  const handleClick = async (coupon: any, e: any) => {
    const noCode = !hasCode(coupon);

    // 🔥 DEAL → DIRECT OPEN
    if (noCode) {
      const finalLink = buildAffiliateLink(coupon.link);
      window.open(finalLink, "_blank");
      return;
    }

    const free = isFreeCoupon(coupon);

    // 🔥 PREMIUM → REQUIRE AD
    if (!free && !unlocked[coupon.id]) {
      watchAd(coupon.id);
      return;
    }

    // 🔥 COPY + OPEN
    navigator.clipboard.writeText(coupon.code);

    await supabase.from("clicks").insert([
      { coupon_id: coupon.id }
    ]);

    setPopup({
      show: true,
      x: e.clientX,
      y: e.clientY,
    });

    setTimeout(() => {
      setPopup({ show: false, x: 0, y: 0 });

      const finalLink = buildAffiliateLink(coupon.link);
      window.open(finalLink, "_blank");
    }, 700);
  };

  const getDomainName = (url: string) => {
    try {
      return new URL(url).hostname
        .replace("www.", "")
        .split(".")[0]
        .toLowerCase();
    } catch {
      return "fallback";
    }
  };

  return (
    <div className="row">

      <h2 className="animate">{title}</h2>

      <div className="carousel" ref={carouselRef}>
        <div className="carousel-track" ref={trackRef}>
          {loopedCoupons.map((c, i) => {
            const noCode = !hasCode(c);
            const free = isFreeCoupon(c);
            const isUnlocked = unlocked[c.id];

            return (
              <div
                key={i}
                className="card"
                onClick={(e) => handleClick(c, e)}
              >
                <img
                  src={`/logos/${getDomainName(c.link)}.png`}
                  alt="logo"
                  onError={(e: any) => {
                    e.target.src = "/fallback.png";
                  }}
                />

                <div className="card-info">
                  <span className="discount">{c.discount}</span>
                  <span className="title">{c.title}</span>
                </div>

                {/* 🔥 OVERLAY LOGIC */}
                {!noCode && (
                  <div className="overlay">
                    {free ? (
                      <span>{c.code}</span>
                    ) : isUnlocked ? (
                      <span>{c.code}</span>
                    ) : adLoading === c.id ? (
                      <span>Loading Ad...</span>
                    ) : (
                      <span>Watch Ad</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {popup.show && (
        <div
          className="copy-popup"
          style={{
            position: "fixed",
            top: popup.y,
            left: popup.x,
            transform: "translate(-50%, -100%)",
            zIndex: 9999,
          }}
        >
          Code Copied!
        </div>
      )}
    </div>
  );
}