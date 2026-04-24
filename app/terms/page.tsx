"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function TermsPage() {

  useEffect(() => {
    const elements = document.querySelectorAll(".terms-animate");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="container">

      <section className="page terms-page">
        <div className="dark-panel" />
        <div className="light-panel" />

        {/* 🔥 SCROLLABLE AREA */}
        <div className="terms-wrapper">

          <div className="terms-block terms-animate">

            <h1>Terms of Service</h1>

            <p className="terms-text">
              By accessing and using Coupon Wolve, you agree to comply with and be bound by these terms.
            </p>

            <p className="terms-text">
              Our platform provides coupon codes and deals for informational purposes only. We do not guarantee
              that all codes will work at all times.
            </p>

            <p className="terms-text">
              Users are responsible for how they use the information provided on this website.
            </p>

            <p className="terms-text">
              We reserve the right to update, modify, or remove content at any time without notice.
            </p>

            <p className="terms-text">
              Any misuse of the platform, including attempts to manipulate or abuse the system,
              may result in restricted access.
            </p>

            <p className="terms-text">
              By continuing to use this website, you accept these terms.
            </p>

            <Link href="/">
              <button className="btn-flat primary terms-back">
                ← Back to Home
              </button>
            </Link>

          </div>

        </div>
      </section>

    </div>
  );
}