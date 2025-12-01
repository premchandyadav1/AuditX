"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, Calendar, DollarSign, FileText, Building2, AlertTriangle } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface SearchResult {
  id: string
  type: "document" | "transaction" | "vendor" | "case"
  title: string
  subtitle: string
  amount?: string
  date?: string
  riskLevel?: "low" | "medium" | "high"
  metadata?: Record<string, any>
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [filters, setFilters] = useState({
    type: "all",
    dateRange: "all",
    riskLevel: "all",
  })
  const supabase = createBrowserClient()

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    console.log("[v0] Searching for:", query)

    try {
      const searchResults: SearchResult[] = []

      // Search documents
      const { data: documents } = await supabase
        .from("documents")
        .select("*")
        .or(`document_number.ilike.%${query}%,vendor_name.ilike.%${query}%`)
        .limit(10)

      if (documents) {
        searchResults.push(
          ...documents.map((doc) => ({
            id: doc.id,
            type: "document" as const,
            title: `${doc.document_type} - ${doc.document_number}`,
            subtitle: doc.vendor_name,
            amount: `₹${doc.amount?.toLocaleString()}`,
            date: doc.document_date,
            riskLevel:
              doc.fraud_score > 70 ? ("high" as const) : doc.fraud_score > 40 ? ("medium" as const) : ("low" as const),
            metadata: doc,
          })),
        )
      }

      // Search vendors
      const { data: vendors } = await supabase.from("vendors").select("*").ilike("name", `%${query}%`).limit(10)

      if (vendors) {
        searchResults.push(
          ...vendors.map((vendor) => ({
            id: vendor.id,
            type: "vendor" as const,
            title: vendor.name,
            subtitle: `Risk Score: ${vendor.risk_score || 0}`,
            riskLevel:
              vendor.risk_score > 70
                ? ("high" as const)
                : vendor.risk_score > 40
                  ? ("medium" as const)
                  : ("low" as const),
            metadata: vendor,
          })),
        )
      }

      // Search transactions
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .or(`transaction_id.ilike.%${query}%,vendor_name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10)

      if (transactions) {
        searchResults.push(
          ...transactions.map((txn) => ({
            id: txn.id,
            type: "transaction" as const,
            title: `Transaction ${txn.transaction_id}`,
            subtitle: txn.vendor_name || "Unknown Vendor",
            amount: `₹${txn.amount?.toLocaleString()}`,
            date: txn.transaction_date,
            riskLevel: "low" as const,
            metadata: txn,
          })),
        )
      }

      console.log("[v0] Search complete. Found", searchResults.length, "results")
      setResults(searchResults)
    } catch (error) {
      console.error("[v0] Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "document":
        return FileText
      case "transaction":
        return DollarSign
      case "vendor":
        return Building2
      case "case":
        return AlertTriangle
      default:
        return FileText
    }
  }

  const getRiskBadge = (level?: string) => {
    if (!level) return null

    const colors = {
      low: "bg-chart-4/10 text-chart-4",
      medium: "bg-chart-2/10 text-chart-2",
      high: "bg-destructive/10 text-destructive",
    }

    return (
      <span className={`px-2 py-0.5 rounded-full text-xs ${colors[level as keyof typeof colors]}`}>
        {level.toUpperCase()}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Advanced Search</h1>
          <p className="text-muted-foreground">Search documents, transactions, vendors, and fraud cases</p>
        </div>

        {/* Search Bar */}
        <Card className="p-6 mb-8 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by document number, vendor name, transaction ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching} className="holographic-gradient glow-blue">
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          <div className="flex gap-4 mt-4">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
          </div>
        </Card>

        {/* Search Results */}
        {results.length > 0 && (
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Found {results.length} result{results.length !== 1 ? "s" : ""}
              </h3>
            </div>

            <div className="space-y-3">
              {results.map((result) => {
                const Icon = getIcon(result.type)
                return (
                  <div
                    key={result.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all bg-background/50 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{result.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                          {result.type}
                        </span>
                        {getRiskBadge(result.riskLevel)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{result.subtitle}</span>
                        {result.amount && <span>{result.amount}</span>}
                        {result.date && <span>{new Date(result.date).toLocaleDateString()}</span>}
                      </div>
                    </div>

                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {results.length === 0 && !isSearching && query && (
          <Card className="p-12 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search query or filters to find what you're looking for
              </p>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
