import { useState, useMemo } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";

const LINKS = [
  { to: "/receiver/dashboard", label: "Nearby Food" },
  { to: "/receiver/requests", label: "My Requests" },
];

const MAX_KM = 20;

// TODO: GET /receiver/listings/nearby  -> backend already filters to <= 20 km, sorted nearest first
const nearby = [
  { id: 1, name: "Veg Biryani", donor: "Spice Route", category: "Cooked", qty: 20, unit: "portions", distance: 3.8, until: "2026-11-17T21:00" },
  { id: 2, name: "Bread loaves", donor: "City Bakery", category: "Bakery", qty: 15, unit: "pcs", distance: 7.1, until: "2026-11-17T19:30" },
  { id: 3, name: "Dal & Rice", donor: "Grand Palace Hotel", category: "Cooked", qty: 30, unit: "portions", distance: 12.4, until: "2026-11-17T22:00" },
  { id: 4, name: "Sandwiches", donor: "Brew & Bite", category: "Packed", qty: 25, unit: "pcs", distance: 18.9, until: "2026-11-17T20:15" },
];
const myRequests = [
  { id: 1, listing: "Veg Biryani", qty: 12, method: "Volunteer Delivery", status: "Approved" },
  { id: 2, listing: "Bread loaves", qty: 5, method: "Direct Pickup", status: "Pending" },
  { id: 3, listing: "Fruit salad", qty: 3, method: "Direct Pickup", status: "Completed" },
];

function timeLeft(iso) {
  const ms = new Date(iso) - new Date();
  if (ms <= 0) return "Expired";
  const h = Math.floor(ms / 3.6e6);
  const m = Math.floor((ms % 3.6e6) / 6e4);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}

export default function ReceiverDashboard() {
  const [category, setCategory] = useState("All");
  const [minQty, setMinQty] = useState("");
  const [requests, setRequests] = useState(myRequests);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ qty: "", method: "Direct Pickup", note: "" });
  const [error, setError] = useState("");

  const categories = ["All", ...new Set(nearby.map((n) => n.category))];

  const filtered = useMemo(
    () =>
      nearby
        .filter((l) => l.distance <= MAX_KM) // UI safeguard; server is the source of truth
        .filter((l) => category === "All" || l.category === category)
        .filter((l) => !minQty || l.qty >= Number(minQty))
        .sort((a, b) => a.distance - b.distance),
    [category, minQty]
  );

  const openRequest = (l) => {
    setSelected(l);
    setForm({ qty: "", method: "Direct Pickup", note: "" });
    setError("");
  };

  const submit = (e) => {
    e.preventDefault();
    const q = Number(form.qty);
    if (!q || q <= 0) return setError("Enter a valid quantity.");
    if (q > selected.qty) return setError(`Only ${selected.qty} ${selected.unit} available.`);
    // TODO: POST /receiver/requests  (server re-validates distance <= 20 km)
    setRequests((r) => [
      { id: Date.now(), listing: selected.name, qty: q, method: form.method, status: "Pending" },
      ...r,
    ]);
    setSelected(null);
  };

  const confirmReceipt = (id) =>
    setRequests((r) => r.map((x) => (x.id === id ? { ...x, status: "Completed" } : x)));

  return (
    <DashboardLayout title="Receiver Dashboard" links={LINKS}>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Listings within 20 km" value={nearby.length} />
        <StatCard label="Pending requests" value={requests.filter((r) => r.status === "Pending").length} />
        <StatCard label="Completed" value={requests.filter((r) => r.status === "Completed").length} />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <label className="text-sm text-slate-600">
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2">
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-sm text-slate-600">
          Min. quantity
          <input type="number" min="0" value={minQty} onChange={(e) => setMinQty(e.target.value)}
            className="mt-1 block w-32 rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <p className="ml-auto text-sm text-slate-500">Showing food within {MAX_KM} km, nearest first</p>
      </div>

      {/* Listing cards */}
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 && (
          <p className="col-span-full rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No food listings match your filters within 20 km.
          </p>
        )}
        {filtered.map((l) => (
          <article key={l.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-slate-900">{l.name}</h3>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                {l.distance} km away
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{l.donor} · {l.category}</p>
            <p className="mt-3 text-sm text-slate-700">{l.qty} {l.unit} available</p>
            <p className="text-xs font-medium text-amber-700">{timeLeft(l.until)}</p>
            <button onClick={() => openRequest(l)}
              className="mt-4 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Request food
            </button>
          </article>
        ))}
      </div>

      {/* My requests */}
      <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 px-5 py-4 font-semibold text-slate-900">My requests</h2>
        <ul className="divide-y divide-slate-100">
          {requests.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <div>
                <p className="font-medium text-slate-900">{r.listing} × {r.qty}</p>
                <p className="text-xs text-slate-500">{r.method}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={r.status} />
                {r.status === "Approved" && (
                  <button onClick={() => confirmReceipt(r.id)}
                    className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700">
                    Confirm Receipt
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Request modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={submit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Request {selected.name}</h3>
            <p className="text-sm text-slate-500">{selected.donor} · {selected.distance} km away</p>

            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <label className="mt-4 block text-sm text-slate-700">
              Quantity ({selected.unit})
              <input type="number" min="1" max={selected.qty} value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

            <fieldset className="mt-4">
              <legend className="text-sm text-slate-700">Fulfilment method</legend>
              <div className="mt-1 flex gap-3">
                {["Direct Pickup", "Volunteer Delivery"].map((m) => (
                  <label key={m} className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm ${
                    form.method === m ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-300 text-slate-600"}`}>
                    <input type="radio" className="sr-only" checked={form.method === m}
                      onChange={() => setForm({ ...form, method: m })} />
                    {m}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="mt-4 block text-sm text-slate-700">
              Note
              <textarea rows="2" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Back</button>
              <button type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Submit Request</button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
