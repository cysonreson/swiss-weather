import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat") || "47.3769"
  const lon = searchParams.get("lon") || "8.5417"
  const date = searchParams.get("date") || "today"

  try {
    // Verwende die Sunrise-Sunset API
    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${date}&formatted=0`

    console.log("Fetching sun times from:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 86400 }, // Cache für 24 Stunden
    })

    if (!response.ok) {
      console.error(`Sunrise API error: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error(`Sunrise API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Überprüfe, ob die Antwort die erwartete Datenstruktur enthält
    if (!data.results) {
      console.error("Unexpected API response format:", data)
      throw new Error("Unexpected API response format")
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching sun times:", error)
    return NextResponse.json({ error: "Failed to fetch sun times", details: error.message }, { status: 500 })
  }
}

