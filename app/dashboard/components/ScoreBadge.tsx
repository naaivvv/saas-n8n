export default function ScoreBadge({ score }: { score: number }) {
  let badgeColor = "bg-neutral-500/20 text-neutral-300 border-neutral-500/30";
  let label = "Cold";

  if (score >= 80) {
    badgeColor = "bg-danger/20 text-danger border-danger/50";
    label = "Hot";
  } else if (score >= 50) {
    badgeColor = "bg-accent/20 text-accent border-accent/50";
    label = "Warm";
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold tracking-wide ${badgeColor}`}>
      {label}
      <span className="opacity-70 font-mono text-[10px]">({score})</span>
    </div>
  );
}
