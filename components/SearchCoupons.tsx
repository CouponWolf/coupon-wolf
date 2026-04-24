"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SearchCoupons() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [popup, setPopup] = useState({ show: false, x: 0, y: 0 });

  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});
  const [adLoading, setAdLoading] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

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

  const searchCoupons = async () => {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .ilike("link", `%${query}%`)
      .eq("is_active", true);

    if (data) setResults(data);
  };

  // ===== HELPERS =====

  const isNoCode = (coupon: any) => {
    return !coupon.code || coupon.code.trim() === "";
  };

  const isPremium = (coupon: any) => {
    const discount = coupon.discount?.toLowerCase() || "";

    const percentMatch = discount.match(/(\d+)%/);
    if (percentMatch && parseInt(percentMatch[1]) > 15) return true;

    const dollarMatch = discount.match(/\$(\d+)/);
    if (dollarMatch && parseInt(dollarMatch[1]) > 10) return true;

    return false;
  };

  const watchAd = (id: string) => {
    if (adLoading) return;

    setAdLoading(id);

    setTimeout(() => {
      setUnlocked((prev) => ({ ...prev, [id]: true }));
      setAdLoading(null);
    }, 2000);
  };

  const handleClick = async (coupon: any, e: any) => {
    const noCode = isNoCode(coupon);
    const premium = isPremium(coupon);
    const isUnlocked = unlocked[coupon.id];

    if (noCode) {
      window.open(coupon.link, "_blank");
      return;
    }

    if (premium && !isUnlocked) {
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
      window.open(coupon.link, "_blank");
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

      {/* 🔥 SCROLL CONTAINER */}
      <div
        className="search-results"
        ref={containerRef}
        onWheel={(e) => {
          if (!containerRef.current) return;

          const container = containerRef.current;

          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            container.scrollLeft += e.deltaY;
          }
        }}
      >
        {results.map((c) => {
          const noCode = isNoCode(c);
          const premium = isPremium(c);
          const isUnlocked = unlocked[c.id];

          return (
            <div
              key={c.id}
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

              {!noCode && (
                <div className="overlay">
                  {premium ? (
                    isUnlocked ? (
                      <span>{c.code}</span>
                    ) : adLoading === c.id ? (
                      <span>Loading Ad...</span>
                    ) : (
                      <span>Watch Ad</span>
                    )
                  ) : (
                    <span>{c.code}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
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