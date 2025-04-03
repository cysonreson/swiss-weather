"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, CloudRain, CloudSnow, Droplets, Sun, Wind, Umbrella } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ForecastDetailProps {
  data: any
}

export default function ForecastDetail({ data }: ForecastDetailProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [sunTimes, setSunTimes] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
  const [weeklyData, setWeeklyData] = useState<any[]>([])

  useEffect(() => {
    if (data && data.metadata && data.metadata.latitude && data.metadata.longitude) {
      fetchSunTimes(data.metadata.latitude, data.metadata.longitude)
      organizeWeeklyData()
    }
  }, [data])

  useEffect(() => {
    if (data && data.metadata && data.metadata.latitude && data.metadata.longitude) {
      fetchSunTimes(data.metadata.latitude, data.metadata.longitude)
    }
  }, [selectedDayIndex])

  const fetchSunTimes = async (lat: number, lon: number) => {
    setLoading(true)
    try {
      // Get the date for the selected day
      const selectedDate = data.data_day.time[selectedDayIndex]
      const formattedDate = selectedDate ? new Date(selectedDate).toISOString().split("T")[0] : "today"

      const response = await fetch(`/api/suntime?lat=${lat}&lon=${lon}&date=${formattedDate}`)
      if (response.ok) {
        const data = await response.json()
        setSunTimes(data.results)
      }
    } catch (error) {
      console.error("Error fetching sun times:", error)
    } finally {
      setLoading(false)
    }
  }

  const organizeWeeklyData = () => {
    if (!data || !data.data_day || !data.data_day.time) return

    const forecastData = data.data_day
    const dates = forecastData.time || []

    // Just take the first 7 days of available data
    const weekDays = dates.slice(0, 7).map((_, index) => index)

    // Set as a single "week"
    setWeeklyData([weekDays])

    // Set the selected day to the first day
    if (weekDays.length > 0) {
      setSelectedDayIndex(weekDays[0])
    }
  }

  const navigateWeek = (direction: number) => {
    const newIndex = currentWeekIndex + direction
    if (newIndex >= 0 && newIndex < weeklyData.length) {
      setCurrentWeekIndex(newIndex)
      // Setze den ausgewählten Tag auf den ersten Tag der neuen Woche
      if (weeklyData[newIndex] && weeklyData[newIndex].length > 0) {
        setSelectedDayIndex(weeklyData[newIndex][0])
      }
    }
  }

  const getWeekLabel = (weekIndex: number) => {
    if (!data || !data.data_day || !data.data_day.time || weeklyData.length === 0) return "Woche"

    const firstDayIndex = weeklyData[weekIndex][0]
    const firstDayDate = new Date(data.data_day.time[firstDayIndex])

    const lastDayIndex = weeklyData[weekIndex][weeklyData[weekIndex].length - 1]
    const lastDayDate = new Date(data.data_day.time[lastDayIndex])

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("de-CH", { day: "numeric", month: "numeric" })
    }

    return `  => {
      return date.toLocaleDateString("de-CH", { day: "numeric", month: "numeric" })
    }

    return \`${formatDate(firstDayDate)} - ${formatDate(lastDayDate)}`
  }

  if (!data || !data.data_day) {
    return <div>Keine Prognosedaten verfügbar</div>
  }

  const forecastData = data.data_day
  const dates = forecastData.time || []
  const tempMax = forecastData.temperature_max || []
  const tempMin = forecastData.temperature_min || []
  const pictocodes = forecastData.pictocode || []
  const precipitations = forecastData.precipitation || []
  const precipProbs = forecastData.precipitation_probability || []
  const windSpeeds = forecastData.windspeed_max || []
  const uvIndexes = forecastData.uvindex || []

  if (dates.length === 0 || weeklyData.length === 0) {
    return <div>Keine Prognosedaten verfügbar</div>
  }

  // Aktuelle Woche abrufen
  const currentWeekDays = weeklyData[currentWeekIndex] || []

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unbekanntes Datum"

    try {
      // Make sure we have a valid date string
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString)
        return "Ungültiges Datum"
      }

      return date.toLocaleDateString("de-CH", { weekday: "long", day: "numeric", month: "long" })
    } catch (e) {
      console.error("Error formatting date:", e, dateString)
      return "Fehler beim Formatieren des Datums"
    }
  }

  const formatShortDate = (dateString: string) => {
    if (!dateString) return "Unbekannt"

    try {
      // Make sure we have a valid date string
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        console.error("Invalid date for short format:", dateString)
        return "Ungültig"
      }

      const formatted = date.toLocaleDateString("de-CH", { weekday: "short", day: "numeric", month: "short" })
      return formatted.split(",")[0] || formatted // Just get the weekday if possible
    } catch (e) {
      console.error("Error formatting short date:", e, dateString)
      return "Fehler"
    }
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return "--:--"

    try {
      // Make sure we have a valid time string
      const date = new Date(timeString)
      if (isNaN(date.getTime())) {
        console.error("Invalid time:", timeString)
        return "--:--"
      }

      return date.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })
    } catch (e) {
      console.error("Error formatting time:", e, timeString)
      return "--:--"
    }
  }

  const getWeatherIcon = (code: string, size = 6) => {
    const className = `h-${size} w-${size}`
    if (code?.includes("clear")) return <Sun className={`${className} text-yellow-400`} />
    if (code?.includes("rain")) return <CloudRain className={`${className} text-blue-400`} />
    if (code?.includes("snow")) return <CloudSnow className={`${className} text-blue-200`} />
    if (code?.includes("wind")) return <Wind className={`${className} text-gray-400`} />
    return <Cloud className={`${className} text-gray-400`} />
  }

  const getUVIndexDescription = (index: number) => {
    if (index <= 2) return { text: "Niedrig", color: "bg-green-500" }
    if (index <= 5) return { text: "Mittel", color: "bg-yellow-500" }
    if (index <= 7) return { text: "Hoch", color: "bg-orange-500" }
    if (index <= 10) return { text: "Sehr hoch", color: "bg-red-500" }
    return { text: "Extrem", color: "bg-purple-500" }
  }

  const getWeatherDescription = (code: string) => {
    if (!code || code === "undefined") return "Keine Wetterdaten verfügbar"
    if (code.includes("clear")) return "Klar"
    if (code.includes("pcloudy")) return "Teilweise bewölkt"
    if (code.includes("mcloudy")) return "Überwiegend bewölkt"
    if (code.includes("cloudy")) return "Bewölkt"
    if (code.includes("rain")) return "Regen"
    if (code.includes("snow")) return "Schnee"
    if (code.includes("tstorm")) return "Gewitter"
    if (code.includes("fog")) return "Nebel"
    return "Wechselhaft" // Default instead of "Unbekannt"
  }

  return (
    <div className="space-y-6">
      <div className="flex overflow-x-auto pb-4 gap-2 w-full justify-center">
        {currentWeekDays.map((dayIndex: number, i: number) => {
          // Get day of week and date
          let dayLabel = "Tag " + (i + 1)
          let dateObj: Date

          if (dayIndex >= 0 && dates[dayIndex]) {
            // If we have data for this day
            dateObj = new Date(dates[dayIndex])
          } else {
            // Calculate the date based on the week and day index
            const firstDayIndex = currentWeekDays.find((idx) => idx >= 0) || 0
            const firstDayDate = firstDayIndex >= 0 ? new Date(dates[firstDayIndex]) : new Date()
            const dayDiff = i - currentWeekDays.indexOf(firstDayIndex)

            dateObj = new Date(firstDayDate)
            dateObj.setDate(firstDayDate.getDate() + dayDiff)
          }

          if (!isNaN(dateObj.getTime())) {
            const weekday = dateObj.toLocaleDateString("de-CH", { weekday: "short" })
            const day = dateObj.getDate()
            dayLabel = `${weekday} ${day}`
          }

          // Skip rendering if no data and not the selected day
          const hasData = dayIndex >= 0
          const isSelected = dayIndex === selectedDayIndex

          return (
            <Card
              key={i}
              className={`flex-shrink-0 w-[120px] ${hasData ? "bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-600/70" : "bg-white/30 dark:bg-slate-700/30"} transition-all duration-200 ${hasData ? "cursor-pointer" : "opacity-60"} ${isSelected ? "ring-2 ring-primary shadow-md" : "shadow-sm"} rounded-xl`}
              onClick={() => hasData && setSelectedDayIndex(dayIndex)}
            >
              <CardContent className="p-3 flex flex-col items-center">
                <div className="text-sm font-medium">{dayLabel}</div>
                {hasData ? (
                  <>
                    <div className="my-2 bg-white/70 dark:bg-slate-600/70 p-2 rounded-full">
                      {getWeatherIcon(String(pictocodes[dayIndex] || ""), 6)}
                    </div>
                    <div className="flex gap-2 text-sm">
                      <span className="font-bold">{Math.round(tempMax[dayIndex] || 0)}°</span>
                      <span className="text-muted-foreground">{Math.round(tempMin[dayIndex] || 0)}°</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="my-2 text-muted-foreground">-</div>
                    <div className="text-sm text-muted-foreground">Keine Daten</div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-white/50 dark:bg-slate-700/50 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle>{formatDate(dates[selectedDayIndex] || "")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white/70 dark:bg-slate-600/70 p-2 rounded-full mr-3">
                    {getWeatherIcon(String(pictocodes[selectedDayIndex] || ""), 8)}
                  </div>
                  <div className="ml-1">
                    <div className="text-2xl font-bold">{Math.round(tempMax[selectedDayIndex] || 0)}°C</div>
                    <div className="text-muted-foreground">Höchsttemperatur</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{Math.round(tempMin[selectedDayIndex] || 0)}°C</div>
                  <div className="text-muted-foreground">Tiefsttemperatur</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center bg-white/30 dark:bg-slate-800/30 p-3 rounded-lg">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-2">
                    <Umbrella className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Regenwahrscheinlichkeit</div>
                    <div className="text-xl">{precipProbs[selectedDayIndex] || 0}%</div>
                  </div>
                </div>
                <div className="flex items-center bg-white/30 dark:bg-slate-800/30 p-3 rounded-lg">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-2">
                    <Droplets className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Niederschlag</div>
                    <div className="text-xl">{precipitations[selectedDayIndex] || 0} mm</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center bg-white/30 dark:bg-slate-800/30 p-3 rounded-lg">
                  <div className="bg-slate-100 dark:bg-slate-900/30 p-2 rounded-full mr-2">
                    <Wind className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Windgeschwindigkeit</div>
                    <div className="text-xl">{Math.round(windSpeeds[selectedDayIndex] || 0)} km/h</div>
                  </div>
                </div>
                <div className="flex items-center bg-white/30 dark:bg-slate-800/30 p-3 rounded-lg">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full mr-2">
                    <Sun className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">UV-Index</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{uvIndexes[selectedDayIndex] || 0}</span>
                      {uvIndexes[selectedDayIndex] && (
                        <Badge className={`${getUVIndexDescription(uvIndexes[selectedDayIndex]).color} text-white`}>
                          {getUVIndexDescription(uvIndexes[selectedDayIndex]).text}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-gradient-to-b from-blue-100 to-orange-100 dark:from-blue-900/30 dark:to-orange-900/30 rounded-lg p-4 shadow-sm">
                <div className="text-lg font-medium mb-2">Tagesverlauf</div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col items-center">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full mb-1">
                      <Sun className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="text-sm font-medium">Sonnenaufgang</div>
                    <div className="text-xl font-bold">
                      {sunTimes ? formatTime(sunTimes.sunrise) : loading ? "Lädt..." : "--:--"}
                    </div>
                  </div>

                  <div className="flex-1 h-2 mx-4 bg-gradient-to-r from-yellow-400 via-blue-400 to-indigo-600 rounded-full" />

                  <div className="flex flex-col items-center">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mb-1">
                      <Sun className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div className="text-sm font-medium">Sonnenuntergang</div>
                    <div className="text-xl font-bold">
                      {sunTimes ? formatTime(sunTimes.sunset) : loading ? "Lädt..." : "--:--"}
                    </div>
                  </div>
                </div>
              </div>

              <Card className="bg-white/70 dark:bg-slate-800/70 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-lg font-medium mb-2">Wetterübersicht</div>
                  <div className="text-lg">{getWeatherDescription(String(pictocodes[selectedDayIndex] || ""))}</div>
                  <p className="text-muted-foreground mt-2">
                    Die Temperaturen liegen zwischen {Math.round(tempMin[selectedDayIndex] || 0)}°C und{" "}
                    {Math.round(tempMax[selectedDayIndex] || 0)}°C.
                    {precipProbs[selectedDayIndex] > 20
                      ? ` Es besteht eine ${precipProbs[selectedDayIndex]}% Chance auf Niederschlag.`
                      : " Niederschlag ist unwahrscheinlich."}
                    {windSpeeds[selectedDayIndex] > 20 ? " Es wird windig sein." : " Der Wind wird mäßig sein."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

