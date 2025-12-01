from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from .database import Base
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
import enum
from sqlalchemy import Enum


class PlanEnum(enum.Enum):
    FREE = "free"
    PRO = "pro"
    BUSINESS = "business"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    plan = Column(Enum(PlanEnum), nullable=False, server_default=PlanEnum.FREE.name)
    


class DigitalAsset(Base):
    __tablename__ = "digital_assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    file_path = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User")    


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    is_active = Column(Boolean, server_default="TRUE", nullable=False)
    
    # JSON field to store design and display rules later
    settings = Column(String, nullable=True) # We will use String for now, can be JSON in production DB

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    asset_id = Column(Integer, ForeignKey("digital_assets.id"), nullable=False)

    owner = relationship("User")
    asset = relationship("DigitalAsset")    


class Subscriber(Base):
    __tablename__ = "subscribers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)

    # We can add a relationship if we want to easily access subscribers from a campaign object
    campaign = relationship("Campaign")