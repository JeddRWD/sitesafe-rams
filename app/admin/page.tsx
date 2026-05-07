"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Site = {
  id: string;
  site_name: string;
  slug: string;
  access_code: string;
  rams_version: number;
  start_date: string | null;
  expiry_date: string | null;
  is_active: boolean;
};

type Acknowledgement = {
  id: string;
  operative_name: string;
  company_name: string | null;
  role: string | null;
  signed_at: string;
  rams_version: number;
  sites: { site_name: string } | null;
};

export default function AdminPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [acks, setAcks] = useState<Acknowledgement[]>([]);
  const [siteName, setSiteName] = useState("");
  const [slug, setSlug] = useState("");
  const [accessCode, setAccessCode] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: siteData } = await supabase.from("sites").select("*").order("site_name");
    setSites(siteData || []);

    const { data: ackData } = await supabase
      .from("rams_acknowledgements")
      .select("*, sites(site_name)")
      .order("signed_at", { ascending: false })
      .limit(50);
    setAcks((ackData as Acknowledgement[]) || []);
  }

  async function addSite() {
    if (!siteName || !slug || !accessCode) return;
    await supabase.from("sites").insert({
      site_name: siteName,
      slug,
      access_code: accessCode,
      is_active: true,
      rams_version: 1
    });
    setSiteName("");
    setSlug("");
    setAccessCode("");
    loadData();
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">SiteSafe RAMS Admin</h1>

      <section className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Add Site</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <input className="border rounded-xl p-3" placeholder="Site name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          <input className="border rounded-xl p-3" placeholder="slug e.g. bingham-gate" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <input className="border rounded-xl p-3" placeholder="Access code" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} />
          <button className="bg-blue-700 text-white rounded-xl p-3 font-semibold" onClick={addSite}>Add Site</button>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Sites</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">Site</th>
                <th className="p-2">Slug</th>
                <th className="p-2">Code</th>
                <th className="p-2">Version</th>
                <th className="p-2">Link</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site.id} className="border-b">
                  <td className="p-2">{site.site_name}</td>
                  <td className="p-2">{site.slug}</td>
                  <td className="p-2">{site.access_code}</td>
                  <td className="p-2">{site.rams_version}</td>
                  <td className="p-2"><a className="text-blue-700 underline" href={`/site/${site.slug}`}>Open</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Signatures</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Company</th>
                <th className="p-2">Role</th>
                <th className="p-2">Site</th>
                <th className="p-2">Version</th>
                <th className="p-2">Signed</th>
              </tr>
            </thead>
            <tbody>
              {acks.map((ack) => (
                <tr key={ack.id} className="border-b">
                  <td className="p-2">{ack.operative_name}</td>
                  <td className="p-2">{ack.company_name}</td>
                  <td className="p-2">{ack.role}</td>
                  <td className="p-2">{ack.sites?.site_name}</td>
                  <td className="p-2">{ack.rams_version}</td>
                  <td className="p-2">{new Date(ack.signed_at).toLocaleString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
