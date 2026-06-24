import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  color?: "green" | "orange" | "red";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const colorStyles = {
  green: "bg-primary-500",
  orange: "bg-secondary-500",
  red: "bg-red-500",
};

const sizeStyles = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

export function ProgressBar({
  value,
  className,
  showLabel = false,
  color = "green",
  size = "md",
  animated = false,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs font-semibold text-primary-600">{clamped}%</span>
        </div>
      )}
      <div className={cn("w-full bg-slate-100 rounded-full overflow-hidden", sizeStyles[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            colorStyles[color],
            animated && "progress-animated"
          )}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
