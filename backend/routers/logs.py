from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database, auth
import uuid

router = APIRouter(
    prefix="/logs",
    tags=["logs"],
)

@router.get("/", response_model=List[schemas.Log])
def read_logs(
    skip: int = 0, 
    limit: int = 500, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    logs = db.query(models.Log).filter(models.Log.owner_id == current_user.id).offset(skip).limit(limit).all()
    return logs

@router.post("/", response_model=schemas.Log)
def create_log(
    log: schemas.LogBase, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_log = models.Log(
        **log.dict(), 
        id=str(uuid.uuid4()),
        owner_id=current_user.id
    )
    db.add(db_log)

    # Automatically decrement inventory if a dose is taken
    if log.status == "taken":
        medicine = db.query(models.Medicine).filter(
            models.Medicine.id == log.medicine_id,
            models.Medicine.owner_id == current_user.id
        ).first()
        if medicine and medicine.inventory > 0:
            medicine.inventory -= 1

    db.commit()
    db.refresh(db_log)
    return db_log
