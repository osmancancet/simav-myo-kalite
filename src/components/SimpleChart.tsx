"use client"

import { useEffect, useRef } from "react"

interface ChartData {
    labels: string[]
    datasets: {
        label: string
        data: number[]
        backgroundColor?: string | string[]
        borderColor?: string | string[]
        borderWidth?: number
    }[]
}

interface SimpleChartProps {
    type: "bar" | "doughnut" | "line"
    data: ChartData
    height?: number
}

export function SimpleChart({ type, data, height = 200 }: SimpleChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!canvasRef.current) return

        const ctx = canvasRef.current.getContext("2d")
        if (!ctx) return

        const canvas = canvasRef.current
        canvas.width = canvas.offsetWidth
        canvas.height = height

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (type === "bar") {
            drawBarChart(ctx, data, canvas.width, canvas.height)
        } else if (type === "doughnut") {
            drawDoughnutChart(ctx, data, canvas.width, canvas.height)
        } else if (type === "line") {
            drawLineChart(ctx, data, canvas.width, canvas.height)
        }
    }, [type, data, height])

    return <canvas ref={canvasRef} className="w-full" style={{ height }} />
}

function drawBarChart(ctx: CanvasRenderingContext2D, data: ChartData, width: number, height: number) {
    const padding = 40
    const barWidth = (width - padding * 2) / data.labels.length - 10
    const maxValue = Math.max(...data.datasets[0].data, 1)
    const scale = (height - padding * 2) / maxValue

    data.datasets[0].data.forEach((value, i) => {
        const x = padding + i * (barWidth + 10)
        const barHeight = value * scale
        const y = height - padding - barHeight

        const colors = data.datasets[0].backgroundColor
        ctx.fillStyle = Array.isArray(colors) ? colors[i] : colors || "#3b82f6"
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, 4)
        ctx.fill()

        ctx.fillStyle = "#64748b"
        ctx.font = "11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(data.labels[i], x + barWidth / 2, height - 10)

        ctx.fillStyle = "#ffffff"
        ctx.fillText(value.toString(), x + barWidth / 2, y - 5)
    })
}

function drawDoughnutChart(ctx: CanvasRenderingContext2D, data: ChartData, width: number, height: number) {
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 20
    const innerRadius = radius * 0.6

    const total = data.datasets[0].data.reduce((a, b) => a + b, 0)
    let startAngle = -Math.PI / 2

    data.datasets[0].data.forEach((value, i) => {
        const sliceAngle = (value / total) * Math.PI * 2

        const colors = data.datasets[0].backgroundColor
        ctx.fillStyle = Array.isArray(colors) ? colors[i] : colors || "#3b82f6"

        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
        ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true)
        ctx.closePath()
        ctx.fill()

        startAngle += sliceAngle
    })

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 24px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(total.toString(), centerX, centerY)
}

function drawLineChart(ctx: CanvasRenderingContext2D, data: ChartData, width: number, height: number) {
    const padding = 40
    const maxValue = Math.max(...data.datasets[0].data, 1)
    const stepX = (width - padding * 2) / (data.labels.length - 1)
    const scale = (height - padding * 2) / maxValue

    const points = data.datasets[0].data.map((value, i) => ({
        x: padding + i * stepX,
        y: height - padding - value * scale
    }))

    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.3)")
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)")

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.moveTo(points[0].x, height - padding)
    points.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.lineTo(points[points.length - 1].x, height - padding)
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.beginPath()
    points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
    })
    ctx.stroke()

    points.forEach(p => {
        ctx.fillStyle = "#3b82f6"
        ctx.beginPath()
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
        ctx.fill()
    })
}
