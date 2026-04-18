"use client";

import { useState, useEffect } from "react";
import { submitCoupon } from "@/lib/utils";

export default function SubmitPage() {
  const [form, setForm] = useState({
    title: "",
    code: "",
    discount: "",
    link: "",
    expires: "",
  });

  // 🔥 POPUP STATE
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // 🔥 POPUP FUNCTION
  const showPopup = (message: string, type = "success") => {
    setPopup({ show: true, message, type });

    setTimeout(() => {
      setPopup({ show: false, message: "", type: "success" });
    }, 1500);
  };

  useEffect(() => {
    const el = document.querySelector(".animate");
    if (el) {
      setTimeout(() => el.classList.add("show"), 100);
    }
  }, []);

  const handleSubmit = async () => {
    const res = await submitCoupon(form);

    if (!res) return;

    // 🔥 SHOW POPUP INSTEAD OF ALERT
    showPopup(res.message, res.success ? "success" : "error");

    if (res.success) {
      setForm({
        title: "",
        code: "",
        discount: "",
        link: "",
        expires: "",
      });
    }
  };

  return (
    <div className="page">

      <div className="dark-panel" />
      <div className="light-panel" />

      <div className="page-center">
        <div className="submit-box animate">

          <h1>Submit a Coupon</h1>

          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            placeholder="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />

          <input
            placeholder="Discount"
            value={form.discount}
            onChange={(e) => setForm({ ...form, discount: e.target.value })}
          />

          <input
            placeholder="Link"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />

          <input
            type="date"
            value={form.expires}
            onChange={(e) => setForm({ ...form, expires: e.target.value })}
          />

          <button className="btn-flat primary" onClick={handleSubmit}>
            Submit
          </button>

        </div>
      </div>

      {/* 🔥 CUSTOM POPUP */}
      {popup.show && (
        <div className={`custom-popup ${popup.type}`}>
          {popup.message}
        </div>
      )}

    </div>
  );
}