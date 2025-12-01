import { DashboardNav } from "@/components/dashboard-nav"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96 mb-8" />

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4 border-border/50">
                <Skeleton className="h-20 w-full" />
              </Card>
            ))}
          </div>

          <Card className="h-[calc(100vh-400px)] p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="space-y-4">
              <Skeleton className="h-20 w-3/4" />
              <Skeleton className="h-20 w-2/3 ml-auto" />
              <Skeleton className="h-20 w-3/4" />
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
