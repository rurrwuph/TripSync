from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, require_admin
from app.schemas.all_schemas import RefundCreate, RefundOut
import app.models.all_models as models
from app.services.mail_service import mail_service

router = APIRouter()

@router.post("/", response_model=RefundOut)
def request_refund(refund: RefundCreate, db: Session = Depends(get_db)):
    # Convert lists to comma-separated strings for storage
    t_ids_str = ",".join(map(str, refund.ticket_ids)) if refund.ticket_ids else None
    seats_str = ",".join(refund.seat_numbers) if refund.seat_numbers else None
    
    # Check if refund already exists for any of these tickets (simplified check)
    if refund.ticket_ids:
        for tid in refund.ticket_ids:
            # We could do a more complex check, but for now let's just create a new group
            pass

    db_refund = models.Refund(
        ticket_id=refund.ticket_id,
        ticket_ids=t_ids_str,
        seat_numbers=seats_str,
        amount=refund.amount,
        cause=refund.cause,
        status="pending"
    )
    
    # Update all affected tickets to 'cancelled' status
    if refund.ticket_ids:
        db.query(models.Ticket).filter(models.Ticket.id.in_(refund.ticket_ids)).update({"status": "cancelled"}, synchronize_session=False)
    elif refund.ticket_id:
        db.query(models.Ticket).filter(models.Ticket.id == refund.ticket_id).update({"status": "cancelled"}, synchronize_session=False)
    
    db.add(db_refund)
    db.commit()
    db.refresh(db_refund)
    return db_refund

@router.get("/", response_model=List[RefundOut])
def list_refunds(db: Session = Depends(get_db), current_admin: models.User = Depends(require_admin)):
    return db.query(models.Refund).all()

@router.put("/{refund_id}/status")
def update_refund_status(refund_id: int, status: str, db: Session = Depends(get_db), current_admin: models.User = Depends(require_admin)):
    refund = db.query(models.Refund).filter(models.Refund.id == refund_id).first()
    if not refund:
        raise HTTPException(status_code=404, detail="Refund not found")
    
    refund.status = status
    
    # If approved, ensure tickets are cancelled (already handled in request_refund but good to re-verify)
    if status == "approved":
        tids = []
        if refund.ticket_ids:
            tids = [int(x) for x in refund.ticket_ids.split(",") if x]
        elif refund.ticket_id:
            tids = [refund.ticket_id]
            
        if tids:
            db.query(models.Ticket).filter(models.Ticket.id.in_(tids)).update({"status": "cancelled"}, synchronize_session=False)
            
    db.commit()

    # Send Notification Email
    try:
        # Get User via ticket
        t_id_to_check = None
        if refund.ticket_ids:
            t_id_to_check = int(refund.ticket_ids.split(",")[0])
        elif refund.ticket_id:
            t_id_to_check = refund.ticket_id
            
        if t_id_to_check:
            ticket = db.query(models.Ticket).filter(models.Ticket.id == t_id_to_check).first()
            if ticket and ticket.user:
                mail_service.send_refund_status_update(
                    user_email=ticket.user.email,
                    status=status,
                    seats=refund.seat_numbers or str(ticket.seat_number)
                )
    except Exception as e:
        print(f"Failed to send refund notification email: {e}")

    return {"message": f"Refund status updated to {status}"}
