#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Core Processing Package.

Contains data processing, analysis, and notebook generation logic.
"""
# Author: Eshan Roy <eshanized@proton.me>
# License: MIT License
# Copyright (c) 2026 Eshan Roy

from .ingest import ingest_data
from .quality import validate_quality
from .analyzer import analyze_dataset
from .recommender import get_recommendations
from .notebook import generate_notebook

__all__ = [
    "ingest_data",
    "validate_quality",
    "analyze_dataset",
    "get_recommendations",
    "generate_notebook",
]
