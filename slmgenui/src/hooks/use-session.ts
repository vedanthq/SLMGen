/**
 * Session management hook.
 * 
 * Stores session state across the wizard steps.
 * 
 * @author Eshan Roy <eshanized@proton.me>
 * @license MIT
 * @copyright 2026 Eshan Roy
 */

'use client';

import { useState, useCallback } from 'react';
import type {
    WizardStep,
    DatasetStats,
    TaskType,
    DeploymentTarget,
    RecommendationResponse,
    NotebookResponse,
} from '@/lib/types';

export interface SessionState {
    sessionId: string | null;
    stats: DatasetStats | null;
    task: TaskType | null;
    deployment: DeploymentTarget | null;
    recommendation: RecommendationResponse | null;
    notebook: NotebookResponse | null;
    currentStep: WizardStep;
}

const initialState: SessionState = {
    sessionId: null,
    stats: null,
    task: null,
    deployment: null,
    recommendation: null,
    notebook: null,
    currentStep: 'upload',
};

export function useSession() {
    const [state, setState] = useState<SessionState>(initialState);

    // Set session after Upload
    const setSession = useCallback((sessionId: string, stats: DatasetStats) => {
        setState(prev => ({
            ...prev,
            sessionId,
            stats,
            currentStep: 'configure',
        }));
    }, []);

    // Set task Type
    const setTask = useCallback((task: TaskType) => {
        setState(prev => ({ ...prev, task }));
    }, []);

    // Set deployment Target
    const setDeployment = useCallback((deployment: DeploymentTarget) => {
        setState(prev => ({ ...prev, deployment }));
    }, []);

    // Set Recommendation
    const setRecommendation = useCallback((recommendation: RecommendationResponse) => {
        setState(prev => ({
            ...prev,
            recommendation,
            currentStep: 'recommend',
        }));
    }, []);

    // Set generated Notebook
    const setNotebook = useCallback((notebook: NotebookResponse) => {
        setState(prev => ({
            ...prev,
            notebook,
            currentStep: 'generate',
        }));
    }, []);

    // Go to specific Step
    const goToStep = useCallback((step: WizardStep) => {
        setState(prev => ({ ...prev, currentStep: step }));
    }, []);

    // Reset Everything
    const reset = useCallback(() => {
        setState(initialState);
    }, []);

    // Check if we can proceed from configure
    const canProceedFromConfigure = state.task !== null && state.deployment !== null;

    return {
        ...state,
        setSession,
        setTask,
        setDeployment,
        setRecommendation,
        setNotebook,
        goToStep,
        reset,
        canProceedFromConfigure,
    };
}
