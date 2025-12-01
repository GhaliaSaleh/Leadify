from pydantic import BaseModel, EmailStr
from datetime import datetime

# ==================================
# Schemas for User
# ==================================
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    plan: str 

    class Config:
        from_attributes = True

# ==================================
# Schemas for Token
# ==================================
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: int | None = None

# ==================================
# Schemas for Digital Asset
# ==================================
class DigitalAssetBase(BaseModel):
    name: str

class DigitalAssetCreate(DigitalAssetBase):
    pass

class DigitalAssetOut(DigitalAssetBase):
    id: int
    file_path: str
    owner_id: int

    class Config:
        from_attributes = True

# Schemas for Campaign (النسخة النهائية والمصححة)
# ==================================
class CampaignSettings(BaseModel):
    title: str = "احصل على هديتك المجانية!"
    button_text: str = "أرسل لي الآن"
    placeholder_text: str = "ادخل بريدك الإلكتروني هنا"
    delay_seconds: int = 3
    button_color: str = "#4263EB"

class CampaignBase(BaseModel):
    name: str
    asset_id: int

class CampaignCreate(CampaignBase):
    settings: CampaignSettings | None = None

class CampaignUpdate(BaseModel):
    name: str | None = None
    is_active: bool | None = None
    settings: CampaignSettings | None = None # <-- هذا هو السطر الحاسم

class CampaignOut(CampaignBase):
    id: int
    is_active: bool
    owner_id: int
    settings: CampaignSettings | None = None

    class Config:
        from_attributes = True



# Schemas for Subscriber
# ==================================
class SubscriberOut(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

        
# ... في قسم Campaign Schemas

class CampaignUpdate(BaseModel):
    name: str | None = None
    is_active: bool | None = None
    settings: CampaignSettings | None = None               