"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, RefreshCw, Download } from "lucide-react"
import { PaymentFiltersComponent } from "@/components/payments/payment-filters"
import { PaymentsTable } from "@/components/payments/payments-table"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"
import type { Payment, PaymentFilters } from "@/types"
import type { ApiResponse } from "@/types/api"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<PaymentFilters>({})
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    failed: 0,
  })

  const fetchPayments = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.getPayments(filters) as ApiResponse<Payment[]>
      if (response.success && response.data) {
        setPayments(response.data)
        calculateStats(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error)
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const calculateStats = (paymentData: Payment[]) => {
    const total = paymentData.length
    const pending = paymentData.filter(p => p.status === "PENDING").length
    const verified = paymentData.filter(p => p.status === "VERIFIED").length
    const failed = paymentData.filter(p => p.status === "FAILED").length

    setStats({ total, pending, verified, failed })
  }

  const handleFiltersChange = (newFilters: PaymentFilters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  const handlePaymentUpdate = () => {
    fetchPayments()
  }

  const exportPayments = () => {
    try {
      if (payments.length === 0) {
        toast({
          title: "No Data",
          description: "No payments available to export",
          variant: "destructive",
        })
        return
      }

      // Create CSV content
      const csvHeaders = [
        "Payment ID",
        "Student Name",
        "Student Email",
        "Course/Hostel",
        "Payment Type",
        "Amount",
        "Status",
        "Payment Method",
        "Reference/Transaction ID",
        "Payment Date",
        "Verified By",
        "Verification Date"
      ]
      
      const csvData = payments.map(payment => [
        payment.id,
        payment.user?.name || "N/A",
        payment.user?.email || "N/A",
        payment.course?.name || payment.hostel?.name || "N/A",
        payment.type,
        payment.amount,
        payment.status,
        payment.method || "N/A",
        payment.reference || payment.gatewayPaymentId || "N/A",
        new Date(payment.createdAt).toLocaleDateString(),
        "N/A", // No verifiedBy field in the Payment type
        "N/A"  // No verifiedAt field in the Payment type
      ])
      
      const csvContent = [
        csvHeaders.join(","),
        ...csvData.map(row => row.map(field => `"${field}"`).join(","))
      ].join("\n")
      
      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      
      link.setAttribute("href", url)
      link.setAttribute("download", `payments_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Success",
        description: `Exported ${payments.length} payment records to CSV`,
      })
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Error",
        description: "Failed to export payments",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payment Management</h1>
          <p className="text-muted-foreground">
            Manage and verify student payments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPayments}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={fetchPayments} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All payment records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">
              Successfully verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">
              Failed payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <PaymentFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <PaymentsTable
              payments={payments}
              onPaymentUpdate={handlePaymentUpdate}
            />
          )}
        </CardContent>
      </Card>

      {/* Empty State */}
      {!isLoading && payments.length === 0 && (
        <Alert>
          <AlertDescription>
            No payments found matching your criteria. Try adjusting your filters.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
