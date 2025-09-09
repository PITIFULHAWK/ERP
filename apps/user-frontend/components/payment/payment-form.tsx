"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, Smartphone, Wallet } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import type { CreatePaymentRequest, PaymentSummary } from "@/types"

const paymentSchema = z.object({
  type: z.enum(["COURSE", "HOSTEL"]),
  courseId: z.string().optional(),
  hostelId: z.string().optional(),
  amount: z.number().min(1, "Amount must be greater than 0"),
  method: z.enum(["MANUAL", "RAZORPAY", "CARD", "UPI"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface PaymentFormProps {
  onSuccess?: (payment: any) => void
  onCancel?: () => void
  courseId?: string
  hostelId?: string
  defaultAmount?: number
}

export function PaymentForm({ onSuccess, onCancel, courseId, hostelId, defaultAmount }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null)
  const { user } = useAuth()

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      type: courseId ? "COURSE" : "HOSTEL",
      courseId: courseId || "",
      hostelId: hostelId || "",
      amount: defaultAmount || 0,
      method: "MANUAL",
      reference: "",
      notes: "",
    },
  })

  const paymentType = form.watch("type")

  const handleSubmit = async (data: PaymentFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to make a payment",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const paymentData: CreatePaymentRequest = {
        userId: user.id,
        type: data.type,
        courseId: data.type === "COURSE" ? data.courseId : undefined,
        hostelId: data.type === "HOSTEL" ? data.hostelId : undefined,
        amount: data.amount,
        method: data.method,
        reference: data.reference,
        notes: data.notes,
      }

      const response = await apiClient.createPayment(paymentData)
      
      if (response.success) {
        toast({
          title: "Payment Created",
          description: "Your payment has been submitted for verification",
        })
        onSuccess?.(response.data)
      } else {
        toast({
          title: "Payment Failed",
          description: response.message || "Failed to create payment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "CARD":
        return <CreditCard className="h-4 w-4" />
      case "UPI":
        return <Smartphone className="h-4 w-4" />
      case "RAZORPAY":
        return <Wallet className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getMethodIcon(form.watch("method"))}
          Make Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="COURSE">Course Fees</SelectItem>
                      <SelectItem value="HOSTEL">Hostel Fees</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the amount you want to pay
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MANUAL">Manual Payment</SelectItem>
                      <SelectItem value="RAZORPAY">Razorpay</SelectItem>
                      <SelectItem value="CARD">Credit/Debit Card</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter reference number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Transaction reference or receipt number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert>
              <AlertDescription>
                Your payment will be marked as PENDING until verified by an administrator. 
                You can upload a receipt after submitting this form.
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit Payment"
                )}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
