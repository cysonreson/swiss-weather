"use client"

import { Cloud, CloudRain, CloudSnow, Droplets, Sun, Thermometer, Wind } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface WeatherDetailsProps {
  weather: any
  type: "today" | "hourly" | "forecast"
}

export default function WeatherDetails({ weather, type }: WeatherDetailsProps) {
  // Safely check if weather data exists
  if (!weather) {
    return <div>Keine Wetterdaten verfügbar</div>
  }

  const getWeatherIcon = (code: string) => {
    // Use fixed sizes instead of dynamic classes
    if (code?.includes("clear")) return <Sun className="h-5 w-5 text-yellow-400" />
    if (code?.includes("rain")) return <CloudRain className="h-5 w-5 text-blue-400" />
    if (code?.includes("snow")) return <CloudSnow className="h-5 w-5 text-blue-200" />
    if (code?.includes("wind")) return <Wind className="h-5 w-5 text-gray-400" />
    return <Cloud className="h-5 w-5 text-gray-400" />
  }

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })
    } catch (e) {
      return timeString
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("de-CH", { weekday: "short", day: "numeric", month: "short" })
    } catch (e) {
      return dateString
    }
  }

  // Helper function to get current weather data
  const getCurrentWeather = () => {
    if (weather.current) {
      return weather.current
    }

    // If not, try to extract from data_1h (first hour)
    if (weather.data_1h && weather.data_1h.time && weather.data_1h.time.length > 0) {
      const index = 0 // First hour
      return {
        temperature: weather.data_1h.temperature?.[index] || 0,
        temperature_min: weather.data_1h.temperature_min?.[index] || 0,
        temperature_max: weather.data_1h.temperature_max?.[index] || 0,
        pictocode: weather.data_1h.pictocode?.[index] || 1,
        precipitation: weather.data_1h.precipitation?.[index] || 0,
        precipitation_probability: weather.data_1h.precipitation_probability?.[index] || 0,
        relativehumidity: weather.data_1h.relativehumidity?.[index] || 0,
        dewpoint: weather.data_1h.dewpoint?.[index] || 0,
        windspeed: weather.data_1h.windspeed?.[index] || 0,
        windgust: weather.data_1h.windgust?.[index] || 0,
      }
    }

    return null
  }

  if (type === "today") {
    // Check if current data exists
    const currentData = getCurrentWeather() || {}

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-600/70 transition-all duration-200 shadow-sm hover:shadow-md rounded-xl">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full mb-2">
              <Thermometer className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-sm font-medium">Temperatur</p>
            <p className="text-xl font-bold">{Math.round(currentData.temperature || 0)}°C</p>
            <p className="text-xs text-muted-foreground">
              Min: {Math.round(currentData.temperature_min || 0)}° | Max: {Math.round(currentData.temperature_max || 0)}
              °
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-600/70 transition-all duration-200 shadow-sm hover:shadow-md rounded-xl">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mb-2">
              <Droplets className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-sm font-medium">Feuchtigkeit</p>
            <p className="text-xl font-bold">{currentData.relativehumidity || 0}%</p>
            <p className="text-xs text-muted-foreground">Taupunkt: {Math.round(currentData.dewpoint || 0)}°C</p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-600/70 transition-all duration-200 shadow-sm hover:shadow-md rounded-xl">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="bg-slate-100 dark:bg-slate-900/30 p-2 rounded-full mb-2">
              <Wind className="h-5 w-5 text-slate-500" />
            </div>
            <p className="text-sm font-medium">Wind</p>
            <p className="text-xl font-bold">{Math.round(currentData.windspeed || 0)} km/h</p>
            <p className="text-xs text-muted-foreground">Böen: {Math.round(currentData.windgust || 0)} km/h</p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-600/70 transition-all duration-200 shadow-sm hover:shadow-md rounded-xl">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mb-2">
              <CloudRain className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-sm font-medium">Niederschlag</p>
            <p className="text-xl font-bold">{currentData.precipitation || 0} mm</p>
            <p className="text-xs text-muted-foreground">Wahrsch.: {currentData.precipitation_probability || 0}%</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (type === "hourly" && weather.data_1h) {
    const hourlyData = weather.data_1h || {}
    const times = hourlyData.time || []
    const temperatures = hourlyData.temperature || []
    const pictocodes = hourlyData.pictocode || []
    const precipitations = hourlyData.precipitation || []

    // Check if we have any hourly data
    if (times.length === 0) {
      return <div>Keine stündlichen Daten verfügbar</div>
    }

    return (
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4">
          {times.slice(0, 24).map((time: string, index: number) => (
            <Card
              key={index}
              className="bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-600/70 transition-all duration-200 shadow-sm hover:shadow-md rounded-xl"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4 bg-white/70 dark:bg-slate-600/70 p-2 rounded-full">
                    {getWeatherIcon(String(pictocodes[index] || ""))}
                  </div>
                  <div>
                    <p className="font-medium">{formatTime(time)}</p>
                    <p className="text-sm text-muted-foreground">Niederschlag: {precipitations[index] || 0} mm</p>
                  </div>
                </div>
                <div className="text-xl font-bold">{Math.round(temperatures[index] || 0)}°C</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    )
  }

  if (type === "forecast" && weather.data_day) {
    const forecastData = weather.data_day || {}
    const dates = forecastData.time || []
    const tempMax = forecastData.temperature_max || []
    const tempMin = forecastData.temperature_min || []
    const pictocodes = forecastData.pictocode || []
    const precipitations = forecastData.precipitation || []

    // Check if we have any forecast data
    if (dates.length === 0) {
      return <div>Keine Prognosedaten verfügbar</div>
    }

    return (
      <div className="space-y-4">
        {dates.map((date: string, index: number) => (
          <Card
            key={index}
            className="bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-600/70 transition-all duration-200 shadow-sm hover:shadow-md rounded-xl"
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-4 bg-white/70 dark:bg-slate-600/70 p-2 rounded-full">
                  {getWeatherIcon(String(pictocodes[index] || ""))}
                </div>
                <div>
                  <p className="font-medium">{formatDate(date)}</p>
                  <p className="text-sm text-muted-foreground">Niederschlag: {precipitations[index] || 0} mm</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{Math.round(tempMax[index] || 0)}°C</p>
                <p className="text-sm text-muted-foreground">{Math.round(tempMin[index] || 0)}°C</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return <div>Keine Daten verfügbar</div>
}

