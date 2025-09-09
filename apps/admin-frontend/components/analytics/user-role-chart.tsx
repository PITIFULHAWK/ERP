"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UserRoleChartProps {
  data: {
    role: string
    count: number
    percentage: number
  }[]
}

export function UserRoleChart({ data }: UserRoleChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Role Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="role" />
            <YAxis />
            <Tooltip formatter={(value, name) => [value, "Count"]} />
            <Bar dataKey="count" fill="#164e63" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
