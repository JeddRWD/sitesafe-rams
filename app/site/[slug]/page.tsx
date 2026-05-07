"use client";

import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
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

type RamsSection = {
  id: string;
  title: string;
  content: string;
  section_order: number;
};

export default function SitePage({ params }: { params: { slug: string } }) {
  const [site, setSite] = useState<Site | null>(null);
  const [sections, setSections] = useState<RamsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [operativeName, setOperativeName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const signatureRef = useRef<SignatureCanvas | null>(null);

  useEffect(() => {
    async function loadSite() {
      const { data: siteData, error: siteError } = await supabase
        .from("sites")
        .select("*")
        .eq("slug", params.slug)
        .single();

      if (siteError || !siteData) {
        setError("Site not found.");
        setLoading(false);
        return;
      }

      setSite(siteData);

      const { data: sectionData } = await supabase
        .from("rams_sections")
        .select("*")
        .eq("site_id", siteData.id)
        .eq("is_active", true)
        .order("section_order", { ascending: true });

      setSections(sectionData || []);
      setLoading(false);
    }

    loadSite();
  }, [params.slug]);

  function checkCode() {
    if (!site) return;
    if (code.trim().toLowerCase() === site.access_code.trim().toLowerCase()) {
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect access code.");
    }
  }

  async function submitSignature() {
    if (!site) return;
    if (!operativeName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      setError("Please sign before submitting.");
      return;
    }

    const signatureData = signatureRef.current.toDataURL("image/png");

    const { error: insertError } = await supabase.from("rams_acknowledgements").insert({
      site_id: site.id,
      operative_name: operativeName,
      company_name: companyName,
      role,
      signature_data: signatureData,
      rams_version: site.rams_version
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSubmitted(true);
    setError("");
  }

  if (loading) return <main className="p-6">Loading...</main>;

  if (!site) return <main className="p-6 text-red-600">{error}</main>;

  if (!unlocked) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold mb-2">{site.site_name}</h1>
          <p className="text-gray-600 mb-6">Enter the site RAMS access code to continue.</p>
          <input
            className="w-full border rounded-xl p-3 mb-3"
            placeholder="Access code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {error && <p className="text-red-600 mb-3">{error}</p>}
          <button onClick={checkCode} className="w-full bg-blue-700 text-white rounded-xl p-3 font-semibold">
            Access RAMS
          </button>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Signed Successfully</h1>
          <p className="text-gray-600">Your RAMS acknowledgement has been recorded.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h1 className="text-3xl font-bold">{site.site_name}</h1>
        <p className="text-gray-600">RAMS Version {site.rams_version}</p>
        <p className="text-sm text-gray-500 mt-2">Start: {site.start_date || "Not set"} | Expiry: {site.expiry_date || "Not set"}</p>
      </div>

      <div className="space-y-4 mb-8">
        {sections.map((section) => (
          <details key={section.id} className="bg-white rounded-2xl shadow p-5">
            <summary className="font-bold cursor-pointer text-lg">{section.title}</summary>
            <p className="whitespace-pre-wrap mt-4 text-gray-700 leading-relaxed">{section.content}</p>
          </details>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Read & Understood Declaration</h2>
        <div className="grid gap-3 mb-4">
          <input className="border rounded-xl p-3" placeholder="Operative name" value={operativeName} onChange={(e) => setOperativeName(e.target.value)} />
          <input className="border rounded-xl p-3" placeholder="Company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          <input className="border rounded-xl p-3" placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
        <div className="border rounded-xl bg-gray-50 mb-3">
          <SignatureCanvas ref={signatureRef} canvasProps={{ className: "w-full h-48" }} />
        </div>
        {error && <p className="text-red-600 mb-3">{error}</p>}
        <div className="flex gap-3">
          <button className="border rounded-xl px-4 py-3" onClick={() => signatureRef.current?.clear()}>Clear</button>
          <button className="bg-blue-700 text-white rounded-xl px-4 py-3 font-semibold" onClick={submitSignature}>Submit Signature</button>
        </div>
      </div>
    </main>
  );
}
