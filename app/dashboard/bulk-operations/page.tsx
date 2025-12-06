"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { createBrowserClient } from "@/lib/supabase/client"
import { CheckCircle2, Loader2, Trash2, Download, Archive } from "lucide-react"
import { toast } from "sonner"

export default function BulkOperationsPage() {
  const [resourceType, setResourceType] = useState("transactions")
  const [items, setItems] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadItems()
  }, [resourceType])

  const loadItems = async () => {
    setLoading(true)
    const { data } = await supabase.from(resourceType).select("*").limit(50)
    setItems(data || [])
    setSelectedItems([])
    setLoading(false)
  }

  const handleBulkOperation = async (operation: string) => {
    if (selectedItems.length === 0) {
      toast.error("Please select items first")
      return
    }

    setProcessing(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Create batch operation record
      const { data: batchOp, error: batchError } = await supabase
        .from("batch_operations")
        .insert({
          user_id: user.id,
          operation_type: operation,
          resource_type: resourceType,
          status: "processing",
          total_items: selectedItems.length,
        })
        .select()
        .single()

      if (batchError) throw batchError

      // Execute operation
      let success = 0
      let failed = 0

      for (const itemId of selectedItems) {
        try {
          if (operation === "delete") {
            await supabase.from(resourceType).delete().eq("id", itemId)
          } else if (operation === "export") {
            // Export logic here
          } else if (operation === "update_status") {
            await supabase.from(resourceType).update({ status: "archived" }).eq("id", itemId)
          }
          success++
        } catch (err) {
          failed++
        }
      }

      // Update batch operation status
      await supabase
        .from("batch_operations")
        .update({
          status: "completed",
          processed_items: success,
          completed_at: new Date().toISOString(),
          results: { success, failed },
        })
        .eq("id", batchOp.id)

      toast.success(`Operation completed! ${success} successful, ${failed} failed`)
      loadItems()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setProcessing(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items.map((item) => item.id))
    }
  }

  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight gradient-text">Bulk Operations</h2>
        <p className="text-muted-foreground">Perform actions on multiple items simultaneously</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={resourceType} onValueChange={setResourceType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transactions">Transactions</SelectItem>
              <SelectItem value="vendors">Vendors</SelectItem>
              <SelectItem value="documents">Documents</SelectItem>
              <SelectItem value="fraud_cases">Fraud Cases</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="outline">
            {selectedItems.length} of {items.length} selected
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkOperation("export")}
            disabled={selectedItems.length === 0 || processing}
            className="bg-transparent"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkOperation("update_status")}
            disabled={selectedItems.length === 0 || processing}
            className="bg-transparent"
          >
            <Archive className="w-4 h-4 mr-2" />
            Archive
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleBulkOperation("delete")}
            disabled={selectedItems.length === 0 || processing}
          >
            {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Delete
          </Button>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Items</CardTitle>
              <CardDescription>Choose items to perform bulk operations</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={toggleSelectAll} className="bg-transparent">
              {selectedItems.length === items.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No items found</div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => toggleSelectItem(item.id)}
                  />

                  <div className="flex-1">
                    <div className="font-medium">
                      {item.name || item.title || item.file_name || `Item ${item.id.slice(0, 8)}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.amount && `₹${Number(item.amount).toLocaleString()}`}
                      {item.department && ` • ${item.department}`}
                      {item.status && ` • ${item.status}`}
                      {item.risk_score && ` • Risk: ${item.risk_score}`}
                    </div>
                  </div>

                  {item.is_flagged && (
                    <Badge variant="destructive" className="shrink-0">
                      Flagged
                    </Badge>
                  )}

                  {item.status === "resolved" && <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
