"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const GAMES = [
  "Genshin Impact",
  "Wuthering Waves",
  "Zenless Zone Zero",
  "Naraka",
  "Seven Deadly Sins",
  "Others"
];

export default function GamingPage() {
  const [activeGame, setActiveGame] = useState("Genshin Impact");
  const [coupons, setCoupons] = useState<any[]>([]);
  const [coverSrc, setCoverSrc] = useState("");
  const [flip, setFlip] = useState(false);

  const [popup, setPopup] = useState({ show: false, x: 0, y: 0 });

  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});
  const [adLoading, setAdLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons(activeGame);
    loadCover(activeGame);

    setFlip(true);
    setTimeout(() => setFlip(false), 400);

    const stored = JSON.parse(localStorage.getItem("unlockedCoupons") || "{}");
    setUnlocked(stored);
  }, [activeGame]);

  // ===== FETCH =====
  const fetchCoupons = async (game: string) => {

    if (game === "Others") {
      const { data } = await supabase
        .from("coupons")
        .select("*")
        .eq("is_active", true)
        .eq("page_category", "gaming");

      if (data) setCoupons(data);
      return;
    }

    const { data } = await supabase
      .from("coupons")
      .select("*")
      .ilike("title", `%${game.toLowerCase()}%`)
      .eq("is_active", true);

    if (data) setCoupons(data);
  };

  // ===== COVER =====
  const loadCover = (game: string) => {

    // ✅ OTHERS
    if (game === "Others") {
      setCoverSrc("/gaming-covers/others_cover.png");
      return;
    }

    // ✅ FORMAT WITH "-"
    const formatted = game
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/:/g, "");

    const img = new Image();
    const path = `/gaming-covers/${formatted}_cover.png`;

    img.onload = () => setCoverSrc(path);

    img.onerror = () => {
      setCoverSrc("/gaming-covers/others_cover.png");
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

    // 🔥 NO LINK → COPY ONLY
    if (!c.link) {
      navigator.clipboard.writeText(c.code);

      setPopup({ show: true, x: e.clientX, y: e.clientY });

      setTimeout(() => {
        setPopup({ show: false, x: 0, y: 0 });
      }, 700);

      return;
    }

    const finalLink = c.link;

    if (!has_coupon) {
      window.open(finalLink, "_blank");
      return;
    }

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

  // ===== LOGO =====
  const getLogo = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, "_");
  };

  // ===== UI =====
  return (
    <div className="clothing-page">

      <img src="/panels/corner_shape.png" className="corner-shape" />
      <img src="/categories/gaming.png" className="category-icon" />

      <h1 className="clothing-title">GAMING</h1>

      <div className="clothing-container">

        <div className="store-tabs">
          {GAMES.map((g) => (
            <button
              key={g}
              className={`store-btn ${activeGame === g ? "active" : ""}`}
              onClick={() => setActiveGame(g)}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="clothing-content">

          <div className="coupons-scroll">
            {coupons.map((c, i) => {
              const has_coupon = hasCode(c);
              const cheap = isCheap(c);
              const unlockedNow = unlocked[c.id];

              return (
                <div key={i} className="coupon-card">

                  <img
                    className="card-logo"
                    src={`/logos/${getLogo(c.title)}.png`}
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