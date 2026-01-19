"""
Middleware Package.

Authentication and request processing middleware.
"""
# Author: Eshan Roy <eshanized@proton.me>
# License: MIT License

from .auth import (
    AuthenticatedUser,
    AnonymousUser,
    get_current_user,
    get_optional_user,
    require_role,
    verify_jwt,
)

__all__ = [
    "AuthenticatedUser",
    "AnonymousUser", 
    "get_current_user",
    "get_optional_user",
    "require_role",
    "verify_jwt",
]
