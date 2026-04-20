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
  });

  // 🔐 AUTH PROTECTION
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      // 🔴 PUT YOUR EMAIL HERE
      if (!user || user.email !== "hamidmohi98@gmail.com") {
        router.push("/");
        return;
      }

      setAuthorized(true);
    };

    checkUser();
  }, []);

  // 🔥 ONLY LOAD DATA IF AUTHORIZED
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
      .update({ is_active: !c.is_active })
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

  // ===== CATEGORY =====
  const updateCategory = async (id: string, value: string) => {
    const categoryValue = value === "" ? null : value;

    await supabase
      .from("coupons")
      .update({ category: categoryValue })
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

  // 🔐 BLOCK UI UNTIL AUTH CHECK
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

      {/* (rest of your UI unchanged) */}