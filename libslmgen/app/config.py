#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Application Configuration.

Handles env vars and settings for the SLMGEN backend.
"""
# Author: Eshan Roy <eshanized@proton.me>
# License: MIT License
# Copyright (c) 2026 Eshan Roy

from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """App configuration loaded from Environment."""
    
    # CORS settings - where the frontend Lives
    # Comma-separated list of allowed origins
    allowed_origins: str = "http://localhost:3000,https://slmgen.vercel.app"
    
    # File storage stuff
    upload_dir: str = "./uploads"
    
    # Optional GitHub token for Gist creation
    # Leave empty if you don't want automatic Colab links
    github_token: str = ""
    
    # Session management
    max_sessions: int = 25
    session_ttl_minutes: int = 30
    
    # Security settings
    max_upload_bytes: int = 100 * 1024 * 1024  # 100 MB
    rate_limit_per_minute: int = 60  # General rate limit
    upload_rate_limit_per_minute: int = 10  # Stricter for uploads
    download_token_ttl_minutes: int = 60  # Download token validity
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # ignore extra env Vars


# Global settings Instance
settings = Settings()

# Make sure upload directory Exists
Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
