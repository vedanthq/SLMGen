/**
 * Job Card Component.
 * 
 * Displays a summary of a fine-tuning job with quick actions.
 * 
 * @author Eshan Roy <eshanized@proton.me>
 * @license MIT
 * @copyright 2026 Eshan Roy
 */

'use client'

import { useState } from 'react'
import {
    FileText,
    Clock,
    Download,
    Trash2,
    ExternalLink,
    Cpu,
    Database,
    Target,
    Loader2,
    Check,
    AlertCircle
} from '@/components/icons'

interface Job {
    id: string
    session_id: string
    dataset_filename: string
    total_examples: number
    total_tokens: number
    quality_score: number
    task_type: string
    deployment_target: string
    selected_model_name: string
    model_score: number
    notebook_filename?: string
    colab_url?: string
    status: string
    created_at: string
}

interface JobCardProps {
    job: Job
    onDelete?: (id: string) => Promise<void>
}

const STATUS_STYLES = {
    created: { bg: 'bg-[#67b0e8]/10', text: 'text-[#67b0e8]', label: 'Created' },
    processing: { bg: 'bg-[#e5c76b]/10', text: 'text-[#e5c76b]', label: 'Processing' },
    completed: { bg: 'bg-[#8ccf7e]/10', text: 'text-[#8ccf7e]', label: 'Completed' },
    failed: { bg: 'bg-[#e57474]/10', text: 'text-[#e57474]', label: 'Failed' },
}

export function JobCard({ job, onDelete }: JobCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const status = STATUS_STYLES[job.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.created
    const createdDate = new Date(job.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })

    const handleDelete = async () => {
        if (!onDelete || isDeleting) return

        if (!confirm('Are you sure you want to delete this job?')) return

        setIsDeleting(true)
        try {
            await onDelete(job.id)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="bg-[#1e2528] border border-[#2d3437] rounded-xl p-5 hover:border-[#8ccf7e]/30 transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#141b1e] flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#8ccf7e]" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[#dadada] truncate max-w-[200px]">
                            {job.dataset_filename}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-[#8a9899]">
                            <Clock className="w-3 h-3" />
                            {createdDate}
                        </div>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${status.bg} ${status.text}`}>
                    {status.label}
                </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                    <Database className="w-4 h-4 text-[#8a9899]" />
                    <span className="text-[#8a9899]">{job.total_examples.toLocaleString()} examples</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Cpu className="w-4 h-4 text-[#8a9899]" />
                    <span className="text-[#8a9899]">{job.selected_model_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-[#8a9899]" />
                    <span className="text-[#8a9899] capitalize">{job.task_type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    {job.quality_score >= 0.8 ? (
                        <Check className="w-4 h-4 text-[#8ccf7e]" />
                    ) : (
                        <AlertCircle className="w-4 h-4 text-[#e5c76b]" />
                    )}
                    <span className="text-[#8a9899]">{Math.round(job.quality_score * 100)}% quality</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-[#2d3437]">
                {job.colab_url && (
                    <a
                        href={job.colab_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141b1e] rounded-lg text-sm text-[#dadada] hover:bg-[#8ccf7e]/10 hover:text-[#8ccf7e] transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Open in Colab
                    </a>
                )}
                {job.notebook_filename && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141b1e] rounded-lg text-sm text-[#dadada] hover:bg-[#67b0e8]/10 hover:text-[#67b0e8] transition-colors">
                        <Download className="w-4 h-4" />
                        Download
                    </button>
                )}
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#8a9899] hover:bg-[#e57474]/10 hover:text-[#e57474] transition-colors disabled:opacity-50"
                >
                    {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Trash2 className="w-4 h-4" />
                    )}
                </button>
            </div>
        </div>
    )
}
