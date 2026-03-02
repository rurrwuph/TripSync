from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, require_admin, get_current_user
from app.schemas.all_schemas import RefundCreate, RefundOut, PartialRefundRequest
import app.models.all_models as models
from app.services import booking_service
# from app.services.mail_service import mail_service

router = APIRouter()

@router.post("/", response_model=RefundOut)
def request_refund(refund: RefundCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Convert lists to comma-separated strings for storage
    t_ids_str = ",".join(map(str, refund.ticket_ids)) if refund.ticket_ids else None
    seats_str = ",".join(refund.seat_numbers) if refund.seat_numbers else None
    
    # Check if refund already exists for any of these tickets
    check_ids = []
    if refund.ticket_ids:
        check_ids.extend(refund.ticket_ids)
    elif refund.ticket_id:
        check_ids.append(refund.ticket_id)

    if check_ids:
        # Check for existing pending or approved refunds that might overlap
        # Since ticket_ids is a comma-separated string, we'll fetch pending/approved and check in Python
        existing_refunds = db.query(models.Refund).filter(
            models.Refund.status.in_(["pending", "approved"])
        ).all()
        
        for er in existing_refunds:
            er_ids = []
            if er.ticket_ids:
                try:
                    er_ids = [int(x.strip()) for x in er.ticket_ids.split(",") if x.strip()]
                except ValueError:
                    continue
            elif er.ticket_id:
                er_ids = [er.ticket_id]
                
            if any(tid in er_ids for tid in check_ids):
                raise HTTPException(
                    status_code=400, 
                    detail="A refund request already exists (pending or approved) for one or more of these seats."
                )

    db_refund = models.Refund(
        ticket_id=refund.ticket_id,
        ticket_ids=t_ids_str,
        seat_numbers=seats_str,
        amount=refund.amount,
        cause=refund.cause,
        status="pending"
    )
    
    # Update all affected tickets to 'RELEASED' status (making them available)
    if refund.ticket_ids:
        db.query(models.Ticket).filter(models.Ticket.id.in_(refund.ticket_ids)).update({"status": "RELEASED"}, synchronize_session=False)
    elif refund.ticket_id:
        db.query(models.Ticket).filter(models.Ticket.id == refund.ticket_id).update({"status": "RELEASED"}, synchronize_session=False)
    
    db.add(db_refund)
    db.commit()
    db.refresh(db_refund)
    return db_refund

@router.post("/partial", response_model=RefundOut)
def partial_refund(request: PartialRefundRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Endpoint for partial cancellation.
    Immediate seat release and time-based refund processing.
    """
    # Use service to handle transactional logic
    refund_record = booking_service.process_partial_refund(
        db=db,
        booking_id=request.booking_id,
        ticket_ids=request.ticket_ids,
        cause=request.cause
    )
    return refund_record

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

    # Notification email logic to be moved to frontend if desired
    # try:
    #     # Get User via ticket
    #     t_id_to_check = None
    #     if refund.ticket_ids:
    #         t_id_to_check = int(refund.ticket_ids.split(",")[0])
    #     elif refund.ticket_id:
    #         t_id_to_check = refund.ticket_id
    #         
    #     if t_id_to_check:
    #         ticket = db.query(models.Ticket).filter(models.Ticket.id == t_id_to_check).first()
    #         if ticket and ticket.user:
    #             mail_service.send_refund_status_update(
    #                 user_email=ticket.user.email,
    #                 status=status,
    #                 seats=refund.seat_numbers or str(ticket.seat_number)
    #             )
    # except Exception as e:
    #     print(f"Failed to send refund notification email: {e}")

    return {"message": f"Refund status updated to {status}"}
