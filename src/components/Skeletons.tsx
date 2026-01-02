"use client"

export function CardSkeleton() {
    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-700 rounded-xl" />
                <div className="flex-1">
                    <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-700/50 rounded w-1/2" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-slate-700/50 rounded w-full" />
                <div className="h-3 bg-slate-700/50 rounded w-5/6" />
            </div>
        </div>
    )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden animate-pulse">
            <div className="bg-slate-700/30 px-4 py-3 flex gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-4 bg-slate-600 rounded flex-1" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="px-4 py-3 flex gap-4 border-t border-slate-700/50">
                    {[1, 2, 3, 4].map(j => (
                        <div key={j} className="h-4 bg-slate-700/50 rounded flex-1" />
                    ))}
                </div>
            ))}
        </div>
    )
}

export function StatSkeleton() {
    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 animate-pulse">
            <div className="h-3 bg-slate-700/50 rounded w-1/2 mb-2" />
            <div className="h-8 bg-slate-700 rounded w-1/3" />
        </div>
    )
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <StatSkeleton key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CardSkeleton />
                <CardSkeleton />
            </div>
            <TableSkeleton rows={5} />
        </div>
    )
}

export function CourseSkeleton() {
    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 animate-pulse">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-slate-700 rounded-2xl" />
                <div className="flex-1">
                    <div className="h-6 bg-slate-700 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-slate-700/50 rounded w-1/2" />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-slate-700/30 rounded-xl p-4">
                        <div className="h-8 bg-slate-700 rounded w-1/2 mx-auto mb-2" />
                        <div className="h-3 bg-slate-700/50 rounded w-3/4 mx-auto" />
                    </div>
                ))}
            </div>
        </div>
    )
}
