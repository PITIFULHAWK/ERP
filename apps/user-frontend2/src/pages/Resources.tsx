import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Link as LinkIcon, Image, Video, Download } from "lucide-react";
import { apiService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface SectionInfo {
  id: string;
  course: { id: string; name: string; code: string };
  semester: { id: string; code: string; number: number };
}

interface SubjectInfo { id: string; name: string; code: string; credits: number }

interface ResourceItem {
  id: string;
  title: string;
  description?: string | null;
  resourceType: string; // backend type
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  content?: string | null;
  isPinned?: boolean;
  isVisible?: boolean;
  downloadCount?: number;
  createdAt: string;
  section: SectionInfo;
  subject?: SubjectInfo | null;
  uploader?: { id: string; name: string; email: string };
}

export default function Resources() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resources, setResources] = useState<ResourceItem[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!user?.id) throw new Error("Not authenticated");
        const res = await apiService.getStudentResources(user.id);
        if (res.success && Array.isArray(res.data)) {
          setResources(res.data as unknown as ResourceItem[]);
        } else {
          setError(res.message || "Failed to load resources");
        }
      } catch (e) {
        setError("Failed to load resources. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [user?.id]);

  const iconFor = (mime?: string | null, backendType?: string) => {
    if (mime?.startsWith("image/")) return <Image className="h-4 w-4"/>;
    if (mime === "application/pdf") return <FileText className="h-4 w-4" />;
    if (mime?.startsWith("video/")) return <Video className="h-4 w-4"/>;
    if (backendType === "LINK") return <LinkIcon className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatSize = (bytes?: number | null) => {
    if (!bytes || bytes <= 0) return "--";
    const units = ["B","KB","MB","GB"]; let i=0; let n = bytes;
    while (n >= 1024 && i < units.length-1) { n/=1024; i++; }
    return `${n.toFixed(1)} ${units[i]}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Resources</h1>
          <p className="text-lg text-muted-foreground">Lecture notes, links, and materials shared by your professors.</p>
        </div>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Resources</h1>
          <p className="text-lg text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Resources</h1>
        <p className="text-lg text-muted-foreground">Lecture notes, links, and materials shared by your professors.</p>
      </div>

      {resources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No resources available yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {resources.map((r) => (
            <Card key={r.id} className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {iconFor(r.mimeType, r.resourceType)}
                      {r.title}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {r.section.course.name} • {r.subject?.name ?? "General"} • {r.section.semester.code}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {r.isPinned ? <Badge variant="secondary">Pinned</Badge> : null}
                    {r.fileSize ? <Badge variant="outline">{formatSize(r.fileSize)}</Badge> : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {r.description ? (
                  <p className="text-sm text-foreground/90 leading-relaxed">{r.description}</p>
                ) : null}
                <div className="flex gap-2">
                  {r.fileUrl ? (
                    <a href={r.fileUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download / Open
                      </Button>
                    </a>
                  ) : r.content ? (
                    <a href={r.content} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        Open Link
                      </Button>
                    </a>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
