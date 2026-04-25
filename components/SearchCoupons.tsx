"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SearchCoupons() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [affiliateRules, setAffiliateRules] = useState<any[]>([]);

  const [popup, setPopup] = useState({ show: false, x: 0, y: 0 });

  // 🔥 ads system
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});
  const [adLoading, setAdLoading] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchAffiliateRules();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const delay = setTimeout(() => {
      searchCoupons();
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  // ===== FETCH =====
  const searchCoupons = async () => {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .ilike("link", `%${query}%`)
      .eq("is_active", true);

    if (data) setResults(data);
  };

  const fetchAffiliateRules = async () => {
    const { data } = await supabase
      .from("affiliate_rules")
      .select("*");

    if (data) setAffiliateRules(data);
  };

  // ===== AFFILIATE =====
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

  // ===== 🧠 LOGIC =====
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

  // ===== 🔥 HOVER SCROLL (COPY OF PAGE 2) =====
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
      setUnlocked((prev) => ({
        ...prev,
        [couponId]: true,
      }));

      setAdLoading(null);
    }, 2000);
  };

  // ===== CLICK =====
  const handleClick = async (coupon: any, e: any) => {
    const has_coupon = hasCode(coupon);
    const cheap = isCheap(coupon);

    const finalLink = buildAffiliateLink(coupon.link);

    // ❌ NO CODE → DIRECT
    if (!has_coupon) {
      window.open(finalLink, "_blank");
      return;
    }

    // 🟢 CHEAP → FREE
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
        window.open(finalLink, "_blank");
      }, 700);

      return;
    }

    // 🔒 PREMIUM
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
    <div className="search-container animate">

      <input
        className="search-input"
        placeholder="Search for a website (Amazon, Nike...)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* 🔥 EXACT SAME STRUCTURE AS PAGE 2 */}
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
          {results.map((c, i) => {
            const has_coupon = hasCode(c);
            const cheap = isCheap(c);
            const isUnlocked = unlocked[c.id];

            return (
              <div
                key={i}
                className="card"
                onClick={(e) => handleClick(c, e)}
              >
                <img
                  src={`/logos/${getDomainName(c.link)}.png`}
                  onError={(e: any) => {
                    e.target.src = "/fallback.png";
                  }}
                />

                <div className="card-info">
                  <span className="discount">{c.discount}</span>
                  <span className="title">{c.title}</span>
                </div>

                {/* ✅ ONLY SHOW OVERLAY IF HAS CODE */}
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