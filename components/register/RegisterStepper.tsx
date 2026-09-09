const steps = ["Data Diri", "Skill & Minat", "Konfirmasi"] as const;

export function RegisterStepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2 mt-5">
      {steps.map((label, i) => {
        const num = (i + 1) as 1 | 2 | 3;
        const done = num < current;
        const active = num === current;
        return (
          <div key={label} className="contents">
            {i > 0 && (
              <div className={`h-0.5 flex-1 rounded ${done || active ? "bg-emerald-500" : "bg-slate-200"}`} />
            )}
            <div
              className={`flex items-center gap-1.5 font-headline-sm text-sm ${
                done ? "text-emerald-600 font-semibold" : active ? "text-indigo-600 font-semibold" : "text-slate-400 font-medium"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? <span className="material-symbols-outlined text-[16px]">check</span> : num}
              </span>
              <span className={num === 1 ? "hidden sm:inline" : ""}>{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
