from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database, auth
import uuid

router = APIRouter(
    prefix="/vitals",
    tags=["vitals"],
)

@router.get("/", response_model=List[schemas.VitalLog])
def read_vitals(
    skip: int = 0, 
    limit: int = 500, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    vitals = db.query(models.VitalLog).filter(
        models.VitalLog.owner_id == current_user.id
    ).order_by(models.VitalLog.date.desc(), models.VitalLog.time.desc()).offset(skip).limit(limit).all()
    return vitals

@router.post("/", response_model=schemas.VitalLog)
def create_vital_log(
    vital: schemas.VitalLogCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_vital = models.VitalLog(
        **vital.dict(), 
        id=str(uuid.uuid4()),
        owner_id=current_user.id
    )
    db.add(db_vital)
    db.commit()
    db.refresh(db_vital)
    return db_vital
