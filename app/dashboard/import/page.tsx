"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importType, setImportType] = useState("transactions")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", importType)

      const response = await fetch("/api/import/csv", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.error) throw new Error(data.error)

      setResult(data)
      toast.success(`Imported ${data.processed} records successfully!`)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight gradient-text">Import Data</h2>
        <p className="text-muted-foreground">Bulk import transactions, vendors, or budget data from CSV/Excel files</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>Select a CSV or Excel file to import</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-type">Import Type</Label>
              <Select value={importType} onValueChange={setImportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transactions">Transactions</SelectItem>
                  <SelectItem value="vendors">Vendors</SelectItem>
                  <SelectItem value="budget">Budget Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">Select File</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="relative bg-transparent" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Choose File
                    <input
                      id="file-upload"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                </Button>
                {file && <span className="text-sm text-muted-foreground">{file.name}</span>}
              </div>
            </div>

            <Button onClick={handleImport} disabled={loading || !file} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>CSV Format Guide</CardTitle>
            <CardDescription>Required columns for each import type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {importType === "transactions" && (
              <div className="space-y-2">
                <p className="font-medium">Transactions CSV Format:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>amount (number)</li>
                  <li>date (YYYY-MM-DD)</li>
                  <li>vendor_id (UUID, optional)</li>
                  <li>department (text)</li>
                  <li>description (text)</li>
                  <li>invoice_number (text)</li>
                  <li>category (text)</li>
                </ul>
              </div>
            )}

            {importType === "vendors" && (
              <div className="space-y-2">
                <p className="font-medium">Vendors CSV Format:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>name (text)</li>
                  <li>tax_id (text)</li>
                  <li>email (email)</li>
                  <li>phone (text)</li>
                  <li>address (text)</li>
                  <li>category (text)</li>
                </ul>
              </div>
            )}

            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium">Template Available</p>
              <Button variant="link" className="h-auto p-0 text-sm">
                Download CSV Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{result.processed}</p>
                  <p className="text-sm text-muted-foreground">Rows Imported</p>
                </div>
              </div>

              {result.failed > 0 && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{result.failed}</p>
                    <p className="text-sm text-muted-foreground">Rows Failed</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{result.processed + result.failed}</p>
                  <p className="text-sm text-muted-foreground">Total Rows</p>
                </div>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="mt-4">
                <p className="font-medium mb-2">Errors:</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {result.errors.slice(0, 5).map((error: any, i: number) => (
                    <div key={i} className="p-2 bg-red-500/5 border border-red-500/10 rounded text-sm">
                      <p className="text-red-600">{error.error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
