from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.services.db import get_db
from app.utils.helpers import get_current_user_payload
from app.routes.levels import log_audit

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])

PLANS = {
    "starter": {"name": "Starter Plan", "amount": 99900}, # Amount in paise (Rs. 999)
    "growth": {"name": "Growth Plan", "amount": 299900}, # Rs. 2,999
    "premium": {"name": "Premium Plan", "amount": 999900} # Rs. 9,999
}

@router.post("/create-order")
async def create_order(plan_id: str, current_user: dict = Depends(get_current_user_payload)):
    if plan_id not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan selected")
        
    db = get_db()
    user_id = current_user["sub"]
    
    # Return mock Razorpay order creation response
    mock_order_id = f"order_mock_{ObjectId()}"
    return {
        "id": mock_order_id,
        "amount": PLANS[plan_id]["amount"],
        "currency": "INR",
        "plan_id": plan_id
    }

@router.post("/verify")
async def verify_subscription(payload: dict, current_user: dict = Depends(get_current_user_payload)):
    db = get_db()
    user_id = current_user["sub"]
    
    razorpay_payment_id = payload.get("razorpay_payment_id")
    razorpay_order_id = payload.get("razorpay_order_id")
    plan_id = payload.get("plan_id", "starter")
    
    if not razorpay_payment_id or not razorpay_order_id:
        raise HTTPException(status_code=400, detail="Payment credentials verification failed")
        
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = {
        "subscription": plan_id,
        "level": max(user.get("level", 1), 6),
        "readiness_score": max(user.get("readiness_score", 0.0), 75.0),
        "level_5_subscription": {
            "order_id": razorpay_order_id,
            "payment_id": razorpay_payment_id,
            "plan_id": plan_id,
            "activated_at": datetime.utcnow().isoformat()
        }
    }
    
    if "subscriber" not in user.get("badges", []):
        update_data["$addToSet"] = {"badges": "subscriber"}
        update_data["$inc"] = {"xp": 200}
        
    await db.users.update_one({"_id": ObjectId(user_id)}, update_data)
    await log_audit(db, user_id, "Subscription Activation", {"plan": plan_id, "payment_id": razorpay_payment_id})
    return {"message": "Subscription activated successfully", "xp_gained": 200}
