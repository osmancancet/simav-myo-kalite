"use client"

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from "chart.js"
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2"

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
)

const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: "#94a3b8"
            }
        }
    },
    scales: {
        x: {
            ticks: { color: "#94a3b8" },
            grid: { color: "#334155" }
        },
        y: {
            ticks: { color: "#94a3b8" },
            grid: { color: "#334155" }
        }
    }
}

interface BarChartProps {
    data: {
        labels: string[]
        datasets: {
            label: string
            data: number[]
            backgroundColor: string | string[]
            borderColor?: string | string[]
            borderWidth?: number
        }[]
    }
    options?: object
}

export function BarChart({ data, options = {} }: BarChartProps) {
    return (
        <div className="h-64">
            <Bar data={data} options={{ ...defaultOptions, ...options }} />
        </div>
    )
}

interface PieChartProps {
    data: {
        labels: string[]
        datasets: {
            data: number[]
            backgroundColor: string[]
            borderColor?: string[]
            borderWidth?: number
        }[]
    }
    options?: object
}

export function PieChart({ data, options = {} }: PieChartProps) {
    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: { color: "#94a3b8" }
            }
        },
        ...options
    }
    return (
        <div className="h-64">
            <Pie data={data} options={pieOptions} />
        </div>
    )
}

export function DoughnutChart({ data, options = {} }: PieChartProps) {
    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "right" as const,
                labels: { color: "#94a3b8" }
            }
        },
        cutout: "60%",
        ...options
    }
    return (
        <div className="h-64">
            <Doughnut data={data} options={doughnutOptions} />
        </div>
    )
}

interface LineChartProps {
    data: {
        labels: string[]
        datasets: {
            label: string
            data: number[]
            borderColor: string
            backgroundColor?: string
            fill?: boolean
            tension?: number
        }[]
    }
    options?: object
}

export function LineChart({ data, options = {} }: LineChartProps) {
    return (
        <div className="h-64">
            <Line data={data} options={{ ...defaultOptions, ...options }} />
        </div>
    )
}

// Stat card with mini chart
interface StatCardProps {
    title: string
    value: string | number
    change?: number
    trend?: number[]
    color?: string
}

export function StatCard({ title, value, change, trend, color = "#3b82f6" }: StatCardProps) {
    const trendData = trend ? {
        labels: trend.map((_, i) => i.toString()),
        datasets: [{
            data: trend,
            borderColor: color,
            backgroundColor: `${color}20`,
            fill: true,
            tension: 0.4,
            pointRadius: 0
        }]
    } : null

    const trendOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { display: false },
            y: { display: false }
        }
    }

    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-sm text-slate-400 mb-1">{title}</p>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    {change !== undefined && (
                        <p className={`text-xs ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {change >= 0 ? "+" : ""}{change}%
                        </p>
                    )}
                </div>
                {trendData && (
                    <div className="w-20 h-10">
                        <Line data={trendData} options={trendOptions} />
                    </div>
                )}
            </div>
        </div>
    )
}
