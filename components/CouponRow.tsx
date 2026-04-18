"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CouponRow({ title, category }: any) {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [affiliateRules, setAffiliateRules] = useState<any[]>([]);

  const [popup, setPopup] = useState({ show: false, x: 0, y: 0 });

  // 🔥 NEW (ads system)
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});
  const [adLoading, setAdLoading] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchCoupons();
    fetchAffiliateRules();
  }, []);

  // ===== FETCH COUPONS =====
  const fetchCoupons = async () => {
    const now = new Date().toISOString();

    const { data } = await supabase
      .from("coupons")
      .select("*")
      .eq("category", category)
      .or(`expires_at.gt.${now},expires_at.is.null`);

    if (data) setCoupons(data);
  };

  // ===== FETCH AFFILIATE RULES =====
  const fetchAffiliateRules = async () => {
    const { data } = await supabase
      .from("affiliate_rules")
      .select("*");

    if (data) setAffiliateRules(data);
  };

  const loopedCoupons = [...coupons, ...coupons, ...coupons];

  // ===== BUILD AFFILIATE =====
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

  // ===== 🔥 FAKE AD SYSTEM (replace later with real ads) =====
  const watchAd = (couponId: string) => {
    if (adLoading) return;

    setAdLoading(couponId);

    // simulate ad (2 seconds)
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
    // 🔥 block if not unlocked
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

      <div
        className="carousel"
        ref={carouselRef}
        onWheel={(e) => {
          if (!carouselRef.current) return;

          const container = carouselRef.current;

          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            e.stopPropagation();
            container.scrollLeft += e.deltaY;
          }
        }}
      >
        <div className="carousel-track" ref={trackRef}>
          {loopedCoupons.map((c, i) => {
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

                {/* 🔥 LOCK / CODE */}
                <div className="overlay">
                  {isUnlocked ? (
                    <span>{c.code}</span>
                  ) : adLoading === c.id ? (
                    <span>Loading Ad...</span>
                  ) : (
                    <span>Watch Ad</span>
                  )}
                </div>
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