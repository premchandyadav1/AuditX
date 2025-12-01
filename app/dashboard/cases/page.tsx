"use client"

import { useState, useEffect } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, AlertCircle, Clock, CheckCircle2, XCircle, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface FraudCase {
  id: string
  case_number: string
  title: string
  severity: "low" | "medium" | "high" | "critical"
  status: "open" | "investigating" | "resolved" | "closed" | "dismissed"
  fraud_type: string
  estimated_loss: number
  detection_date: string
  priority: number
}

const SEVERITY_COLORS = {
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
}

const STATUS_ICONS = {
  open: <AlertCircle className="w-4 h-4" />,
  investigating: <Clock className="w-4 h-4" />,
  resolved: <CheckCircle2 className="w-4 h-4" />,
  closed: <CheckCircle2 className="w-4 h-4" />,
  dismissed: <XCircle className="w-4 h-4" />,
}

export default function CasesPage() {
  const [cases, setCases] = useState<FraudCase[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCases()
  }, [])

  const loadCases = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("fraud_cases").select("*").order("created_at", { ascending: false })

    if (data) {
      setCases(data)
    }
    setIsLoading(false)
  }

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.case_number.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: cases.length,
    open: cases.filter((c) => c.status === "open").length,
    investigating: cases.filter((c) => c.status === "investigating").length,
    resolved: cases.filter((c) => c.status === "resolved").length,
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0A1A2F] via-[#112240] to-[#0A1A2F]">
      <DashboardNav />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Case Management</h1>
              <p className="text-gray-400">Track and manage fraud investigations</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              New Case
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6">
            <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Cases</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
            </Card>
            <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Open</p>
                  <p className="text-3xl font-bold text-orange-400 mt-1">{stats.open}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-400" />
              </div>
            </Card>
            <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Investigating</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.investigating}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </Card>
            <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Resolved</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">{stats.resolved}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cases..."
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </Card>

          {/* Cases List */}
          <div className="space-y-4">
            {isLoading ? (
              <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 text-center">
                <p className="text-gray-400">Loading cases...</p>
              </Card>
            ) : filteredCases.length === 0 ? (
              <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 text-center">
                <p className="text-gray-400">No cases found</p>
              </Card>
            ) : (
              filteredCases.map((fraudCase) => (
                <Card
                  key={fraudCase.id}
                  className="p-6 bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <Link href={`/dashboard/cases/${fraudCase.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className="font-mono text-xs">
                            {fraudCase.case_number}
                          </Badge>
                          <Badge variant="outline" className={SEVERITY_COLORS[fraudCase.severity]}>
                            {fraudCase.severity.toUpperCase()}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            {STATUS_ICONS[fraudCase.status]}
                            <span className="capitalize">{fraudCase.status}</span>
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-2">{fraudCase.title}</h3>

                        <div className="flex items-center gap-6 text-sm text-gray-400">
                          <div>
                            <span className="text-gray-500">Type:</span> {fraudCase.fraud_type}
                          </div>
                          <div>
                            <span className="text-gray-500">Estimated Loss:</span>{" "}
                            <span className="text-red-400 font-semibold">
                              ${fraudCase.estimated_loss.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Priority:</span> {fraudCase.priority}/5
                          </div>
                          <div>
                            <span className="text-gray-500">Detected:</span>{" "}
                            {new Date(fraudCase.detection_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
