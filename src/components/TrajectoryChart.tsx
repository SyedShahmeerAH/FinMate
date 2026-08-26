interface TrajectoryChartProps {
  goal?: string;
  goalLabel?: string;
  days?: string[];
}

export default function TrajectoryChart({
  goal = "Rs. 40,600",
  goalLabel = "TEXTBOOKS",
  days = ["MON", "TUE", "WED", "THU", "FRI"],
}: TrajectoryChartProps) {
  const dataPoints = [
    { height: "mb-16", size: "w-3 h-3", color: "bg-white border-black" },
    { height: "mb-20", size: "w-3 h-3", color: "bg-white border-black" },
    { height: "mb-32", size: "w-6 h-6", color: "bg-[#00FFFF] border-black", active: true },
    { height: "mb-44", size: "w-3 h-3", color: "bg-white border-black" },
    { height: "mb-56", size: "w-4 h-4", color: "bg-black border-[#00FFFF]" },
  ];

  return (
    <div className="col-span-1 md:col-span-7 border-2 border-gray-700 bg-[#0a0a0a] p-8 md:p-10 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h4 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-2 text-white">
            Target_Trajectory
          </h4>
          <p className="font-mono text-sm md:text-base text-[#00FFFF] font-bold">
            {`GOAL: ${goal} // ${goalLabel}`}
          </p>
        </div>
        <iconify-icon icon="lucide:line-chart" class="text-5xl text-gray-600" />
      </div>

      <div className="h-40 md:h-56 w-full relative flex items-end justify-between gap-2 px-2">
        {/* Chart Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          <path
            d="M0,150 L150,140 L300,120 L450,180 L600,200"
            fill="none"
            stroke="#333"
            strokeWidth="2"
            strokeDasharray="8 8"
          />
          <path
            d="M0,150 L150,130 L300,90 L450,50 L600,20"
            fill="none"
            stroke="#00FFFF"
            strokeWidth="3"
          />
        </svg>

        {/* Data Points */}
        {days.map((day, i) => (
          <div
            key={day}
            className="w-full flex flex-col items-center h-full justify-end z-10"
          >
            <div
              className={`${dataPoints[i].size} ${dataPoints[i].color} border-2 ${dataPoints[i].height} ${
                dataPoints[i].active
                  ? "relative group cursor-crosshair hover:scale-125 transition-transform"
                  : ""
              }`}
            >
              {dataPoints[i].active && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#00FFFF] text-black font-mono font-bold text-sm px-3 py-1 hidden group-hover:block whitespace-nowrap border-2 border-black">
                  ACTION_APPLIED
                </div>
              )}
            </div>
            <span
              className={`font-mono text-xs md:text-sm font-bold mt-3 ${
                dataPoints[i].active
                  ? "text-black bg-[#00FFFF] px-2 py-0.5"
                  : i === days.length - 1
                  ? "text-[#00FFFF]"
                  : "text-gray-500"
              }`}
            >
              {day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
