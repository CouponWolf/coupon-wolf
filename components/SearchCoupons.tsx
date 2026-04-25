"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SearchCoupons() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [popup, setPopup] = useState({ show: false, x: 0, y: 0 });

  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});
  const [adLoading, setAdLoading] = useState<string | null>(null);

  const trackRef = useRef<HTMLDivElement | null>(null);

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
  const hasCode = (c: any) => c.code && c.code.trim() !== "";

  const isPremium = (c: any) => {
    const discount = c.discount?.toLowerCase() || "";

    const percentMatch = discount.match(/(\d+)%/);
    if (percentMatch && parseInt(percentMatch[1]) > 15) return true;

    const dollarMatch = discount.match(/\$(\d+)/);
    if (dollarMatch && parseInt(dollarMatch[1]) > 10) return true;

    return false;
  };

  // ===== FAKE AD =====
  const watchAd = (id: string) => {
    if (adLoading) return;

    setAdLoading(id);

    setTimeout(() => {
      setUnlocked((prev) => ({ ...prev, [id]: true }));
      setAdLoading(null);
    }, 2000);
  };

  // ===== CLICK =====
  const handleClick = async (c: any, e: any) => {
    const noCode = !hasCode(c);
    const premium = isPremium(c);
    const isUnlocked = unlocked[c.id];

    // 🔥 NO CODE → DIRECT LINK
    if (noCode) {
      window.open(c.link, "_blank");
      return;
    }

    // 🔥 PREMIUM LOCK
    if (premium && !isUnlocked) {
      watchAd(c.id);
      return;
    }

    // 🔥 NORMAL COPY
    navigator.clipboard.writeText(c.code);

    await supabase.from("clicks").insert([
      { coupon_id: c.id }
    ]);

    setPopup({
      show: true,
      x: e.clientX,
      y: e.clientY,
    });

    setTimeout(() => {
      setPopup({ show: false, x: 0, y: 0 });
      window.open(c.link, "_blank");
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

      {/* 🔥 ROW LIKE PAGE 2 */}
      <div className="search-row">
        <div
          className="search-track"
          ref={trackRef}
          onWheel={(e) => {
            if (!trackRef.current) return;

            // 🔥 ONLY WHEN HOVERING CARD
            const isHoveringCard = (e.target as HTMLElement).closest(".card");

            if (!isHoveringCard) return;

            e.preventDefault();
            e.stopPropagation();

            trackRef.current.scrollLeft += e.deltaY;
          }}
        >
          {results.map((c) => {
            const noCode = !hasCode(c);
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

                {/* 🔥 ONLY SHOW OVERLAY IF HAS CODE */}
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