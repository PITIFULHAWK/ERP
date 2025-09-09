"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Home, TrendingUp, TrendingDown, CheckCircle, Clock, XCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { PaymentForm } from "./payment-form"
import type { PaymentSummary, Payment } from "@/types"

interface PaymentSummaryProps {
  onPaymentCreated?: (payment: Payment) => void
}

export function PaymentSummaryComponent({ onPaymentCreated }: PaymentSummaryProps) {
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedType, setSelectedType] = useState<"COURSE" | "HOSTEL" | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchPaymentSummary()
    }
  }, [user])

  const fetchPaymentSummary = async () => {
    if (!user) return

    try {
      const response = await apiClient.getPaymentSummary(user.id)
      if (response.success && response.data) {
        setSummary(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch payment summary:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = (payment: Payment) => {
    setShowPaymentForm(false)
    setSelectedType(null)
    fetchPaymentSummary() // Refresh summary
    onPaymentCreated?.(payment)
  }

  const getStatusColor = (paid: number, total: number) => {
    if (paid === 0) return "destructive"
    if (paid < total) return "secondary"
    return "default"
  }

  const getStatusIcon = (paid: number, total: number) => {
    if (paid === 0) return <XCircle className="h-4 w-4" />
    if (paid < total) return <Clock className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!summary) {
    return (
      <Alert>
        <AlertDescription>
          Unable to load payment summary. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course Fees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Course Fees
            </CardTitle>
            {getStatusIcon(summary.course.paid, summary.course.total)}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Fees</span>
                <span className="font-medium">₹{summary.course.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Paid</span>
                <span className="font-medium text-green-600">₹{summary.course.paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Due</span>
                <span className="font-medium text-red-600">₹{summary.course.due.toLocaleString()}</span>
              </div>
              <div className="pt-2">
                <Badge variant={getStatusColor(summary.course.paid, summary.course.total)}>
                  {summary.course.paid === 0 
                    ? "Not Paid" 
                    : summary.course.paid < summary.course.total 
                      ? "Partially Paid" 
                      : "Fully Paid"
                  }
                </Badge>
              </div>
              {summary.course.due > 0 && (
                <Button 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => {
                    setSelectedType("COURSE")
                    setShowPaymentForm(true)
                  }}
                >
                  Pay Course Fees
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hostel Fees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Home className="h-4 w-4" />
              Hostel Fees
            </CardTitle>
            {getStatusIcon(summary.hostel.paid, summary.hostel.total)}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Fees</span>
                <span className="font-medium">₹{summary.hostel.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Paid</span>
                <span className="font-medium text-green-600">₹{summary.hostel.paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Due</span>
                <span className="font-medium text-red-600">₹{summary.hostel.due.toLocaleString()}</span>
              </div>
              <div className="pt-2">
                <Badge variant={getStatusColor(summary.hostel.paid, summary.hostel.total)}>
                  {summary.hostel.paid === 0 
                    ? "Not Paid" 
                    : summary.hostel.paid < summary.hostel.total 
                      ? "Partially Paid" 
                      : "Fully Paid"
                  }
                </Badge>
              </div>
              {summary.hostel.due > 0 && (
                <Button 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => {
                    setSelectedType("HOSTEL")
                    setShowPaymentForm(true)
                  }}
                >
                  Pay Hostel Fees
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && selectedType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PaymentForm
              courseId={selectedType === "COURSE" ? undefined : undefined}
              hostelId={selectedType === "HOSTEL" ? undefined : undefined}
              defaultAmount={selectedType === "COURSE" ? summary.course.due : summary.hostel.due}
              onSuccess={handlePaymentSuccess}
              onCancel={() => {
                setShowPaymentForm(false)
                setSelectedType(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
