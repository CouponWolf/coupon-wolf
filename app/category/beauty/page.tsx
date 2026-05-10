"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const BRANDS = [
  "Sephora",
  "Ulta Beauty",
  "FragranceNet",
  "Rare Beauty",
  "Fenty Beauty",
  "Huda Beauty",
  "YesStyle",
  "Others",
];

export default function BeautyPage() {
  const [activeBrand, setActiveBrand] = useState("Sephora");
  const [coupons, setCoupons] = useState<any[]>([]);
  const [coverSrc, setCoverSrc] = useState("");
  const [flip, setFlip] = useState(false);

  const [popup, setPopup] = useState({ show: false, x: 0, y: 0 });

  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});
  const [adLoading, setAdLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons(activeBrand);
    loadCover(activeBrand);

    setFlip(true);
    setTimeout(() => setFlip(false), 400);

    const stored = JSON.parse(localStorage.getItem("unlockedCoupons") || "{}");
    setUnlocked(stored);
  }, [activeBrand]);

  // ===== FETCH =====
  const fetchCoupons = async (brand: string) => {

    if (brand === "Others") {
      const { data } = await supabase
        .from("coupons")
        .select("*")
        .eq("is_active", true)
        .eq("page_category", "beauty");

      if (data) setCoupons(data);
      return;
    }

    const { data } = await supabase
      .from("coupons")
      .select("*")
      .ilike("title", `%${brand.toLowerCase()}%`)
      .eq("is_active", true);

    if (data) setCoupons(data);
  };

  // ===== COVER =====
  const loadCover = (brand: string) => {

    if (brand === "Others") {
      setCoverSrc("/beauty-covers/other_beauty.png");
      return;
    }

    const formatted = brand
      .toLowerCase()
      .replace(/\s+/g, "");

    const img = new Image();
    const path = `/beauty-covers/${formatted}_beauty.png`;

    img.onload = () => setCoverSrc(path);

    img.onerror = () => {
      setCoverSrc("/beauty-covers/other_beauty.png");
    };

    img.src = path;
  };

  // ===== HELPERS =====
  const hasCode = (c: any) => c.code && c.code.trim() !== "";

  const isCheap = (c: any) => {
    const d = (c.discount || "").toLowerCase();
    const p = d.match(/(\d+)%/);
    const dol = d.match(/\$?(\d+)/);

    const percent = p ? parseInt(p[1]) : null;
    const dollars = dol ? parseInt(dol[1]) : null;

    if (percent !== null && percent <= 15) return true;
    if (dollars !== null && dollars <= 10) return true;

    return false;
  };

  const getTitleLogo = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, "_");
  };

  const getDomainName = (url: string) => {
    try {
      return new URL(url).hostname
        .replace("www.", "")
        .split(".")[0]
        .toLowerCase();
    } catch {
      return null;
    }
  };

  // ===== AD =====
  const watchAd = (id: string) => {
    if (adLoading) return;

    setAdLoading(id);

    setTimeout(() => {
      const updated = { ...unlocked, [id]: true };
      setUnlocked(updated);
      localStorage.setItem("unlockedCoupons", JSON.stringify(updated));
      setAdLoading(null);
    }, 2000);
  };

  // ===== CLICK =====
  const handleClick = async (c: any, e: any) => {
    e.stopPropagation();

    const has_coupon = hasCode(c);
    const cheap = isCheap(c);
    const isUnlocked = unlocked[c.id];

    const finalLink = c.link;

    // ❌ NO CODE
    if (!has_coupon) {
      await supabase.from("clicks").insert([{ coupon_id: c.id }]);

      if (finalLink) window.open(finalLink, "_blank");
      return;
    }

    // 🟢 CHEAP
    if (cheap) {
      navigator.clipboard.writeText(c.code);

      await supabase.from("clicks").insert([{ coupon_id: c.id }]);

      setPopup({ show: true, x: e.clientX, y: e.clientY });

      setTimeout(() => {
        setPopup({ show: false, x: 0, y: 0 });
        if (finalLink) window.open(finalLink, "_blank");
      }, 700);

      return;
    }

    // 🔒 PREMIUM
    if (!isUnlocked) {
      watchAd(c.id);
      return;
    }

    // ✅ AFTER UNLOCK
    navigator.clipboard.writeText(c.code);

    await supabase.from("clicks").insert([{ coupon_id: c.id }]);

    setPopup({ show: true, x: e.clientX, y: e.clientY });

    setTimeout(() => {
      setPopup({ show: false, x: 0, y: 0 });
      if (finalLink) window.open(finalLink, "_blank");
    }, 700);
  };

  return (
    <div className="clothing-page">

      <img src="/panels/corner_shape.png" className="corner-shape" />
      <img src="/categories/beauty.png" className="category-icon" />

      <h1 className="clothing-title">BEAUTY</h1>

      <div className="clothing-container">

        <div className="store-tabs">
          {BRANDS.map((b) => (
            <button
              key={b}
              className={`store-btn ${activeBrand === b ? "active" : ""}`}
              onClick={() => setActiveBrand(b)}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="clothing-content">

          <div className="coupons-scroll">
            {coupons.map((c, i) => {
              const has_coupon = hasCode(c);
              const cheap = isCheap(c);
              const unlockedNow = unlocked[c.id];

              const domainLogo = getDomainName(c.link);
              const titleLogo = getTitleLogo(c.title);

              return (
                <div key={i} className="coupon-card">

                  {/* ✅ FIXED LOGO SYSTEM */}
                  <img
                    className="card-logo"
                    src={`/logos/${domainLogo}.png`}
                    onError={(e: any) => {
                      e.target.onerror = null;
                      e.target.src = `/logos/${titleLogo}.png`;
                    }}
                  />

                  <div className="coupon-info">
                    <h3>{c.title}</h3>
                    <p className="discount">{c.discount}</p>

                    {has_coupon && (
                      <span className="code">
                        {cheap
                          ? c.code
                          : unlockedNow
                          ? c.code
                          : "PREMIUM CODE"}
                      </span>
                    )}
                  </div>

                  <button
                    className="go-btn"
                    onClick={(e) => handleClick(c, e)}
                  >
                    {!has_coupon
                      ? "Get Deal"
                      : cheap
                      ? "Get Code"
                      : unlockedNow
                      ? "Get Code"
                      : adLoading === c.id
                      ? "Loading..."
                      : "Watch Ad"}
                  </button>

                </div>
              );
            })}
          </div>

          <div className="model-box">
            <img key={coverSrc} className={flip ? "flip" : ""} src={coverSrc} />
          </div>

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