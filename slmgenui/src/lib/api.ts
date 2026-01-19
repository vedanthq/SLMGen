/**
 * API client for SLMGEN backend.
 * 
 * Handles all communication with the FastAPI backend.
 * 
 * @author Eshan Roy <eshanized@proton.me>
 * @license MIT
 * @copyright 2026 Eshan Roy
 */

import type {
    UploadResponse,
    AnalyzeResponse,
    RecommendationResponse,
    NotebookResponse,
    TaskType,
    DeploymentTarget,
} from './types';

// Backend URL - can be overridden with env var
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Custom error class for API Errors.
 */
export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Helper to make API Requests.
 */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Accept': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            // Try to get error message from Response
            let errorMessage = `Request failed with status ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                }
            } catch {
                // couldn't parse JSON, use default
            }
            throw new ApiError(response.status, errorMessage);
        }

        return response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Network error or something
        throw new ApiError(0, 'Failed to connect to server. Is the backend running?');
    }
}

/**
 * Upload a JSONL dataset File.
 */
export async function uploadDataset(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest<UploadResponse>('/upload', {
        method: 'POST',
        body: formData,
    });
}

/**
 * Get detailed analysis for a Session.
 */
export async function analyzeDataset(sessionId: string): Promise<AnalyzeResponse> {
    return apiRequest<AnalyzeResponse>('/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
    });
}

/**
 * Get model recommendations for a Session.
 */
export async function getRecommendation(
    sessionId: string,
    task: TaskType,
    deployment: DeploymentTarget
): Promise<RecommendationResponse> {
    return apiRequest<RecommendationResponse>('/recommend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            session_id: sessionId,
            task: task,
            deployment: deployment,
        }),
    });
}

/**
 * Generate a training Notebook.
 */
export async function generateNotebook(
    sessionId: string,
    modelId?: string
): Promise<NotebookResponse> {
    return apiRequest<NotebookResponse>('/generate-notebook', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            session_id: sessionId,
            model_id: modelId || null,
        }),
    });
}

/**
 * Get the download URL for a Notebook.
 */
export function getDownloadUrl(sessionId: string): string {
    return `${API_URL}/download/${sessionId}`;
}

/**
 * Health check to verify backend Connection.
 */
export async function healthCheck(): Promise<boolean> {
    try {
        await apiRequest<{ status: string }>('/health');
        return true;
    } catch {
        return false;
    }
}
