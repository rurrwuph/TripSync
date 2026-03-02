"""Email service for TripSync notifications using EmailJS-compatible approach or SMTP."""
import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional

logger = logging.getLogger(__name__)

# SMTP configuration from env (optional - will log if not configured)
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", "noreply@tripsync.com")


def _send_email(to_email: str, subject: str, html_body: str):
    """Internal: Send email via SMTP. Logs if SMTP is not configured."""
    if not SMTP_HOST or not SMTP_USER:
        logger.info(f"[EMAIL-LOG] To: {to_email} | Subject: {subject}")
        logger.info(f"[EMAIL-LOG] Body preview: {html_body[:300]}...")
        print(f"[EMAIL-LOG] Would send email to {to_email}: {subject}")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_FROM
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_FROM, to_email, msg.as_string())

        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        print(f"[EMAIL-ERROR] Failed to send to {to_email}: {e}")
        return False


def send_partial_cancellation_email(
    user_email: str,
    user_name: str,
    route: str,
    departure_time: str,
    cancelled_seats: List[str],
    remaining_seats: List[str],
    refund_amount: float,
    refund_status: str
):
    """Send email after partial cancellation with remaining confirmed tickets."""
    subject = f"TripSync - Partial Cancellation Confirmation ({route})"

    remaining_html = ""
    if remaining_seats:
        seats_list = ", ".join(remaining_seats)
        remaining_html = f"""
        <div style="background: #e8f5e9; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <h3 style="color: #2e7d32; margin: 0 0 8px 0;">✅ Your Confirmed Seats</h3>
            <p style="font-size: 18px; font-weight: bold; color: #1b5e20; margin: 0;">{seats_list}</p>
            <p style="color: #4caf50; font-size: 13px; margin: 8px 0 0 0;">These seats are still active for your trip.</p>
        </div>
        """
    else:
        remaining_html = """
        <div style="background: #ffebee; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <h3 style="color: #c62828; margin: 0;">All seats have been cancelled</h3>
            <p style="color: #e53935; font-size: 13px; margin: 8px 0 0 0;">Your booking has been fully cancelled.</p>
        </div>
        """

    cancelled_seats_str = ", ".join(cancelled_seats)

    html_body = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">TripSync</h1>
            <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">Partial Cancellation Confirmation</p>
        </div>

        <div style="padding: 32px;">
            <p style="color: #374151; font-size: 15px;">Hi <strong>{user_name}</strong>,</p>
            <p style="color: #6b7280; font-size: 14px;">Your partial cancellation has been processed for the following trip:</p>

            <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin: 16px 0; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #1e40af; font-weight: bold;">{route}</p>
                <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Departure: {departure_time}</p>
            </div>

            <div style="background: #fef2f2; padding: 16px; border-radius: 12px; margin: 16px 0;">
                <h3 style="color: #991b1b; margin: 0 0 8px 0;">❌ Cancelled Seats</h3>
                <p style="font-size: 16px; font-weight: bold; color: #dc2626; margin: 0;">{cancelled_seats_str}</p>
            </div>

            {remaining_html}

            <div style="background: #f0f9ff; padding: 16px; border-radius: 12px; margin: 16px 0;">
                <p style="margin: 0; color: #0369a1; font-size: 14px;">
                    Refund Amount: <strong>৳{refund_amount:.0f}</strong> ({refund_status})
                </p>
            </div>

            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">
                Questions? Contact us at support@tripsync.com
            </p>
        </div>
    </div>
    """

    _send_email(user_email, subject, html_body)


def send_trip_update_email(
    user_email: str,
    user_name: str,
    route: str,
    change_type: str,  # "updated" or "deleted"
    old_departure: Optional[str] = None,
    new_departure: Optional[str] = None
):
    """Send email when admin edits or deletes a trip."""
    if change_type == "updated":
        subject = f"TripSync - Trip Schedule Changed ({route})"
        change_html = f"""
        <div style="background: #fff3e0; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <h3 style="color: #e65100; margin: 0 0 8px 0;">⏰ Schedule Updated</h3>
            <p style="color: #bf360c; font-size: 14px; margin: 0;">
                Old: <s>{old_departure}</s><br/>
                New: <strong>{new_departure}</strong>
            </p>
        </div>
        """
    else:
        subject = f"TripSync - Trip Cancelled ({route})"
        change_html = """
        <div style="background: #ffebee; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <h3 style="color: #c62828; margin: 0 0 8px 0;">🚫 Trip Cancelled</h3>
            <p style="color: #e53935; font-size: 14px; margin: 0;">
                This trip has been cancelled by the operator. A full refund will be processed shortly.
            </p>
        </div>
        """

    html_body = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">TripSync</h1>
            <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">Trip {change_type.title()} Notification</p>
        </div>

        <div style="padding: 32px;">
            <p style="color: #374151; font-size: 15px;">Hi <strong>{user_name}</strong>,</p>
            <p style="color: #6b7280; font-size: 14px;">We're writing to inform you about a change to your upcoming trip:</p>

            <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin: 16px 0; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #1e40af; font-weight: bold;">{route}</p>
            </div>

            {change_html}

            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">
                Questions? Contact us at support@tripsync.com
            </p>
        </div>
    </div>
    """

    _send_email(user_email, subject, html_body)
