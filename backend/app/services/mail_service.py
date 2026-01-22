import logging
from typing import List

# Setup a simple logger to simulate email output
logging.basicConfig(level=logging.INFO)
email_logger = logging.getLogger("TripSyncMailService")

class MailService:
    @staticmethod
    def send_booking_confirmation(user_email: str, trip_details: dict, seats: List[str]):
        """
        Simulates sending a booking confirmation email.
        """
        route = trip_details.get('route') or f"{trip_details.get('from')} to {trip_details.get('to')}"
        departure = trip_details.get('time') or trip_details.get('departure_time')
        
        subject = "TripSync Booking Confirmation"
        body = f"""
        Dear Passenger,
        
        Your booking is confirmed!
        
        Trip: {route}
        Date/Time: {departure}
        Seats: {', '.join(seats)}
        
        Thank you for choosing TripSync.
        """
        
        email_logger.info("\n" + "="*50)
        email_logger.info(f"SENT EMAIL TO: {user_email}")
        email_logger.info(f"SUBJECT: {subject}")
        email_logger.info(f"BODY:\n{body}")
        email_logger.info("="*50 + "\n")

    @staticmethod
    def send_refund_status_update(user_email: str, status: str, seats: str):
        """
        Simulates sending a refund status update email.
        """
        subject = f"TripSync Refund {status.capitalize()}"
        body = f"""
        Dear Passenger,
        
        Your refund request for seats {seats} has been {status}.
        
        Status: {status.upper()}
        
        If you have any questions, please contact support.
        """
        
        email_logger.info("\n" + "#"*50)
        email_logger.info(f"SENT EMAIL TO: {user_email}")
        email_logger.info(f"SUBJECT: {subject}")
        email_logger.info(f"BODY:\n{body}")
        email_logger.info("#"*50 + "\n")

# Global instance
mail_service = MailService()
