"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ContactPage() {

  // 🔥 SAME ANIMATION ENGINE (LIKE ABOUT)
  useEffect(() => {
    const elements = document.querySelectorAll(".contact-animate");

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

    return () => observer.disconnect();
  }, []);

  return (
    <div className="container">

      {/* ===== PAGE 1 ===== */}
      <section className="page">

        <div className="dark-panel" />
        <div className="light-panel" />

        <div className="contact-block contact-animate">
          <h1>Contact Us</h1>

          <p className="contact-text">
            Have a question, suggestion, or found a broken coupon?
            We’d love to hear from you.
          </p>

          <p className="contact-text">
            Reach out and we’ll get back to you as soon as possible.
          </p>

          {/* 🔥 EMAIL */}
          <div className="contact-info">
            <span>Email:</span>
            <a href="mailto:support@couponwolve.com">
              support@couponwolve.com
            </a>
          </div>

          {/* 🔥 FUTURE FORM NOTE */}
          <p className="contact-note">
            (Contact form coming soon)
          </p>

          <Link href="/">
            <button className="btn-flat primary contact-back">
              ← Back to Home
            </button>
          </Link>
        </div>

      </section>

    </div>
  );
}