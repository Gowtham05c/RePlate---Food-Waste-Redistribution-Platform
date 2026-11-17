import { useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";

const LINKS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/users", label: "User Verification" },
  { to: "/admin/listings", label: "Listing Moderation" },
  { to: "/admin/reports", label: "Reports" },
];

// TODO: replace with adminApi calls (GET /admin/users?status=Pending, GET /admin/listings/flagged)
const pendingUsers = [
  { id: 1, name: "Grand Palace Hotel", type: "Donor", status: "Pending" },
  { id: 2, name: "Hope Foundation NGO", type: "Receiver", status: "Pending" },
  { id: 3, name: "Ravi Kumar", type: "Volunteer", status: "Pending" },
];
const flagged = [
  { id: 11, food: "Veg Biryani (20 portions)", donor: "Spice Route", reason: "Allergen info missing" },
  { id: 12, food: "Bread loaves", donor: "City Bakery", reason: "Reported expired" },
];

export default function AdminDashboard() {
  const [users, setUsers] = useState(pendingUsers);
  const [flaggedListings, setFlagged] = useState(flagged);
  const [range, setRange] = useState({ start: "", end: "" });
  const [report, setReport] = useState(null);

  const act = (id) => setUsers((u) => u.filter((x) => x.id !== id)); // call approve/suspend API here

  const generate = () => {
    // TODO: GET /admin/reports?start=&end=
    setReport({ listings: 128, quantity: "1,430 kg", within20: 97, hotels: 24, ngos: 18, volunteers: 31 });
  };

  return (
    <DashboardLayout title="Administrator Dashboard" links={LINKS}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending verifications" value={users.length} />
        <StatCard label="Flagged listings" value={flaggedListings.length} />
        <StatCard label="Active listings" value="42" />
        <StatCard label="Donations this month" value="87" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Verification */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <h2 className="border-b border-slate-100 px-5 py-4 font-semibold text-slate-900">
            Registrations awaiting verification
          </h2>
          <ul className="divide-y divide-slate-100">
            {users.length === 0 && (
              <li className="px-5 py-6 text-sm text-slate-500">All caught up.</li>
            )}
            {users.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="font-medium text-slate-900">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={u.status} />
                  <button onClick={() => act(u.id)} className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700">
                    Approve
                  </button>
                  <button onClick={() => act(u.id)} className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50">
                    Suspend
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Flagged listings */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <h2 className="border-b border-slate-100 px-5 py-4 font-semibold text-slate-900">
            Flagged listings & complaints
          </h2>
          <ul className="divide-y divide-slate-100">
            {flaggedListings.length === 0 && (
              <li className="px-5 py-6 text-sm text-slate-500">No flagged listings.</li>
            )}
            {flaggedListings.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="font-medium text-slate-900">{l.food}</p>
                  <p className="text-xs text-slate-500">{l.donor} · {l.reason}</p>
                </div>
                <button
                  onClick={() => setFlagged((f) => f.filter((x) => x.id !== l.id))}
                  className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                >
                  Deactivate
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Reports */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">Redistribution report</h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm text-slate-600">
            Start date
            <input type="date" value={range.start} onChange={(e) => setRange({ ...range, start: e.target.value })}
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm text-slate-600">
            End date
            <input type="date" value={range.end} onChange={(e) => setRange({ ...range, end: e.target.value })}
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <button
            onClick={generate}
            disabled={!range.start || !range.end}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Generate
          </button>
        </div>

        {report && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Total food listings posted" value={report.listings} />
            <StatCard label="Total quantity redistributed" value={report.quantity} />
            <StatCard label="Completed donations within 20 km" value={report.within20} />
            <StatCard label="Active hotels" value={report.hotels} />
            <StatCard label="Active NGOs" value={report.ngos} />
            <StatCard label="Active volunteers" value={report.volunteers} />
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
