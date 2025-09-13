"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CreditCard, 
  Home, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Check,
  X,
  AlertCircle
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"
import type { Payment } from "@/types"
import type { ApiResponse } from "@/types"

interface PaymentsTableProps {
  payments: Payment[]
  onPaymentUpdate: () => void
}

export function PaymentsTable({ payments, onPaymentUpdate }: PaymentsTableProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
      case "VERIFIED":
        return "default"
      case "PENDING":
        return "secondary"
      case "FAILED":
      case "REJECTED":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
      case "VERIFIED":
        return <CheckCircle className="h-4 w-4" />
      case "PENDING":
        return <Clock className="h-4 w-4" />
      case "FAILED":
      case "REJECTED":
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

  const handleVerifyPayment = async (paymentId: string, verified: boolean) => {
    setIsVerifying(true)
    try {
      const response = await apiClient.verifyPayment(paymentId, {
        status: verified ? "VERIFIED" : "REJECTED",
        verificationNotes: verificationNotes || undefined,
        rejectionReason: verified ? undefined : (verificationNotes || "Payment rejected by admin"),
      }) as ApiResponse<Payment>

      if (response.success) {
        toast({
          title: "Success",
          description: `Payment ${verified ? "verified" : "rejected"} successfully`,
        })
        onPaymentUpdate()
        setSelectedPayment(null)
        setVerificationNotes("")
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update payment status",
          variant: "destructive",
        })
      }
    } catch (error : unknown) {
      console.error(error)
      toast({
        title: "Error",
        description:"An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No payments found</p>
        <p className="text-sm">Payment records will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
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
                <div>
                  <div className="font-medium">{payment.user.name}</div>
                  <div className="text-sm text-muted-foreground">{payment.user.email}</div>
                </div>
              </TableCell>
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Payment Details</DialogTitle>
                    </DialogHeader>
                    {selectedPayment && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">User</Label>
                            <p className="text-sm">{selectedPayment.user.name}</p>
                            <p className="text-xs text-muted-foreground">{selectedPayment.user.email}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Amount</Label>
                            <p className="text-sm font-medium">₹{selectedPayment.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Type</Label>
                            <p className="text-sm capitalize">{selectedPayment.type.toLowerCase()}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Method</Label>
                            <p className="text-sm capitalize">{selectedPayment.method.toLowerCase()}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Status</Label>
                            <Badge variant={getStatusColor(selectedPayment.status)} className="flex items-center gap-1 w-fit">
                              {getStatusIcon(selectedPayment.status)}
                              {selectedPayment.status}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Reference</Label>
                            <p className="text-sm">{selectedPayment.reference || "-"}</p>
                          </div>
                        </div>

                        {selectedPayment.notes && (
                          <div>
                            <Label className="text-sm font-medium">Notes</Label>
                            <p className="text-sm">{selectedPayment.notes}</p>
                          </div>
                        )}

                        {selectedPayment.receipts.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Receipts</Label>
                            <div className="space-y-2">
                              {selectedPayment.receipts.map((receipt) => (
                                <div key={receipt.id} className="p-3 border rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium">{receipt.mediaType}</p>
                                      <p className="text-xs text-muted-foreground">
                                        Uploaded by {receipt.uploadedBy.name}
                                      </p>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => window.open(receipt.mediaUrl, '_blank')}
                                    >
                                      View Receipt
                                    </Button>
                                  </div>
                                  {receipt.notes && (
                                    <p className="text-xs text-muted-foreground mt-2">{receipt.notes}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedPayment.status === "PENDING" && (
                          <div className="space-y-4">
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                This payment is pending verification. Review the details and receipts before verifying.
                              </AlertDescription>
                            </Alert>
                            
                            <div>
                              <Label htmlFor="verification-notes">Verification Notes</Label>
                              <Textarea
                                id="verification-notes"
                                placeholder="Add verification notes..."
                                value={verificationNotes}
                                onChange={(e) => setVerificationNotes(e.target.value)}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleVerifyPayment(selectedPayment.id, true)}
                                disabled={isVerifying}
                                className="flex-1"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Verify Payment
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleVerifyPayment(selectedPayment.id, false)}
                                disabled={isVerifying}
                                className="flex-1"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Reject Payment
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
