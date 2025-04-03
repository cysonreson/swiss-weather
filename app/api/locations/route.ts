import { type NextRequest, NextResponse } from "next/server"

// Liste der wichtigsten Schweizer Städte
const topSwissCities = [
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query") || ""

  if (!query || query.length < 1) {
    // Wenn keine Suchanfrage, geben wir die beliebtesten Städte zurück
    return NextResponse.json(topSwissCities)
  }

  console.log("Searching for location:", query)

  // Suche in unserer vordefinierten Liste von Schweizer Städten
  const normalizedQuery = query.toLowerCase().trim()
  const matchingCities = topSwissCities.filter((city) => city.name.toLowerCase().includes(normalizedQuery))

  console.log(`Found ${matchingCities.length} matching cities in predefined list`)

  // Wenn wir Übereinstimmungen in unserer vordefinierten Liste haben, geben wir sie zurück
  if (matchingCities.length > 0) {
    return NextResponse.json(matchingCities)
  }

  // Wenn keine Übereinstimmungen in unserer Liste, versuchen wir die API
  try {
    // Versuchen wir zuerst, nach Orten zu suchen
    let url = `https://openplzapi.org/de/Localities?name=${encodeURIComponent(query)}`

    console.log("Fetching locations from:", url)

    let response = await fetch(url, {
      headers: {
        accept: "text/json",
      },
      next: { revalidate: 3600 }, // Cache für 1 Stunde
    })

    let data = []

    if (response.ok) {
      data = await response.json()
      console.log(`Found ${data.length} localities from API`)
    }

    // Wenn keine Orte gefunden wurden, versuchen wir Straßen
    if (data.length === 0) {
      url = `https://openplzapi.org/de/Streets?name=${encodeURIComponent(query)}`

      console.log("Fetching streets from:", url)

      response = await fetch(url, {
        headers: {
          accept: "text/json",
        },
        next: { revalidate: 3600 }, // Cache für 1 Stunde
      })

      if (response.ok) {
        const streetsData = await response.json()
        console.log(`Found ${streetsData.length} streets from API`)

        // Extrahieren eindeutiger Städte aus Straßen
        const cityMap = new Map()

        streetsData.forEach((item: any) => {
          if (item.city) {
            // Verwenden Sie die Stadt als Schlüssel, um Duplikate zu vermeiden
            const key = `${item.city}-${item.latitude}-${item.longitude}`

            if (!cityMap.has(key)) {
              cityMap.set(key, {
                name: item.city,
                lat: item.latitude || 47.3769,
                lon: item.longitude || 8.5417,
              })
            }
          }
        })

        data = Array.from(cityMap.values())
        console.log(`Extracted ${data.length} unique cities from streets`)
      }
    }

    // Transformieren der Daten in ein einfacheres Format
    const locations = data.map((item: any) => {
      return {
        name: item.name || item.city || "Unbekannter Ort",
        lat: item.latitude || 47.3769,
        lon: item.longitude || 8.5417,
      }
    })

    // Wenn immer noch keine Ergebnisse, geben wir eine Teilmenge unserer vordefinierten Städte zurück
    if (locations.length === 0) {
      console.log("No results from API, returning subset of predefined cities")
      return NextResponse.json(topSwissCities)
    }

    return NextResponse.json(locations.slice(0, 30))
  } catch (error) {
    console.error("Error fetching locations:", error)

    // Fallback zu unseren vordefinierten Schweizer Städten, wenn die API fehlschlägt
    console.log("API error, returning predefined cities")
    return NextResponse.json(topSwissCities)
  }
}

