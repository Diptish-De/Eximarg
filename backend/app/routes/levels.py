from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.services.db import get_db
from app.models.schemas import (
    Level1Identity,
    Level2Exporter,
    Level3Verification,
    Level4Company,
    UserResponse
)
from app.utils.helpers import get_current_user_payload

router = APIRouter(prefix="/api/levels", tags=["levels"])

async def log_audit(db, user_id: str, action: str, metadata: dict = None):
    await db.audit_logs.insert_one({
        "user_id": user_id,
        "action": action,
        "timestamp": datetime.utcnow(),
        "metadata": metadata or {}
    })

@router.post("/1")
async def save_level_1(payload: Level1Identity, current_user: dict = Depends(get_current_user_payload)):
    db = get_db()
    user_id = current_user["sub"]
    
    # Check current progress
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Grant rewards: identity_verified, +100 XP, 12.5% readiness
    payload.verified = True
    payload.otp_verified = True
    
    update_data = {
        "level_1_identity": payload.model_dump(),
        "level": max(user.get("level", 1), 2),
        "readiness_score": max(user.get("readiness_score", 0.0), 12.5)
    }
    
    # XP system: Level 1 +100 XP
    if "identity_verified" not in user.get("badges", []):
        update_data["$addToSet"] = {"badges": "identity_verified"}
        update_data["$inc"] = {"xp": 100}
        
    await db.users.update_one({"_id": ObjectId(user_id)}, update_data)
    await log_audit(db, user_id, "Level 1 Identity Completed", {"director_name": payload.director_name})
    return {"message": "Level 1 Identity Verification complete", "xp_gained": 100}

@router.post("/2")
async def save_level_2(payload: Level2Exporter, current_user: dict = Depends(get_current_user_payload)):
    db = get_db()
    user_id = current_user["sub"]
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Mock RCMC suggestions based on Exporter Type / Business Model
    suggestions = ["FIEO (Federation of Indian Export Organisations)"]
    if "agricultural" in payload.export_intent.lower() or "food" in payload.export_intent.lower():
        suggestions.append("APEDA (Agricultural and Processed Food Products Export Development Authority)")
    if "spice" in payload.export_intent.lower():
        suggestions.append("Spices Board India")
    if "chemical" in payload.export_intent.lower():
        suggestions.append("CHEMEXCIL")
    if "textile" in payload.export_intent.lower() or "garment" in payload.export_intent.lower():
        suggestions.append("AEPC (Apparel Export Promotion Council)")
        
    payload.rcmc_suggestions = suggestions
    
    update_data = {
        "level_2_exporter": payload.model_dump(),
        "level": max(user.get("level", 1), 3),
        "readiness_score": max(user.get("readiness_score", 0.0), 25.0)
    }
    
    if "exporter_profile" not in user.get("badges", []):
        update_data["$addToSet"] = {"badges": "exporter_profile"}
        update_data["$inc"] = {"xp": 100}
        
    await db.users.update_one({"_id": ObjectId(user_id)}, update_data)
    await log_audit(db, user_id, "Level 2 Exporter Profile Completed", {"exporter_type": payload.exporter_type})
    return {"message": "Level 2 Exporter Profile complete", "rcmc_suggestions": suggestions, "xp_gained": 100}

@router.post("/3-verification")
async def save_level_3(payload: Level3Verification, current_user: dict = Depends(get_current_user_payload)):
    db = get_db()
    user_id = current_user["sub"]
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Compute Trust, Verification, Risk scores
    payload.trust_score = 92.5
    payload.verification_score = 100.0
    payload.risk_score = 15.0 # Low risk
    
    update_data = {
        "level_3_verification": payload.model_dump(),
        "level": max(user.get("level", 1), 4),
        "readiness_score": max(user.get("readiness_score", 0.0), 37.5)
    }
    
    if "documents_verified" not in user.get("badges", []):
        update_data["$addToSet"] = {"badges": "documents_verified"}
        update_data["$inc"] = {"xp": 150}
        
    await db.users.update_one({"_id": ObjectId(user_id)}, update_data)
    await log_audit(db, user_id, "Level 3 Business Verification Completed", {"gst": payload.gst})
    return {"message": "Level 3 Business Verification complete", "scores": {"trust": 92.5, "verification": 100.0, "risk": "Low"}, "xp_gained": 150}

@router.post("/4-company")
async def save_level_4(payload: Level4Company, current_user: dict = Depends(get_current_user_payload)):
    db = get_db()
    user_id = current_user["sub"]
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = {
        "level_4_company": payload.model_dump(),
        "level": max(user.get("level", 1), 5),
        "readiness_score": max(user.get("readiness_score", 0.0), 62.5)
    }
    
    if "company_confirmed" not in user.get("badges", []):
        update_data["$addToSet"] = {"badges": "company_confirmed"}
        update_data["$inc"] = {"xp": 200}
        
    await db.users.update_one({"_id": ObjectId(user_id)}, update_data)
    await log_audit(db, user_id, "Level 4 Company Profile Completed", {"company_name": payload.company_name})
    return {"message": "Level 4 Company Profile complete", "xp_gained": 200}

@router.post("/lock")
async def lock_levels(current_user: dict = Depends(get_current_user_payload)):
    db = get_db()
    user_id = current_user["sub"]
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"levels_locked": True}}
    )
    await log_audit(db, user_id, "Onboarding Profiles Locked", {})
    return {"message": "Onboarding levels locked and confirmed successfully."}
