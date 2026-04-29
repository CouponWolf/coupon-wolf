"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CouponRow({ title, category }: any) {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [affiliateRules, setAffiliateRules] = useState<any[]>([]);

  const [popup, setPopup] = useState({ show: false, x: 0, y: 0 });

  // 🔥 ads system
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});
  const [adLoading, setAdLoading] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchCoupons();
    fetchAffiliateRules();

    const stored = JSON.parse(localStorage.getItem("unlockedCoupons") || "{}");
    setUnlocked(stored);
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

  // ===== BUILD AFFILIATE =====
  const buildAffiliateLink = (url: string) => {
    if (!url) return ""; // ✅ FIX: avoid invalid URL

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

  // ===== 🧠 CHECK TYPE =====
  const hasCode = (coupon: any) => {
    return coupon.code && coupon.code.trim() !== "";
  };

  const isCheap = (coupon: any) => {
    const discount = (coupon.discount || "").toLowerCase();

    const percentMatch = discount.match(/(\d+)%/);
    const dollarMatch = discount.match(/\$?(\d+)/);

    const percent = percentMatch ? parseInt(percentMatch[1]) : null;
    const dollars = dollarMatch ? parseInt(dollarMatch[1]) : null;

    if (percent !== null && percent <= 15) return true;
    if (dollars !== null && dollars <= 10) return true;

    return false;
  };

  // ===== 🆕 TITLE → LOGO NAME =====
  const getTitleLogo = (title: string) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, "_"); // spaces → _
  };

  // ===== HOVER SCROLL =====
  useEffect(() => {
    const container = carouselRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const handleEnter = () => {
      const style = window.getComputedStyle(track);
      const matrix = new DOMMatrixReadOnly(style.transform);
      const currentX = matrix.m41;

      container.scrollLeft = -currentX;
      track.style.animation = "none";
    };

    const handleLeave = () => {
      track.style.animation = "scroll 20s linear infinite";
    };

    container.addEventListener("mouseenter", handleEnter);
    container.addEventListener("mouseleave", handleLeave);

    return () => {
      container.removeEventListener("mouseenter", handleEnter);
      container.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  // ===== 🔥 FAKE AD =====
  const watchAd = (couponId: string) => {
    if (adLoading) return;

    setAdLoading(couponId);

    setTimeout(() => {
      const updated = {
        ...unlocked,
        [couponId]: true,
      };

      setUnlocked(updated);
      localStorage.setItem("unlockedCoupons", JSON.stringify(updated));

      setAdLoading(null);
    }, 2000);
  };

  // ===== CLICK =====
  const handleClick = async (coupon: any, e: any) => {
    const has_coupon = hasCode(coupon);
    const cheap = isCheap(coupon);

    const finalLink = buildAffiliateLink(coupon.link);

    // ✅ NO CODE
    if (!has_coupon) {
      if (finalLink) {
        window.open(finalLink, "_blank");
      }
      return;
    }

    // ✅ CHEAP
    if (cheap) {
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

        if (finalLink) {
          window.open(finalLink, "_blank"); // ✅ ONLY if exists
        }
      }, 700);

      return;
    }

    // ✅ PREMIUM
    if (!unlocked[coupon.id]) {
      watchAd(coupon.id);
      return;
    }

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

      if (finalLink) {
        window.open(finalLink, "_blank"); // ✅ ONLY if exists
      }
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
            const has_coupon = hasCode(c);
            const cheap = isCheap(c);
            const isUnlocked = unlocked[c.id];
            const isPremium = has_coupon && !cheap;

            const domainLogo = getDomainName(c.link);
            const titleLogo = getTitleLogo(c.title);

            return (
              <div
                key={i}
                className={`card ${isPremium ? "premium-card" : ""}`}
                onClick={(e) => handleClick(c, e)}
              >
                {/* ✅ LOGO SYSTEM FIXED */}
                <img
                  src={`/logos/${domainLogo}.png`}
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = `/logos/${titleLogo}.png`;
                  }}
                />

                <div className="card-info">
                  <span className="discount">{c.discount}</span>
                  <span className="title">{c.title}</span>
                </div>

                {has_coupon && (
                  <div className="overlay">
                    {cheap ? (
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