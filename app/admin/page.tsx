"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import type { Site } from "../../types/database";

export default function AdminPage() {
  const [adminCode, setAdminCode] = useState("");
  const [authorised, setAuthorised] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [siteName, setSiteName] = useState("");
  const [slug, setSlug] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [message, setMessage] = useState("");

  async function loadSites() {
    const { data } = await supabase.from("sites").select("*").order("site_name");
    setSites(data || []);
  }

  useEffect(() => {
    if (authorised) loadSites();
  }, [authorised]);

  function login() {
    const expected = process.env.NEXT_PUBLIC_ADMIN_CODE || "admin";
    if (adminCode === expected) setAuthorised(true);
    else setMessage("Incorrect admin code.");
  }

  async function addSite() {
    setMessage("");
    const cleanSlug = slug || siteName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { error } = await supabase.from("sites").insert({
      site_name: siteName,
      slug: cleanSlug,
      access_code: accessCode,
      start_date: startDate || null,
      expiry_date: expiryDate || null,
      rams_version: 1,
      is_active: true
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    setSiteName("");
    setSlug("");
    setAccessCode("");
    setStartDate("");
    setExpiryDate("");
    setMessage("Site added.");
    loadSites();
  }

  if (!authorised) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <section className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-600">Enter your admin code.</p>
          <input className="mt-4 w-full rounded-xl border px-4 py-3" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} placeholder="Admin code" />
          <button onClick={login} className="mt-4 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white">Login</button>
          {message && <p className="mt-3 text-sm text-red-700">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <section className="mx-auto max-w-6xl rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">SiteSafe RAMS</p>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <Link href="/" className="rounded-xl border px-4 py-2 text-sm font-semibold">Home</Link>
        </div>

        <div className="mt-6 rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">Add New Site</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <input className="rounded-xl border px-3 py-2" placeholder="Site name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            <input className="rounded-xl border px-3 py-2" placeholder="Slug e.g. bingham-gate" value={slug} onChange={(e) => setSlug(e.target.value)} />
            <input className="rounded-xl border px-3 py-2" placeholder="Access code" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} />
            <input className="rounded-xl border px-3 py-2" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input className="rounded-xl border px-3 py-2" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </div>
          <button onClick={addSite} className="mt-4 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white">Add Site</button>
          {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">Site</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Review Date</th>
                <th className="p-3">Version</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site.id} className="border-t">
                  <td className="p-3 font-semibold">{site.site_name}</td>
                  <td className="p-3">{site.slug}</td>
                  <td className="p-3">{site.expiry_date || "Not set"}</td>
                  <td className="p-3">{site.rams_version || 1}</td>
                  <td className="p-3 flex gap-2">
                    <Link href={`/site/${site.slug}`} className="rounded-lg border px-3 py-1 font-semibold">View</Link>
                    <Link href={`/admin/sites/${site.id}`} className="rounded-lg bg-blue-700 px-3 py-1 font-semibold text-white">Edit RAMS</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
