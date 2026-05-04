"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [tab, setTab] = useState("add");

  const [coupons, setCoupons] = useState<any[]>([]);
  const [search, setSearch] = useState("");
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
  }, [authorized, search]);

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const fetchCoupons = async () => {
    let query = supabase
      .from("coupons")
      .select("*")
      .order("updated_at", { ascending: false }); // 🔥 newest first

    if (search.trim() !== "") {
      query = query.or(
        `title.ilike.%${search}%,link.ilike.%${search}%,category.ilike.%${search}%`
      );
    }

    const { data } = await query;

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
      page_category: null, // ✅ NEW
      updated_at: new Date().toISOString(),
    });

    if (error) return alert(error.message);

    setForm({
      title: "",
      code: "",
      discount: "",
      link: "",
      affiliate_link: "",
      expires: "",
    });

    fetchCoupons();
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingCoupon.id);

    if (error) return alert(error.message);

    setEditingCoupon(null);
    setTab("manage");

    setForm({
      title: "",
      code: "",
      discount: "",
      link: "",
      affiliate_link: "",
      expires: "",
    });

    fetchCoupons();
  };

  // ===== TOGGLE =====
  const toggleActive = async (c: any) => {
    const { error } = await supabase
      .from("coupons")
      .update({
        is_active: !c.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", c.id);

    if (error) return alert("Toggle failed");

    fetchCoupons();
  };

  // ===== DELETE =====
  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;

    await supabase.from("coupons").delete().eq("id", id);

    fetchCoupons();
    fetchClicks();
  };

  // ===== CATEGORY (HOME PAGE) =====
  const updateCategory = async (id: string, value: string) => {
    const categoryValue = value === "" ? null : value;

    await supabase
      .from("coupons")
      .update({
        category: categoryValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    fetchCoupons();
  };

  // ===== 🆕 PAGE CATEGORY (NEW) =====
  const updatePageCategory = async (id: string, value: string) => {
    const pageValue = value === "" ? null : value;

    await supabase
      .from("coupons")
      .update({
        page_category: pageValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    fetchCoupons();
  };

  // ===== APPROVE =====
  const approveCoupon = async (c: any) => {
    if (loadingId) return;
    setLoadingId(c.id);

    try {
      const { data: existing } = await supabase
        .from("coupons")
        .select("id")
        .eq("code", c.code)
        .eq("link", c.link)
        .maybeSingle();

      if (!existing) {
        const { error: insertError } = await supabase
          .from("coupons")
          .insert({
            title: c.title,
            code: c.code,
            discount: c.discount,
            link: c.link,
            affiliate_link: c.affiliate_link || null,
            expires_at: c.expires_at || null,
            is_active: true,
            category: null,
            page_category: null, // ✅ NEW
          });

        if (insertError) throw insertError;
      }

      await supabase.from("pending_coupons").delete().eq("id", c.id);

      await fetchPending();
      await fetchCoupons();
    } catch (err: any) {
      alert("Approve failed: " + err.message);
    }

    setLoadingId(null);
  };

  // ===== REJECT =====
  const rejectCoupon = async (id: string) => {
    if (!confirm("Reject this submission?")) return;

    await supabase.from("pending_coupons").delete().eq("id", id);
    fetchPending();
  };

  if (!authorized) {
    return <div style={{ padding: "40px" }}>Checking access...</div>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1 className="admin-header">Admin Panel</h1>

      <div className="admin-tabs">
        <button onClick={() => setTab("add")} className={tab === "add" ? "active" : ""}>Add</button>
        <button onClick={() => setTab("manage")} className={tab === "manage" ? "active" : ""}>Manage</button>
        <button onClick={() => setTab("pending")} className={tab === "pending" ? "active" : ""}>Pending</button>
        {tab === "edit" && <button className="active">Edit</button>}
      </div>

      {tab === "add" && (
        <div className="auth-box">
          <h2>Add Coupon</h2>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <input placeholder="Discount" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
          <input placeholder="Link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <input placeholder="Affiliate Link" value={form.affiliate_link} onChange={(e) => setForm({ ...form, affiliate_link: e.target.value })} />
          <input type="date" value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })} />
          <button className="btn-primary" onClick={handleAdd}>Add Coupon</button>
        </div>
      )}

      {tab === "edit" && (
        <div className="auth-box">
          <h2>Edit Coupon</h2>

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
            placeholder="Affiliate Link"
            value={form.affiliate_link}
            onChange={(e) => setForm({ ...form, affiliate_link: e.target.value })}
          />

          <input
            type="date"
            value={form.expires}
            onChange={(e) => setForm({ ...form, expires: e.target.value })}
          />

          <button className="btn-primary" onClick={saveEdit}>
            Save Changes
          </button>
        </div>
      )}

      {tab === "manage" && (
        <>
          <input
            className="admin-search"
            placeholder="Search by title, link, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="admin-table">
          <div className="admin-row header">
            <span>Title</span>
            <span>Code</span>
            <span>Discount</span>
            <span>Link</span>
            <span>Expires</span>
            <span>Category</span>
            <span>Page</span> {/* ✅ NEW */}
            <span>Clicks</span>
            <span>Actions</span>
          </div>

          {coupons.map((c) => (
            <div key={c.id} className="admin-row">
              <span>{c.title}</span>
              <span>{c.code}</span>
              <span>{c.discount}</span>
              <a href={c.link} target="_blank" className="truncate">{c.link}</a>
              <span>{formatDate(c.expires_at)}</span>

              {/* HOME CATEGORY */}
              <select value={c.category || ""} onChange={(e) => updateCategory(c.id, e.target.value)}>
                <option value="">None</option>
                <option value="new">New</option>
                <option value="best">Best</option>
                <option value="used">Used</option>
              </select>

              {/* 🔥 NEW PAGE CATEGORY */}
              <select value={c.page_category || ""} onChange={(e) => updatePageCategory(c.id, e.target.value)}>
                <option value="">None</option>
                <option value="clothing">Clothing</option>
                <option value="gaming">Gaming</option>
                <option value="tech">Tech</option>
                <option value="shoes">Shoes</option>
                <option value="beauty">Beauty</option>
                <option value="home">Home</option>
                <option value="fitness">Fitness</option>
                <option value="travel">Travel</option>
              </select>

              <span>{clicksMap[c.id] || 0}</span>

              <div style={{ display: "flex", gap: "6px" }}>
                <button className={`action-btn ${c.is_active ? "btn-active" : "btn-inactive"}`} onClick={() => toggleActive(c)}>
                  {c.is_active ? "Active" : "Off"}
                </button>

                <button className="action-btn btn-edit" onClick={() => startEdit(c)}>Edit</button>

                <button className="action-btn btn-delete" onClick={() => deleteCoupon(c.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        </>
      )}

      {tab === "pending" && (
        <div className="admin-table">
          <div className="admin-row header">
            <span>Title</span>
            <span>Code</span>
            <span>Discount</span>
            <span>Link</span>
            <span>Expires</span>
            <span>Actions</span>
          </div>

          {pending.map((c) => (
            <div key={c.id} className="admin-row">
              <span>{c.title}</span>
              <span>{c.code}</span>
              <span>{c.discount}</span>

              <a href={c.link} target="_blank" className="truncate">{c.link}</a>

              <span>{formatDate(c.expires_at)}</span>

              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  className="action-btn btn-active"
                  disabled={loadingId === c.id}
                  onClick={() => approveCoupon(c)}
                >
                  {loadingId === c.id ? "..." : "Approve"}
                </button>

                <button className="action-btn btn-delete" onClick={() => rejectCoupon(c.id)}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}