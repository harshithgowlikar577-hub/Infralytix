from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas import UserCreate, UserLogin, TokenResponse, UserOut, RefreshTokenRequest
from backend.app.services.auth_service import AuthService, get_current_user
from backend.app.models import User

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new government officer, project manager, or analyst.
    """
    user = AuthService.register_user(db, user_in)
    role_name = user.role.name if user.role else "ProjectManager"
    return UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        ministry=user.ministry,
        role=role_name,
        is_active=user.is_active,
        created_at=user.created_at
    )

@router.post("/login", response_model=TokenResponse)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user credentials and obtain JWT access token with RBAC claims.
    """
    return AuthService.authenticate_user(db, credentials)

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Refresh an expired or expiring JWT access token using a valid refresh token.
    """
    return AuthService.refresh_access_token(db, payload.refresh_token)


@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get profile information and departmental scope of the currently authenticated user.
    """
    role_name = current_user.role.name if current_user.role else "PublicViewer"
    return UserOut(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        ministry=current_user.ministry,
        role=role_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        last_login_at=current_user.last_login_at
    )
