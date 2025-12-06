"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@/lib/supabase/client"
import { LayoutDashboard, BarChart3, TrendingUp, AlertTriangle, DollarSign, Users, Save, RotateCcw } from "lucide-react"
import { toast } from "sonner"

const availableWidgets = [
  { id: "kpi-cards", name: "KPI Cards", icon: LayoutDashboard, description: "Total spend, fraud detected, risk score" },
  {
    id: "fraud-chart",
    name: "Fraud Trends Chart",
    icon: BarChart3,
    description: "Line chart of fraud cases over time",
  },
  { id: "department-risk", name: "Department Risk Chart", icon: TrendingUp, description: "Risk scores by department" },
  { id: "recent-alerts", name: "Recent Alerts", icon: AlertTriangle, description: "Latest fraud alerts and warnings" },
  { id: "top-vendors", name: "Top Vendors", icon: Users, description: "Vendors by transaction volume" },
  { id: "spending-summary", name: "Spending Summary", icon: DollarSign, description: "Monthly spending overview" },
]

export default function CustomizeDashboardPage() {
  const [widgets, setWidgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadWidgets()
  }, [])

  const loadWidgets = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from("dashboard_widgets").select("*").eq("user_id", user.id).order("position")

    if (data && data.length > 0) {
      setWidgets(data)
    } else {
      // Set defaults
      setWidgets(
        availableWidgets.map((w, i) => ({
          widget_type: w.id,
          position: i,
          is_visible: true,
          size: "medium",
        })),
      )
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Delete existing widgets
      await supabase.from("dashboard_widgets").delete().eq("user_id", user.id)

      // Insert new configuration
      const widgetsToInsert = widgets.map((w) => ({
        user_id: user.id,
        widget_type: w.widget_type,
        position: w.position,
        size: w.size,
        is_visible: w.is_visible,
      }))

      const { error } = await supabase.from("dashboard_widgets").insert(widgetsToInsert)

      if (error) throw error

      toast.success("Dashboard customization saved!")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setWidgets(
      availableWidgets.map((w, i) => ({
        widget_type: w.id,
        position: i,
        is_visible: true,
        size: "medium",
      })),
    )
    toast.info("Dashboard reset to defaults")
  }

  const toggleWidget = (widgetType: string) => {
    setWidgets(widgets.map((w) => (w.widget_type === widgetType ? { ...w, is_visible: !w.is_visible } : w)))
  }

  if (loading) {
    return <div className="flex-1 p-8 pt-6">Loading...</div>
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight gradient-text">Customize Dashboard</h2>
        <p className="text-muted-foreground">Choose which widgets to display on your main dashboard</p>
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          Save Layout
        </Button>

        <Button variant="outline" onClick={handleReset} className="bg-transparent">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Default
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {availableWidgets.map((widget) => {
          const Icon = widget.icon
          const widgetConfig = widgets.find((w) => w.widget_type === widget.id)
          const isVisible = widgetConfig?.is_visible ?? true

          return (
            <Card key={widget.id} className={`glass-card ${!isVisible ? "opacity-50" : ""}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{widget.name}</CardTitle>
                      <CardDescription className="text-xs">{widget.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor={widget.id} className="text-sm cursor-pointer">
                    {isVisible ? "Visible" : "Hidden"}
                  </Label>
                  <Switch id={widget.id} checked={isVisible} onCheckedChange={() => toggleWidget(widget.id)} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
