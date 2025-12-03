import json
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import EmailStr

from . import models, schemas
from .database import get_db
from . import email as email_service

router = APIRouter(
    prefix="/public",
    tags=["Public"]
)

@router.get("/campaigns/{campaign_id}/settings", response_model=schemas.CampaignSettings)
def get_campaign_settings(campaign_id: int, db: Session = Depends(get_db)):
    campaign = db.query(models.Campaign).filter(
        models.Campaign.id == campaign_id,
        models.Campaign.is_active == True
    ).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.settings:
        return json.loads(campaign.settings)
    
    return schemas.CampaignSettings()


class SubscriptionRequest(schemas.BaseModel):
    email: EmailStr
    campaign_id: int

@router.post("/subscribe", status_code=status.HTTP_204_NO_CONTENT)
def subscribe_to_campaign(
    subscription: SubscriptionRequest,
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    campaign = db.query(models.Campaign).filter(
        models.Campaign.id == subscription.campaign_id,
        models.Campaign.is_active == True
    ).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found or is not active")

    existing_subscriber = db.query(models.Subscriber).filter(
        models.Subscriber.campaign_id == subscription.campaign_id,
        models.Subscriber.email == subscription.email
    ).first()

    if existing_subscriber:
        return

    new_subscriber = models.Subscriber(
        email=subscription.email,
        campaign_id=subscription.campaign_id
    )
    db.add(new_subscriber)
    db.commit()
    db.refresh(new_subscriber)

   
    background_tasks.add_task(
        email_service.send_asset_email,
        to_email=new_subscriber.email,
        asset_name=campaign.asset.name,
        asset_path=campaign.asset.file_path
    )


    return {"message": "Subscription request accepted"}