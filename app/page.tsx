import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <section className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Construction Compliance Portal</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">SiteSafe RAMS</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Site specific RAMS, QR access, expiry tracking and operative sign-off capture.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-5">
            <h2 className="font-semibold text-slate-900">QR Site Access</h2>
            <p className="mt-2 text-sm text-slate-600">Each site has its own public RAMS page protected by a site access code.</p>
          </div>
          <div className="rounded-2xl border p-5">
            <h2 className="font-semibold text-slate-900">Collapsible RAMS</h2>
            <p className="mt-2 text-sm text-slate-600">Break RAMS into clear sections that operatives and site managers can open as needed.</p>
          </div>
          <div className="rounded-2xl border p-5">
            <h2 className="font-semibold text-slate-900">Signed Records</h2>
            <p className="mt-2 text-sm text-slate-600">Capture signatures with date, time, company, role and RAMS version.</p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Link href="/admin" className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Admin Panel</Link>
          <Link href="/site/bingham-gate" className="rounded-xl border px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Test Site Page</Link>
        </div>
      </section>
    </main>
  );
}
