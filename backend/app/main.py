from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from . import models, schemas, utils, oauth2
from .database import SessionLocal, engine, get_db
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import UploadFile, File 
import shutil
from fastapi.middleware.cors import CORSMiddleware
from typing import List 
from . import public_router
import json
from fastapi.responses import StreamingResponse
import io # للتعامل مع البيانات في الذاكرة
import csv # لإنشاء ملفات CSV



# This line creates the database tables if they don't exist
# We will use Alembic for this, so we can comment it out or remove it
models.Base.metadata.create_all(bind=engine)

app = FastAPI()
# Add the CORS middleware to the application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, etc.)
    allow_headers=["*"], # Allow all headers
)





@app.post("/users/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user with this email already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password
    hashed_password = utils.hash_password(user.password)

    # Create a new user instance
    new_user = models.User(email=user.email, hashed_password=hashed_password)

    # Add to the database session and commit
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.post("/login", response_model=schemas.Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    # OAuth2PasswordRequestForm returns "username" and "password"
    # We will use the "username" field for the email
    user = db.query(models.User).filter(models.User.email == user_credentials.username).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")

    if not utils.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")

    # Create and return the JWT token
    access_token = oauth2.create_access_token(data={"user_id": user.id})
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserOut)
def get_current_user_data(current_user: models.User = Depends(oauth2.get_current_user)):
    return current_user


@app.post("/assets/upload", response_model=schemas.DigitalAssetOut)
def upload_asset(
    name: str = Form(...),
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # Define a path to save the file
    file_path = f"uploads/{file.filename}"
    
    # Create the uploads directory if it doesn't exist
    import os
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    # Save the file to the server
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Create a new record in the database
    new_asset = models.DigitalAsset(
        name=name,
        file_path=file_path,
        owner_id=current_user.id
    )
    
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    
    return new_asset


@app.get("/assets/", response_model=List[schemas.DigitalAssetOut])
def get_user_assets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # Query the database for assets owned by the current user
    assets = db.query(models.DigitalAsset).filter(models.DigitalAsset.owner_id == current_user.id).all()
    return assets


@app.delete("/assets/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # 1. Find the asset query
    asset_query = db.query(models.DigitalAsset).filter(models.DigitalAsset.id == asset_id)
    asset = asset_query.first()

    # 2. Check if the asset exists
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    # 3. Verify ownership
    if asset.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to perform requested action")

    # 4. --- التحقق الجديد والمهم ---
    # Check if the asset is used in any campaigns
    linked_campaign = db.query(models.Campaign).filter(models.Campaign.asset_id == asset_id).first()
    if linked_campaign:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail=f"لا يمكن حذف هذا العنصر. إنه مرتبط بحملة '{linked_campaign.name}'. يرجى حذف الحملة أولاً."
        )
    
    # 5. (Optional) Delete the actual file
    import os
    try:
        if os.path.exists(asset.file_path):
            os.remove(asset.file_path)
    except Exception as e:
        print(f"Error deleting file {asset.file_path}: {e}")

    # 6. Delete the asset record from the database
    asset_query.delete(synchronize_session=False)
    db.commit()

    return


@app.get("/campaigns/", response_model=List[schemas.CampaignOut])
def get_user_campaigns(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    campaigns = db.query(models.Campaign).filter(models.Campaign.owner_id == current_user.id).all()
    
    for campaign in campaigns:
        if campaign.settings:
            campaign.settings = json.loads(campaign.settings)

    return campaigns


@app.post("/campaigns/", response_model=schemas.CampaignOut)
def create_campaign(
    campaign: schemas.CampaignCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
       # --- هذا هو الكود الجديد الذي سنضيفه ---
    # 1. التحقق من خطة المستخدم
    is_free_plan = (current_user.plan == models.PlanEnum.FREE)

    if is_free_plan:
        # 2. حساب عدد الحملات الحالية
        campaign_count = db.query(models.Campaign).filter(models.Campaign.owner_id == current_user.id).count()
        
        # 3. فرض القيد
        if campaign_count >= 1: # الحد الأقصى للخطة المجانية
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="لقد وصلت إلى الحد الأقصى لعدد الحملات (1) في الخطة المجانية. يرجى الترقية."
            )
        
    # التحقق من ملكية الأصل (هذا الكود لم يتغير)
    asset_to_link = db.query(models.DigitalAsset).filter(
        models.DigitalAsset.id == campaign.asset_id,
        models.DigitalAsset.owner_id == current_user.id
    ).first()

    if not asset_to_link:
        raise HTTPException(
            status_code=404, 
            detail=f"Asset with id {campaign.asset_id} not found or you don't have permission."
        )

    # تحويل كائن الإعدادات إلى نص JSON لتخزينه
    settings_str = None
    if campaign.settings:
        settings_str = campaign.settings.model_dump_json()

    # إنشاء الحملة الجديدة مع الإعدادات كنص
    new_campaign = models.Campaign(
        name=campaign.name,
        asset_id=campaign.asset_id,
        owner_id=current_user.id,
        settings=settings_str 
    )

    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)
    
    # عند إرجاع البيانات، نقوم بتحويل نص الإعدادات مرة أخرى إلى كائن
    # ليتوافق مع `response_model`
    if new_campaign.settings:
        new_campaign.settings = json.loads(new_campaign.settings)

    return new_campaign

app.include_router(public_router.router)


@app.put("/campaigns/{campaign_id}", response_model=schemas.CampaignOut)
def update_campaign(
    campaign_id: int,
    campaign_update: schemas.CampaignUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    campaign_query = db.query(models.Campaign).filter(models.Campaign.id == campaign_id)
    db_campaign = campaign_query.first()

    if not db_campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")

    if db_campaign.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    # --- هذا هو المنطق الجديد والمحسن ---
    
    # 1. نحصل على بيانات التحديث من الطلب
    update_data = campaign_update.model_dump(exclude_unset=True)

    # 2. إذا كانت هناك إعدادات جديدة، ندمجها مع القديمة
    if "settings" in update_data and update_data["settings"] is not None:
        # نحمل الإعدادات القديمة من قاعدة البيانات (إن وجدت)
        current_settings = {}
        if db_campaign.settings:
            current_settings = json.loads(db_campaign.settings)
        
        # ندمج الإعدادات الجديدة فوق القديمة
        new_settings_data = {**current_settings, **update_data["settings"]}
        
        # نحول الكائن المدمج النهائي إلى نص JSON
        update_data["settings"] = json.dumps(new_settings_data)

    # 3. نقوم بتحديث قاعدة البيانات بالبيانات المدمجة
    campaign_query.update(update_data, synchronize_session=False)
    db.commit()
    db.refresh(db_campaign)

    # 4. نقوم بفك الإعدادات قبل إرجاعها (كما فعلنا من قبل)
    if db_campaign.settings:
        db_campaign.settings = json.loads(db_campaign.settings)

    return db_campaign


# === API to get subscribers for a specific campaign ===
@app.get("/campaigns/{campaign_id}/subscribers", response_model=List[schemas.SubscriberOut])
def get_campaign_subscribers(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # First, verify the user owns the campaign
    campaign = db.query(models.Campaign).filter(
        models.Campaign.id == campaign_id,
        models.Campaign.owner_id == current_user.id
    ).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Get the subscribers for this campaign
    subscribers = db.query(models.Subscriber).filter(models.Subscriber.campaign_id == campaign_id).all()
    return subscribers


# === API to export subscribers as a CSV file ===
@app.get("/campaigns/{campaign_id}/subscribers/csv")
def export_campaign_subscribers(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # The same verification logic as above
    campaign = db.query(models.Campaign).filter(
        models.Campaign.id == campaign_id,
        models.Campaign.owner_id == current_user.id
    ).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    subscribers = db.query(models.Subscriber).filter(models.Subscriber.campaign_id == campaign_id).all()

    # Create a CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['id', 'email', 'created_at']) # Header row
    for subscriber in subscribers:
        writer.writerow([subscriber.id, subscriber.email, subscriber.created_at.isoformat()])
    
    output.seek(0) # Go back to the start of the in-memory file

    # Return the CSV file as a downloadable response
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=subscribers_campaign_{campaign_id}.csv"}
    )

@app.delete("/campaigns/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    campaign_query = db.query(models.Campaign).filter(models.Campaign.id == campaign_id)
    campaign = campaign_query.first()

    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")

    if campaign.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to perform requested action")
    
    # Note: We need to decide what to do with subscribers of this campaign.
    # For now, we will leave them, but in a real app we might delete them too (ON DELETE CASCADE).
    
    campaign_query.delete(synchronize_session=False)
    db.commit()

    return
