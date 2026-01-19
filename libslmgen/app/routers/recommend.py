#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Recommend Router.

Returns model recommendations based on task and deployment target.
"""
# Author: Eshan Roy <eshanized@proton.me>
# License: MIT License
# Copyright (c) 2026 Eshan Roy

import logging
from fastapi import APIRouter, HTTPException

from app.session import session_manager
from app.models import RecommendRequest, RecommendationResponse
from core import analyze_dataset, get_recommendations, ingest_data

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/recommend", response_model=RecommendationResponse)
async def get_model_recommendation(request: RecommendRequest):
    """
    Get model recommendations based on task, deployment, and dataset.
    
    Returns a primary recommendation and alternatives with scores.
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
    
    # Get or compute Characteristics
    characteristics = session.characteristics
    if characteristics is None:
        # Need to Analyze first
        data = session.raw_data
        if not data and session.file_path:
            data, _, error = ingest_data(session.file_path)
            if error:
                raise HTTPException(status_code=500, detail=f"Failed to reload data: {error}")
        
        if not data:
            raise HTTPException(status_code=400, detail="No data available.")
        
        characteristics = analyze_dataset(data)
        session.characteristics = characteristics
    
    # Save user Selections
    session.task_type = request.task
    session.deployment_target = request.deployment
    session_manager.update(session)
    
    # Get Recommendations
    recommendations = get_recommendations(
        task=request.task,
        deployment=request.deployment,
        stats=session.stats,
        characteristics=characteristics,
    )
    
    # Store the primary recommendation
    session.selected_model_id = recommendations.primary.model_id
    session_manager.update(session)
    
    logger.info(f"Recommended {recommendations.primary.model_name} for session {session.id}")
    
    return recommendations
