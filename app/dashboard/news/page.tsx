"use client"

import { DashboardNav } from "@/components/dashboard-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Newspaper,
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  RefreshCcw,
  Calendar,
  MapPin,
  AlertTriangle,
  Shield,
} from "lucide-react"
import { useState, useEffect } from "react"

interface NewsArticle {
  title: string
  summary: string
  source: string
  category: string
  country: string
  date: string
  relevanceScore: number
  tags: string[]
  url?: string
  riskLevel?: string
  affectedSectors?: string[]
  imageUrl?: string
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedCountry, setSelectedCountry] = useState("worldwide")
  const [error, setError] = useState<string | null>(null)

  const categories = [
    { id: "all", label: "All News", icon: Newspaper },
    { id: "fraud", label: "Fraud Cases", icon: AlertCircle },
    { id: "corruption", label: "Corruption", icon: TrendingUp },
    { id: "compliance", label: "Compliance", icon: Shield },
    { id: "government-spending", label: "Gov Spending", icon: Calendar },
    { id: "investigation", label: "Investigations", icon: Search },
    { id: "policy", label: "Policy Updates", icon: Filter },
  ]

  const countries = [
    "worldwide",
    "India",
    "United States",
    "United Kingdom",
    "China",
    "Brazil",
    "South Africa",
    "European Union",
  ]

  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== "all") params.set("category", selectedCategory)
      if (selectedCountry !== "worldwide") params.set("country", selectedCountry)

      const response = await fetch(`/api/news/fetch?${params}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      }
      setArticles(data.articles || [])
    } catch (error) {
      console.error("[v0] Failed to fetch news:", error)
      setError("Failed to fetch news. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [selectedCategory, selectedCountry])

  const filteredArticles = articles.filter(
    (article) =>
      article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      fraud: "bg-destructive/10 text-destructive border-destructive/30",
      corruption: "bg-chart-1/10 text-chart-1 border-chart-1/30",
      compliance: "bg-chart-3/10 text-chart-3 border-chart-3/30",
      "government-spending": "bg-chart-4/10 text-chart-4 border-chart-4/30",
      investigation: "bg-chart-2/10 text-chart-2 border-chart-2/30",
      policy: "bg-primary/10 text-primary border-primary/30",
    }
    return colors[category] || "bg-muted text-muted-foreground"
  }

  const getRiskColor = (riskLevel: string) => {
    const colors: Record<string, string> = {
      critical: "bg-destructive text-destructive-foreground",
      high: "bg-chart-1 text-white",
      medium: "bg-chart-4 text-white",
      low: "bg-chart-3 text-white",
    }
    return colors[riskLevel] || "bg-muted text-muted-foreground"
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Newspaper className="w-8 h-8 text-primary" />
              Global Intelligence Feed
            </h1>
            <p className="text-muted-foreground">
              Real-time worldwide fraud, corruption, and compliance news powered by NewsAPI + AI
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-500">Live Feed Active</span>
            </div>
          </div>
          <Button onClick={fetchNews} disabled={loading} className="holographic-gradient glow-blue">
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh Feed
          </Button>
        </div>

        {error && (
          <Card className="p-4 mb-6 bg-chart-4/10 border-chart-4/30">
            <div className="flex items-center gap-2 text-chart-4">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="p-6 mb-6 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search news by title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filters */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={selectedCategory === cat.id ? "holographic-gradient" : ""}
                    >
                      <Icon className="w-3 h-3 mr-2" />
                      {cat.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Country Filter */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Region</p>
              <div className="flex flex-wrap gap-2">
                {countries.map((country) => (
                  <Button
                    key={country}
                    variant={selectedCountry === country ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCountry(country)}
                    className={selectedCountry === country ? "holographic-gradient" : ""}
                  >
                    <MapPin className="w-3 h-3 mr-2" />
                    {country}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
            <p className="text-sm text-muted-foreground mb-1">Total Articles</p>
            <p className="text-2xl font-bold text-foreground">{filteredArticles.length}</p>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
            <p className="text-sm text-muted-foreground mb-1">Critical Alerts</p>
            <p className="text-2xl font-bold text-destructive">
              {filteredArticles.filter((a) => a.riskLevel === "critical" || a.relevanceScore >= 90).length}
            </p>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
            <p className="text-sm text-muted-foreground mb-1">Countries</p>
            <p className="text-2xl font-bold text-foreground">{new Set(filteredArticles.map((a) => a.country)).size}</p>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
            <p className="text-sm text-muted-foreground mb-1">Avg Relevance</p>
            <p className="text-2xl font-bold text-primary">
              {filteredArticles.length > 0
                ? Math.round(filteredArticles.reduce((sum, a) => sum + a.relevanceScore, 0) / filteredArticles.length)
                : 0}
              %
            </p>
          </Card>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCcw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Fetching live intelligence from global sources...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredArticles.map((article, index) => (
              <Card
                key={index}
                className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  {article.imageUrl && (
                    <div className="shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={article.imageUrl || "/placeholder.svg"}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          article.riskLevel === "critical" || article.relevanceScore >= 90
                            ? "bg-destructive animate-pulse"
                            : article.riskLevel === "high" || article.relevanceScore >= 80
                              ? "bg-chart-1"
                              : "bg-chart-3"
                        }`}
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2 leading-tight">{article.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{article.summary}</p>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Newspaper className="w-3 h-3" />
                        <span>{article.source}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{article.country}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(article.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{article.relevanceScore}% relevant</span>
                      </div>
                    </div>

                    {/* Tags and Category */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`${getCategoryColor(article.category)} text-xs`}>
                        {article.category.replace("-", " ").toUpperCase()}
                      </Badge>
                      {article.riskLevel && (
                        <Badge className={`${getRiskColor(article.riskLevel)} text-xs`}>
                          {article.riskLevel.toUpperCase()} RISK
                        </Badge>
                      )}
                      {article.tags?.slice(0, 4).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {article.affectedSectors?.slice(0, 2).map((sector, i) => (
                        <Badge key={`sector-${i}`} variant="secondary" className="text-xs">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  {article.url && article.url !== "#" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 bg-transparent"
                      onClick={() => window.open(article.url, "_blank")}
                    >
                      <ExternalLink className="w-3 h-3 mr-2" />
                      Read More
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredArticles.length === 0 && !loading && (
          <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-border/50">
            <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No articles found matching your filters</p>
          </Card>
        )}
      </main>
    </div>
  )
}
