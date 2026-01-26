import os
import resend
from typing import List
import logging

# Load API key directly (assuming it's already in the process environment)
resend.api_key = os.getenv("RESEND_API_KEY")

email_logger = logging.getLogger("TripSyncMailService")

class MailService:
    @staticmethod
    def send_booking_confirmation(user_email: str, trip_details: dict, seats: List[str]):
        """
        Sends a real booking confirmation email using Resend.
        """
        if not resend.api_key:
            email_logger.error("RESEND_API_KEY not found. Falling back to mock logging.")
            # Fallback mock logic for development if key is missing
            return
            
        route = trip_details.get('route') or f"{trip_details.get('from')} to {trip_details.get('to')}"
        departure = trip_details.get('time') or trip_details.get('departure_time')
        
        try:
            params = {
                "from": "TripSync <onboarding@resend.dev>", # Default sender for unverified domains
                "to": [user_email],
                "subject": "Your TripSync Booking is Confirmed! ",
                "html": f"""
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h1 style="color: #E2136E;">Booking Confirmed!</h1>
                    <p>Dear Passenger,</p>
                    <p>Pack your bags! Your seat on the <strong>{route}</strong> trip has been successfully booked.</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Route:</strong> {route}</p>
                        <p style="margin: 5px 0;"><strong>Departure:</strong> {departure}</p>
                        <p style="margin: 5px 0;"><strong>Seats:</strong> {', '.join(seats)}</p>
                    </div>
                    <p>Thank you for choosing TripSync for your journey in Bangladesh.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999;">If you didn't make this booking, please contact our support team immediately.</p>
                </div>
                """
            }
            resend.Emails.send(params)
            email_logger.info(f"Resend email sent successfully to {user_email}")
        except Exception as e:
            email_logger.error(f"Failed to send Resend email: {e}")

    @staticmethod
    def send_refund_status_update(user_email: str, status: str, seats: str):
        """
        Sends a real refund status update email using Resend.
        """
        if not resend.api_key:
            email_logger.error("RESEND_API_KEY not found.")
            return

        status_color = "#22c55e" if status == "approved" else "#ef4444"
        
        try:
            params = {
                "from": "TripSync <onboarding@resend.dev>",
                "to": [user_email],
                "subject": f"TripSync Refund Request {status.capitalize()}",
                "html": f"""
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #333;">Refund Request Update</h2>
                    <p>Dear Passenger,</p>
                    <p>We are writing to inform you that your refund request for seats <strong>{seats}</strong> has been 
                       <span style="color: {status_color}; font-weight: bold; text-transform: uppercase;">{status}</span>.</p>
                    
                    <p style="margin-top: 20px;">If you have any further questions regarding this decision, please reach out to our team.</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999;">TripSync - Travel with Ease</p>
                </div>
                """
            }
            resend.Emails.send(params)
            email_logger.info(f"Resend status update sent successfully to {user_email}")
        except Exception as e:
            email_logger.error(f"Failed to send Resend status update: {e}")

# Global instance
mail_service = MailService()
