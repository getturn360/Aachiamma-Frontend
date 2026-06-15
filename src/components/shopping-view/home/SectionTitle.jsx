export default function SectionTitle({ text, accentColor = "#08665F" }) {
  return (
    <div className="flex items-center justify-center mb-8 px-2">
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
  );
}
