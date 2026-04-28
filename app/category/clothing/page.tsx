"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const STORES = ["Nike", "Adidas", "ASOS", "Shein", "Zara"];

export default function ClothingPage() {
  const [activeStore, setActiveStore] = useState("Nike");
  const [coupons, setCoupons] = useState<any[]>([]);
  const [modelSrc, setModelSrc] = useState("");
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    fetchCoupons(activeStore);
    loadModel(activeStore);

    setFlip(true);
    setTimeout(() => setFlip(false), 400);
  }, [activeStore]);

  const fetchCoupons = async (store: string) => {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .ilike("link", `%${store.toLowerCase()}%`)
      .eq("is_active", true);

    if (data) setCoupons(data);
  };

  // ✅ FIXED IMAGE SYSTEM
  const loadModel = (store: string) => {
    const capital = store.charAt(0).toUpperCase() + store.slice(1);
    const specific = `/models/${capital}_model.png`;

    const fallback = [
      "/models/model_1.png",
      "/models/model_2.png",
      "/models/model_3.png",
    ];

    const img = new Image();

    img.onload = () => {
      setModelSrc(specific);
    };

    img.onerror = () => {
      const random = fallback[Math.floor(Math.random() * fallback.length)];
      setModelSrc(random);
    };

    img.src = specific;
  };

  return (
    <div className="clothing-page">

      {/* TOP RIGHT */}
      <img src="/panels/corner_shape.png" className="corner-shape" />
      <img src="/categories/clothing.png" className="category-icon" />

      {/* TITLE */}
      <h1 className="clothing-title">CLOTHING</h1>

      {/* MAIN */}
      <div className="clothing-container">

        {/* TABS */}
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

        {/* CONTENT */}
        <div className="clothing-content">

          {/* DEALS */}
          <div className="coupons-scroll">
            {coupons.map((c, i) => (
              <div key={i} className="coupon-card">

                <div className="coupon-info">
                  <h3>{c.title}</h3>
                  <p className="discount">{c.discount}</p>
                  {c.code && <span className="code">{c.code}</span>}
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

          {/* MODEL */}
          <div className="model-box">
            <img
              key={modelSrc}
              className={flip ? "flip" : ""}
              src={modelSrc}
            />
          </div>

        </div>
      </div>
    </div>
  );
}