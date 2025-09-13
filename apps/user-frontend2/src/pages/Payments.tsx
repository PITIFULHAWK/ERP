import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiService, CreatePaymentRequest, Payment } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Course {
  id: string;
  name: string;
  code: string;
  totalFees: number;
}

interface Hostel {
  id: string;
  name: string;
  fees: number;
  type: string;
}

export default function Payments() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  // Form states
  const [coursePayment, setCoursePayment] = useState({
    courseId: "",
    amount: "",
    method: "MANUAL" as const,
    reference: "",
    notes: "",
  });
  
  const [hostelPayment, setHostelPayment] = useState({
    hostelId: "",
    amount: "",
    method: "MANUAL" as const,
    reference: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, hostelsRes, paymentsRes] = await Promise.all([
          apiService.getCourses(),
          apiService.getHostels(),
          user ? apiService.getPayments({ userId: user.id }) : Promise.resolve({ success: true, data: [] }),
        ]);

        if (coursesRes.success) setCourses(coursesRes.data || []);
        if (hostelsRes.success) setHostels(hostelsRes.data || []);
        if (paymentsRes.success) setPayments(paymentsRes.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Error",
          description: "Failed to load payment data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleCoursePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      const paymentData: CreatePaymentRequest = {
        userId: user.id,
        type: "COURSE",
        courseId: coursePayment.courseId,
        amount: parseFloat(coursePayment.amount),
        method: coursePayment.method,
        reference: coursePayment.reference || undefined,
        notes: coursePayment.notes || undefined,
      };

      const response = await apiService.createPayment(paymentData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Course payment submitted successfully!",
        });
        
        // Reset form
        setCoursePayment({
          courseId: "",
          amount: "",
          method: "MANUAL",
          reference: "",
          notes: "",
        });
        
        // Refresh payments
        const paymentsRes = await apiService.getPayments({ userId: user.id });
        if (paymentsRes.success) setPayments(paymentsRes.data || []);
      }
    } catch (error) {
      console.error("Course payment error:", error);
      toast({
        title: "Error",
        description: "Failed to submit course payment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleHostelPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      const paymentData: CreatePaymentRequest = {
        userId: user.id,
        type: "HOSTEL",
        hostelId: hostelPayment.hostelId,
        amount: parseFloat(hostelPayment.amount),
        method: hostelPayment.method,
        reference: hostelPayment.reference || undefined,
        notes: hostelPayment.notes || undefined,
      };

      const response = await apiService.createPayment(paymentData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Hostel payment submitted successfully!",
        });
        
        // Reset form
        setHostelPayment({
          hostelId: "",
          amount: "",
          method: "MANUAL",
          reference: "",
          notes: "",
        });
        
        // Refresh payments
        const paymentsRes = await apiService.getPayments({ userId: user.id });
        if (paymentsRes.success) setPayments(paymentsRes.data || []);
      }
    } catch (error) {
      console.error("Hostel payment error:", error);
      toast({
        title: "Error",
        description: "Failed to submit hostel payment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "default";
      case "PENDING":
        return "secondary";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">
          Manage your course and hostel payments
        </p>
      </div>

      <Tabs defaultValue="make-payment" className="space-y-6">
        <TabsList>
          <TabsTrigger value="make-payment">Make Payment</TabsTrigger>
          <TabsTrigger value="payment-history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="make-payment" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Course Payment */}
            <Card>
              <CardHeader>
                <CardTitle>Course Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCoursePayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">Select Course</Label>
                    <Select
                      value={coursePayment.courseId}
                      onValueChange={(value) =>
                        setCoursePayment({ ...coursePayment, courseId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name} - ₹{course.totalFees.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course-amount">Amount (₹)</Label>
                    <Input
                      id="course-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={coursePayment.amount}
                      onChange={(e) =>
                        setCoursePayment({ ...coursePayment, amount: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course-method">Payment Method</Label>
                    <Select
                      value={coursePayment.method}
                      onValueChange={(value: any) =>
                        setCoursePayment({ ...coursePayment, method: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MANUAL">Manual/Bank Transfer</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="CARD">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course-reference">Reference Number</Label>
                    <Input
                      id="course-reference"
                      placeholder="Transaction reference (optional)"
                      value={coursePayment.reference}
                      onChange={(e) =>
                        setCoursePayment({ ...coursePayment, reference: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course-notes">Notes</Label>
                    <Textarea
                      id="course-notes"
                      placeholder="Additional notes (optional)"
                      value={coursePayment.notes}
                      onChange={(e) =>
                        setCoursePayment({ ...coursePayment, notes: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting || !coursePayment.courseId || !coursePayment.amount}
                  >
                    {submitting ? "Submitting..." : "Submit Course Payment"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Hostel Payment */}
            <Card>
              <CardHeader>
                <CardTitle>Hostel Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleHostelPayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hostel">Select Hostel</Label>
                    <Select
                      value={hostelPayment.hostelId}
                      onValueChange={(value) =>
                        setHostelPayment({ ...hostelPayment, hostelId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a hostel" />
                      </SelectTrigger>
                      <SelectContent>
                        {hostels.map((hostel) => (
                          <SelectItem key={hostel.id} value={hostel.id}>
                            {hostel.name} ({hostel.type}) - ₹{hostel.fees.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hostel-amount">Amount (₹)</Label>
                    <Input
                      id="hostel-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={hostelPayment.amount}
                      onChange={(e) =>
                        setHostelPayment({ ...hostelPayment, amount: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hostel-method">Payment Method</Label>
                    <Select
                      value={hostelPayment.method}
                      onValueChange={(value: any) =>
                        setHostelPayment({ ...hostelPayment, method: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MANUAL">Manual/Bank Transfer</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="CARD">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hostel-reference">Reference Number</Label>
                    <Input
                      id="hostel-reference"
                      placeholder="Transaction reference (optional)"
                      value={hostelPayment.reference}
                      onChange={(e) =>
                        setHostelPayment({ ...hostelPayment, reference: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hostel-notes">Notes</Label>
                    <Textarea
                      id="hostel-notes"
                      placeholder="Additional notes (optional)"
                      value={hostelPayment.notes}
                      onChange={(e) =>
                        setHostelPayment({ ...hostelPayment, notes: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting || !hostelPayment.hostelId || !hostelPayment.amount}
                  >
                    {submitting ? "Submitting..." : "Submit Hostel Payment"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payment-history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No payments found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {payment.type} Payment
                          </span>
                          <Badge variant={getStatusBadgeVariant(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Amount: ₹{payment.amount.toLocaleString()} • {payment.method}
                        </p>
                        {payment.reference && (
                          <p className="text-sm text-muted-foreground">
                            Ref: {payment.reference}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {formatDate(payment.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
