import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data);
            navigate("/");
        } catch (error) {
            // Error is handled in the auth context
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-primary rounded-full p-3">
                            <GraduationCap className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Sign in to your student portal
                    </p>
                </div>

                {/* Login Form */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Sign In</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    {...field}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={
                                                            showPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        placeholder="Enter your password"
                                                        {...field}
                                                        disabled={isLoading}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() =>
                                                            setShowPassword(
                                                                !showPassword
                                                            )
                                                        }
                                                        disabled={isLoading}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Signing in..." : "Sign In"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                        <div className="text-sm text-center text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="text-primary hover:underline font-medium"
                            >
                                Sign up here
                            </Link>
                        </div>
                    </CardFooter>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>© 2024 AcademiaOS. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
