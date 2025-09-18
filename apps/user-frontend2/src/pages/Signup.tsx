import React, { useState, useEffect } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, University } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const signupSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
        universityId: z.string().min(1, "Please select a university"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type SignupFormData = z.infer<typeof signupSchema>;

const Signup: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [universities, setUniversities] = useState<University[]>([]);
    const [loadingUniversities, setLoadingUniversities] = useState(true);
    const { signup, isLoading } = useAuth();
    const navigate = useNavigate();

    const form = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            universityId: "",
        },
    });

    // Fetch universities on component mount
    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const response = await apiService.getUniversities();
                if (response.success && response.data) {
                    setUniversities(response.data);
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description:
                        "Failed to load universities. Please refresh the page.",
                    variant: "destructive",
                });
            } finally {
                setLoadingUniversities(false);
            }
        };

        fetchUniversities();
    }, []);

    const onSubmit = async (data: SignupFormData) => {
        try {
            const { confirmPassword, ...signupData } = data;
            await signup(signupData);
            navigate("/login");
        } catch (error) {
            // Error is handled in the auth context
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-primary rounded-full p-3">
                            <GraduationCap className="h-8 w-8 text-primary-foreground" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Join AcademiaOS
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Create your student account
                    </p>
                </div>

                {/* Signup Form */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Create Account</CardTitle>
                        <CardDescription>
                            Fill in your details to get started
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
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your full name"
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
                                    name="universityId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>University</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={
                                                    isLoading ||
                                                    loadingUniversities
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue
                                                            placeholder={
                                                                loadingUniversities
                                                                    ? "Loading universities..."
                                                                    : "Select your university"
                                                            }
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {universities.map(
                                                        (university) => (
                                                            <SelectItem
                                                                key={
                                                                    university.id
                                                                }
                                                                value={
                                                                    university.id
                                                                }
                                                            >
                                                                {
                                                                    university.name
                                                                }
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
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
                                                        placeholder="Create a password"
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

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Confirm Password
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={
                                                            showConfirmPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        placeholder="Confirm your password"
                                                        {...field}
                                                        disabled={isLoading}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() =>
                                                            setShowConfirmPassword(
                                                                !showConfirmPassword
                                                            )
                                                        }
                                                        disabled={isLoading}
                                                    >
                                                        {showConfirmPassword ? (
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
                                    disabled={isLoading || loadingUniversities}
                                >
                                    {isLoading
                                        ? "Creating Account..."
                                        : "Create Account"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                        <div className="text-sm text-center text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-primary hover:underline font-medium"
                            >
                                Sign in here
                            </Link>
                        </div>
                    </CardFooter>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-muted-foreground">
                    <p>© 2024 AcademiaOS. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
