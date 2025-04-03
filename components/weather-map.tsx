"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface WeatherMapProps {
  lat: number
  lon: number
  zoom?: number
}

export default function WeatherMap({ lat, lon, zoom = 9 }: WeatherMapProps) {
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const apiKey = process.env.NEXT_PUBLIC_METEOBLUE_API_KEY || "fGJdZSIqDOgm61jE"

  useEffect(() => {
    setIsLoading(true)

    // Use a higher zoom level for better detail
    const mapZoom = 10

    // Construct the meteoblue map URL with the provided coordinates
    // Using the Maps API as per documentation
    const mapUrl = `https://www.meteoblue.com/en/weather/maps/widget?windAnimation=1&gust=0&satellite=0&cloudsAndPrecipitation=1&temperature=1&sunshine=0&extremeForecastIndex=0&geoloc=fixed&latitude=${lat}&longitude=${lon}&zoom=${mapZoom}&hideControls=0&hideMenu=0&hideOptions=0&hideProgress=0&hideBorder=1&hideNames=0&hideScaleBar=0&hideSymbols=0&hideTimeline=0&apikey=${apiKey}`

    if (iframeRef.current) {
      iframeRef.current.src = mapUrl
    }
  }, [lat, lon, apiKey])

  return (
    <Card className="overflow-hidden border-none shadow-lg relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-900 rounded-full animate-ping opacity-75"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Wetterkarte wird geladen...</p>
          </div>
        </div>
      )}

      {/* Location marker overlay */}
      <div className="absolute top-2 left-2 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-md p-2 shadow-md">
        <div className="flex items-center text-sm">
          <MapPin className="h-4 w-4 mr-1 text-red-500" />
          <span className="font-medium">
            {lat.toFixed(4)}, {lon.toFixed(4)}
          </span>
        </div>
      </div>

      <iframe
        ref={iframeRef}
        frameBorder="0"
        scrolling="no"
        allowTransparency={true}
        sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
        className="w-full h-[400px]"
        title="Meteoblue Weather Map"
        onLoad={() => setIsLoading(false)}
      ></iframe>
    </Card>
  )
}

