import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiService, Placement, PlacementStatus } from "@/lib/api";

export default function Placements() {
  const [loading, setLoading] = useState(true);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<PlacementStatus | "ALL">("ACTIVE");

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiService.getPlacements({
        status: status === "ALL" ? undefined : status,
        page,
        limit: 10,
      });
      if (res.success && res.data) {
        setPlacements(res.data.placements || []);
        setTotalPages(res.data.pagination.totalPages || 1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const statusBadge = (s: PlacementStatus) => {
    switch (s) {
      case "ACTIVE":
        return "default" as const;
      case "CLOSED":
        return "secondary" as const;
      case "DRAFT":
        return "outline" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Placements</h1>
        <p className="text-muted-foreground">Browse current and past placement drives.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Status</label>
          <Select value={status} onValueChange={(v: any) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["ALL", "ACTIVE", "CLOSED", "DRAFT"] as const).map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : placements.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No placements found</div>
      ) : (
        <div className="space-y-4">
          {placements.map((p) => (
            <Card key={p.id}>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{p.title}</CardTitle>
                  <div className="text-sm text-muted-foreground">{p.companyName} • {p.position}</div>
                </div>
                <Badge variant={statusBadge(p.status)}>{p.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{p.description}</p>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-4">
                  {p.location && <span>Location: {p.location}</span>}
                  {p.packageOffered && <span>Package: {p.packageOffered}</span>}
                  {p.cgpaCriteria ? <span>CGPA ≥ {p.cgpaCriteria}</span> : <span>No CGPA criteria</span>}
                  {p.applicationDeadline && (
                    <span>Deadline: {new Date(p.applicationDeadline).toLocaleString()}</span>
                  )}
                  {typeof p.emailsSent === "number" && <span>Emails Sent: {p.emailsSent}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
          <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
          <Button variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</Button>
        </div>
      )}
    </div>
  );
}
