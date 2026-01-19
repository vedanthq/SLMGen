/**
 * Supabase Database Types.
 * 
 * Type definitions for database tables.
 * Generate with: npx supabase gen types typescript --project-id <project-id>
 * 
 * @author Eshan Roy <eshanized@proton.me>
 * @license MIT
 * @copyright 2026 Eshan Roy
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    bio: string | null
                    notifications_enabled: boolean
                    theme: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    notifications_enabled?: boolean
                    theme?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    notifications_enabled?: boolean
                    theme?: string
                    updated_at?: string
                }
            }
            jobs: {
                Row: {
                    id: string
                    user_id: string
                    session_id: string
                    dataset_filename: string
                    dataset_path: string
                    total_examples: number
                    total_tokens: number
                    quality_score: number
                    task_type: string
                    deployment_target: string
                    selected_model_id: string
                    selected_model_name: string
                    model_score: number
                    training_config: Json
                    notebook_filename: string | null
                    notebook_path: string | null
                    colab_url: string | null
                    status: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    session_id: string
                    dataset_filename: string
                    dataset_path: string
                    total_examples: number
                    total_tokens: number
                    quality_score: number
                    task_type: string
                    deployment_target: string
                    selected_model_id: string
                    selected_model_name: string
                    model_score: number
                    training_config?: Json
                    notebook_filename?: string | null
                    notebook_path?: string | null
                    colab_url?: string | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    notebook_filename?: string | null
                    notebook_path?: string | null
                    colab_url?: string | null
                    status?: string
                    updated_at?: string
                }
            }
            datasets: {
                Row: {
                    id: string
                    user_id: string
                    job_id: string | null
                    filename: string
                    storage_path: string
                    file_size: number
                    total_examples: number | null
                    total_tokens: number | null
                    avg_tokens_per_example: number | null
                    quality_score: number | null
                    single_turn_pct: number | null
                    multi_turn_pct: number | null
                    has_system_prompts: boolean
                    quality_issues: Json
                    is_multilingual: boolean
                    looks_like_json: boolean
                    is_multi_turn: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    job_id?: string | null
                    filename: string
                    storage_path: string
                    file_size: number
                    total_examples?: number | null
                    total_tokens?: number | null
                    avg_tokens_per_example?: number | null
                    quality_score?: number | null
                    single_turn_pct?: number | null
                    multi_turn_pct?: number | null
                    has_system_prompts?: boolean
                    quality_issues?: Json
                    is_multilingual?: boolean
                    looks_like_json?: boolean
                    is_multi_turn?: boolean
                    created_at?: string
                }
                Update: {
                    job_id?: string | null
                    total_examples?: number | null
                    total_tokens?: number | null
                    avg_tokens_per_example?: number | null
                    quality_score?: number | null
                }
            }
            training_configs: {
                Row: {
                    id: string
                    user_id: string | null
                    name: string
                    is_default: boolean
                    is_system: boolean
                    lora_rank: number
                    lora_alpha: number
                    lora_dropout: number
                    learning_rate: number
                    num_epochs: number
                    batch_size: number
                    gradient_accumulation_steps: number
                    warmup_ratio: number
                    max_seq_length: number
                    optimizer: string
                    scheduler: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    name: string
                    is_default?: boolean
                    is_system?: boolean
                    lora_rank?: number
                    lora_alpha?: number
                    lora_dropout?: number
                    learning_rate?: number
                    num_epochs?: number
                    batch_size?: number
                    gradient_accumulation_steps?: number
                    warmup_ratio?: number
                    max_seq_length?: number
                    optimizer?: string
                    scheduler?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    name?: string
                    is_default?: boolean
                    lora_rank?: number
                    lora_alpha?: number
                    lora_dropout?: number
                    learning_rate?: number
                    num_epochs?: number
                    batch_size?: number
                    gradient_accumulation_steps?: number
                    warmup_ratio?: number
                    max_seq_length?: number
                    optimizer?: string
                    scheduler?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Job = Database['public']['Tables']['jobs']['Row']
export type Dataset = Database['public']['Tables']['datasets']['Row']
export type TrainingConfig = Database['public']['Tables']['training_configs']['Row']
