"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@/lib/supabase/client"
import { AlertTriangle, TrendingUp, Network, DollarSign, Calendar, Target } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function FraudPatternsPage() {
  const [patterns, setPatterns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadPatterns()
  }, [])

  const loadPatterns = async () => {
    const { data } = await supabase.from("fraud_patterns").select("*").order("match_count", { ascending: false })

    setPatterns(data || [])
    setLoading(false)
  }

  const getIcon = (type: string) => {
    const icons: any = {
      duplicate: Network,
      threshold: Target,
      temporal: Calendar,
      amount: DollarSign,
      vendor: TrendingUp,
    }
    return icons[type] || AlertTriangle
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <Skeleton className="h-9 w-96" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight gradient-text">Fraud Pattern Recognition</h2>
        <p className="text-muted-foreground">AI-detected patterns and anomalies across audit data</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {patterns.map((pattern) => {
          const Icon = getIcon(pattern.pattern_type)
          return (
            <Card key={pattern.id} className="glass-card hover:glow-blue transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Icon className="w-8 h-8 text-primary" />
                  <Badge
                    variant={
                      pattern.severity === "critical"
                        ? "destructive"
                        : pattern.severity === "high"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {pattern.severity}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{pattern.pattern_name}</CardTitle>
                <CardDescription>{pattern.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Matches Found</span>
                    <span className="text-2xl font-bold">{pattern.match_count}</span>
                  </div>
                  {pattern.last_detected_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Detected</span>
                      <span>{new Date(pattern.last_detected_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="pt-2">
                    <Badge variant="outline" className="w-full justify-center">
                      {pattern.pattern_type.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {patterns.length === 0 && (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No patterns detected yet</p>
            <p className="text-sm text-muted-foreground">Fraud patterns will appear here as data is analyzed</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
