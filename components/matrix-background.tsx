"use client"

import { useEffect, useRef, useState } from "react"

interface Point {
  x: number
  y: number
  baseOpacity: number
  currentOpacity: number
  targetOpacity: number
  color: string
  size: number
}

const COLORS = [
  "rgba(6, 182, 212, ", // cyan
  "rgba(139, 92, 246, ", // violet
  "rgba(16, 185, 129, ", // emerald
  "rgba(244, 114, 182, ", // pink
]

export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointsRef = useRef<Point[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const animationRef = useRef<number>()
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = dimensions.width
    canvas.height = dimensions.height

    // Create grid of points
    const spacing = 40
    const points: Point[] = []
    
    for (let x = spacing / 2; x < dimensions.width; x += spacing) {
      for (let y = spacing / 2; y < dimensions.height; y += spacing) {
        const baseOpacity = 0.03 + Math.random() * 0.04
        points.push({
          x,
          y,
          baseOpacity,
          currentOpacity: baseOpacity,
          targetOpacity: baseOpacity,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 1.5 + Math.random() * 1,
        })
      }
    }
    pointsRef.current = points

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const mouse = mouseRef.current
      const influenceRadius = 200
      const maxBrightness = 0.6

      for (const point of pointsRef.current) {
        // Calculate distance from mouse
        const dx = mouse.x - point.x
        const dy = mouse.y - point.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Set target opacity based on distance
        if (distance < influenceRadius) {
          const influence = 1 - distance / influenceRadius
          point.targetOpacity = point.baseOpacity + (maxBrightness - point.baseOpacity) * influence * influence
        } else {
          point.targetOpacity = point.baseOpacity
        }

        // Smooth transition
        point.currentOpacity += (point.targetOpacity - point.currentOpacity) * 0.1

        // Draw point
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2)
        ctx.fillStyle = point.color + point.currentOpacity + ")"
        ctx.fill()

        // Draw connection lines to nearby bright points
        if (point.currentOpacity > 0.15) {
          for (const otherPoint of pointsRef.current) {
            if (otherPoint === point) continue
            if (otherPoint.currentOpacity < 0.15) continue
            
            const lineDx = otherPoint.x - point.x
            const lineDy = otherPoint.y - point.y
            const lineDistance = Math.sqrt(lineDx * lineDx + lineDy * lineDy)
            
            if (lineDistance < 60) {
              const lineOpacity = Math.min(point.currentOpacity, otherPoint.currentOpacity) * 0.5
              ctx.beginPath()
              ctx.moveTo(point.x, point.y)
              ctx.lineTo(otherPoint.x, otherPoint.y)
              ctx.strokeStyle = point.color + lineOpacity + ")"
              ctx.lineWidth = 0.5
              ctx.stroke()
            }
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.8 }}
    />
  )
}
