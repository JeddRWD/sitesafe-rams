import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow p-8 text-center">
        <h1 className="text-3xl font-bold mb-3">SiteSafe RAMS</h1>
        <p className="text-gray-600 mb-6">QR based site specific RAMS access and operative sign off.</p>
        <div className="space-y-3">
          <Link className="block bg-blue-700 text-white rounded-xl px-4 py-3 font-semibold" href="/site/bingham-gate">
            Open Test Site: Bingham Gate
          </Link>
          <Link className="block border rounded-xl px-4 py-3 font-semibold" href="/admin">
            Admin Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
