"use client"
import { useState, useEffect, useRef } from "react"
import { X, MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LocationSearchProps {
  onSelect: (location: any) => void
  onClose: () => void
}

// Liste der beliebtesten Schweizer Städte direkt im Code
const popularLocations = [
  { name: "Zürich", lat: 47.3769, lon: 8.5417 },
  { name: "Genf", lat: 46.2044, lon: 6.1432 },
  { name: "Basel", lat: 47.5596, lon: 7.5886 },
  { name: "Bern", lat: 46.948, lon: 7.4474 },
  { name: "Lausanne", lat: 46.5197, lon: 6.6323 },
  { name: "Luzern", lat: 47.0502, lon: 8.3093 },
  { name: "St. Gallen", lat: 47.4245, lon: 9.3767 },
  { name: "Lugano", lat: 46.0037, lon: 8.9511 },
  { name: "Winterthur", lat: 47.5, lon: 8.75 },
  { name: "Chur", lat: 46.85, lon: 9.5333 },
  { name: "Thun", lat: 46.75, lon: 7.6167 },
  { name: "Biel", lat: 47.1368, lon: 7.2467 },
  { name: "Fribourg", lat: 46.8, lon: 7.15 },
  { name: "Schaffhausen", lat: 47.6958, lon: 8.6367 },
  { name: "Neuchâtel", lat: 46.99, lon: 6.9292 },
  { name: "Sion", lat: 46.2333, lon: 7.3667 },
  { name: "Zug", lat: 47.1667, lon: 8.5167 },
  { name: "Davos", lat: 46.8, lon: 9.8333 },
  { name: "St. Moritz", lat: 46.4986, lon: 9.8375 },
  { name: "Interlaken", lat: 46.6833, lon: 7.85 },
]

export default function LocationSearch({ onSelect, onClose }: LocationSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const apiKey = process.env.NEXT_PUBLIC_METEOBLUE_API_KEY || "fGJdZSIqDOgm61jE"
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Automatische Suche bei Eingabe mit Debounce
  useEffect(() => {
    // Lösche vorherigen Timer, wenn ein neuer Buchstabe eingegeben wird
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Wenn Suchbegriff leer ist, zeige beliebte Orte
    if (searchTerm.trim() === "") {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    // Starte einen neuen Timer (300ms Verzögerung)
    setLoading(true)
    debounceTimerRef.current = setTimeout(() => {
      handleSearch()
    }, 300)

    // Cleanup beim Unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchTerm])

  const handleSearch = async () => {
    if (searchTerm.trim().length < 1) {
      setResults([])
      setLoading(false)
      return
    }

    setError(null)

    try {
      // Verwende die Meteoblue API direkt für Ortssuche
      const url = `https://www.meteoblue.com/de/server/search/query3?query=${encodeURIComponent(searchTerm)}&apikey=${apiKey}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()

      // Transformiere die Daten in das benötigte Format
      const locations =
        data.results?.map((item: any) => ({
          name: item.name,
          lat: item.lat,
          lon: item.lon,
        })) || []

      setResults(locations)

      if (locations.length === 0) {
        setError("Keine Orte gefunden. Bitte versuchen Sie einen anderen Suchbegriff.")
      }
    } catch (error) {
      console.error("Error searching locations:", error)
      setError("Fehler bei der Suche. Bitte versuchen Sie es später erneut.")
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Filtere beliebte Orte basierend auf Suchbegriff
  const filteredPopularLocations =
    searchTerm.trim().length > 0
      ? popularLocations.filter((location) => location.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : popularLocations

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-slate-800 shadow-xl rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Ort suchen</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Schließen</span>
            </Button>
          </div>

          <div className="flex gap-2 mb-4">
            <div className="relative w-full">
              <Input
                placeholder="Stadt oder Ort eingeben..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 flex-1"
                autoFocus
              />
              {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

          {results.length > 0 ? (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {results.map((location, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    onClick={() => onSelect(location)}
                  >
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
                    <div>
                      <p className="font-medium">{location.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                {searchTerm.trim().length > 0 ? "Keine Ergebnisse gefunden:" : "Beliebte Orte:"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {popularLocations.map((location, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    onClick={() => onSelect(location)}
                  >
                    <MapPin className="h-3 w-3 mr-2 text-primary" />
                    {location.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

