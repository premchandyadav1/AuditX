"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, X, FileText, Download, Save } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { createBrowserClient } from "@/lib/supabase/client"

export default function ReportBuilderPage() {
  const [reportName, setReportName] = useState("")
  const [reportType, setReportType] = useState("custom")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [filters, setFilters] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserClient()

  const availableColumns = {
    transactions: ["amount", "transaction_date", "department", "vendor_name", "invoice_number", "risk_score"],
    vendors: ["name", "tax_id", "risk_score", "total_amount", "total_transactions", "category"],
    fraud_cases: ["title", "severity", "status", "estimated_loss", "detection_date", "assigned_to"],
    documents: ["file_name", "department", "upload_date", "status", "risk_score"],
  }

  const addFilter = () => {
    setFilters([...filters, { column: "", operator: "equals", value: "" }])
  }

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  const handleGenerateReport = async () => {
    if (!reportName) {
      toast.error("Please enter a report name")
      return
    }

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Save report template
      const { data, error } = await supabase
        .from("report_templates")
        .insert({
          name: reportName,
          report_type: reportType,
          config: {
            columns: selectedColumns,
            filters,
            dateRange,
          },
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      // Generate report
      const reportResponse = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: data.id }),
      })

      if (!reportResponse.ok) throw new Error("Failed to generate report")

      toast.success("Report generated successfully!")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight gradient-text">Custom Report Builder</h2>
        <p className="text-muted-foreground">Design and generate custom audit reports with advanced filtering</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>Define what data to include in your report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  placeholder="Q1 Fraud Summary Report"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-type">Data Source</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transactions">Transactions</SelectItem>
                    <SelectItem value="vendors">Vendors</SelectItem>
                    <SelectItem value="fraud_cases">Fraud Cases</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="custom">Multi-Source</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, "PPP") : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, "PPP") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Columns to Include</Label>
                <div className="grid grid-cols-2 gap-3">
                  {availableColumns[reportType as keyof typeof availableColumns]?.map((column) => (
                    <div key={column} className="flex items-center space-x-2">
                      <Checkbox
                        id={column}
                        checked={selectedColumns.includes(column)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedColumns([...selectedColumns, column])
                          } else {
                            setSelectedColumns(selectedColumns.filter((c) => c !== column))
                          }
                        }}
                      />
                      <label
                        htmlFor={column}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {column.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Filters</CardTitle>
                  <CardDescription>Add conditions to narrow down results</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={addFilter} className="bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filters.map((filter, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Column</Label>
                      <Select
                        value={filter.column}
                        onValueChange={(value) => {
                          const newFilters = [...filters]
                          newFilters[index].column = value
                          setFilters(newFilters)
                        }}
                      >
                        <SelectTrigger className="bg-transparent">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableColumns[reportType as keyof typeof availableColumns]?.map((col) => (
                            <SelectItem key={col} value={col}>
                              {col.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Operator</Label>
                      <Select
                        value={filter.operator}
                        onValueChange={(value) => {
                          const newFilters = [...filters]
                          newFilters[index].operator = value
                          setFilters(newFilters)
                        }}
                      >
                        <SelectTrigger className="bg-transparent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not_equals">Not Equals</SelectItem>
                          <SelectItem value="greater_than">Greater Than</SelectItem>
                          <SelectItem value="less_than">Less Than</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Value</Label>
                      <Input
                        placeholder="Enter value"
                        value={filter.value}
                        onChange={(e) => {
                          const newFilters = [...filters]
                          newFilters[index].value = e.target.value
                          setFilters(newFilters)
                        }}
                      />
                    </div>

                    <Button size="icon" variant="ghost" onClick={() => removeFilter(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {filters.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No filters added. Click "Add Filter" to add conditions.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleGenerateReport} disabled={loading} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>

              <Button variant="outline" className="w-full bg-transparent" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>

              <Button variant="outline" className="w-full bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Download Sample
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm">Report Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{reportName || "Untitled"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source:</span>
                <span className="font-medium">{reportType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Columns:</span>
                <span className="font-medium">{selectedColumns.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Filters:</span>
                <span className="font-medium">{filters.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date Range:</span>
                <span className="font-medium">{dateRange.from && dateRange.to ? "Yes" : "No"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
