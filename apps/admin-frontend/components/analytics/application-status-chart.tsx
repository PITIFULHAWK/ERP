"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ApplicationStatusChartProps {
  data: {
    status: string
    count: number
    percentage: number
  }[]
}

const COLORS = {
  PENDING: "#f59e0b",
  UNDER_REVIEW: "#3b82f6",
  VERIFIED: "#10b981",
  REJECTED: "#ef4444",
  INCOMPLETE: "#6b7280",
}

export function ApplicationStatusChart({ data }: ApplicationStatusChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percentage }) => `${percentage.toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || "#8884d8"} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
