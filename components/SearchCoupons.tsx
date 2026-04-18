"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SearchCoupons() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [popup, setPopup] = useState({ show: false, x: 0, y: 0 });

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

  const handleClick = async (coupon: any, e: any) => {
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

      <div className="search-results">
        {results.map((c) => (
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

            <div className="overlay">
              <span>{c.code}</span>
            </div>
          </div>
        ))}
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