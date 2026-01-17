export default function QuickAction({ label }) {
  return (
    <button className="bg-blue-600 text-white rounded-2xl p-4 text-center active:scale-95">
      {label}
    </button>
  );
}
