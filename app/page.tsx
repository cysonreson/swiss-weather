"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Sun, Moon, Cloud, CloudRain, CloudSnow, Wind } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import WeatherDetails from "@/components/weather-details"
import LocationSearch from "@/components/location-search"
import WeatherMap from "@/components/weather-map"
import HourlyChart from "@/components/hourly-chart"
import ForecastDetail from "@/components/forecast-detail"

export default function WeatherApp() {
  const [weather, setWeather] = useState<any>(null)
  const [location, setLocation] = useState({ lat: 47.3769, lon: 8.5417, name: "Zürich" })
  const [loading, setLoading] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("today")
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Fix for hydration issues with theme
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchWeather()
  }, [location])

  const fetchWeather = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log(`Fetching weather for: ${location.name} (${location.lat}, ${location.lon})`)

      const response = await fetch(`/api/weather?lat=${location.lat}&lon=${location.lon}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        console.error("API error:", data.error, data.details)
        throw new Error(data.error)
      }

      console.log("Weather data received:", data)

      // Check if we have the expected data structure
      if (!data.metadata && !data.data_1h && !data.data_day) {
        console.error("Unexpected data format:", data)
        throw new Error("Unerwartetes Datenformat von der Wetter-API")
      }

      setWeather(data)
    } catch (error) {
      console.error("Error fetching weather data:", error)
      setError("Wetterdaten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.")
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSelect = (selectedLocation: any) => {
    console.log("Selected location:", selectedLocation)
    setLocation(selectedLocation)
    setSearchOpen(false)
  }

  const getWeatherIcon = (code: string) => {
    if (!code) return <Cloud className="h-8 w-8 text-gray-400" />

    const codeStr = String(code)
    if (codeStr.includes("clear")) return <Sun className="h-8 w-8 text-yellow-400" />
    if (codeStr.includes("rain")) return <CloudRain className="h-8 w-8 text-blue-400" />
    if (codeStr.includes("snow")) return <CloudSnow className="h-8 w-8 text-blue-200" />
    if (codeStr.includes("wind")) return <Wind className="h-8 w-8 text-gray-400" />
    return <Cloud className="h-8 w-8 text-gray-400" />
  }

  // Helper function to extract current weather from the API response
  const getCurrentWeather = () => {
    if (!weather) return null

    // Check if we have the expected data structure
    if (weather.current) {
      return weather.current
    }

    // If not, try to extract from data_1h (first hour)
    if (weather.data_1h && weather.data_1h.time && weather.data_1h.time.length > 0) {
      const index = 0 // First hour
      return {
        temperature: weather.data_1h.temperature?.[index] || 0,
        pictocode: weather.data_1h.pictocode?.[index] || 1,
        precipitation: weather.data_1h.precipitation?.[index] || 0,
        precipitation_probability: weather.data_1h.precipitation_probability?.[index] || 0,
        relativehumidity: weather.data_1h.relativehumidity?.[index] || 0,
        windspeed: weather.data_1h.windspeed?.[index] || 0,
        winddirection: weather.data_1h.winddirection?.[index] || 0,
      }
    }

    return null
  }

  const currentWeather = getCurrentWeather()

  // Determine background gradient based on weather and time
  const getBackgroundGradient = () => {
    if (!currentWeather) return "from-sky-100 to-blue-200 dark:from-slate-900 dark:to-slate-800"

    const code = String(currentWeather.pictocode || "")
    const temp = currentWeather.temperature || 0

    if (code.includes("clear")) {
      if (temp > 25) return "from-orange-100 to-yellow-200 dark:from-orange-950 dark:to-yellow-950"
      return "from-sky-100 to-blue-200 dark:from-sky-950 dark:to-blue-950"
    }

    if (code.includes("pcloudy")) return "from-blue-100 to-gray-200 dark:from-blue-950 dark:to-gray-900"
    if (code.includes("mcloudy") || code.includes("cloudy"))
      return "from-gray-200 to-gray-300 dark:from-gray-900 dark:to-gray-800"
    if (code.includes("rain")) return "from-blue-200 to-gray-300 dark:from-blue-950 dark:to-gray-900"
    if (code.includes("snow")) return "from-blue-100 to-gray-100 dark:from-blue-950 dark:to-gray-950"

    return "from-sky-100 to-blue-200 dark:from-slate-900 dark:to-slate-800"
  }

  // Handle theme toggle with proper check for mounted state
  const toggleTheme = () => {
    if (mounted) {
      // Force the theme to change by explicitly setting it to the opposite of current
      if (theme === "dark") {
        setTheme("light")
      } else {
        setTheme("dark")
      }
      console.log("Toggling theme to:", theme === "dark" ? "light" : "dark")
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${getBackgroundGradient()} transition-colors duration-700`}>
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
              Schweiz Wetter
            </span>
          </h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Ort suchen</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {mounted ? (
                theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )
              ) : (
                <div className="h-5 w-5" /> // Placeholder while mounting
              )}
              <span className="sr-only">Design wechseln</span>
            </Button>
          </div>
        </header>

        {searchOpen && <LocationSearch onSelect={handleLocationSelect} onClose={() => setSearchOpen(false)} />}

        <div className="grid gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-xl">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold">{location.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1 text-sm md:text-base">
                    <MapPin className="h-4 w-4 mr-1" />
                    {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
                  </CardDescription>
                </div>
                {currentWeather && (
                  <div className="flex items-center bg-white/50 dark:bg-slate-700/50 p-2 rounded-lg shadow-sm">
                    {getWeatherIcon(currentWeather.pictocode)}
                    <div className="ml-2 text-3xl md:text-4xl font-bold">
                      {Math.round(currentWeather.temperature)}°C
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-900 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>{error}</p>
                  <Button variant="outline" onClick={fetchWeather} className="mt-4">
                    Erneut versuchen
                  </Button>
                </div>
              ) : weather ? (
                <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4 bg-white/50 dark:bg-slate-700/50 p-1 rounded-lg">
                    <TabsTrigger
                      value="today"
                      className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-800 data-[state=active]:shadow-md transition-all duration-200"
                    >
                      Heute
                    </TabsTrigger>
                    <TabsTrigger
                      value="hourly"
                      className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-800 data-[state=active]:shadow-md transition-all duration-200"
                    >
                      Stündlich
                    </TabsTrigger>
                    <TabsTrigger
                      value="forecast"
                      className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-800 data-[state=active]:shadow-md transition-all duration-200"
                    >
                      Prognose
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="today" className="animate-in fade-in-50 duration-300 mt-2">
                    <div className="grid gap-6">
                      <WeatherDetails weather={weather} type="today" />
                      <WeatherMap lat={location.lat} lon={location.lon} zoom={10} />
                    </div>
                  </TabsContent>
                  <TabsContent value="hourly" className="animate-in fade-in-50 duration-300 mt-2">
                    <HourlyChart data={weather} />
                  </TabsContent>
                  <TabsContent value="forecast" className="animate-in fade-in-50 duration-300 mt-2">
                    <ForecastDetail data={weather} />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8">
                  <p>Keine Wetterdaten verfügbar</p>
                  <Button variant="outline" onClick={fetchWeather} className="mt-4">
                    Erneut versuchen
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="flex items-center">
                <span>Daten von meteoblue.com</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

