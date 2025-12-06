import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Skeleton className="w-full max-w-md h-[600px]" />
    </div>
  )
}
