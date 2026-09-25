export type VirtualBackdrop = "desert" | "modern" | "poolside";

const scenes: Record<VirtualBackdrop, { sky: string; ground: string; accent: string }> = {
  desert: {
    sky: "linear-gradient(180deg, #9fd5df 0%, #e8d6ad 52%, #c58d58 100%)",
    ground: "linear-gradient(155deg, #b98a58, #7f5d3d)",
    accent: "#67e8f9",
  },
  modern: {
    sky: "linear-gradient(180deg, #8eb9c4 0%, #d9ddd4 50%, #899083 100%)",
    ground: "linear-gradient(155deg, #8d918a, #555c55)",
    accent: "#a7f3d0",
  },
  poolside: {
    sky: "linear-gradient(180deg, #74bed2 0%, #d5e6df 52%, #a7a58e 100%)",
    ground: "linear-gradient(155deg, #c9baa1, #84796b)",
    accent: "#67e8f9",
  },
};

export function VirtualYardBackdrop({ backdrop }: { backdrop: VirtualBackdrop }) {
  const scene = scenes[backdrop];

  return (
    <div className="absolute inset-0 overflow-hidden" role="img" aria-label="Virtual backyard design lot">
      <div className="absolute inset-0" style={{ background: scene.sky }} />
      <div className="absolute right-[12%] top-[10%] h-[11%] aspect-square rounded-full bg-amber-100/90 shadow-[0_0_45px_rgba(253,230,138,0.75)]" />
      <div className="absolute inset-x-0 top-[27%] h-[25%] bg-stone-600/35 [clip-path:polygon(0_82%,12%_35%,24%_68%,38%_18%,52%_70%,66%_28%,81%_65%,92%_32%,100%_76%,100%_100%,0_100%)]" />
      <div className="absolute inset-x-0 bottom-0 top-[43%]" style={{ background: scene.ground }} />

      {backdrop === "modern" && (
        <div className="absolute right-[8%] top-[28%] h-[27%] w-[42%] border border-white/40 bg-stone-100/80 shadow-2xl">
          <div className="absolute bottom-0 left-[12%] h-[60%] w-[30%] bg-slate-700/80" />
          <div className="absolute right-[8%] top-[20%] h-[35%] w-[38%] bg-sky-200/50" />
        </div>
      )}

      {backdrop === "poolside" && (
        <div className="absolute bottom-[12%] left-[18%] h-[30%] w-[64%] rounded-[45%] border-[6px] border-stone-100/80 bg-cyan-500/60 shadow-[inset_0_0_25px_rgba(255,255,255,0.55),0_12px_35px_rgba(0,0,0,0.25)]" />
      )}

      <div className="virtual-yard-grid absolute -bottom-[38%] -left-[20%] -right-[20%] top-[42%] opacity-65" style={{ color: scene.accent }} />
      <div className="pointer-events-none absolute inset-3 border border-cyan-200/25 shadow-[inset_0_0_35px_rgba(103,232,249,0.12)]" />
      <span className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-cyan-200/80" />
      <span className="absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-cyan-200/80" />
      <span className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-cyan-200/80" />
      <span className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-cyan-200/80" />
      <div className="hologram-scan pointer-events-none absolute inset-x-0 h-px bg-cyan-100/70 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />
    </div>
  );
}