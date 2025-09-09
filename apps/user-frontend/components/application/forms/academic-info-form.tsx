"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useApplication } from "@/contexts/application-context"

const academicInfoSchema = z
  .object({
    class10Percentage: z.number().min(0).max(100, "Percentage must be between 0 and 100"),
    class10Board: z.string().min(2, "Board name is required"),
    class10YearOfPassing: z.number().min(1990).max(new Date().getFullYear(), "Please enter a valid year"),
    class12Percentage: z.number().min(0).max(100, "Percentage must be between 0 and 100"),
    class12Board: z.string().min(2, "Board name is required"),
    class12YearOfPassing: z.number().min(1990).max(new Date().getFullYear(), "Please enter a valid year"),
    class12Stream: z.string().min(2, "Stream is required"),
    hasJeeMainsScore: z.boolean().default(false),
    jeeMainsScore: z.number().optional(),
    jeeMainsRank: z.number().optional(),
    jeeMainsYear: z.number().optional(),
  })
  .refine(
    (data) => {
      if (data.hasJeeMainsScore) {
        return data.jeeMainsScore && data.jeeMainsRank && data.jeeMainsYear
      }
      return true
    },
    {
      message: "JEE Mains details are required when JEE score is provided",
      path: ["jeeMainsScore"],
    },
  )

type AcademicInfoFormData = z.infer<typeof academicInfoSchema>

export function AcademicInfoForm() {
  const { formData, updateFormData } = useApplication()

  const form = useForm<AcademicInfoFormData>({
    resolver: zodResolver(academicInfoSchema),
    defaultValues: {
      class10Percentage: 0,
      class10Board: "",
      class10YearOfPassing: new Date().getFullYear() - 2,
      class12Percentage: 0,
      class12Board: "",
      class12YearOfPassing: new Date().getFullYear(),
      class12Stream: "",
      hasJeeMainsScore: false,
      jeeMainsScore: undefined,
      jeeMainsRank: undefined,
      jeeMainsYear: undefined,
    },
  })

  const hasJeeMainsScore = form.watch("hasJeeMainsScore")

  // Load existing data
  useEffect(() => {
    if (formData.academicInfo) {
      form.reset(formData.academicInfo)
    }
  }, [formData.academicInfo, form])

  // Auto-save on form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData("academicInfo", value)
    })
    return () => subscription.unsubscribe()
  }, [form, updateFormData])

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Class 10 Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Class 10 Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="class10Percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentage *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter percentage"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="class10Board"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Board *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CBSE, ICSE, State Board" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="class10YearOfPassing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year of Passing *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter year"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value) || new Date().getFullYear())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Class 12 Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Class 12 Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              control={form.control}
              name="class12Percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentage *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter percentage"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="class12Board"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Board *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CBSE, ICSE, State Board" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="class12YearOfPassing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year of Passing *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter year"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value) || new Date().getFullYear())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="class12Stream"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stream *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Science, Commerce, Arts" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* JEE Mains Details */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <FormField
              control={form.control}
              name="hasJeeMainsScore"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I have JEE Mains score</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {hasJeeMainsScore && (
            <div>
              <h3 className="text-lg font-semibold mb-4">JEE Mains Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="jeeMainsScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>JEE Mains Score *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter score"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jeeMainsRank"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>JEE Mains Rank *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter rank"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jeeMainsYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>JEE Mains Year *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter year"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>

        <div className="text-sm text-muted-foreground">* Required fields</div>
      </form>
    </Form>
  )
}
