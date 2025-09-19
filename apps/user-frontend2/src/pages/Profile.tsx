import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Basic account information</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">Name</div>
            <div className="font-medium">{user?.name ?? "-"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="font-medium">{user?.email ?? "-"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Role</div>
            <div className="font-medium">
              {user?.role ?? "-"} {user?.role && <Badge variant="secondary" className="ml-2">{user.role}</Badge>}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">University</div>
            <div className="font-medium">{(user as any)?.university?.name ?? "-"}</div>
          </div>
          {user?.role === "STUDENT" && (
            <>
              <div>
                <div className="text-sm text-muted-foreground">CGPA</div>
                <div className="font-medium">{(user as any)?.cgpa != null ? Number((user as any).cgpa).toFixed(2) : "-"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Current Semester</div>
                <div className="font-medium">{(user as any)?.currentSemesterInfo?.semesterInfo ?? "-"}</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div>
        <Button variant="destructive" onClick={logout}>Sign out</Button>
      </div>
    </div>
  );
}
