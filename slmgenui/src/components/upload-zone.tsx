/**
 * Upload Zone Component.
 * 
 * Drag-and-drop file upload with validation feedback.
 * Everblush themed.
 * 
 * @author Eshan Roy <eshanized@proton.me>
 * @license MIT
 * @copyright 2026 Eshan Roy
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText } from '@/components/icons';
import type { DatasetStats } from '@/lib/types';
import { uploadDataset, ApiError } from '@/lib/api';

interface UploadZoneProps {
    onUpload: (sessionId: string, stats: DatasetStats) => void;
    onError: (error: string) => void;
}

export function UploadZone({ onUpload, onError }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file Selection
    const handleFile = useCallback(async (file: File) => {
        // Validate file Type
        if (!file.name.toLowerCase().endsWith('.jsonl')) {
            onError('Please upload a .jsonl file');
            return;
        }

        setFileName(file.name);
        setIsUploading(true);

        try {
            const response = await uploadDataset(file);
            onUpload(response.session_id, response.stats);
        } catch (error) {
            if (error instanceof ApiError) {
                onError(error.message);
            } else {
                onError('Failed to upload file. Is the backend running?');
            }
            setFileName(null);
        } finally {
            setIsUploading(false);
        }
    }, [onUpload, onError]);

    // Drag event handlers
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }, [handleFile]);

    // Click to Upload
    const handleClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    }, [handleFile]);

    return (
        <div
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`
                relative cursor-pointer rounded-2xl border-2 border-dashed p-12
                transition-all duration-300 ease-out
                ${isDragging
                    ? 'border-[#8ccf7e] bg-[#8ccf7e]/10 scale-[1.02]'
                    : 'border-[#2d3437] bg-[#1e2528]/50 hover:border-[#8ccf7e]/50 hover:bg-[#1e2528]/80'
                }
                ${isUploading ? 'pointer-events-none opacity-70' : ''}
            `}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".jsonl"
                onChange={handleInputChange}
                className="hidden"
            />

            <div className="flex flex-col items-center gap-4 text-center">
                {isUploading ? (
                    <>
                        {/* Loading spinner */}
                        <div className="w-16 h-16 border-4 border-[#8ccf7e] border-t-transparent rounded-full animate-spin" />
                        <p className="text-lg text-[#dadada]">Uploading {fileName}...</p>
                    </>
                ) : (
                    <>
                        {/* Upload icon */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8ccf7e] to-[#6cbfbf] flex items-center justify-center shadow-lg shadow-[#8ccf7e]/20">
                            <Upload className="w-10 h-10 text-[#141b1e]" />
                        </div>

                        <div>
                            <p className="text-xl font-semibold text-[#dadada]">
                                Drop your JSONL file here
                            </p>
                            <p className="text-[#8a9899] mt-1">
                                or click to browse
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[#8a9899]">
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-[#1e2528] rounded-md border border-[#2d3437]">
                                <FileText className="w-4 h-4" />
                                <span className="font-mono">.jsonl</span>
                            </span>
                            <span>Minimum 50 examples</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
