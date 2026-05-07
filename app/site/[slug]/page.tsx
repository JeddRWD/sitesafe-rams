"use client";

import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { supabase } from "../../../lib/supabaseClient";
import type { RamsSection, Site } from "../../../types/database";

type Props = { params: { slug: string } };

export default function SiteRamsPage({ params }: Props) {
  const [site, setSite] = useState<Site | null>(null);
  const [sections, setSections] = useState<RamsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessCode, setAccessCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [operativeName, setOperativeName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const signatureRef = useRef<SignatureCanvas | null>(null);

  useEffect(() => {
    async function loadSite() {
      setLoading(true);
      const { data, error } = await supabase
        .from("sites")
        .select("*")
        .eq("slug", params.slug)
        .single();

      if (error || !data) {
        setError("Site not found or unavailable.");
        setLoading(false);
        return;
      }

      setSite(data);
      const { data: sectionData } = await supabase
        .from("rams_sections")
        .select("*")
        .eq("site_id", data.id)
        .eq("is_active", true)
        .order("section_order", { ascending: true });

      setSections(sectionData || []);
      setLoading(false);
    }
    loadSite();
  }, [params.slug]);

  function checkAccess() {
    if (!site) return;
    if (accessCode.trim().toLowerCase() === site.access_code.trim().toLowerCase()) {
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect access code. Please check with the site manager.");
    }
  }

  async function submitSignature() {
    if (!site) return;
    if (!operativeName.trim()) {
      setError("Please enter the operative name.");
      return;
    }
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      setError("Please sign before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    const signatureData = signatureRef.current.toDataURL("image/png");

    const { error } = await supabase.from("rams_acknowledgements").insert({
      site_id: site.id,
      operative_name: operativeName,
      company_name: companyName,
      role,
      signature_data: signatureData,
      rams_version: site.rams_version || 1
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  }

  if (loading) return <main className="min-h-screen p-6">Loading RAMS...</main>;

  if (!site) {
    return <main className="min-h-screen p-6"><p className="text-red-700">{error}</p></main>;
  }

  const expired = site.expiry_date ? new Date(site.expiry_date) < new Date() : false;

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <section className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 border-b pb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Site Specific RAMS</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{site.site_name}</h1>
          <p className="mt-2 text-sm text-slate-500">RAMS Version {site.rams_version || 1}</p>
          {expired && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">Warning: this RAMS review date has expired.</p>}
        </div>

        {!unlocked ? (
          <div className="max-w-md rounded-2xl border p-5">
            <h2 className="text-xl font-semibold">Enter site access code</h2>
            <p className="mt-2 text-sm text-slate-600">Please enter the site access code provided by the site manager.</p>
            <input
              className="mt-4 w-full rounded-xl border px-4 py-3"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Access code"
            />
            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
            <button onClick={checkAccess} className="mt-4 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">
              View RAMS
            </button>
          </div>
        ) : (
          <div>
            <div className="space-y-3">
              {sections.map((section) => (
                <details key={section.id} className="rounded-2xl border bg-white p-4">
                  <summary className="cursor-pointer text-lg font-semibold text-slate-900">{section.title}</summary>
                  <div className="prose-content mt-4 whitespace-pre-wrap text-slate-700">{section.content}</div>
                </details>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border bg-slate-50 p-5">
              <h2 className="text-xl font-semibold">Read & Understood Declaration</h2>
              {submitted ? (
                <p className="mt-4 rounded-xl bg-green-50 p-4 font-semibold text-green-700">Thank you. Your RAMS acknowledgement has been submitted.</p>
              ) : (
                <>
                  <p className="mt-2 text-sm text-slate-600">By signing below, you confirm that you have read and understood the RAMS for this site.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <input className="rounded-xl border px-4 py-3" placeholder="Operative name" value={operativeName} onChange={(e) => setOperativeName(e.target.value)} />
                    <input className="rounded-xl border px-4 py-3" placeholder="Company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    <input className="rounded-xl border px-4 py-3" placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
                  </div>
                  <div className="mt-4 rounded-xl border bg-white p-2">
                    <SignatureCanvas ref={signatureRef} canvasProps={{ className: "h-40 w-full" }} />
                  </div>
                  <div className="mt-3 flex gap-3">
                    <button onClick={() => signatureRef.current?.clear()} className="rounded-xl border px-4 py-2 text-sm font-semibold">Clear</button>
                    <button onClick={submitSignature} disabled={submitting} className="rounded-xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
                      {submitting ? "Submitting..." : "Submit Sign Off"}
                    </button>
                  </div>
                  {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
