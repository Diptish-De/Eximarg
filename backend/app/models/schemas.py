from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Level1Identity(BaseModel):
    director_name: str
    phone: str
    email: str
    address: str
    pan: str
    aadhaar: str
    selfie: Optional[str] = None # Base64
    verified: bool = False
    otp_verified: bool = False

class Level2Exporter(BaseModel):
    exporter_type: str
    business_model: str
    export_intent: str
    shipments_range: str
    registration_date: str
    operating_since: str
    rcmc_suggestions: Optional[List[str]] = []

class Level3Verification(BaseModel):
    gst: str
    cin: Optional[str] = None
    address_proof: Optional[str] = None # Base64
    bank_statement: Optional[str] = None # Base64
    ifsc: str
    ad_code: str
    iec: str
    rcmc: str
    apeda_fssai: Optional[str] = None
    trust_score: float = 0.0
    verification_score: float = 0.0
    risk_score: float = 0.0

class Level4Company(BaseModel):
    company_logo: Optional[str] = None # Base64
    company_name: str
    website: Optional[str] = None
    social_links: Optional[Dict[str, str]] = {}
    tagline: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    role: str
    level: int
    xp: int
    readiness_score: float
    badges: List[str]
    subscription: Optional[str] = None # 'starter', 'growth', 'premium'
    products_locked: bool = False
    levels_locked: bool = False
    level_1_identity: Optional[Level1Identity] = None
    level_2_exporter: Optional[Level2Exporter] = None
    level_3_verification: Optional[Level3Verification] = None
    level_4_company: Optional[Level4Company] = None
    level_5_subscription: Optional[Dict[str, Any]] = None
    level_6_catalog: Optional[Dict[str, Any]] = None

class ProductSchema(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    hsn_code: str
    sku: str
    price_min: float
    price_max: float
    sample_price: float
    images: List[str] = [] # Base64 references
    moq_tiers: List[Dict[str, Any]] = []

class OrderProduct(BaseModel):
    product_id: str
    name: str
    quantity: int
    price: float

class OrderSchema(BaseModel):
    id: Optional[str] = None
    buyer_name: str
    buyer_email: str
    buyer_address: str
    seller_details: Dict[str, Any]
    products: List[OrderProduct]
    fob_charges: float = 0.0
    cif_charges: float = 0.0
    total_amount: float = 0.0
    invoice_number: Optional[str] = None
    status: str = "draft" # draft, sent, paid
    created_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    pdf_base64: Optional[str] = None

class AuditLogSchema(BaseModel):
    id: Optional[str] = None
    user_id: str
    action: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None
