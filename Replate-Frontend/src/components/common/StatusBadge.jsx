const STYLES = {
  Pending: "bg-amber-100 text-amber-800",
  Approved: "bg-emerald-100 text-emerald-800",
  Active: "bg-emerald-100 text-emerald-800",
  Completed: "bg-blue-100 text-blue-800",
  Delivered: "bg-blue-100 text-blue-800",
  InTransit: "bg-indigo-100 text-indigo-800",
  PickedUp: "bg-indigo-100 text-indigo-800",
  Rejected: "bg-red-100 text-red-800",
  Suspended: "bg-red-100 text-red-800",
  Cancelled: "bg-slate-200 text-slate-700",
  Expired: "bg-slate-200 text-slate-700",
  Flagged: "bg-orange-100 text-orange-800",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STYLES[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}
