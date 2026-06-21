from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.services.db import get_db
from app.models.schemas import UserRegister, UserLogin, UserResponse
from app.utils.helpers import (
    validate_password_strength,
    hash_password,
    verify_password,
    create_jwt_token,
    get_current_user_payload
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

async def init_test_users():
    db = get_db()
    test_users = [
        {"email": "fresh@eximarg.com", "password": "Fresh@123", "role": "exporter"},
        {"email": "admin@eximarg.com", "password": "Admin@123", "role": "admin"},
        {"email": "provider@eximarg.com", "password": "Provider@123", "role": "service_provider"}
    ]
    for u in test_users:
        exists = await db.users.find_one({"email": u["email"]})
        if not exists:
            hashed = hash_password(u["password"])
            await db.users.insert_one({
                "email": u["email"],
                "password_hash": hashed,
                "role": u["role"],
                "level": 1,
                "xp": 0,
                "readiness_score": 0.0,
                "badges": [],
                "subscription": None,
                "products_locked": False,
                "levels_locked": False,
                "level_1_identity": None,
                "level_2_exporter": None,
                "level_3_verification": None,
                "level_4_company": None,
                "level_5_subscription": None,
                "level_6_catalog": None
            })

@router.post("/register")
async def register(payload: UserRegister):
    db = get_db()
    if not validate_password_strength(payload.password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, and a number."
        )
    
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    hashed = hash_password(payload.password)
    user_doc = {
        "email": payload.email,
        "password_hash": hashed,
        "role": "exporter",
        "level": 1,
        "xp": 0,
        "readiness_score": 0.0,
        "badges": [],
        "subscription": None,
        "products_locked": False,
        "levels_locked": False,
        "level_1_identity": None,
        "level_2_exporter": None,
        "level_3_verification": None,
        "level_4_company": None,
        "level_5_subscription": None,
        "level_6_catalog": None
    }
    
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    token = create_jwt_token(user_id, payload.email, "exporter")
    return {"token": token, "user_id": user_id}

@router.post("/login")
async def login(payload: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    token = create_jwt_token(str(user["_id"]), user["email"], user["role"])
    return {"token": token, "user_id": str(user["_id"])}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user_payload)):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(current_user["sub"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        role=user["role"],
        level=user.get("level", 1),
        xp=user.get("xp", 0),
        readiness_score=user.get("readiness_score", 0.0),
        badges=user.get("badges", []),
        subscription=user.get("subscription"),
        products_locked=user.get("products_locked", False),
        levels_locked=user.get("levels_locked", False),
        level_1_identity=user.get("level_1_identity"),
        level_2_exporter=user.get("level_2_exporter"),
        level_3_verification=user.get("level_3_verification"),
        level_4_company=user.get("level_4_company"),
        level_5_subscription=user.get("level_5_subscription"),
        level_6_catalog=user.get("level_6_catalog")
    )
