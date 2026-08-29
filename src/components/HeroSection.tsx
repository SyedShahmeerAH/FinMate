interface HeroSectionProps {
  headline?: string;
  subline?: string;
}

export default function HeroSection({
  headline = "System Online.",
  subline = "How can I optimize your capital?",
}: HeroSectionProps) {
  return (
    <div className="space-y-6">
      <div className="eyebrow">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)] animate-pulse" />
        AI Financial Advisor
      </div>
      <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-white tracking-tight leading-[1.05]">
        {headline}
      </h1>
      <p className="text-lg md:text-xl text-white/30 font-light max-w-lg">
        {subline}
      </p>
    </div>
  );
}
