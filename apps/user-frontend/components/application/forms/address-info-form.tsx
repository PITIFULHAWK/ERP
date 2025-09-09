"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useApplication } from "@/contexts/application-context"

const addressInfoSchema = z
  .object({
    address: z.string().min(10, "Address must be at least 10 characters"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().regex(/^\d{6}$/, "Please enter a valid 6-digit pincode"),
    sameAsPermament: z.boolean().default(false),
    correspondenceAddress: z.string().optional(),
    correspondenceCity: z.string().optional(),
    correspondenceState: z.string().optional(),
    correspondencePincode: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.sameAsPermament) {
        return (
          data.correspondenceAddress &&
          data.correspondenceCity &&
          data.correspondenceState &&
          data.correspondencePincode
        )
      }
      return true
    },
    {
      message: "Correspondence address is required when different from permanent address",
      path: ["correspondenceAddress"],
    },
  )

type AddressInfoFormData = z.infer<typeof addressInfoSchema>

export function AddressInfoForm() {
  const { formData, updateFormData } = useApplication()

  const form = useForm<AddressInfoFormData>({
    resolver: zodResolver(addressInfoSchema),
    defaultValues: {
      address: "",
      city: "",
      state: "",
      pincode: "",
      sameAsPermament: true,
      correspondenceAddress: "",
      correspondenceCity: "",
      correspondenceState: "",
      correspondencePincode: "",
    },
  })

  const sameAsPermament = form.watch("sameAsPermament")

  // Load existing data
  useEffect(() => {
    if (formData.addressInfo) {
      form.reset(formData.addressInfo)
    }
  }, [formData.addressInfo, form])

  // Auto-save on form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData("addressInfo", value)
    })
    return () => subscription.unsubscribe()
  }, [form, updateFormData])

  // Copy permanent address to correspondence when checkbox is checked
  useEffect(() => {
    if (sameAsPermament) {
      const permanentData = form.getValues()
      form.setValue("correspondenceAddress", permanentData.address)
      form.setValue("correspondenceCity", permanentData.city)
      form.setValue("correspondenceState", permanentData.state)
      form.setValue("correspondencePincode", permanentData.pincode)
    }
  }, [sameAsPermament, form])

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Permanent Address */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Permanent Address</h3>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Address *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your complete address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter state" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pincode *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter 6-digit pincode" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Correspondence Address */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <FormField
              control={form.control}
              name="sameAsPermament"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Correspondence address is same as permanent address</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {!sameAsPermament && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Correspondence Address</h3>

              <FormField
                control={form.control}
                name="correspondenceAddress"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter correspondence address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="correspondenceCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="correspondenceState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter state" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="correspondencePincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter 6-digit pincode" {...field} />
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
