import { Reveal } from "@/components/Reveal";

const testimonials = [
  {
    quote:
      "Tugas Besar Pemrograman Web selamat berkat barter 2 jam sama abang IF angkatan '20! Saya bantuin perbaiki slide presentasi sidangnya, dia ajarin saya routing Laravel sampai paham.",
    name: "Farhan Ramadhan",
    meta: "Teknik Informatika (IF '23)",
    initials: "FR",
    initialsClass: "bg-indigo-100 text-indigo-700",
  },
  {
    quote:
      "Puas banget bisa tukar skill edit video TikTok himpunan sama tutorial algoritma C++. Nggak ada rasa minder karena sama-sama belajar dan saling butuh.",
    name: "Dinda Permata",
    meta: "Sistem Informasi (SI '22)",
    initials: "DP",
    initialsClass: "bg-emerald-100 text-emerald-700",
  },
  {
    quote:
      "Sistem BuddyPoints bikin kita gak segan minta tolong diajarin. Dengan poin, yang ngajarin dihargai dan yang belajar punya komitmen hadir tepat waktu.",
    name: "Bayu Saputra",
    meta: "Sistem Komputer (SK '21)",
    initials: "BS",
    initialsClass: "bg-amber-100 text-amber-700",
  },
] as const;

function Stars() {
  return (
    <div className="flex items-center text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
          star
        </span>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section id="testimoni" className="max-w-[1440px] mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <Reveal>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-label-code text-xs text-amber-600 font-bold uppercase tracking-widest block mb-1">
            {"//"} TESTIMONI KAMPUS
          </span>
          <h2 className="font-headline-lg text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Suara Mahasiswa Filkom UPI YPTK
          </h2>
          <p className="font-body-md text-sm sm:text-base text-slate-600">
            Kisah nyata kawan-kawan yang terselamatkan dari kebuntuan tugas kuliah
            lewat barter ilmu sehat.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 150} className="h-full">
            <div
              className="h-full p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:-translate-y-1.5 hover:border-amber-200 transition-all duration-300 flex flex-col justify-between group"
            >
            <div className="flex flex-col gap-3">
              <Stars />
              <p className="font-body-md text-sm text-slate-700 italic leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
              <div className={`w-10 h-10 rounded-full ${t.initialsClass} ring-1 ring-slate-200 flex items-center justify-center font-bold text-xs`}>
                {t.initials}
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-sm text-slate-900 font-bold">{t.name}</span>
                <span className="font-label-code text-xs text-slate-500">{t.meta}</span>
              </div>
            </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
