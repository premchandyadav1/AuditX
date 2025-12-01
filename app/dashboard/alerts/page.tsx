"use client"

import { useState, useEffect } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, Info, CheckCircle2, X, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Alert {
  id: string
  alert_type: string
  severity: "low" | "medium" | "high" | "critical"
  title: string
  message: string
  is_read: boolean
  is_dismissed: boolean
  created_at: string
  action_url?: string
}

const SEVERITY_CONFIG = {
  critical: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertTriangle },
  high: { color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: AlertTriangle },
  medium: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Info },
  low: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Info },
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from("alerts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_dismissed", false)
        .order("created_at", { ascending: false })

      if (data) setAlerts(data)
    }
  }

  const markAsRead = async (id: string) => {
    const supabase = createClient()
    await supabase.from("alerts").update({ is_read: true, read_at: new Date().toISOString() }).eq("id", id)

    setAlerts(alerts.map((a) => (a.id === id ? { ...a, is_read: true } : a)))
  }

  const dismissAlert = async (id: string) => {
    const supabase = createClient()
    await supabase.from("alerts").update({ is_dismissed: true }).eq("id", id)

    setAlerts(alerts.filter((a) => a.id !== id))
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from("alerts")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("is_read", false)

      setAlerts(alerts.map((a) => ({ ...a, is_read: true })))
    }
  }

  const filteredAlerts = filter === "all" ? alerts : alerts.filter((a) => !a.is_read)
  const unreadCount = alerts.filter((a) => !a.is_read).length

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0A1A2F] via-[#112240] to-[#0A1A2F]">
      <DashboardNav />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Alerts & Notifications</h1>
              <p className="text-gray-400">
                {unreadCount} unread alert{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={
                filter === "all"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600"
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              }
            >
              All ({alerts.length})
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              onClick={() => setFilter("unread")}
              className={
                filter === "unread"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600"
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              }
            >
              Unread ({unreadCount})
            </Button>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <Card className="p-12 bg-white/5 backdrop-blur-xl border-white/10 text-center">
                <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No alerts</h3>
                <p className="text-gray-400">You're all caught up!</p>
              </Card>
            ) : (
              filteredAlerts.map((alert) => {
                const config = SEVERITY_CONFIG[alert.severity]
                const Icon = config.icon

                return (
                  <Card
                    key={alert.id}
                    className={`p-6 backdrop-blur-xl border-white/10 transition-all ${
                      alert.is_read ? "bg-white/5" : "bg-white/10"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white">{alert.title}</h3>
                              {!alert.is_read && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                            </div>
                            <Badge variant="outline" className={config.color}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            {!alert.is_read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(alert.id)}
                                className="text-gray-400 hover:text-white"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => dismissAlert(alert.id)}
                              className="text-gray-400 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-gray-300 mb-3">{alert.message}</p>

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">{new Date(alert.created_at).toLocaleString()}</p>
                          {alert.action_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                            >
                              View Details
                              <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
