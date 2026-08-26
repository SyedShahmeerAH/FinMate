interface HeroSectionProps {
  headline?: string;
  subline?: string;
}

export default function HeroSection({
  headline = "System Online.",
  subline = "How can I optimize your capital?",
}: HeroSectionProps) {
  return (
    <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tight leading-[1.1]">
      {headline}
      <br />
      <span className="text-gray-500">{subline}</span>
    </h2>
  );
}
