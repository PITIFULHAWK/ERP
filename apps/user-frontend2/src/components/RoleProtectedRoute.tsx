import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, GraduationCap } from "lucide-react";

interface RoleProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: Array<
        "USER" | "STUDENT" | "PROFESSOR" | "VERIFIER" | "ADMIN"
    >;
    fallbackMessage?: string;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
    children,
    allowedRoles,
    fallbackMessage,
}) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user || !allowedRoles.includes(user.role)) {
        // Show different messages based on user role
        if (user?.role === "USER") {
            return (
                <div className="min-h-screen flex items-center justify-center p-6">
                    <Card className="max-w-md w-full">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-yellow-600" />
                            </div>
                            <CardTitle className="text-xl">
                                Account Verification Required
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-muted-foreground">
                                To access this feature, you need to complete
                                your course application and get verified as a
                                student.
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <FileText className="w-4 h-4" />
                                    <span>Submit your course application</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <GraduationCap className="w-4 h-4" />
                                    <span>
                                        Get verified by the administration
                                    </span>
                                </div>
                            </div>
                            <Button
                                onClick={() =>
                                    (window.location.href = "/application")
                                }
                                className="w-full"
                            >
                                Apply for Course
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <CardTitle className="text-xl">Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground">
                            {fallbackMessage ||
                                "You don't have permission to access this page."}
                        </p>
                        <Button
                            onClick={() => (window.location.href = "/")}
                            className="w-full mt-4"
                        >
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
};

export default RoleProtectedRoute;
