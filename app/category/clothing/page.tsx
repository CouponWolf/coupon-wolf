"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const STORES = ["Nike", "Adidas", "ASOS", "Shein", "Zara", "Others"];

export default function ClothingPage() {
  const [activeStore, setActiveStore] = useState("Nike");
  const [coupons, setCoupons] = useState<any[]>([]);
  const [modelSrc, setModelSrc] = useState("");
  const [flip, setFlip] = useState(false);

  // 🔥 popup
  const [popup, setPopup] = useState({ show: false, x: 0, y: 0 });

  // 🔥 ads system
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});
  const [adLoading, setAdLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons(activeStore);
    loadModel(activeStore);

    setFlip(true);
    setTimeout(() => setFlip(false), 400);

    const stored = JSON.parse(localStorage.getItem("unlockedCoupons") || "{}");
    setUnlocked(stored);
  }, [activeStore]);

  // ===== FETCH =====
  const fetchCoupons = async (store: string) => {
    if (store === "Others") {
      const { data } = await supabase
        .from("coupons")
        .select("*")
        .eq("is_active", true)
        .eq("page_category", "clothing");

      if (data) setCoupons(data);
      return;
    }

    const { data } = await supabase
      .from("coupons")
      .select("*")
      .ilike("link", `%${store.toLowerCase()}%`)
      .eq("is_active", true);

    if (data) setCoupons(data);
  };

  // ===== MODEL =====
  const loadModel = (store: string) => {
    if (store === "Others") {
      const random = Math.floor(Math.random() * 3) + 1;
      setModelSrc(`/models/model_${random}.png`);
      return;
    }

    const capital = store.charAt(0).toUpperCase() + store.slice(1);
    const img = new Image();

    const path = `/models/${capital}_model.png`;

    img.onload = () => setModelSrc(path);
    img.onerror = () => {
      const random = Math.floor(Math.random() * 3) + 1;
      setModelSrc(`/models/model_${random}.png`);
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

  const buildAffiliate = (url: string) => url;

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

  // ===== CLICK BUTTON ONLY =====
  const handleClick = async (c: any, e: any) => {
    e.stopPropagation();

    const has_coupon = hasCode(c);
    const cheap = isCheap(c);
    const finalLink = buildAffiliate(c.link);

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

  const getLogo = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "").split(".")[0];
    } catch {
      return "fallback";
    }
  };

  // ===== UI =====
  return (
    <div className="clothing-page">

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

        {/* CONTENT */}
        <div className="clothing-content">

          {/* DEALS */}
          <div className="coupons-scroll">
            {coupons.map((c, i) => {
              const has_coupon = hasCode(c);
              const cheap = isCheap(c);
              const unlockedNow = unlocked[c.id];

              const isPremium = has_coupon && !cheap;

              return (
                <div key={i} className="coupon-card">

                  <img
                    className="card-logo"
                    src={`/logos/${getLogo(c.link)}.png`}
                    onError={(e: any) => (e.target.src = "/fallback.png")}
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