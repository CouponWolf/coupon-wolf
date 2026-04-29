"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const STORES = ["Nike", "Adidas", "ASOS", "Shein", "Zara", "Others"];

export default function ClothingPage() {
  const [activeStore, setActiveStore] = useState("Nike");
  const [coupons, setCoupons] = useState<any[]>([]);
  const [affiliateRules, setAffiliateRules] = useState<any[]>([]);

  const [modelSrc, setModelSrc] = useState("");
  const [flip, setFlip] = useState(false);

  // 🔥 POPUP
  const [popup, setPopup] = useState({ show: false, x: 0, y: 0 });

  // 🔥 ADS SYSTEM
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});
  const [adLoading, setAdLoading] = useState<string | null>(null);

  // ===== INIT =====
  useEffect(() => {
    fetchAffiliateRules();

    const stored = JSON.parse(localStorage.getItem("unlockedCoupons") || "{}");
    setUnlocked(stored);
  }, []);

  useEffect(() => {
    fetchCoupons(activeStore);
    loadModel(activeStore);

    setFlip(true);
    setTimeout(() => setFlip(false), 400);
  }, [activeStore]);

  // ===== FETCH COUPONS =====
  const fetchCoupons = async (store: string) => {
    let query = supabase
      .from("coupons")
      .select("*")
      .eq("is_active", true);

    if (store === "Others") {
      query = query.eq("page_category", "clothing");
    } else {
      query = query.ilike("link", `%${store.toLowerCase()}%`);
    }

    const { data } = await query;

    if (data) setCoupons(data);
  };

  // ===== AFFILIATE =====
  const fetchAffiliateRules = async () => {
    const { data } = await supabase.from("affiliate_rules").select("*");
    if (data) setAffiliateRules(data);
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

  // ===== LOGIC =====
  const hasCode = (c: any) => c.code && c.code.trim() !== "";

  const isCheap = (c: any) => {
    const d = (c.discount || "").toLowerCase();

    const p = d.match(/(\d+)%/);
    const $ = d.match(/\$?(\d+)/);

    const percent = p ? parseInt(p[1]) : null;
    const dollars = $ ? parseInt($[1]) : null;

    if (percent !== null && percent <= 15) return true;
    if (dollars !== null && dollars <= 10) return true;

    return false;
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
    const finalLink = buildAffiliateLink(c.link);

    const has_coupon = hasCode(c);
    const cheap = isCheap(c);

    // NO CODE
    if (!has_coupon) {
      window.open(finalLink, "_blank");
      return;
    }

    // CHEAP
    if (cheap) {
      navigator.clipboard.writeText(c.code);

      await supabase.from("clicks").insert([{ coupon_id: c.id }]);

      setPopup({ show: true, x: e.clientX, y: e.clientY });

      setTimeout(() => {
        setPopup({ show: false, x: 0, y: 0 });
        window.open(finalLink, "_blank");
      }, 700);

      return;
    }

    // PREMIUM
    if (!unlocked[c.id]) {
      watchAd(c.id);
      return;
    }

    navigator.clipboard.writeText(c.code);

    await supabase.from("clicks").insert([{ coupon_id: c.id }]);

    setPopup({ show: true, x: e.clientX, y: e.clientY });

    setTimeout(() => {
      setPopup({ show: false, x: 0, y: 0 });
      window.open(finalLink, "_blank");
    }, 700);
  };

  // ===== MODEL =====
  const loadModel = (store: string) => {
    if (store === "Others") {
      const r = Math.floor(Math.random() * 3) + 1;
      setModelSrc(`/models/model_${r}.png`);
      return;
    }

    const name = store.charAt(0).toUpperCase() + store.slice(1);
    setModelSrc(`/models/${name}_model.png`);
  };

  // ===== LOGO =====
  const getLogo = (url: string) => {
    try {
      return new URL(url).hostname
        .replace("www.", "")
        .split(".")[0];
    } catch {
      return "fallback";
    }
  };

  return (
    <div className="clothing-page">

      {/* TOP RIGHT */}
      <img src="/panels/corner_shape.png" className="corner-shape" />
      <img src="/categories/clothing.png" className="category-icon" />

      <h1 className="clothing-title">CLOTHING</h1>

      <div className="clothing-container">

        {/* TABS */}
        <div className="store-tabs">
          {STORES.map((s) => (
            <button
              key={s}
              className={`store-btn ${activeStore === s ? "active" : ""}`}
              onClick={() => setActiveStore(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="clothing-content">

          {/* DEALS */}
          <div className="coupons-scroll">
            {coupons.map((c, i) => {
              const has_coupon = hasCode(c);
              const cheap = isCheap(c);
              const isUnlocked = unlocked[c.id];
              const isPremium = has_coupon && !cheap;

              return (
                <div
                  key={i}
                  className={`coupon-card ${isPremium ? "premium" : ""}`}
                  onClick={(e) => handleClick(c, e)}
                >
                  <img
                    className="card-logo"
                    src={`/logos/${getLogo(c.link)}.png`}
                    onError={(e: any) => (e.target.src = "/fallback.png")}
                  />

                  <div className="coupon-info">
                    <h3>{c.title}</h3>
                    <p className="discount">{c.discount}</p>
                  </div>

                  {/* OVERLAY */}
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

          {/* MODEL */}
          <div className="model-box">
            <img key={modelSrc} className={flip ? "flip" : ""} src={modelSrc} />
          </div>

        </div>
      </div>

      {/* POPUP */}
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