"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MonthlyTrendsChartProps {
  data: {
    month: string
    submitted: number
    verified: number
    rejected: number
  }[]
}

export function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Application Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="submitted" stroke="#3b82f6" strokeWidth={2} name="Submitted" />
            <Line type="monotone" dataKey="verified" stroke="#10b981" strokeWidth={2} name="Verified" />
            <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} name="Rejected" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
