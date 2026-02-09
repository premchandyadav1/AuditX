"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Building2,
  AlertTriangle,
  XCircle,
  Shield,
  TrendingUp,
  FileText,
  Scale,
  Users,
  CheckCircle2,
  AlertCircle,
  Info,
  DollarSign,
  Award,
  Newspaper,
  Briefcase,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function CompanyIntelligencePage() {
  const [companyName, setCompanyName] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [searchType, setSearchType] = useState<"general" | "compliance" | "misconduct">("general")

  const handleSearch = async () => {
    if (!companyName.trim()) return

    setLoading(true)
    setData(null)

    try {
      const response = await fetch("/api/company-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, searchType }),
      })

      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 75) return "text-red-500"
    if (score >= 50) return "text-orange-500"
    if (score >= 25) return "text-yellow-500"
    return "text-green-500"
  }

  const getRiskBadge = (score: number) => {
    if (score >= 75)
      return (
        <Badge variant="destructive" className="text-sm">
          Critical Risk
        </Badge>
      )
    if (score >= 50) return <Badge className="bg-orange-500 hover:bg-orange-600 text-sm">High Risk</Badge>
    if (score >= 25) return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-sm">Medium Risk</Badge>
    return <Badge className="bg-green-500 hover:bg-green-600 text-sm">Low Risk</Badge>
  }

  const renderDataSection = (
    title: string,
    icon: any,
    data: any,
    variant: "default" | "warning" | "danger" = "default",
  ) => {
    if (!data || (Array.isArray(data) && data.length === 0)) return null

    const Icon = icon
    const borderClass = variant === "danger" ? "border-red-500/50" : variant === "warning" ? "border-orange-500/50" : ""

    return (
      <Card className={`glass-card ${borderClass}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {typeof data === "string" ? (
            <p className="text-sm leading-relaxed">{data}</p>
          ) : Array.isArray(data) ? (
            data.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-1">
                {typeof item === "string" ? (
                  <p className="text-sm">{item}</p>
                ) : (
                  Object.entries(item).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <span className="text-xs font-medium text-muted-foreground capitalize min-w-24">
                        {key.replace(/_/g, " ")}:
                      </span>
                      <span className="text-sm flex-1">{String(value)}</span>
                    </div>
                  ))
                )}
              </div>
            ))
          ) : (
            <div className="space-y-2">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex gap-3 items-start">
                  <span className="text-sm font-medium text-muted-foreground capitalize min-w-32">
                    {key.replace(/_/g, " ")}:
                  </span>
                  <span className="text-sm flex-1 font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
            <Search className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Company Intelligence System
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered real-time intelligence gathering and risk assessment
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <Card className="glass-card border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Intelligence Search
          </CardTitle>
          <CardDescription>
            Enter company name to conduct comprehensive background check and risk analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={searchType} onValueChange={(v) => setSearchType(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general" className="gap-2">
                <Info className="w-4 h-4" />
                General Intel
              </TabsTrigger>
              <TabsTrigger value="compliance" className="gap-2">
                <Shield className="w-4 h-4" />
                Compliance
              </TabsTrigger>
              <TabsTrigger value="misconduct" className="gap-2">
                <AlertTriangle className="w-4 h-4" />
                Misconduct
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-3">
            <Input
              placeholder="Enter company name (e.g., TechCorp Solutions Pvt Ltd)"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 h-11"
            />
            <Button onClick={handleSearch} disabled={loading || !companyName.trim()} className="gap-2 h-11 px-6">
              <Search className="w-4 h-4" />
              {loading ? "Analyzing..." : "Search"}
            </Button>
          </div>

          {searchType === "general" && (
            <p className="text-xs text-muted-foreground">
              Retrieves company overview, financial health, reputation, and risk indicators
            </p>
          )}
          {searchType === "compliance" && (
            <p className="text-xs text-muted-foreground">
              Checks regulatory compliance, blacklists, legal cases, and certifications
            </p>
          )}
          {searchType === "misconduct" && (
            <p className="text-xs text-muted-foreground">
              Searches for fraud cases, corruption, financial irregularities, and investigations
            </p>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="glass-card border-blue-500/30">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-blue-500"></div>
                <Search className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-medium">Conducting Intelligence Search</p>
                <p className="text-sm text-muted-foreground">Analyzing data from multiple sources...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="space-y-6">
          {/* Company Header Card */}
          <Card className="glass-card border-2">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                    <Building2 className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{data.companyName || companyName}</h2>
                    <p className="text-sm text-muted-foreground mt-1">Intelligence Report Generated</p>
                  </div>
                </div>
                {(data.overall_risk_score || data.risk_score) &&
                  getRiskBadge(data.overall_risk_score || data.risk_score)}
              </div>
            </CardContent>
          </Card>

          {/* Risk Score Dashboard */}
          {(data.overall_risk_score !== undefined || data.risk_score !== undefined) && (
            <Card className="glass-card border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-end gap-3">
                    <div className={`text-6xl font-bold ${getRiskColor(data.overall_risk_score || data.risk_score)}`}>
                      {data.overall_risk_score || data.risk_score}
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground">Risk Score</p>
                      <p className="text-xs text-muted-foreground">Out of 100</p>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        (data.overall_risk_score || data.risk_score) >= 75
                          ? "bg-red-500"
                          : (data.overall_risk_score || data.risk_score) >= 50
                            ? "bg-orange-500"
                            : (data.overall_risk_score || data.risk_score) >= 25
                              ? "bg-yellow-500"
                              : "bg-green-500"
                      }`}
                      style={{ width: `${data.overall_risk_score || data.risk_score}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* General Intelligence Sections */}
          {data.overview && renderDataSection("Company Overview", Building2, data.overview, "default")}
          {data.financial_health && renderDataSection("Financial Health", DollarSign, data.financial_health, "default")}
          {data.reputation && renderDataSection("Reputation Assessment", Award, data.reputation, "default")}
          {data.contracts && renderDataSection("Government Contracts", Briefcase, data.contracts, "default")}
          {data.risk_indicators && data.risk_indicators.length > 0 && renderDataSection("Risk Indicators", AlertTriangle, data.risk_indicators, "warning")}
          {data.news && data.news.length > 0 && renderDataSection("Recent News", Newspaper, data.news, "default")}

          {/* Compliance Sections */}
          {data.compliance_status && renderDataSection("Compliance Status", Shield, data.compliance_status, "default")}
          {data.blacklists && data.blacklists.length > 0 && renderDataSection("Government Blacklists", XCircle, data.blacklists, "danger")}
          {data.legal_cases && data.legal_cases.length > 0 && renderDataSection("Legal Cases", Scale, data.legal_cases, "danger")}
          {data.certifications && data.certifications.length > 0 && renderDataSection("Certifications", CheckCircle2, data.certifications, "default")}
          {data.audit_findings && renderDataSection("Audit Findings", FileText, data.audit_findings, "warning")}

          {/* Misconduct Sections */}
          {data.severity && (
            <Card className={`glass-card ${data.severity === "critical" || data.severity === "high" ? "border-red-500/50" : "border-orange-500/50"}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Misconduct Severity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-lg font-semibold text-white ${
                    data.severity === "critical" ? "bg-red-600" :
                    data.severity === "high" ? "bg-orange-600" :
                    data.severity === "medium" ? "bg-yellow-600" : "bg-green-600"
                  }`}>
                    {data.severity.toUpperCase()}
                  </div>
                  <p className="text-sm flex-1">{data.summary}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {data.fraud_cases && data.fraud_cases.length > 0 && renderDataSection("Fraud Cases", AlertTriangle, data.fraud_cases, "danger")}
          {data.corruption && data.corruption.length > 0 && renderDataSection("Corruption Scandals", XCircle, data.corruption, "danger")}
          {data.financial_issues && data.financial_issues.length > 0 && renderDataSection("Financial Issues", AlertTriangle, data.financial_issues, "warning")}
          {data.complaints && data.complaints.length > 0 && renderDataSection("Complaints", AlertTriangle, data.complaints, "warning")}
          {data.investigations && data.investigations.length > 0 && renderDataSection("Investigations", AlertTriangle, data.investigations, "warning")}
          {data.court_cases && data.court_cases.length > 0 && renderDataSection("Court Cases", Scale, data.court_cases, "danger")}

          {/* Recommendation */}
          {data.recommendation && renderDataSection("Recommendation", Info, data.recommendation, "default")}

          {/* Error Note */}
          {data.error && (
            <Card className="glass-card border-yellow-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="w-5 h-5" />
                  Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{data.error}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
