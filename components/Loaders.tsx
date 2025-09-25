import { cn } from "@/lib/utils";

export function MainLoader({ className }: { className?: string }) {
  return (
    <div className={cn("spinner", className)}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
