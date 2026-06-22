const ICON_TONES = {
  gold: "bg-gradient-to-br from-amber-50 via-amber-100 to-orange-100 border-amber-200/80 text-amber-600 shadow-amber-100/80",
  teal: "bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-teal-200/80 text-[#08665F] shadow-teal-100/80",
};

export default function SectionTitle({
  text,
  accentColor = "#08665F",
  icon: Icon,
  iconTone = "teal",
}) {
  const toneClass = ICON_TONES[iconTone] || ICON_TONES.teal;

  return (
    <div className="flex flex-col items-center mb-8 px-2">
      {Icon && (
        <div
          className={`mb-4 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border shadow-md rotate-3 ${toneClass}`}
          aria-hidden
        >
          <Icon className="w-6 h-6 sm:w-8 sm:h-8 -rotate-3" strokeWidth={2.25} />
        </div>
      )}
      <div className="flex items-center justify-center w-full">
        <div
          className="flex-1 max-w-[50px] sm:max-w-[100px] md:max-w-[150px] h-[1px] sm:h-[2px] md:h-[2px] mr-3 sm:mr-6 rounded-full"
          style={{ background: `${accentColor}22` }}
        />
        <h2
          className="uppercase font-extrabold text-center px-3 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white/60 inline-block"
          style={{ color: accentColor }}
        >
          <span className="block tracking-[0.03em]" style={{ fontSize: "clamp(14px, 2.2vw, 28px)" }} >
            {text}
          </span>
        </h2>
        <div
          className="flex-1 max-w-[50px] sm:max-w-[100px] md:max-w-[150px] h-[1px] sm:h-[2px] md:h-[2px] ml-3 sm:ml-6 rounded-full"
          style={{ background: `${accentColor}22` }}
        />
      </div>
    </div>
  );
}
