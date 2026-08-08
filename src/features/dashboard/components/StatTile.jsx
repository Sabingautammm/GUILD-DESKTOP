export default function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-[#EDE1CB] bg-[#FAF6EE] p-4">
      <div className="flex items-center gap-1.5 text-[#6B5B45] mb-1">
        {Icon && <Icon className="text-xs shrink-0" />}
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-base font-bold text-[#17120D]">{value}</p>
    </div>
  );
}
