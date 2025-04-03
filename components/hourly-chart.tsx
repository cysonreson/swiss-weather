"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Sun, Wind } from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface HourlyChartProps {
  data: any
}

export default function HourlyChart({ data }: HourlyChartProps) {
  const [mounted, setMounted] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && data && data.data_1h) {
      prepareChartData()
    }
  }, [mounted, data])

  const prepareChartData = () => {
    if (!data || !data.data_1h) return

    const hourlyData = data.data_1h
    const times = hourlyData.time || []
    const temperatures = hourlyData.temperature || []
    const precipitations = hourlyData.precipitation || []
    const windSpeeds = hourlyData.windspeed || []

    const formattedData = times.slice(0, 24).map((time: string, index: number) => {
      return {
        time: formatTime(time),
        temperature: temperatures[index] || 0,
        precipitation: precipitations[index] || 0,
        windSpeed: windSpeeds[index] || 0,
      }
    })

    setChartData(formattedData)
  }

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })
    } catch (e) {
      console.error("Error formatting time:", e)
      return "00:00"
    }
  }

  // If not mounted yet, show loading
  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-900 rounded-full animate-ping opacity-75"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!data || !data.data_1h) {
    return <div>Keine stündlichen Daten verfügbar</div>
  }

  return (
    <div className="space-y-6">
      {/* Temperature Chart using Recharts */}
      <Card className="bg-white/50 dark:bg-slate-700/50 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Sun className="h-5 w-5 mr-2 text-yellow-400" />
            Temperaturverlauf
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-4">
          <div className="h-[250px] w-full">
            <ChartContainer
              config={{
                temperature: {
                  label: "Temperatur (°C)",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value) => [`${value}°C`, "Temperatur"]} />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="var(--color-temperature)"
                    name="Temperatur (°C)"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Precipitation Chart using Recharts */}
      <Card className="bg-white/50 dark:bg-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Droplets className="h-5 w-5 mr-2 text-blue-400" />
            Niederschlag
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-4">
          <div className="h-[200px] w-full">
            <ChartContainer
              config={{
                precipitation: {
                  label: "Niederschlag (mm)",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(value) => [`${value} mm`, "Niederschlag"]} />}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="precipitation"
                    stroke="var(--color-precipitation)"
                    name="Niederschlag (mm)"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Wind Speed Chart using Recharts */}
      <Card className="bg-white/50 dark:bg-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Wind className="h-5 w-5 mr-2 text-slate-400" />
            Windgeschwindigkeit
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-4">
          <div className="h-[200px] w-full">
            <ChartContainer
              config={{
                windSpeed: {
                  label: "Windgeschwindigkeit (km/h)",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(value) => [`${value} km/h`, "Windgeschwindigkeit"]} />}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="windSpeed"
                    stroke="var(--color-windSpeed)"
                    name="Windgeschwindigkeit (km/h)"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

