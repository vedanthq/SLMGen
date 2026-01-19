/**
 * Model Comparison Component.
 * 
 * Side-by-side comparison of recommended models with score breakdowns.
 * 
 * @author Eshan Roy <eshanized@proton.me>
 * @license MIT
 * @copyright 2026 Eshan Roy
 */

'use client'

import { useState } from 'react'
import {
    Star,
    Cpu,
    Clock,
    Target,
    ChevronRight,
    Check,
    Lock
} from '@/components/icons'

interface ModelScore {
    task_fit: number
    deploy_fit: number
    data_fit: number
    overall: number
}

interface Model {
    id: string
    name: string
    size: string
    vram_gb: number
    training_time_min: number
    score: ModelScore
    reasons: string[]
    is_gated: boolean
}

interface ModelComparisonProps {
    models: Model[]
    selectedId?: string
    onSelect: (id: string) => void
}

export function ModelComparison({ models, selectedId, onSelect }: ModelComparisonProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null)

    // Sort by overall score
    const sortedModels = [...models].sort((a, b) => b.score.overall - a.score.overall)
    const topModels = sortedModels.slice(0, 3)

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 text-[#dadada]">
                <Target className="w-5 h-5 text-[#8ccf7e]" />
                <span className="font-medium">Model Comparison</span>
                <span className="text-sm text-[#8a9899]">
                    (Top {topModels.length} recommendations)
                </span>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topModels.map((model, idx) => {
                    const isSelected = model.id === selectedId
                    const isExpanded = model.id === expandedId
                    const isBest = idx === 0

                    return (
                        <div
                            key={model.id}
                            className={`relative bg-[#1e2528] border rounded-xl overflow-hidden transition-all ${isSelected
                                ? 'border-[#8ccf7e] ring-1 ring-[#8ccf7e]/30'
                                : 'border-[#2d3437] hover:border-[#8ccf7e]/50'
                                }`}
                        >
                            {/* Best Match Badge */}
                            {isBest && (
                                <div className="absolute top-0 right-0 bg-gradient-to-l from-[#e5c76b] to-[#e5c76b]/0 px-3 py-1">
                                    <div className="flex items-center gap-1 text-xs font-medium text-[#141b1e]">
                                        <Star className="w-3 h-3" />
                                        Best
                                    </div>
                                </div>
                            )}

                            {/* Model Header */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold text-[#dadada] flex items-center gap-2">
                                            {model.name}
                                            {model.is_gated && (
                                                <Lock className="w-3 h-3 text-[#8a9899]" />
                                            )}
                                        </h4>
                                        <p className="text-sm text-[#8a9899]">{model.size} params</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-[#8ccf7e]">
                                            {Math.round(model.score.overall * 100)}
                                        </div>
                                        <div className="text-xs text-[#8a9899]">score</div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="flex items-center gap-2 text-xs text-[#8a9899]">
                                        <Cpu className="w-3.5 h-3.5" />
                                        {model.vram_gb}GB VRAM
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-[#8a9899]">
                                        <Clock className="w-3.5 h-3.5" />
                                        ~{model.training_time_min}min
                                    </div>
                                </div>

                                {/* Score Breakdown Bar */}
                                <div className="space-y-1.5">
                                    <ScoreBar label="Task Fit" value={model.score.task_fit} color="#67b0e8" />
                                    <ScoreBar label="Deploy Fit" value={model.score.deploy_fit} color="#8ccf7e" />
                                    <ScoreBar label="Data Fit" value={model.score.data_fit} color="#c47fd5" />
                                </div>

                                {/* Expand/Collapse Reasons */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : model.id)}
                                    className="flex items-center gap-1 mt-3 text-xs text-[#8a9899] hover:text-[#dadada] transition-colors"
                                >
                                    <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                    Why this model?
                                </button>

                                {isExpanded && (
                                    <ul className="mt-2 space-y-1 text-xs text-[#8a9899] animate-in slide-in-from-top-2">
                                        {model.reasons.map((reason, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <Check className="w-3 h-3 text-[#8ccf7e] mt-0.5 flex-shrink-0" />
                                                {reason}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Select Button */}
                            <button
                                onClick={() => onSelect(model.id)}
                                className={`w-full py-3 text-sm font-medium transition-colors ${isSelected
                                    ? 'bg-[#8ccf7e] text-[#141b1e]'
                                    : 'bg-[#141b1e] text-[#dadada] hover:bg-[#8ccf7e]/10 hover:text-[#8ccf7e]'
                                    }`}
                            >
                                {isSelected ? 'Selected' : 'Select Model'}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// Score bar subcomponent
function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
    const percentage = Math.round(value * 100)

    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="w-16 text-[#8a9899]">{label}</span>
            <div className="flex-1 h-1.5 bg-[#141b1e] rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                />
            </div>
            <span className="w-8 text-right text-[#8a9899]">{percentage}%</span>
        </div>
    )
}
