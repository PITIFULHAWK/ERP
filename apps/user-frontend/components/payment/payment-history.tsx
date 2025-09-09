"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Home, Clock, CheckCircle, XCircle, Upload } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import type { Payment } from "@/types"

export function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "COURSE" | "HOSTEL">("ALL")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "SUCCESS" | "FAILED">("ALL")
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchPayments()
    }
  }, [user, filter, statusFilter])

  const fetchPayments = async () => {
    if (!user) return

    try {
      const params: any = { userId: user.id }
      if (filter !== "ALL") params.type = filter
      if (statusFilter !== "ALL") params.status = statusFilter

      const response = await apiClient.getPayments(params)
      if (response.success && response.data) {
        setPayments(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error)
      toast({
        title: "Error",
        description: "Failed to load payment history",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "default"
      case "PENDING":
        return "secondary"
      case "FAILED":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="h-4 w-4" />
      case "PENDING":
        return <Clock className="h-4 w-4" />
      case "FAILED":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "COURSE":
        return <CreditCard className="h-4 w-4" />
      case "HOSTEL":
        return <Home className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payment History</CardTitle>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="COURSE">Course</SelectItem>
                <SelectItem value="HOSTEL">Hostel</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No payments found</p>
            <p className="text-sm">Your payment history will appear here</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(payment.type)}
                      <span className="capitalize">{payment.type.toLowerCase()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ₹{payment.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {payment.method.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(payment.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(payment.status)}
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(payment.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {payment.reference || "-"}
                  </TableCell>
                  <TableCell>
                    {payment.status === "PENDING" && payment.receipts.length === 0 && (
                      <Button size="sm" variant="outline">
                        <Upload className="h-4 w-4 mr-1" />
                        Upload Receipt
                      </Button>
                    )}
                    {payment.receipts.length > 0 && (
                      <Badge variant="outline">
                        Receipt Uploaded
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
