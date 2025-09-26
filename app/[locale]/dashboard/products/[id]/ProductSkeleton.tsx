import { Skeleton } from "@/components/ui/skeleton";

export function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-lg" color="#62748e" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-20 h-20 rounded-md"
              color="#62748e"
            />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" color="#62748e" />
          <Skeleton className="h-6 w-1/2" color="#62748e" />
          <Skeleton className="h-24 w-full" color="#62748e" />
        </div>
        <div className="h-px bg-border" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/3" color="#62748e" />
          <Skeleton className="h-10 w-full" color="#62748e" />
          <Skeleton className="h-10 w-full" color="#62748e" />
        </div>
      </div>
    </div>
  );
}
