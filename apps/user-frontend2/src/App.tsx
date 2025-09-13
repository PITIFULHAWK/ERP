import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
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
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        {/* Protected routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Dashboard />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/courses"
                            element={
                                <ProtectedRoute>
                                    <RoleProtectedRoute
                                        allowedRoles={[
                                            "STUDENT",
                                            "PROFESSOR",
                                            "VERIFIER",
                                            "ADMIN",
                                        ]}
                                    >
                                        <Layout>
                                            <Courses />
                                        </Layout>
                                    </RoleProtectedRoute>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/notices"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Notices />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/application"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Application />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/payments"
                            element={
                                <ProtectedRoute>
                                    <RoleProtectedRoute
                                        allowedRoles={[
                                            "STUDENT",
                                            "PROFESSOR",
                                            "VERIFIER",
                                            "ADMIN",
                                        ]}
                                    >
                                        <Layout>
                                            <Payments />
                                        </Layout>
                                    </RoleProtectedRoute>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/timetable"
                            element={
                                <ProtectedRoute>
                                    <RoleProtectedRoute
                                        allowedRoles={[
                                            "STUDENT",
                                            "PROFESSOR",
                                            "VERIFIER",
                                            "ADMIN",
                                        ]}
                                    >
                                        <Layout>
                                            <Timetable />
                                        </Layout>
                                    </RoleProtectedRoute>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/attendance"
                            element={
                                <ProtectedRoute>
                                    <RoleProtectedRoute
                                        allowedRoles={[
                                            "STUDENT",
                                            "PROFESSOR",
                                            "VERIFIER",
                                            "ADMIN",
                                        ]}
                                    >
                                        <Layout>
                                            <Attendance />
                                        </Layout>
                                    </RoleProtectedRoute>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/results"
                            element={
                                <ProtectedRoute>
                                    <RoleProtectedRoute
                                        allowedRoles={[
                                            "STUDENT",
                                            "PROFESSOR",
                                            "VERIFIER",
                                            "ADMIN",
                                        ]}
                                    >
                                        <Layout>
                                            <Results />
                                        </Layout>
                                    </RoleProtectedRoute>
                                </ProtectedRoute>
                            }
                        />

                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </AuthProvider>
    </QueryClientProvider>
);

export default App;
