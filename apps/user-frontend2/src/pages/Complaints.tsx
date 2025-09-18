import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiService, Complaint, ComplaintCategory, ComplaintPriority } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function Complaints() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<{ status?: string; category?: ComplaintCategory }>({});

  // Form state
  const [form, setForm] = useState<{
    title: string;
    description: string;
    category: ComplaintCategory;
    priority: ComplaintPriority;
    location: string;
    urgency: boolean;
  }>({
    title: "",
    description: "",
    category: "ACADEMIC",
    priority: "MEDIUM",
    location: "",
    urgency: false,
  });

  const categories: ComplaintCategory[] = [
    "HOSTEL",
    "ACADEMIC",
    "INFRASTRUCTURE",
    "FOOD",
    "TRANSPORT",
    "LIBRARY",
    "MEDICAL",
    "FINANCIAL",
    "ADMINISTRATIVE",
    "DISCIPLINARY",
    "TECHNICAL",
    "OTHER",
  ];

  const priorities: ComplaintPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const res = await apiService.getComplaints({
        page,
        limit: 10,
        ...(filters.status ? { status: filters.status as any } : {}),
        ...(filters.category ? { category: filters.category } : {}),
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      if (res.success && res.data) {
        setComplaints(res.data.complaints);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to load complaints", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.status, filters.category]);

  const submitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await apiService.createComplaint({
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority,
        location: form.location || undefined,
        urgency: form.urgency,
      });
      if (res.success) {
        toast({ title: "Submitted", description: "Complaint raised successfully" });
        setForm({ title: "", description: "", category: "ACADEMIC", priority: "MEDIUM", location: "", urgency: false });
        setPage(1);
        loadComplaints();
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to submit complaint", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return "secondary" as const;
      case "IN_PROGRESS":
      case "PENDING_INFO":
        return "outline" as const;
      case "RESOLVED":
      case "CLOSED":
        return "default" as const;
      case "ESCALATED":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Complaints</h1>
        <p className="text-muted-foreground">Raise and track your issues with the university.</p>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">Raise Complaint</TabsTrigger>
          <TabsTrigger value="list">My Complaints</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>New Complaint</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitComplaint} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v: ComplaintCategory) => setForm({ ...form, category: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v: ComplaintPriority) => setForm({ ...form, priority: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="loc">Location (optional)</Label>
                    <Input id="loc" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Urgency</Label>
                    <Select value={form.urgency ? "true" : "false"} onValueChange={(v: string) => setForm({ ...form, urgency: v === "true" })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Normal</SelectItem>
                        <SelectItem value="true">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Complaint"}</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>My Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(v) => { setFilters({ ...filters, status: v }); setPage(1); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      {['OPEN','IN_PROGRESS','PENDING_INFO','RESOLVED','CLOSED','ESCALATED'].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={filters.category} onValueChange={(v) => { setFilters({ ...filters, category: v as ComplaintCategory }); setPage(1); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {loading ? (
                  <div className="grid gap-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i}>
                        <CardHeader>
                          <Skeleton className="h-6 w-1/3" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-20 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">No complaints found</div>
                ) : (
                  <div className="space-y-4">
                    {complaints.map((c) => (
                      <div key={c.id} className="p-4 border rounded-lg flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{c.title}</span>
                            <Badge variant={statusBadge(c.status)}>{c.status}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">{c.category} • {new Date(c.createdAt).toLocaleString()}</div>
                          <p className="text-sm">{c.description}</p>
                          {c.location && <div className="text-xs text-muted-foreground">Location: {c.location}</div>}
                          {c.resolutionNote && (
                            <div className="text-xs text-muted-foreground border rounded p-2 bg-muted/40">
                              <span className="font-medium">Resolution:</span> {c.resolutionNote}
                            </div>
                          )}
                        </div>
                        <div className="text-right space-y-1">
                          {c.priority && <Badge variant="outline">{c.priority}</Badge>}
                          <div className="text-xs text-muted-foreground">{c._count?.updates ?? 0} update(s)</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
                  <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
                  <Button variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
