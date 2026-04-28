"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [tab, setTab] = useState("add");

  const [coupons, setCoupons] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [clicksMap, setClicksMap] = useState<Record<string, number>>({});
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    code: "",
    discount: "",
    link: "",
    affiliate_link: "",
    expires: "",
    page: "", // 🔥 NEW
  });

  // 🔐 PROTECTION
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user || user.email !== "hamidmohi98@gmail.com") {
        router.push("/");
        return;
      }

      setAuthorized(true);
    };

    check();
  }, []);

  useEffect(() => {
    if (!authorized) return;
    fetchCoupons();
    fetchClicks();
    fetchPending();
  }, [authorized]);

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const fetchCoupons = async () => {
    const { data } = await supabase.from("coupons").select("*");
    if (data) setCoupons(data);
  };

  const fetchPending = async () => {
    const { data } = await supabase.from("pending_coupons").select("*");
    if (data) setPending(data);
  };

  const fetchClicks = async () => {
    const { data } = await supabase.from("clicks").select("coupon_id");

    const map: Record<string, number> = {};
    data?.forEach((c) => {
      map[c.coupon_id] = (map[c.coupon_id] || 0) + 1;
    });

    setClicksMap(map);
  };

  // ===== ADD =====
  const handleAdd = async () => {
    const { error } = await supabase.from("coupons").insert({
      title: form.title,
      code: form.code,
      discount: form.discount,
      link: form.link,
      affiliate_link: form.affiliate_link || null,
      expires_at: form.expires || null,
      is_active: true,
      category: null,
      page: form.page || null, // 🔥 NEW
    });

    if (error) return alert(error.message);

    resetForm();
    fetchCoupons();
  };

  const resetForm = () => {
    setForm({
      title: "",
      code: "",
      discount: "",
      link: "",
      affiliate_link: "",
      expires: "",
      page: "",
    });
  };

  // ===== EDIT =====
  const startEdit = (c: any) => {
    setEditingCoupon(c);

    setForm({
      title: c.title,
      code: c.code,
      discount: c.discount,
      link: c.link,
      affiliate_link: c.affiliate_link || "",
      expires: c.expires_at ? c.expires_at.split("T")[0] : "",
      page: c.page || "", // 🔥
    });

    setTab("edit");
  };

  const saveEdit = async () => {
    const { error } = await supabase
      .from("coupons")
      .update({
        title: form.title,
        code: form.code,
        discount: form.discount,
        link: form.link,
        affiliate_link: form.affiliate_link || null,
        expires_at: form.expires || null,
        page: form.page || null, // 🔥
      })
      .eq("id", editingCoupon.id);

    if (error) return alert(error.message);

    setEditingCoupon(null);
    setTab("manage");
    resetForm();
    fetchCoupons();
  };

  // ===== CATEGORY =====
  const updateCategory = async (id: string, value: string) => {
    await supabase
      .from("coupons")
      .update({ category: value || null })
      .eq("id", id);

    fetchCoupons();
  };

  // ===== PAGE (NEW) =====
  const updatePage = async (id: string, value: string) => {
    await supabase
      .from("coupons")
      .update({ page: value || null })
      .eq("id", id);

    fetchCoupons();
  };

  // ===== TOGGLE =====
  const toggleActive = async (c: any) => {
    await supabase
      .from("coupons")
      .update({ is_active: !c.is_active })
      .eq("id", c.id);

    fetchCoupons();
  };

  // ===== DELETE =====
  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;

    await supabase.from("coupons").delete().eq("id", id);

    fetchCoupons();
    fetchClicks();
  };

  // ===== APPROVE =====
  const approveCoupon = async (c: any) => {
    if (loadingId) return;
    setLoadingId(c.id);

    try {
      await supabase.from("coupons").insert({
        ...c,
        is_active: true,
        page: null, // 🔥 force assign later
      });

      await supabase.from("pending_coupons").delete().eq("id", c.id);

      fetchPending();
      fetchCoupons();
    } catch (err: any) {
      alert(err.message);
    }

    setLoadingId(null);
  };

  if (!authorized) {
    return <div style={{ padding: "40px" }}>Checking access...</div>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1 className="admin-header">Admin Panel</h1>

      <div className="admin-tabs">
        <button onClick={() => setTab("add")}>Add</button>
        <button onClick={() => setTab("manage")}>Manage</button>
        <button onClick={() => setTab("pending")}>Pending</button>
        {tab === "edit" && <button className="active">Edit</button>}
      </div>

      {/* ===== ADD ===== */}
      {tab === "add" && (
        <div className="auth-box">
          <h2>Add Coupon</h2>

          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <input placeholder="Discount" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
          <input placeholder="Link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <input placeholder="Affiliate Link" value={form.affiliate_link} onChange={(e) => setForm({ ...form, affiliate_link: e.target.value })} />
          <input type="date" value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })} />

          {/* 🔥 PAGE SELECT */}
          <select value={form.page} onChange={(e) => setForm({ ...form, page: e.target.value })}>
            <option value="">Select Page</option>
            <option value="clothing">Clothing</option>
            <option value="gaming">Gaming</option>
            <option value="tech">Tech</option>
            <option value="beauty">Beauty</option>
            <option value="home">Home</option>
            <option value="fitness">Fitness</option>
            <option value="travel">Travel</option>
          </select>

          <button className="btn-primary" onClick={handleAdd}>
            Add Coupon
          </button>
        </div>
      )}

      {/* ===== MANAGE ===== */}
      {tab === "manage" && (
        <div className="admin-table">

          <div className="admin-row header">
            <span>Title</span>
            <span>Code</span>
            <span>Discount</span>
            <span>Category</span>
            <span>Page</span> {/* 🔥 */}
            <span>Clicks</span>
            <span>Actions</span>
          </div>

          {coupons.map((c) => (
            <div key={c.id} className="admin-row">

              <span>{c.title}</span>
              <span>{c.code}</span>
              <span>{c.discount}</span>

              {/* CATEGORY */}
              <select value={c.category || ""} onChange={(e) => updateCategory(c.id, e.target.value)}>
                <option value="">None</option>
                <option value="new">New</option>
                <option value="best">Best</option>
                <option value="used">Used</option>
              </select>

              {/* 🔥 PAGE */}
              <select value={c.page || ""} onChange={(e) => updatePage(c.id, e.target.value)}>
                <option value="">None</option>
                <option value="clothing">Clothing</option>
                <option value="gaming">Gaming</option>
                <option value="tech">Tech</option>
                <option value="beauty">Beauty</option>
                <option value="home">Home</option>
                <option value="fitness">Fitness</option>
                <option value="travel">Travel</option>
              </select>

              <span>{clicksMap[c.id] || 0}</span>

              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => toggleActive(c)}>
                  {c.is_active ? "Active" : "Off"}
                </button>

                <button onClick={() => startEdit(c)}>Edit</button>

                <button onClick={() => deleteCoupon(c.id)}>Delete</button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}