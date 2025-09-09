"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentSummaryComponent } from "@/components/payment/payment-summary"
import { PaymentHistory } from "@/components/payment/payment-history"
import { CreditCard, History } from "lucide-react"

export default function PaymentsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Payments</h1>
              <p className="text-muted-foreground">
                Manage your course and hostel fee payments
              </p>
            </div>

            <Tabs defaultValue="summary" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Summary
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Payment History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <PaymentSummaryComponent />
              </TabsContent>

              <TabsContent value="history">
                <PaymentHistory />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
