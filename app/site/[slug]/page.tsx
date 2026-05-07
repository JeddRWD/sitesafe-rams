"use client";

import { useEffect, useRef, useState, use } from "react";
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
};

type RamsSection = {
  id: string;
  title: string;
  content: string;
  section_order: number;
};

export default function SitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [site, setSite] = useState<Site | null>(null);
  const [sections, setSections] = useState<RamsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessCode, setAccessCode] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [message, setMessage] = useState("");

  const [operativeName, setOperativeName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");

  const sigRef = useRef<SignatureCanvas | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: siteData } = await supabase
        .from("sites")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!siteData) {
        setLoading(false);
        return;
      }

      setSite(siteData);

      const { data: sectionData } = await supabase
        .from("rams_sections")
        .select("*")
        .eq("site_id", siteData.id)
        .order("section_order", { ascending: true });

      setSections(sectionData || []);
      setLoading(false);
    }

    loadData();
  }, [slug]);

  async function submitSignature() {
    if (!site) return;

    if (!operativeName) {
      setMessage("Please enter your name.");
      return;
    }

    if (!sigRef.current || sigRef.current.isEmpty()) {
      setMessage("Please sign.");
      return;
    }

    const signatureData = sigRef.current.toDataURL();

    const { error } = await supabase
      .from("rams_acknowledgements")
      .insert({
        site_id: site.id,
        operative_name: operativeName,
        company_name: companyName,
        role,
        signature_data: signatureData,
        rams_version: site.rams_version || 1,
      });

    if (error) {
      setMessage("Error submitting sign off.");
      return;
    }

    setMessage("RAMS signed successfully.");

    setOperativeName("");
    setCompanyName("");
    setRole("");

    sigRef.current.clear();
  }

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  if (!site) {
    return <div style={{ padding: 40 }}>Site not found.</div>;
  }

  if (!hasAccess) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          padding: 40,
        }}
      >
        <div
          style={{
            maxWidth: 500,
            margin: "0 auto",
            background: "white",
            padding: 30,
            borderRadius: 16,
          }}
        >
          <h1>{site.site_name}</h1>

          <p>Enter site access code.</p>

          <input
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="Access code"
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 12,
            }}
          />

          <button
            onClick={() => {
              if (
                accessCode.trim().toLowerCase() ===
                site.access_code.toLowerCase()
              ) {
                setHasAccess(true);
                setMessage("");
              } else {
                setMessage("Incorrect access code.");
              }
            }}
            style={{
              padding: "12px 20px",
              background: "#111827",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Access RAMS
          </button>

          {message && (
            <p style={{ color: "red", marginTop: 12 }}>{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: 40,
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div
          style={{
            background: "white",
            padding: 30,
            borderRadius: 16,
            marginBottom: 20,
          }}
        >
          <h1>{site.site_name}</h1>

          <p>
            <strong>RAMS Version:</strong> {site.rams_version}
          </p>

          <p>
            <strong>Start Date:</strong> {site.start_date || "N/A"}
          </p>

          <p>
            <strong>Expiry Date:</strong> {site.expiry_date || "N/A"}
          </p>
        </div>

        <div
          style={{
            background: "white",
            padding: 30,
            borderRadius: 16,
            marginBottom: 20,
          }}
        >
          <h2>RAMS Sections</h2>

          {sections.map((section) => (
            <details
              key={section.id}
              style={{
                marginTop: 10,
                border: "1px solid #d1d5db",
                borderRadius: 8,
                padding: 12,
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {section.title}
              </summary>

              <div style={{ marginTop: 10 }}>
                {section.content}
              </div>
            </details>
          ))}
        </div>

        <div
          style={{
            background: "white",
            padding: 30,
            borderRadius: 16,
          }}
        >
          <h2>Sign Off</h2>

          <p>
            By signing below, I confirm I have read and understood
            the RAMS.
          </p>

          <input
            value={operativeName}
            onChange={(e) => setOperativeName(e.target.value)}
            placeholder="Operative name"
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 12,
            }}
          />

          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company"
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 12,
            }}
          />

          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Role"
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 12,
            }}
          />

          <div
            style={{
              border: "2px dashed #9ca3af",
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <SignatureCanvas
              ref={sigRef}
              canvasProps={{
                width: 800,
                height: 200,
              }}
            />
          </div>

          <button
            onClick={() => sigRef.current?.clear()}
            style={{
              padding: "10px 16px",
              marginRight: 10,
            }}
          >
            Clear
          </button>

          <button
            onClick={submitSignature}
            style={{
              padding: "10px 16px",
              background: "#111827",
              color: "white",
              border: "none",
              borderRadius: 8,
            }}
          >
            Submit Sign Off
          </button>

          {message && (
            <p style={{ marginTop: 12 }}>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
