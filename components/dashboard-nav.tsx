"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Upload, AlertTriangle, Receipt, BookCheck, Settings, Search, Bell, FolderOpen, BarChart3, Newspaper, Sparkles, FileCheck, Shield, FileUp, Brain, FileText } from "lucide-react"
import { ThemeSwitcher } from "@/components/theme-switcher"
import Image from "next/image"

interface NavSection {
  title: string
  icon?: React.ElementType
  items: Array<{
    title: string
    href: string
    icon: React.ElementType
  }>
}

const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Intelligence & Analysis",
    icon: Brain,
    items: [
      {
        title: "News Intelligence",
        href: "/dashboard/news",
        icon: Newspaper,
      },
      {
        title: "Company Intelligence",
        href: "/dashboard/company-intel",
        icon: Search,
      },
      {
        title: "AI Copilot",
        href: "/dashboard/ai-copilot",
        icon: Sparkles,
      },
    ],
  },
  {
    title: "Document Operations",
    icon: FileText,
    items: [
      {
        title: "Document Upload",
        href: "/dashboard/upload",
        icon: Upload,
      },
      {
        title: "Import Data",
        href: "/dashboard/import",
        icon: FileUp,
      },
      {
        title: "OCR Extract",
        href: "/dashboard/upload",
        icon: FileCheck,
      },
    ],
  },
  {
    title: "Compliance & Risk",
    icon: Shield,
    items: [
      {
        title: "Policy Compliance",
        href: "/dashboard/compliance",
        icon: BookCheck,
      },
      {
        title: "Fraud & Anomalies",
        href: "/dashboard/fraud",
        icon: AlertTriangle,
      },
    ],
  },
  {
    title: "Analytics & Reporting",
    icon: BarChart3,
    items: [
      {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Workspace",
    icon: FolderOpen,
    items: [
      {
        title: "Transactions",
        href: "/dashboard/transactions",
        icon: Receipt,
      },
      {
        title: "Alerts",
        href: "/dashboard/alerts",
        icon: Bell,
      },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  // Keep all sections expanded by default to avoid hydration issues
  const expandedSections: Record<string, boolean> = {
    "Main": true,
    "Intelligence & Analysis": true,
    "Document Operations": true,
    "Compliance & Risk": true,
    "Analytics & Reporting": true,
    "Workspace": true,
    "Settings": false,
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-sidebar z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-sidebar-border">
          <Image
            src="/auditx-logo.jpeg"
            alt="AuditX Logo"
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <span className="text-xl font-bold text-sidebar-foreground">AuditX</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-2">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                {/* Section Header */}
                {section.items.length > 0 && (
                  <div className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide",
                    "text-sidebar-foreground/70",
                  )}>
                    {section.icon && <section.icon className="w-4 h-4" />}
                    <span className="flex-1 text-left">{section.title}</span>
                  </div>
                )}

                {/* Section Items */}
                {expandedSections[section.title] && (
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ml-2",
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground glow-blue"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          )}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
          {/* Theme Switcher */}
          <div className="px-3">
            <ThemeSwitcher />
          </div>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-primary">AU</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Auditor</p>
              <p className="text-xs text-muted-foreground truncate">admin@auditx.gov</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
