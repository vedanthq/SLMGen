#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JSONL Data Ingestion.

Parses and validates uploaded JSONL files with conversation format.
We're pretty strict here - bad data = bad models.
"""
# Author: Eshan Roy <eshanized@proton.me>
# License: MIT License
# Copyright (c) 2026 Eshan Roy

import json
import logging
from pathlib import Path
from typing import Optional

from app.models import DatasetStats

logger = logging.getLogger(__name__)

# Minimum examples needed for Fine-tuning
MIN_EXAMPLES = 50


def _estimate_tokens(text: str) -> int:
    """
    Rough token estimation - approximately 4 characters per token.
    
    FIX: B2 - Documentation transparency
    NOTE: This is a heuristic approximation. Actual token counts vary by:
    - Tokenizer used (GPT, Llama, etc. have different tokenizers)
    - Language (non-Latin scripts like CJK may have 1-2 chars/token)
    - Content type (code has different tokenization than prose)
    
    For multilingual or code-heavy datasets, actual token counts 
    may be 2-3x higher than this estimate.
    """
    return max(1, len(text) // 4)


def _validate_message(msg: dict) -> tuple[bool, str]:
    """Check if a single message is Valid."""
    if not isinstance(msg, dict):
        return False, "message must be a Dict"
    
    role = msg.get("role")
    content = msg.get("content")
    
    if role not in ("user", "assistant", "system"):
        return False, f"invalid role: {role}"
    
    if not isinstance(content, str):
        return False, "content must be a String"
    
    return True, ""


def _validate_conversation(entry: dict, idx: int) -> tuple[bool, str]:
    """Validate a single conversation Entry."""
    if not isinstance(entry, dict):
        return False, f"Line {idx}: must be a JSON object"
    
    messages = entry.get("messages")
    if not isinstance(messages, list):
        return False, f"Line {idx}: missing or invalid 'messages' array"
    
    if len(messages) < 2:
        return False, f"Line {idx}: need at least 2 messages (got {len(messages)})"
    
    # Check each Message
    has_user = False
    has_assistant = False
    
    for i, msg in enumerate(messages):
        valid, err = _validate_message(msg)
        if not valid:
            return False, f"Line {idx}, message {i}: {err}"
        
        if msg.get("role") == "user":
            has_user = True
        elif msg.get("role") == "assistant":
            has_assistant = True
    
    if not has_user:
        return False, f"Line {idx}: must have at least one user message"
    if not has_assistant:
        return False, f"Line {idx}: must have at least one assistant message"
    
    return True, ""


def ingest_data(file_path: str) -> tuple[list[dict], Optional[DatasetStats], Optional[str]]:
    """
    Parse and validate a JSONL file.
    
    Expected format per Line:
    {"messages": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
    
    Returns:
        - raw_data: List of valid conversation Dicts
        - stats: DatasetStats if successful, None on Error
        - error: Error message if failed, None on Success
    """
    path = Path(file_path)
    
    if not path.exists():
        return [], None, f"File not found: {file_path}"
    
    if not path.suffix.lower() == ".jsonl":
        return [], None, "File must have .jsonl extension"
    
    data: list[dict] = []
    errors: list[str] = []
    
    # Stats tracking
    total_tokens = 0
    single_turn = 0
    multi_turn = 0
    has_system = False
    
    logger.info(f"Starting ingestion: {file_path}")
    
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line_num, line in enumerate(f, start=1):
                line = line.strip()
                if not line:
                    continue  # skip empty Lines
                
                # Parse JSON
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError as e:
                    errors.append(f"Line {line_num}: Invalid JSON - {e}")
                    continue
                
                # Validate structure
                valid, err = _validate_conversation(entry, line_num)
                if not valid:
                    errors.append(err)
                    continue
                
                # Good entry - collect Stats
                messages = entry["messages"]
                data.append(entry)
                
                # Count tokens across all Messages
                for msg in messages:
                    total_tokens += _estimate_tokens(msg.get("content", ""))
                    if msg.get("role") == "system":
                        has_system = True
                
                # Single vs multi-turn (excluding system)
                non_system = [m for m in messages if m.get("role") != "system"]
                if len(non_system) == 2:
                    single_turn += 1
                else:
                    multi_turn += 1
    
    except Exception as e:
        logger.error(f"Failed to read file: {e}")
        return [], None, f"Failed to read file: {e}"
    
    # Check minimum Examples
    if len(data) < MIN_EXAMPLES:
        return [], None, (
            f"Need at least {MIN_EXAMPLES} examples for fine-tuning. "
            f"You only have {len(data)}. Maybe try adding more data?"
        )
    
    # Log any validation Errors we found
    if errors:
        logger.warning(f"Found {len(errors)} validation issues")
        for err in errors[:5]:  # just show first 5
            logger.warning(f"  - {err}")
    
    # Calculate Stats
    total = len(data)
    single_pct = int((single_turn / total) * 100) if total > 0 else 0
    multi_pct = 100 - single_pct
    avg_tokens = total_tokens // total if total > 0 else 0
    
    # Quality score will be computed Later by quality module
    stats = DatasetStats(
        total_examples=total,
        total_tokens=total_tokens,
        avg_tokens_per_example=avg_tokens,
        single_turn_pct=single_pct,
        multi_turn_pct=multi_pct,
        has_system_prompts=has_system,
        quality_score=1.0,  # placeholder, filled in by quality.py
        quality_issues=[],
    )
    
    logger.info(f"Ingested {total} examples, {total_tokens} tokens")
    
    return data, stats, None
