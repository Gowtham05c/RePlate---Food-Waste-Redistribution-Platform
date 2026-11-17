import { useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";

const LINKS = [
  { to: "/volunteer/dashboard", label: "Dashboard" },
  { to: "/volunteer/deliveries", label: "My Deliveries" },
];

// TODO: GET /volunteer/tasks/available  and  GET /volunteer/tasks/mine
const initialAvailable = [
  { id: 1, item: "Veg Biryani × 12", pickup: "Spice Route, MG Road", dropoff: "Hope Foundation, Indiranagar", distance: 6.4, deadline: "2026-11-17T21:00" },
  { id: 2, item: "Bread loaves × 10", pickup: "City Bakery, Koramangala", dropoff: "Asha Kitchen, HSR Layout", distance: 4.1, deadline: "2026-11-17T19:30" },
];

// Status flow: Accepted -> PickedUp -> InTransit -> Delivered
const NEXT = {
  Accepted: { to: "PickedUp", label: "Picked Up" },
  PickedUp: { to: "InTransit", label: "In Transit" },
  InTransit: { to: "Delivered", label: "Delivered" },
};

const fmt = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function VolunteerDashboard() {
  const [available, setAvailable] = useState(initialAvailable);
  const [mine, setMine] = useState([]);

  const accept = (task) => {
    // TODO: POST /volunteer/tasks/{id}/accept
    setAvailable((a) => a.filter((t) => t.id !== task.id));
    setMine((m) => [{ ...task, status: "Accepted" }, ...m]);
  };

  const advance = (id) => {
    // TODO: PUT /volunteer/tasks/{id}/status
    setMine((m) =>
      m.map((t) => (t.id === id && NEXT[t.status] ? { ...t, status: NEXT[t.status].to } : t))
    );
  };

  const inProgress = mine.filter((t) => t.status !== "Delivered").length;
  const done = mine.filter((t) => t.status === "Delivered").length;

  return (
    <DashboardLayout title="Volunteer Dashboard" links={LINKS}>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Available tasks" value={available.length} />
        <StatCard label="In progress" value={inProgress} />
        <StatCard label="Delivered today" value={done} />
      </div>

      <section className="mt-6">
        <h2 className="mb-3 font-semibold text-slate-900">Available delivery tasks</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {available.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              No delivery tasks right now. Check back soon.
            </p>
          )}
          {available.map((t) => (
            <article key={t.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-slate-900">{t.item}</h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  {t.distance} km
                </span>
              </div>
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex gap-2"><dt className="w-16 text-slate-500">Pickup</dt><dd className="text-slate-800">{t.pickup}</dd></div>
                <div className="flex gap-2"><dt className="w-16 text-slate-500">Drop-off</dt><dd className="text-slate-800">{t.dropoff}</dd></div>
                <div className="flex gap-2"><dt className="w-16 text-slate-500">Deadline</dt><dd className="font-medium text-amber-700">{fmt(t.deadline)}</dd></div>
              </dl>
              <button onClick={() => accept(t)}
                className="mt-4 w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                Accept
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 px-5 py-4 font-semibold text-slate-900">My deliveries</h2>
        <ul className="divide-y divide-slate-100">
          {mine.length === 0 && <li className="px-5 py-6 text-sm text-slate-500">You haven't accepted any tasks yet.</li>}
          {mine.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-medium text-slate-900">{t.item}</p>
                <p className="text-xs text-slate-500">{t.pickup} → {t.dropoff}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={t.status} />
                {NEXT[t.status] && (
                  <button onClick={() => advance(t.id)}
                    className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700">
                    {NEXT[t.status].label}
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
