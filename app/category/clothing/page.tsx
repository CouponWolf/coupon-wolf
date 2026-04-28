"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const STORES = ["Nike", "Adidas", "ASOS", "Shein", "Zara"];

export default function ClothingPage() {
  const [activeStore, setActiveStore] = useState("Nike");
  const [coupons, setCoupons] = useState<any[]>([]);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    fetchCoupons(activeStore);

    // 🔥 trigger flip animation
    setFlip(true);
    setTimeout(() => setFlip(false), 500);
  }, [activeStore]);

  const fetchCoupons = async (store: string) => {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .ilike("link", `%${store.toLowerCase()}%`)
      .eq("is_active", true);

    if (data) setCoupons(data);
  };

  // ===== 🧠 SMART IMAGE LOGIC =====
  const getModelImage = () => {
    const capital = activeStore.charAt(0).toUpperCase() + activeStore.slice(1);

    // try specific model first
    const specific = `/models/${capital}_model.png`;

    // fallback random
    const fallbackImages = ["/models/model_1.png", "/models/model_2.png", "/models/model_3.png"];
    const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

    return specific + "?v=" + new Date().getTime(); // force refresh
  };

  return (
    <div className="clothing-page">

      {/* ===== TOP RIGHT VISUAL ===== */}
      <img src="/panels/corner_shape.png" className="corner-shape" />
      <img src="/categories/clothing.png" className="category-icon" />

      {/* ===== TITLE ===== */}
      <h1 className="clothing-title">CLOTHING</h1>

      {/* ===== MAIN CONTAINER ===== */}
      <div className="clothing-container">

        {/* ===== LEFT TABS ===== */}
        <div className="store-tabs">
          {STORES.map((store) => (
            <button
              key={store}
              className={`store-btn ${activeStore === store ? "active" : ""}`}
              onClick={() => setActiveStore(store)}
            >
              {store}
            </button>
          ))}
        </div>

        {/* ===== CONTENT ===== */}
        <div className="clothing-content">

          {/* ===== COUPONS SCROLL ===== */}
          <div className="coupons-scroll">
            {coupons.map((c, i) => (
              <div key={i} className="coupon-card">
                <div>
                  <h3>{c.title}</h3>
                  <p className="discount">{c.discount}</p>
                  <span className="code">{c.code}</span>
                </div>

                <button
                  className="go-btn"
                  onClick={() => window.open(c.link, "_blank")}
                >
                  Get Deal
                </button>
              </div>
            ))}
          </div>

          {/* ===== MODEL SIDE ===== */}
          <div className={`model-box ${flip ? "flip" : ""}`}>
            <img src={getModelImage()} />
          </div>

        </div>
      </div>
    </div>
  );
}