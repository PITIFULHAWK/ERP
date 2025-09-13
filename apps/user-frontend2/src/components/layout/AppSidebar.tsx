import { NavLink, useLocation } from "react-router-dom";
import {
    Home,
    BookOpen,
    Bell,
    Calendar,
    Trophy,
    GraduationCap,
    Settings,
    User,
    Clock,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

const navigation = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "Browse Courses", url: "/courses", icon: BookOpen },
    { title: "Notices", url: "/notices", icon: Bell },
    { title: "Timetable", url: "/timetable", icon: Clock },
    { title: "My Attendance", url: "/attendance", icon: Calendar },
    { title: "My Results", url: "/results", icon: Trophy },
];

const bottomNavigation = [
    { title: "Profile", url: "/profile", icon: User },
    { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
    const { state } = useSidebar();
    const collapsed = state === "collapsed";
    const location = useLocation();
    const currentPath = location.pathname;

    const isActive = (path: string) => currentPath === path;

    const getNavClasses = (path: string) => {
        const baseClasses =
            "flex items-center gap-3 text-sm font-medium transition-colors duration-200";
        return isActive(path)
            ? `${baseClasses} text-sidebar-primary bg-sidebar-accent rounded-lg`
            : `${baseClasses} text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent rounded-lg`;
    };

    return (
        <Sidebar className="border-r border-sidebar-accent">
            <SidebarContent className="bg-sidebar">
                {/* Logo Section */}
                <div className="p-6 border-b border-sidebar-accent">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        {!collapsed && (
                            <div>
                                <h1 className="text-lg font-bold text-sidebar-accent-foreground">
                                    AcademiaOS
                                </h1>
                                <p className="text-xs text-sidebar-foreground">
                                    Student Portal
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-sidebar-foreground text-xs uppercase tracking-wider font-medium px-6 py-4">
                        Main Menu
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="px-4">
                        <SidebarMenu>
                            {navigation.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <NavLink
                                            to={item.url}
                                            end={item.url === "/"}
                                            className={getNavClasses(item.url)}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            {!collapsed && (
                                                <span>{item.title}</span>
                                            )}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Bottom Navigation */}
                <div className="mt-auto">
                    <SidebarGroup>
                        <SidebarGroupContent className="px-4 pb-4">
                            <SidebarMenu>
                                {bottomNavigation.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <NavLink
                                                to={item.url}
                                                className={getNavClasses(
                                                    item.url
                                                )}
                                            >
                                                <item.icon className="w-5 h-5" />
                                                {!collapsed && (
                                                    <span>{item.title}</span>
                                                )}
                                            </NavLink>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </div>
            </SidebarContent>
        </Sidebar>
    );
}
