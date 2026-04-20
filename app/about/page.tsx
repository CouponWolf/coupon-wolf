"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AboutPage() {

  // 🔥 SCROLL ANIMATION
  useEffect(() => {
    const elements = document.querySelectorAll(".about-animate");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          } else {
            entry.target.classList.remove("show");
          }
        });
      },
      { threshold: 0.3 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="container">

      {/* ===== PAGE 1 ===== */}
      <section className="page">
        <div className="dark-panel" />
        <div className="light-panel" />

        <div className="about-center">
          <div className="about-block about-animate">
            <h1>About Coupon Wolve</h1>

            <p className="about-text">
              Coupon Wolve is built to help people find the best deals online —
              quickly, transparently, and without hidden tricks.
            </p>
          </div>
        </div>

        <div className="about-page-arrows bounce">↓↓↓</div>
      </section>

      {/* ===== PAGE 2 ===== */}
      <section className="page">
        <div className="dark-panel" />
        <div className="light-panel" />

        <div className="about-center">
          <div className="about-block about-animate">
            <h1>How It Works</h1>

            <p className="about-text">
              We collect and display the best available coupon codes from across
              the internet. Our system highlights what’s new, what’s valuable,
              and what people actually use — so you don’t waste time testing
              dead or fake codes.
            </p>
          </div>
        </div>

        <div className="about-page-arrows bounce">↓↓↓</div>
      </section>

      {/* ===== PAGE 3 ===== */}
      <section className="page">
        <div className="dark-panel" />
        <div className="light-panel" />

        <div className="about-center">
          <div className="about-block about-animate">
            <h1>Fair & Transparent</h1>

            <p className="about-text">
              If you're already using someone else's affiliate link, we respect
              that. We do NOT override or steal commissions.
            </p>

            <p className="about-text">
              We also don’t make shady deals to hide better coupons. What you see
              here is what actually works — no manipulation.
            </p>
          </div>
        </div>

        <div className="about-page-arrows bounce">↓↓↓</div>
      </section>

      {/* ===== PAGE 4 ===== */}
      <section className="page">
        <div className="dark-panel" />
        <div className="light-panel" />

        <div className="about-center">
          <div className="about-block about-animate">
            <h1>Built With the Community</h1>

            <p className="about-text">
              Coupon Wolve grows with its users. You can help others by sharing
              working codes, reporting expired ones, and contributing to a
              better experience for everyone.
            </p>

            <p className="about-text">
              Together, we make sure no one overpays.
            </p>

            <Link href="/">
              <button className="btn-flat primary about-back">
                ← Back to Home
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}