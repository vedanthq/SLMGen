# SLMGEN API Reference

Complete API documentation for the SLMGEN backend.

## Base URL

```
http://localhost:8000
```

## Authentication

Protected endpoints require a Supabase JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## Upload

### POST /upload

Upload a dataset file for processing.

**Request:**
```http
Content-Type: multipart/form-data

file: <JSONL file>
```

**Response:**
```json
{
  "session_id": "uuid",
  "filename": "dataset.jsonl",
  "size": 1024,
  "message": "Upload successful"
}
```

---

## Analysis

### GET /analyze/{session_id}

Analyze an uploaded dataset.

**Response:**
```json
{
  "session_id": "uuid",
  "total_examples": 1000,
  "total_tokens": 150000,
  "avg_tokens_per_example": 150,
  "quality_score": 0.85,
  "quality_issues": [],
  "format_valid": true
}
```

---

## Preview

### GET /preview/{session_id}

Get paginated dataset examples.

**Parameters:**
- `page` (int): Page number (default: 1)
- `page_size` (int): Examples per page (default: 5)

**Response:**
```json
{
  "examples": [
    {
      "index": 0,
      "messages": [
        {"role": "user", "content": "..."},
        {"role": "assistant", "content": "..."}
      ],
      "token_count": 150
    }
  ],
  "total_count": 1000,
  "page": 1,
  "page_size": 5
}
```

### GET /preview/{session_id}/distribution

Get field distribution statistics.

**Response:**
```json
{
  "roles": {"user": 1000, "assistant": 1000, "system": 100},
  "avg_message_length": 250.5,
  "token_distribution": {"0-100": 50, "100-500": 400, "500-1000": 350, "1000+": 200},
  "has_system_prompts": true,
  "multi_turn_percentage": 15.5
}
```

### GET /preview/{session_id}/duplicates

Check for duplicate examples.

**Response:**
```json
{
  "count": 5,
  "examples": [12, 45, 67, 89, 112]
}
```

---

## Recommendation

### POST /recommend

Get model recommendations based on dataset and requirements.

**Request:**
```json
{
  "session_id": "uuid",
  "task_type": "instruction_following",
  "deployment_target": "cloud"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "model_id": "phi-4-mini",
      "model_name": "Phi-4 Mini",
      "size": "3.8B",
      "score": 0.92,
      "reasons": ["Best for instruction tasks", "Fits your data size"],
      "is_gated": false
    }
  ]
}
```

---

## Generation

### POST /generate

Generate a fine-tuning notebook.

**Request:**
```json
{
  "session_id": "uuid",
  "model_id": "phi-4-mini",
  "training_config": {
    "lora_rank": 16,
    "learning_rate": 0.0002,
    "num_epochs": 3
  }
}
```

**Response:**
```json
{
  "notebook_path": "/path/to/notebook.ipynb",
  "colab_url": "https://colab.research.google.com/...",
  "download_url": "/download/notebook.ipynb"
}
```

---

## Jobs (Authenticated)

### GET /jobs

List user's jobs.

**Response:**
```json
[
  {
    "id": "uuid",
    "session_id": "uuid",
    "dataset_filename": "data.jsonl",
    "status": "completed",
    "created_at": "2026-01-19T00:00:00Z"
  }
]
```

### POST /jobs

Create a new job record.

### GET /jobs/{id}

Get job details.

### PATCH /jobs/{id}

Update job record.

### DELETE /jobs/{id}

Delete job and associated files.

---

## Health

### GET /

API info and health check.

### GET /health

Simple health check.

---

## Error Responses

```json
{
  "detail": "Error message"
}
```

**Status Codes:**
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
