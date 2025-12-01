import { DashboardNav } from "@/components/dashboard-nav"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-80 mb-2" />
          <Skeleton className="h-6 w-96 mb-8" />

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {[1, 2].map((i) => (
              <Card key={i} className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-48 w-full" />
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </main>
    </div>
  )
}
