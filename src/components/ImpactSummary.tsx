interface ImpactSummaryProps {
  projectedCapital?: string;
  savedAmount?: string;
}

export default function ImpactSummary({
  projectedCapital = "Rs. 1,232,000",
  savedAmount = "+Rs. 42,560 SAVED",
}: ImpactSummaryProps) {
  return (
    <div className="col-span-1 md:col-span-5 border-2 border-gray-700 p-8 md:p-10 bg-[#0a0a0a] flex flex-col justify-center">
      <p className="font-mono text-base md:text-lg text-gray-400 mb-4 border-b-2 border-gray-700 inline-block pb-2 uppercase">
        Projected_Capital
      </p>
      <h4 className="text-6xl md:text-8xl font-black tracking-tighter text-white hover-glitch my-2">
        {projectedCapital}
      </h4>
      <div className="flex items-center gap-3 text-[#00FFFF] font-mono text-xl md:text-2xl mt-4 font-bold">
        <iconify-icon icon="lucide:trending-up" class="text-3xl" />
        <span>{savedAmount}</span>
      </div>
    </div>
  );
}
