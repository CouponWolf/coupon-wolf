"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const BRANDS = ["Nike", "Adidas", "ASOS", "Zara", "H&M", "Shein"];

export default function ClothingPage() {
  const [activeBrand, setActiveBrand] = useState("Nike");
  const [coupons, setCoupons] = useState<any[]>([]);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, [activeBrand]);

  const fetchCoupons = async () => {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .ilike("link", `%${activeBrand.toLowerCase()}%`)
      .eq("is_active", true);

    if (data) setCoupons(data);
  };

  // 🔥 MODEL IMAGE LOGIC
  const getModelImage = () => {
    const name = activeBrand;

    if (name === "Nike" || name === "Adidas" || name === "ASOS") {
      return `/models/${name}_model.png`;
    }

    const random = Math.floor(Math.random() * 3) + 1;
    return `/models/model_${random}.png`;
  };

  const handleTabClick = (brand: string) => {
    if (brand === activeBrand) return;

    setFlipping(true);

    setTimeout(() => {
      setActiveBrand(brand);
      setFlipping(false);
    }, 250);
  };

  return (
    <div className="clothing-page">

      {/* 🔥 TOP RIGHT ICONS */}
      <img src="/categories/clothing.png" className="clothing-icon" />
      <img src="/panels/corner_shape.png" className="corner-shape" />

      {/* 🔥 LEFT TABS */}
      <div className="brand-tabs">
        {BRANDS.map((b) => (
          <div
            key={b}
            className={`brand-tab ${activeBrand === b ? "active" : ""}`}
            onClick={() => handleTabClick(b)}
          >
            {b}
          </div>
        ))}
      </div>

      {/* 🔥 MAIN CONTENT */}
      <div className="clothing-content">

        {/* LEFT → DEALS */}
        <div className="deals-container">
          <h1 className="clothing-title">CLOTHING</h1>

          <div className="deals-scroll">
            {coupons.map((c, i) => {
              const premium = !(
                (c.discount || "").includes("10") ||
                (c.discount || "").includes("15")
              );

              return (
                <div
                  key={i}
                  className={`deal-card ${premium ? "premium" : ""}`}
                >
                  <div className="deal-left">
                    <img
                      src={`/logos/${new URL(c.link).hostname
                        .replace("www.", "")
                        .split(".")[0]}.png`}
                    />
                  </div>

                  <div className="deal-mid">
                    <div className="deal-discount">{c.discount}</div>
                    <div className="deal-title">{c.title}</div>
                  </div>

                  <div className="deal-right">
                    <button
                      onClick={() => window.open(c.link, "_blank")}
                    >
                      View Deal
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT → MODEL */}
        <div className="model-container">
          <div className={`model-frame ${flipping ? "flip" : ""}`}>
            <img src={getModelImage()} />
          </div>
        </div>

      </div>
    </div>
  );
}