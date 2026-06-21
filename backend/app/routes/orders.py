from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from typing import List, Optional
from datetime import datetime
from app.services.db import get_db
from app.models.schemas import OrderSchema
from app.utils.helpers import get_current_user_payload
from app.routes.levels import log_audit

router = APIRouter(prefix="/api/orders", tags=["orders"])

async def get_next_invoice_number(db, user_id: str) -> str:
    # Format: EXIM/YY/<userId4>/0001
    current_year_yy = datetime.utcnow().strftime("%y") # "26" for 2026
    user_id_4 = str(user_id)[-4:]
    
    # Atomic increment
    sequence_key = f"{user_id}_{current_year_yy}"
    seq = await db.invoice_sequences.find_one_and_update(
        {"sequence_key": sequence_key},
        {"$inc": {"sequence_val": 1}},
        upsert=True,
        return_document=True
    )
    val = seq["sequence_val"]
    
    # Zero-padded to 4 digits
    val_str = f"{val:04d}"
    return f"EXIM/{current_year_yy}/{user_id_4}/{val_str}"

@router.post("")
async def create_order(order: OrderSchema, current_user: dict = Depends(get_current_user_payload)):
    db = get_db()
    user_id = current_user["sub"]
    
    order_doc = order.model_dump()
    order_doc["user_id"] = user_id
    order_doc["created_at"] = datetime.utcnow()
    order_doc["status"] = "draft"
    
    result = await db.orders.insert_one(order_doc)
    return {"message": "Draft invoice created successfully", "id": str(result.inserted_id)}

@router.get("")
async def list_orders(current_user: dict = Depends(get_current_user_payload)):
    db = get_db()
    user_id = current_user["sub"]
    
    cursor = db.orders.find({"user_id": user_id})
    orders = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        orders.append(doc)
    return orders

@router.get("/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user_payload)):
    db = get_db()
    user_id = current_user["sub"]
    
    order = await db.orders.find_one({"_id": ObjectId(order_id), "user_id": user_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order/Invoice not found")
        
    order["id"] = str(order["_id"])
    del order["_id"]
    return order

@router.put("/{order_id}")
async def update_order(order_id: str, order: OrderSchema, current_user: dict = Depends(get_current_user_payload)):
    db = get_db()
    user_id = current_user["sub"]
    
    existing = await db.orders.find_one({"_id": ObjectId(order_id), "user_id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Order/Invoice not found")
        
    if existing.get("status") == "sent":
        raise HTTPException(status_code=400, detail="Cannot modify a sent invoice")
        
    update_data = order.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": update_data}
    )
    return {"message": "Invoice draft saved successfully"}

@router.delete("/{order_id}")
async def delete_order(order_id: str, current_user: dict = Depends(get_current_user_payload)):
    db = get_db()
    user_id = current_user["sub"]
    
    result = await db.orders.delete_one({"_id": ObjectId(order_id), "user_id": user_id, "status": "draft"})
    if result.deleted_count == 0:
        raise HTTPException(status_code=400, detail="Invoice not found or cannot delete sent invoices.")
        
    return {"message": "Draft invoice deleted successfully"}

@router.post("/{order_id}/send")
async def send_invoice(order_id: str, payload: dict = None, current_user: dict = Depends(get_current_user_payload)):
    db = get_db()
    user_id = current_user["sub"]
    
    order = await db.orders.find_one({"_id": ObjectId(order_id), "user_id": user_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order/Invoice not found")
        
    if order.get("status") == "sent":
        return {"message": "Invoice already sent", "invoice_number": order.get("invoice_number")}
        
    # Generate unique invoice number atomically
    invoice_num = await get_next_invoice_number(db, user_id)
    
    pdf_base64 = payload.get("pdf_base64") if payload else None
    
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {
            "$set": {
                "status": "sent",
                "invoice_number": invoice_num,
                "sent_at": datetime.utcnow(),
                "pdf_base64": pdf_base64
            }
        }
    )
    
    # Rewards: +100 XP, First Invoice Sent, readiness -> 100%
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    update_user = {
        "readiness_score": 100.0,
        "level": max(user.get("level", 1), 7)
    }
    
    if "first_invoice_sent" not in user.get("badges", []):
        update_user["$addToSet"] = {"badges": "first_invoice_sent"}
        update_user["$inc"] = {"xp": 100}
        
    await db.users.update_one({"_id": ObjectId(user_id)}, update_user)
    await log_audit(db, user_id, "Invoice Send", {"order_id": order_id, "invoice_number": invoice_num})
    return {
        "message": "Invoice sent successfully",
        "invoice_number": invoice_num,
        "xp_gained": 100
    }
