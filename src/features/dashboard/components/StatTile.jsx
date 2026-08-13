export default function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl card-surface p-4">
      <div className="flex items-center gap-1.5 text-guild-400 mb-1">
        {Icon && <Icon className="text-xs shrink-0" />}
        <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-base font-bold text-cream">{value}</p>
    </div>
  );
}
