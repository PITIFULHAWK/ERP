import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const goToProfile = () => navigate("/profile");

    const getUserInitials = (name: string) => {
        return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />

                <main className="flex-1 bg-background">
                    {/* Header */}
                    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
                        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground hidden sm:block">
                                {new Date().toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </div>
                            <div className="text-sm text-muted-foreground sm:hidden">
                                {new Date().toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })}
                            </div>

                            {/* Theme Toggle */}
                            <ThemeToggle variant="simple" />

                            {/* User Avatar -> Profile */}
                            {user && (
                                <Button
                                    variant="ghost"
                                    className="relative h-8 w-8 rounded-full"
                                    onClick={goToProfile}
                                    title="Open Profile"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="" alt={user.name} />
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            {getUserInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            )}
                        </div>
                    </header>

                    {/* Content */}
                    <div className="p-6">{children}</div>
                </main>
            </div>
        </SidebarProvider>
    );
}
