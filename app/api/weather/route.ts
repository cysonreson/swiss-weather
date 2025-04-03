import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat") || "47.3769"
  const lon = searchParams.get("lon") || "8.5417"

  try {
    // Verwende die Umgebungsvariable oder den Standard-API-Schlüssel
    const apiKey = "fGJdZSIqDOgm61jE"

    // API-URL gemäß meteoblue-Dokumentation
    const url = `https://my.meteoblue.com/packages/basic-1h_basic-day?apikey=${apiKey}&lat=${lat}&lon=${lon}&asl=354&format=json`

    console.log("Fetching weather data from:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 300 }, // Cache für 5 Minuten
    })

    if (!response.ok) {
      console.error(`Weather API error: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error(`Weather API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Überprüfung der erwarteten API-Datenstruktur
    if (!data.metadata && !data.data_1h && !data.data_day) {
      console.error("Unexpected API response format:", data)
      throw new Error("Unexpected API response format")
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching weather data:", error)

    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"

    return NextResponse.json(
      { error: "Failed to fetch weather data", details: errorMessage },
      { status: 500 }
    )
  }
}
