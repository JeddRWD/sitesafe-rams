"use client";

import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { supabase } from "../../../lib/supabaseClient";

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

export default function SiteRamsPage({ params }: { params: { slug: string } }) {
  const [site, setSite] = useState<Site | null>(null);
  const [sections, setSections] = useState<RamsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessCode, setAccessCode] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [operativeName, setOperativeName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const sigRef = useRef<SignatureCanvas | null>(null);

  useEffect(() => {
    async function loadSite() {
      const { data: siteData } = await supabase
        .from("sites")
        .select("*")
        .eq("slug", params.slug)
        .single();

      if (siteData) {
        setSite(siteData);

        const { data: sectionData } = await supabase
          .from("rams_sections")
          .select("*")
          .eq("site_id", siteData.id)
          .eq("is_active", true)
          .order("section_order", { ascending: true });

        setSections(sectionData || []);
      }

      setLoading(false);
    }

    loadSite();
  }, [params.slug]);

  function checkAccess() {
    if (!site) return;

    if (accessCode.trim().toLowerCase() === site.access_code.trim().toLowerCase()) {
      setHasAccess(true);
      setMessage("");
    } else {
      setMessage("Incorrect access code.");
    }
  }

  async function submitSignature() {
    if (!site) return;

    if (!operativeName.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    if (!sigRef.current || sigRef.current.isEmpty()) {
      setMessage("Please provide a signature.");
      return;
    }

    const signatureData = sigRef.current.toDataURL("image/png");

    const { error } = await supabase.from("rams_acknowledgements").insert({
      site_id: site.id,
      operative_name: operativeName,
      company_name: companyName,
      role,
      signature_data: signatureData,
      rams_version: site.rams_version || 1
    });

    if (error) {
      setMessage("Could not submit signature. Please try again.");
      return;
    }

    setMessage("Signed and submitted successfully.");
    setOperativeName("");
    setCompanyName("");
    setRole("");
    sigRef.current.clear();
  }

  if (loading) {
    return <main className="page"><div className="container"><div className="card">Loading...</div></div></main>;
  }

  if (!site) {
    return <main className="page"><div className="container"><div className="card">Site not found.</div></div></main>;
  }

  if (!hasAccess) {
    return (
      <main className="page">
        <div className="container">
          <div className="card">
            <h1>{site.site_name}</h1>
            <p>Enter the site access code to view the RAMS.</p>
            <input
              className="input"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Access code"
            />
            <button className="button" onClick={checkAccess}>Access RAMS</button>
            {message && <p className="error">{message}</p>}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container">
        <div className="card">
          <h1>{site.site_name}</h1>
          <p><strong>RAMS Version:</strong> {site.rams_version || 1}</p>
          <p><strong>Start Date:</strong> {site.start_date || "Not set"}</p>
          <p><strong>Expiry Date:</strong> {site.expiry_date || "Not set"}</p>
        </div>

        <div className="card">
          <h2>RAMS Sections</h2>
          {sections.map((section) => (
            <div key={section.id}>
              <button
                className="section-button"
                onClick={() =>
                  setOpenSections({
                    ...openSections,
                    [section.id]: !openSections[section.id],
                  })
                }
              >
                {openSections[section.id] ? "▼" : "▶"} {section.title}
              </button>
              {openSections[section.id] && (
                <div className="section-content">{section.content}</div>
              )}
            </div>
          ))}
        </div>

        <div className="card">
          <h2>Read & Understood Sign Off</h2>
          <p>
            By signing below, I confirm I have read and understood the site specific RAMS.
          </p>

          <input
            className="input"
            value={operativeName}
            onChange={(e) => setOperativeName(e.target.value)}
            placeholder="Operative name"
          />

          <input
            className="input"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company name"
          />

          <input
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Role"
          />

          <SignatureCanvas
            ref={sigRef}
            canvasProps={{ className: "signature-box" }}
          />

          <button className="button secondary" onClick={() => sigRef.current?.clear()}>
            Clear Signature
          </button>

          <button className="button" style={{ marginLeft: 10 }} onClick={submitSignature}>
            Submit Sign Off
          </button>

          {message && (
            <p className={message.includes("successfully") ? "success" : "error"}>
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
