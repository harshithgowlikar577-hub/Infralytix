from datetime import datetime, timezone
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models import User, Role, AuditLog
from backend.app.core.security import verify_password, hash_password, create_access_token, create_refresh_token, decode_token
from backend.app.core.exceptions import UnauthorizedException, ForbiddenException
from backend.app.schemas import UserCreate, UserLogin, TokenResponse, UserOut

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> User:
        existing = db.query(User).filter(User.email == user_in.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Get or create Role
        role = db.query(Role).filter(Role.name == user_in.role).first()
        if not role:
            role = Role(name=user_in.role, description=f"Default role for {user_in.role}")
            db.add(role)
            db.commit()
            db.refresh(role)

        new_user = User(
            email=user_in.email,
            hashed_password=hash_password(user_in.password),
            full_name=user_in.full_name,
            role_id=role.id,
            ministry=user_in.ministry,
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def authenticate_user(db: Session, credentials: UserLogin) -> TokenResponse:
        user = db.query(User).filter(User.email == credentials.email).first()
        if not user or not verify_password(credentials.password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password.")
        if not user.is_active:
            raise UnauthorizedException("User account is inactive.")

        user.last_login_at = datetime.now(timezone.utc)
        db.commit()

        role_name = user.role.name if user.role else "ProjectManager"
        access_token = create_access_token(subject=user.id, role=role_name)
        refresh_token = create_refresh_token(subject=user.id, role=role_name)

        user_out = UserOut(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            ministry=user.ministry,
            role=role_name,
            is_active=user.is_active,
            created_at=user.created_at,
            last_login_at=user.last_login_at
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=86400,
            user=user_out
        )

    @staticmethod
    def refresh_access_token(db: Session, refresh_token_str: str) -> TokenResponse:
        payload = decode_token(refresh_token_str)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid or expired refresh token.")

        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
        if not user or not user.is_active:
            raise UnauthorizedException("User inactive or no longer exists.")

        role_name = user.role.name if user.role else "ProjectManager"
        new_access_token = create_access_token(subject=user.id, role=role_name)
        new_refresh_token = create_refresh_token(subject=user.id, role=role_name)

        user_out = UserOut(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            ministry=user.ministry,
            role=role_name,
            is_active=user.is_active,
            created_at=user.created_at,
            last_login_at=user.last_login_at
        )

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=86400,
            user=user_out
        )


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_token(token)
    if not payload:
        raise UnauthorizedException("Could not validate credentials.")
    user_id: str = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Invalid token subject.")
    
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        raise UnauthorizedException("User not found.")
    return user

def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = current_user.role.name if current_user.role else "PublicViewer"
        if user_role == "SuperAdmin" or user_role in allowed_roles:
            return current_user
        raise ForbiddenException(f"Operation requires one of roles: {allowed_roles}")
    return role_checker
