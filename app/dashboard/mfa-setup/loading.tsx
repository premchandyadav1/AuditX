import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <Skeleton className="h-9 w-96 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="h-[600px] max-w-2xl" />
    </div>
  )
}
