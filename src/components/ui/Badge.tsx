import { cn } from "@/lib/utils";

type BadgeVariant =
  | "green"
  | "orange"
  | "red"
  | "blue"
  | "purple"
  | "slate"
  | "yellow";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, string> = {
  green: "bg-primary-100 text-primary-700",
  orange: "bg-orange-100 text-orange-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  slate: "bg-slate-100 text-slate-600",
  yellow: "bg-yellow-100 text-yellow-700",
};

export function Badge({
  variant = "slate",
  size = "sm",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function CampaignStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    draft: { label: "Draft", variant: "slate" },
    active: { label: "Aktif", variant: "green" },
    completed: { label: "Selesai", variant: "blue" },
    rejected: { label: "Ditolak", variant: "red" },
  };
  const config = map[status] ?? { label: status, variant: "slate" as BadgeVariant };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function ProposalStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    masuk: { label: "Masuk", variant: "blue" },
    diproses: { label: "Diproses", variant: "yellow" },
    disurvei: { label: "Disurvei", variant: "orange" },
    dibantu: { label: "Dibantu", variant: "green" },
    ditolak: { label: "Ditolak", variant: "red" },
  };
  const config = map[status] ?? { label: status, variant: "slate" as BadgeVariant };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
