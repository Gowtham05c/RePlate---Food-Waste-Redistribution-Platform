import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";

const LINKS = [
  { to: "/donor/dashboard", label: "Dashboard" },
  { to: "/donor/listings", label: "My Listings" },
  { to: "/donor/listings/new", label: "Add Listing" },
  { to: "/donor/requests", label: "Incoming Requests" },
];

// TODO: replace with donorApi calls
const initialListings = [
  { id: 1, name: "Veg Biryani", category: "Cooked", qty: 20, unit: "portions", until: "2026-11-17T21:00", status: "Active" },
  { id: 2, name: "Bread loaves", category: "Bakery", qty: 15, unit: "pcs", until: "2026-11-17T19:30", status: "Active" },
  { id: 3, name: "Fruit salad", category: "Fresh", qty: 8, unit: "kg", until: "2026-11-16T20:00", status: "Expired" },
];
const initialRequests = [
  { id: 101, receiver: "Hope Foundation NGO", listing: "Veg Biryani", qty: 12, distance: 3.8, method: "Volunteer Delivery", note: "Feeding 40 people tonight", status: "Pending" },
  { id: 102, receiver: "Asha Kitchen", listing: "Bread loaves", qty: 10, distance: 11.2, method: "Direct Pickup", note: "", status: "Pending" },
  { id: 103, receiver: "Meera S.", listing: "Veg Biryani", qty: 4, distance: 6.5, method: "Direct Pickup", note: "", status: "Approved" },
];

const fmt = (iso) =>
  new Date(iso).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default function DonorDashboard() {
  const [listings, setListings] = useState(initialListings);
  const [requests, setRequests] = useState(initialRequests);

  const setReq = (id, status) =>
    setRequests((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  // Approve -> POST /donor/requests/{id}/approve (backend deducts quantity atomically)

  const deactivate = (id) =>
    setListings((l) => l.map((x) => (x.id === id ? { ...x, status: "Deactivated" } : x)));

  const active = listings.filter((l) => l.status === "Active").length;
  const pending = requests.filter((r) => r.status === "Pending").length;

  return (
    <DashboardLayout title="Donor Dashboard" links={LINKS}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active listings" value={active} />
        <StatCard label="Pending requests" value={pending} />
        <StatCard label="Donations completed" value="34" />
        <StatCard label="Food redistributed" value="412 kg" />
      </div>

      {/* Listings */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">My food listings</h2>
          <Link to="/donor/listings/new" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">
            + Add Listing
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Food</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Available</th>
                <th className="px-5 py-3">Collect by</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listings.map((l) => (
                <tr key={l.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{l.name}</td>
                  <td className="px-5 py-3 text-slate-600">{l.category}</td>
                  <td className="px-5 py-3 text-slate-600">{l.qty} {l.unit}</td>
                  <td className="px-5 py-3 text-slate-600">{fmt(l.until)}</td>
                  <td className="px-5 py-3"><StatusBadge status={l.status} /></td>
                  <td className="px-5 py-3 text-right">
                    {l.status === "Active" && (
                      <div className="flex justify-end gap-3">
                        <Link to={`/donor/listings/${l.id}/edit`} className="text-emerald-700 hover:underline">Edit</Link>
                        <button onClick={() => deactivate(l.id)} className="text-red-600 hover:underline">Deactivate</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Requests */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 px-5 py-4 font-semibold text-slate-900">
          Incoming donation requests (within 20 km)
        </h2>
        <ul className="divide-y divide-slate-100">
          {requests.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-medium text-slate-900">
                  {r.receiver} <span className="font-normal text-slate-500">wants {r.qty} of {r.listing}</span>
                </p>
                <p className="text-xs text-slate-500">
                  {r.distance} km away · {r.method}{r.note && ` · “${r.note}”`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={r.status} />
                {r.status === "Pending" && (
                  <>
                    <button onClick={() => setReq(r.id, "Approved")} className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700">Approve</button>
                    <button onClick={() => setReq(r.id, "Rejected")} className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50">Reject</button>
                  </>
                )}
                {r.status === "Approved" && (
                  <button onClick={() => setReq(r.id, "Completed")} className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700">
                    Confirm Handover
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </DashboardLayout>
  );
}
