#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Upload Router.

Handles file uploads and initial dataset processing.
"""
# Author: Eshan Roy <eshanized@proton.me>
# License: MIT License
# Copyright (c) 2026 Eshan Roy

import logging
import aiofiles
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException

from app.config import settings
from app.session import session_manager
from app.models import UploadResponse
from core import ingest_data, validate_quality

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
    """
    Upload a JSONL dataset for fine-tuning.
    
    The file should contain one JSON object per line with a "messages" array.
    Minimum 50 examples required.
    """
    # Check file Extension
    if not file.filename or not file.filename.lower().endswith(".jsonl"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a .jsonl file"
        )
    
    # Create session First
    session = session_manager.create()
    
    # Save file to disk
    file_path = Path(settings.upload_dir) / f"{session.id}.jsonl"
    
    try:
        async with aiofiles.open(file_path, "wb") as f:
            content = await file.read()
            await f.write(content)
        
        logger.info(f"Saved upload to {file_path}")
    except Exception as e:
        session_manager.delete(session.id)
        logger.error(f"Failed to save file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save file")
    
    # Parse and validate the Data
    data, stats, error = ingest_data(str(file_path))
    
    if error:
        # Cleanup on Error
        session_manager.delete(session.id)
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=error)
    
    # Run quality Checks
    quality_score, quality_issues = validate_quality(data)
    stats.quality_score = quality_score
    stats.quality_issues = quality_issues
    
    # Update Session
    session.file_path = str(file_path)
    session.original_filename = file.filename
    session.raw_data = data
    session.stats = stats
    session_manager.update(session)
    
    logger.info(f"Upload complete: session={session.id}, examples={stats.total_examples}")
    
    return UploadResponse(
        session_id=session.id,
        stats=stats,
        message=f"Dataset uploaded! Found {stats.total_examples} examples.",
    )
