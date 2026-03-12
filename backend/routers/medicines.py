from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database, auth
import uuid

router = APIRouter(
    prefix="/medicines",
    tags=["medicines"],
)

@router.get("/", response_model=List[schemas.Medicine])
def read_medicines(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    medicines = db.query(models.Medicine).filter(models.Medicine.owner_id == current_user.id).offset(skip).limit(limit).all()
    return medicines

@router.post("/", response_model=schemas.Medicine)
def create_medicine(
    medicine: schemas.MedicineCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Generate ID if not present (though our schema doesn't require it from client)
    db_medicine = models.Medicine(
        **medicine.dict(), 
        id=str(uuid.uuid4()),
        owner_id=current_user.id
    )
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    return db_medicine

@router.delete("/{medicine_id}")
def delete_medicine(
    medicine_id: str, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    medicine = db.query(models.Medicine).filter(models.Medicine.id == medicine_id, models.Medicine.owner_id == current_user.id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    db.delete(medicine)
    db.commit()
    return {"ok": True}

from pydantic import BaseModel

class RefillRequest(BaseModel):
    amount: int

@router.put("/{medicine_id}/refill")
def refill_medicine(
    medicine_id: str,
    refill_req: RefillRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    medicine = db.query(models.Medicine).filter(
        models.Medicine.id == medicine_id,
        models.Medicine.owner_id == current_user.id
    ).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    medicine.inventory += refill_req.amount
    db.commit()
    db.refresh(medicine)
    return medicine
