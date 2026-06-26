import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "lg";
  className?: string;
  ring?: boolean;
}

const sizes = {
  sm: { box: "h-9 w-9", px: 36, src: "/logo-nav.png" },
  lg: { box: "h-24 w-24", px: 96, src: "/logo.png" },
} as const;

export function Logo({ size = "sm", className, ring = true }: LogoProps) {
  const { box, px, src } = sizes[size];

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-white",
        ring && size === "sm" && "ring-1 ring-white/30",
        ring && size === "lg" && "ring-4 ring-red-100",
        box,
        className,
      )}
    >
      <Image
        src={src}
        alt="Aunty Eve's Place"
        width={px}
        height={px}
        className="h-full w-full object-cover"
        priority={size === "lg"}
      />
    </div>
  );
}
