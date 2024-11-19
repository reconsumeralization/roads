'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  Road,
  Truck,
  HardHat,
  Construction,
  AlertTriangle,
  Calendar,
  Ruler,
  DollarSign,
} from 'lucide-react'

// Road construction specific data
const projectMetrics = [
  { month: 'Jan', asphalt: 2500, concrete: 1500, repairs: 1000 },
  { month: 'Feb', asphalt: 3000, concrete: 2000, repairs: 800 },
  { month: 'Mar', asphalt: 4500, concrete: 2500, repairs: 1200 },
  { month: 'Apr', asphalt: 3800, concrete: 3000, repairs: 900 },
  { month: 'May', asphalt: 5000, concrete: 3500, repairs: 1500 },
  { month: 'Jun', asphalt: 4200, concrete: 2800, repairs: 1100 },
]

const materialUsage = [
  { name: 'Asphalt', value: 23000, color: '#ff7c43' },
  { name: 'Concrete', value: 15300, color: '#666666' },
  { name: 'Gravel', value: 8700, color: '#ffa600' },
  { name: 'Steel', value: 4500, color: '#2f4b7c' },
]

const safetyMetrics = [
  { month: 'Jan', incidents: 0, nearMisses: 2, inspections: 12 },
  { month: 'Feb', incidents: 1, nearMisses: 1, inspections: 14 },
  { month: 'Mar', incidents: 0, nearMisses: 3, inspections: 13 },
  { month: 'Apr', incidents: 0, nearMisses: 1, inspections: 15 },
  { month: 'May', incidents: 1, nearMisses: 2, inspections: 14 },
  { month: 'Jun', incidents: 0, nearMisses: 1, inspections: 16 },
]

export function RoadConstructionDashboard() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Road Projects
            </CardTitle>
            <Road className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-muted-foreground text-xs">
              Total length: 45.2 miles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Equipment Deployed
            </CardTitle>
            <Truck className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-muted-foreground text-xs">Utilization: 92%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98%</div>
            <p className="text-muted-foreground text-xs">
              Last incident: 45 days ago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Project Completion
            </CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-muted-foreground text-xs">
              On schedule: 11/12 projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Charts */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Progress by Type</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={projectMetrics}>
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value} yd²`}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="asphalt"
                    name="Asphalt"
                    fill="#ff7c43"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="concrete"
                    name="Concrete"
                    fill="#666666"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="repairs"
                    name="Repairs"
                    fill="#ffa600"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Material Usage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={materialUsage}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={(entry) => `${entry.name}: ${entry.value} tons`}
                  >
                    {materialUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Safety Metrics</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={safetyMetrics}>
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="incidents"
                    name="Incidents"
                    stroke="#ff0000"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="nearMisses"
                    name="Near Misses"
                    stroke="#ffa600"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="inspections"
                    name="Inspections"
                    stroke="#00ff00"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
