"use client"

import { useEffect, useRef } from "react"

interface TemperatureChartProps {
  times: string[]
  temperatures: number[]
  pictocodes: (string | number)[]
}

export default function TemperatureChart({ times, temperatures, pictocodes }: TemperatureChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with proper DPR handling
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Find min and max temperature for scaling
    const validTemps = temperatures.filter((t) => !isNaN(t))
    const maxTemp = Math.max(...validTemps) + 2 // Add padding
    const minTemp = Math.min(...validTemps) - 2 // Add padding
    const tempRange = maxTemp - minTemp || 10 // Prevent division by zero

    // Calculate dimensions
    const padding = { top: 30, right: 20, bottom: 40, left: 40 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom

    // Draw temperature line with gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight)
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.8)") // blue-500 with opacity
    gradient.addColorStop(1, "rgba(59, 130, 246, 0.2)") // blue-500 with low opacity

    // Draw temperature area
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top + chartHeight) // Start at bottom left

    temperatures.forEach((temp, i) => {
      if (isNaN(temp)) return

      const x = padding.left + (i / (temperatures.length - 1)) * chartWidth
      const normalizedTemp = (temp - minTemp) / tempRange
      const y = padding.top + chartHeight - normalizedTemp * chartHeight

      if (i === 0) {
        ctx.lineTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    // Complete the area by drawing to the bottom right and back to start
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
    ctx.lineTo(padding.left, padding.top + chartHeight)
    ctx.closePath()

    ctx.fillStyle = gradient
    ctx.fill()

    // Draw temperature line
    ctx.beginPath()
    ctx.lineWidth = 3
    ctx.strokeStyle = "#3b82f6" // blue-500

    temperatures.forEach((temp, i) => {
      if (isNaN(temp)) return

      const x = padding.left + (i / (temperatures.length - 1)) * chartWidth
      const normalizedTemp = (temp - minTemp) / tempRange
      const y = padding.top + chartHeight - normalizedTemp * chartHeight

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw temperature points and values
    temperatures.forEach((temp, i) => {
      if (isNaN(temp)) return

      const x = padding.left + (i / (temperatures.length - 1)) * chartWidth
      const normalizedTemp = (temp - minTemp) / tempRange
      const y = padding.top + chartHeight - normalizedTemp * chartHeight

      // Draw point
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fillStyle = "#3b82f6" // blue-500
      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw temperature value
      ctx.font = "bold 12px sans-serif"
      ctx.fillStyle = "#1e293b" // slate-800
      ctx.textAlign = "center"
      ctx.fillText(`${Math.round(temp)}°`, x, y - 12)
    })

    // Draw horizontal grid lines
    ctx.strokeStyle = "rgba(203, 213, 225, 0.5)" // slate-200 with opacity
    ctx.lineWidth = 1

    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * chartHeight
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.stroke()

      // Draw temperature labels on y-axis
      const temp = maxTemp - (i / 4) * tempRange
      ctx.font = "10px sans-serif"
      ctx.fillStyle = "#64748b" // slate-500
      ctx.textAlign = "right"
      ctx.fillText(`${Math.round(temp)}°`, padding.left - 5, y + 3)
    }

    // Draw time labels
    ctx.font = "10px sans-serif"
    ctx.fillStyle = "#64748b" // slate-500
    ctx.textAlign = "center"

    times.forEach((time, i) => {
      if (i % 2 === 0 || times.length <= 12) {
        // Show every other label if many points
        const x = padding.left + (i / (times.length - 1)) * chartWidth
        const formattedTime = new Date(time).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })
        ctx.fillText(formattedTime, x, rect.height - 10)
      }
    })
  }, [times, temperatures, pictocodes])

  return <canvas ref={canvasRef} className="w-full h-[200px]" />
}

