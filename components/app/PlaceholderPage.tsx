import { Reveal } from "@/components/Reveal";

export function PlaceholderPage({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Reveal>
      <div className="flex flex-col items-center justify-center text-center py-24 rounded-2xl bg-white border border-dashed border-slate-300">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-[32px]">{icon}</span>
        </div>
        <h1 className="font-headline-lg text-2xl font-extrabold text-slate-900 mb-2">{title}</h1>
        <p className="font-body-md text-sm text-slate-500 max-w-sm">{description}</p>
        <span className="mt-4 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-label-code font-bold text-amber-700">
          COMING SOON
        </span>
      </div>
    </Reveal>
  );
}
