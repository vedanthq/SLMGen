#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Analyze Router.

Returns detailed dataset characteristics for model selection.
"""
# Author: Eshan Roy <eshanized@proton.me>
# License: MIT License
# Copyright (c) 2026 Eshan Roy

import logging
from fastapi import APIRouter, HTTPException

from app.session import session_manager
from app.models import AnalyzeRequest, AnalyzeResponse
from core import analyze_dataset, ingest_data

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_session(request: AnalyzeRequest):
    """
    Analyze an uploaded dataset and return characteristics.
    
    This extracts features like: multilingual, JSON output patterns,
    multi-turn conversations, etc. which help with model selection.
    """
    session = session_manager.get(request.session_id)
    
    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found or expired. Please upload again."
        )
    
    if session.stats is None:
        raise HTTPException(
            status_code=400,
            detail="Dataset not processed yet."
        )
    
    # If we already have characteristics cached, return Them
    if session.characteristics is not None:
        return AnalyzeResponse(
            session_id=session.id,
            stats=session.stats,
            characteristics=session.characteristics,
        )
    
    # Need to reload data if it was Cleared
    data = session.raw_data
    if not data and session.file_path:
        # Reload from File
        data, _, error = ingest_data(session.file_path)
        if error:
            raise HTTPException(status_code=500, detail=f"Failed to reload data: {error}")
    
    if not data:
        raise HTTPException(
            status_code=400,
            detail="No data available for analysis."
        )
    
    # Run Analysis
    characteristics = analyze_dataset(data)
    
    # Cache it in Session
    session.characteristics = characteristics
    session_manager.update(session)
    
    logger.info(f"Analyzed session {session.id}")
    
    return AnalyzeResponse(
        session_id=session.id,
        stats=session.stats,
        characteristics=characteristics,
    )
