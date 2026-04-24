"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function PrivacyPage() {

  // 🔥 SAME ANIMATION SYSTEM
  useEffect(() => {
    const elements = document.querySelectorAll(".privacy-animate");

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

      <section className="page">
        <div className="dark-panel" />
        <div className="light-panel" />

        <div className="privacy-block privacy-animate">

          <h1>Privacy Policy</h1>

          <p className="privacy-text">
            At Coupon Wolve, we value your privacy and are committed to protecting your personal information.
          </p>

          <p className="privacy-text">
            We may collect basic information such as your email address when you create an account or contact us.
            This information is used only to provide and improve our services.
          </p>

          <p className="privacy-text">
            We do not sell, trade, or share your personal information with third parties without your consent,
            except where required by law.
          </p>

          <p className="privacy-text">
            Our website may use cookies and similar technologies to improve user experience and analyze traffic.
          </p>

          <p className="privacy-text">
            By using our website, you agree to this privacy policy.
          </p>

          <p className="privacy-text">
            If you have any questions about this policy, please contact us.
          </p>

          <Link href="/">
            <button className="btn-flat primary privacy-back">
              ← Back to Home
            </button>
          </Link>

        </div>
      </section>

    </div>
  );
}