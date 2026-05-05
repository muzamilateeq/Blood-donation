import { Droplets } from "lucide-react";

export default function BrandMark({ compact = false, light = false }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl shadow-lg ${
          compact ? "h-10 w-10" : "h-12 w-12"
        } ${
          light
            ? "bg-white text-red-600 shadow-red-950/10"
            : "bg-red-600 text-white shadow-red-600/20"
        }`}
      >
        <Droplets aria-hidden="true" className={compact ? "h-6 w-6" : "h-7 w-7"} />
      </div>
      <div className="min-w-0">
        <p
          className={`truncate font-black leading-none ${
            compact ? "text-lg" : "text-lg sm:text-xl"
          } ${light ? "text-white" : "text-zinc-950"}`}
        >
          LifeLink Pakistan
        </p>
        <p
          className={`mt-1 truncate text-sm font-semibold ${
            light ? "text-red-100" : "text-red-700"
          }`}
        >
          Emergency donor network
        </p>
      </div>
    </div>
  );
}
