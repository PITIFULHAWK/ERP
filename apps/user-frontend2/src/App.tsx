import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router";

import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Notices from "./pages/Notices";
import Payments from "./pages/Payments";
import Application from "./pages/Application";
import Timetable from "./pages/Timetable";
import Attendance from "./pages/Attendance";
import Results from "./pages/Results";
import Complaints from "./pages/Complaints";
import Placements from "./pages/Placements";
import AcademicCalendar from "./pages/AcademicCalendar";
import Resources from "./pages/Resources";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import DarkModeTestPage from "./pages/DarkModeTestPage";
import ThemePersistenceTest from "./pages/ThemePersistenceTest";

const queryClient = new QueryClient();

/**
 * Wrapper for all protected routes
 * - checks authentication
 * - applies Layout
 */
const ProtectedLayout = () => (
    <ProtectedRoute>
        <Layout>
            <Outlet />
        </Layout>
    </ProtectedRoute>
);

/**
 * Wrapper for role-protected routes
 */
const RoleProtectedLayout = ({ allowedRoles }: { allowedRoles: string[] }) => (
    <ProtectedRoute>
        <RoleProtectedRoute allowedRoles={allowedRoles}>
            <Layout>
                <Outlet />
            </Layout>
        </RoleProtectedRoute>
    </ProtectedRoute>
);

const router = createBrowserRouter([
    // Public routes
    { path: "/login", Component: Login },
    { path: "/signup", Component: Signup },
    { path: "/dark-mode-test", Component: DarkModeTestPage },
    { path: "/theme-persistence-test", Component: ThemePersistenceTest },

    // Default protected layout (all children use Layout + ProtectedRoute)
    {
        element: <ProtectedLayout />,
        children: [
            { path: "/", Component: Dashboard },
            { path: "/notices", Component: Notices },
            { path: "/academic-calendar", Component: AcademicCalendar },
            { path: "/holidays", element: <Navigate to="/academic-calendar" replace /> },
            { path: "/application", Component: Application },
        ],
    },

    // Role-protected layout
    {
        element: (
            <RoleProtectedLayout
                allowedRoles={
                    ["STUDENT", "PROFESSOR", "VERIFIER", "ADMIN"] as const
                }
            />
        ),
        children: [
            { path: "/courses", Component: Courses },
            { path: "/payments", Component: Payments },
            { path: "/timetable", Component: Timetable },
            { path: "/attendance", Component: Attendance },
            { path: "/resources", Component: Resources },
            { path: "/results", Component: Results },
            { path: "/complaints", Component: Complaints },
            { path: "/placements", Component: Placements },
        ],
    },

    // Catch-all
    { path: "*", Component: NotFound },
]);

const App = () => (
    <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
        storageKey="theme"
    >
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <RouterProvider router={router} />
                </TooltipProvider>
            </AuthProvider>
        </QueryClientProvider>
    </ThemeProvider>
);

export default App;
