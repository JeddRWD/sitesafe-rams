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

const pageStyle = { minHeight: "100vh", padding: 24 } as const;
const containerStyle = { maxWidth: 900, margin: "0 auto" } as const;
const cardStyle = { background: "white", borderRadius: 18, padding: 28, boxShadow: "0 10px 30px rgba(0,0,0,0.08)", marginBottom: 18 } as const;
const inputStyle = { width: "100%", padding: 13, border: "1px solid #d1d5db", borderRadius: 10, margin: "8px 0 14px", fontSize: 16 } as const;
const buttonStyle = { background: "#1f2937", color: "white", border: "none", padding: "13px 18px", borderRadius: 10, fontWeight: "bold", cursor: "pointer" } as const;

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

  if (loading) return <main style={pageStyle}><div style={containerStyle}><div style={cardStyle}>Loading...</div></div></main>;
  if (!site) return <main style={pageStyle}><div style={containerStyle}><div style={cardStyle}>Site not found.</div></div></main>;

  if (!hasAccess) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <h1>{site.site_name}</h1>
            <p>Enter the site access code to view the RAMS.</p>
            <input style={inputStyle} value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="Access code" />
            <button style={buttonStyle} onClick={checkAccess}>Access RAMS</button>
            {message && <p style={{ color: "#b91c1c", fontWeight: "bold" }}>{message}</p>}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1>{site.site_name}</h1>
          <p><strong>RAMS Version:</strong> {site.rams_version || 1}</p>
          <p><strong>Start Date:</strong> {site.start_date || "Not set"}</p>
          <p><strong>Expiry Date:</strong> {site.expiry_date || "Not set"}</p>
        </div>

        <div style={cardStyle}>
          <h2>RAMS Sections</h2>
          {sections.map((section) => (
            <div key={section.id}>
              <button
                style={{ width: "100%", textAlign: "left", background: "#eef2ff", border: "1px solid #c7d2fe", padding: 16, borderRadius: 12, fontWeight: "bold", cursor: "pointer", marginTop: 10 }}
                onClick={() => setOpenSections({ ...openSections, [section.id]: !openSections[section.id] })}
              >
                {openSections[section.id] ? "▼" : "▶"} {section.title}
              </button>
              {openSections[section.id] && (
                <div style={{ padding: 16, border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 12px 12px", whiteSpace: "pre-wrap" }}>
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={cardStyle}>
          <h2>Read & Understood Sign Off</h2>
          <p>By signing below, I confirm I have read and understood the site specific RAMS.</p>

          <input style={inputStyle} value={operativeName} onChange={(e) => setOperativeName(e.target.value)} placeholder="Operative name" />
          <input style={inputStyle} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name" />
          <input style={inputStyle} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" />

          <SignatureCanvas ref={sigRef} canvasProps={{ style: { border: "2px dashed #9ca3af", borderRadius: 12, background: "white", width: "100%", height: 180, margin: "10px 0" } }} />

          <button style={{ ...buttonStyle, background: "#6b7280" }} onClick={() => sigRef.current?.clear()}>Clear Signature</button>
          <button style={{ ...buttonStyle, marginLeft: 10 }} onClick={submitSignature}>Submit Sign Off</button>

          {message && <p style={{ color: message.includes("successfully") ? "#047857" : "#b91c1c", fontWeight: "bold" }}>{message}</p>}
        </div>
      </div>
    </main>
  );
}
