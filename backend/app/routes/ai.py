from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.services.db import get_db
from app.utils.helpers import get_current_user_payload

router = APIRouter(prefix="/api/ai", tags=["ai"])

LIMITS = {
    "starter": 20,
    "growth": 200,
    "premium": 1000,
    None: 5 # Default trial limit
}

@router.post("/suggest")
async def ai_suggest(payload: dict, current_user: dict = Depends(get_current_user_payload)):
    db = get_db()
    user_id = current_user["sub"]
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    sub_tier = user.get("subscription")
    limit = LIMITS.get(sub_tier, 5)
    
    # Calculate calls in current month
    now = datetime.utcnow()
    start_of_month = datetime(now.year, now.month, 1)
    
    count = await db.ai_usage.count_documents({
        "user_id": user_id,
        "timestamp": {"$gte": start_of_month}
    })
    
    if count >= limit:
        raise HTTPException(
            status_code=429,
            detail=f"AI monthly limit reached ({count}/{limit} calls used). Please upgrade your subscription."
        )
        
    prompt = payload.get("prompt", "")
    action_type = payload.get("action_type", "consult") # consult, improve_reply, suggest_docs
    
    # Mock AI response based on prompt topic
    suggestion = "Eximarg AI consultant recommended: Ensure all products match the correct ITC (HS) 8-digit code. In India, APEDA regulates agricultural food exports, while FIEO provides general RCMC certificates. Ensure your buyer conversation has a formal proforma invoice with clear FOB/CIF terms before shipping."
    if "reply" in prompt.lower() or action_type == "improve_reply":
        suggestion = "Dear Buyer, Thank you for expressing interest in our premium export catalog. We have processed your inquiry and attached our detailed FOB pricing table and MOQ tiers. Let us know if you require custom sampling before the bulk deal. Best regards, EXIMARG Export Division."
    elif "hsn" in prompt.lower():
        suggestion = "We suggest reviewing the Spices Board or FIEO directories for the correct HSN code. Common Codes: 0904 (Pepper/Chilli), 1006 (Basmati Rice), 6205 (Cotton Woven Shirts)."
        
    # Log usage
    await db.ai_usage.insert_one({
        "user_id": user_id,
        "action": action_type,
        "prompt": prompt,
        "timestamp": datetime.utcnow()
    })
    
    return {
        "suggestion": suggestion,
        "calls_used": count + 1,
        "limit": limit
    }
