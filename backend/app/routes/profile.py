import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from bson import ObjectId
from app.services.db import get_db
from app.services.storage import get_storage_provider
from app.utils.helpers import get_current_user_payload
from app.routes.levels import log_audit

router = APIRouter(prefix="/api/profile", tags=["profile"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf"}

def validate_file(file: UploadFile, max_size_mb: float):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    # Check file size (approximate using file read since file.size is not always populated)
    # We will read at most max_size_mb + 1KB
    limit = int(max_size_mb * 1024 * 1024)
    content = file.file.read(limit + 1)
    if len(content) > limit:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum size of {max_size_mb}MB."
        )
    # Reset pointer for subsequent reads
    file.file.seek(0)

@router.post("/company-logo")
async def upload_company_logo(file: UploadFile = File(...), current_user: dict = Depends(get_current_user_payload)):
    validate_file(file, 5.0)
    db = get_db()
    user_id = current_user["sub"]
    
    content = await file.read()
    provider = get_storage_provider()
    data_url = await provider.upload_file(content, file.filename, file.content_type)
    
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"level_4_company.company_logo": data_url}}
    )
    await log_audit(db, user_id, "Document Upload", {"type": "company_logo", "filename": file.filename})
    return {"company_logo": data_url}

@router.post("/director-photo")
async def upload_director_photo(file: UploadFile = File(...), current_user: dict = Depends(get_current_user_payload)):
    validate_file(file, 5.0)
    db = get_db()
    user_id = current_user["sub"]
    
    content = await file.read()
    provider = get_storage_provider()
    data_url = await provider.upload_file(content, file.filename, file.content_type)
    
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"level_1_identity.selfie": data_url}}
    )
    await log_audit(db, user_id, "Document Upload", {"type": "director_photo", "filename": file.filename})
    return {"director_photo": data_url}

@router.post("/extra-document")
async def upload_extra_document(file: UploadFile = File(...), current_user: dict = Depends(get_current_user_payload)):
    validate_file(file, 20.0)
    db = get_db()
    user_id = current_user["sub"]
    
    content = await file.read()
    provider = get_storage_provider()
    data_url = await provider.upload_file(content, file.filename, file.content_type)
    
    doc_id = str(ObjectId())
    doc_entry = {
        "id": doc_id,
        "filename": file.filename,
        "content_type": file.content_type,
        "data_url": data_url
    }
    
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"extra_documents": doc_entry}, "$inc": {"xp": 25}} # +25 XP for document
    )
    await log_audit(db, user_id, "Document Upload", {"type": "extra_document", "doc_id": doc_id, "filename": file.filename})
    return doc_entry

@router.get("/extra-documents")
async def get_extra_documents(current_user: dict = Depends(get_current_user_payload)):
    db = get_db()
    user_id = current_user["sub"]
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user.get("extra_documents", [])

@router.delete("/extra-document/{doc_id}")
async def delete_extra_document(doc_id: str, current_user: dict = Depends(get_current_user_payload)):
    db = get_db()
    user_id = current_user["sub"]
    
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"extra_documents": {"id": doc_id}}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
        
    await log_audit(db, user_id, "Document Delete", {"doc_id": doc_id})
    return {"message": "Document deleted successfully"}
