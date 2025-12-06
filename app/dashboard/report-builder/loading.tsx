import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <Skeleton className="h-9 w-96 mb-2" />
        <Skeleton className="h-5 w-[600px]" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Skeleton className="h-[600px]" />
        </div>
        <div>
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    </div>
  )
}
