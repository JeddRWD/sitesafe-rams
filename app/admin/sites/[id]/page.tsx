"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../../lib/supabaseClient";
import type { RamsSection, Site } from "../../../../types/database";

type Props = { params: { id: string } };

export default function EditSitePage({ params }: Props) {
  const [site, setSite] = useState<Site | null>(null);
  const [sections, setSections] = useState<RamsSection[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState(1);
  const [message, setMessage] = useState("");

  async function loadData() {
    const { data: siteData } = await supabase.from("sites").select("*").eq("id", params.id).single();
    setSite(siteData);
    const { data: sectionData } = await supabase
      .from("rams_sections")
      .select("*")
      .eq("site_id", params.id)
      .order("section_order", { ascending: true });
    setSections(sectionData || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addSection() {
    setMessage("");
    const { error } = await supabase.from("rams_sections").insert({
      site_id: params.id,
      title,
      content,
      section_order: order,
      is_active: true
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    setTitle("");
    setContent("");
    setOrder(order + 1);
    setMessage("Section added.");
    loadData();
  }

  async function updateSection(section: RamsSection) {
    const { error } = await supabase
      .from("rams_sections")
      .update({ title: section.title, content: section.content, section_order: section.section_order, is_active: section.is_active })
      .eq("id", section.id);
    if (error) setMessage(error.message);
    else setMessage("Section updated.");
    loadData();
  }

  async function deleteSection(id: string) {
    const { error } = await supabase.from("rams_sections").delete().eq("id", id);
    if (error) setMessage(error.message);
    else setMessage("Section deleted.");
    loadData();
  }

  async function increaseVersion() {
    if (!site) return;
    const nextVersion = (site.rams_version || 1) + 1;
    const { error } = await supabase.from("sites").update({ rams_version: nextVersion, updated_at: new Date().toISOString() }).eq("id", site.id);
    if (error) setMessage(error.message);
    else setMessage(`RAMS version increased to ${nextVersion}.`);
    loadData();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <section className="mx-auto max-w-6xl rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Edit RAMS</p>
            <h1 className="text-3xl font-bold">{site?.site_name || "Loading..."}</h1>
            <p className="mt-1 text-sm text-slate-500">Version {site?.rams_version || 1}</p>
          </div>
          <div className="flex gap-2">
            {site && <Link href={`/site/${site.slug}`} className="rounded-xl border px-4 py-2 text-sm font-semibold">View Site Page</Link>}
            <Link href="/admin" className="rounded-xl border px-4 py-2 text-sm font-semibold">Back to Admin</Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">Add RAMS Section</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input className="rounded-xl border px-3 py-2" placeholder="Section title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="rounded-xl border px-3 py-2" type="number" placeholder="Order" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
          </div>
          <textarea className="mt-3 min-h-36 w-full rounded-xl border px-3 py-2" placeholder="RAMS wording" value={content} onChange={(e) => setContent(e.target.value)} />
          <button onClick={addSection} className="mt-3 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white">Add Section</button>
          <button onClick={increaseVersion} className="ml-3 rounded-xl border px-5 py-3 text-sm font-semibold">Increase RAMS Version</button>
          {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}
        </div>

        <div className="mt-6 space-y-4">
          {sections.map((section, index) => (
            <EditableSection
              key={section.id}
              section={section}
              onChange={(updated) => {
                const copy = [...sections];
                copy[index] = updated;
                setSections(copy);
              }}
              onSave={updateSection}
              onDelete={deleteSection}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function EditableSection({ section, onChange, onSave, onDelete }: {
  section: RamsSection;
  onChange: (section: RamsSection) => void;
  onSave: (section: RamsSection) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border p-5">
      <div className="grid gap-3 md:grid-cols-3">
        <input className="rounded-xl border px-3 py-2 md:col-span-2" value={section.title} onChange={(e) => onChange({ ...section, title: e.target.value })} />
        <input className="rounded-xl border px-3 py-2" type="number" value={section.section_order} onChange={(e) => onChange({ ...section, section_order: Number(e.target.value) })} />
      </div>
      <textarea className="mt-3 min-h-36 w-full rounded-xl border px-3 py-2" value={section.content} onChange={(e) => onChange({ ...section, content: e.target.value })} />
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={section.is_active} onChange={(e) => onChange({ ...section, is_active: e.target.checked })} />
        Active section
      </label>
      <div className="mt-3 flex gap-2">
        <button onClick={() => onSave(section)} className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Save</button>
        <button onClick={() => onDelete(section.id)} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700">Delete</button>
      </div>
    </div>
  );
}
