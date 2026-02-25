"""Email service for order confirmations and shipping notifications."""

import logging
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class EmailService:
    """Async email sender via SMTP (Mailcow)."""

    @property
    def enabled(self) -> bool:
        return bool(settings.smtp_user and settings.smtp_password)

    async def send_order_confirmation(
        self,
        *,
        to_email: str,
        to_name: str | None,
        order_id: str,
        items: list[dict],
        total: float,
        currency: str = "USD",
    ):
        """Send order confirmation email after successful payment."""
        if not self.enabled:
            logger.info("SMTP not configured, skipping order confirmation email")
            return

        subject = f"Order Confirmed — {settings.app_name} #{order_id[:8]}"
        html = self._render_confirmation_html(
            to_name=to_name,
            order_id=order_id,
            items=items,
            total=total,
            currency=currency,
        )

        await self._send(to_email=to_email, subject=subject, html=html)

    async def send_shipping_notification(
        self,
        *,
        to_email: str,
        to_name: str | None,
        order_id: str,
        tracking_number: str | None = None,
        tracking_url: str | None = None,
    ):
        """Send shipping notification when POD provider ships the order."""
        if not self.enabled:
            return

        subject = f"Your Order Has Shipped — {settings.app_name}"
        html = self._render_shipping_html(
            to_name=to_name,
            order_id=order_id,
            tracking_number=tracking_number,
            tracking_url=tracking_url,
        )

        await self._send(to_email=to_email, subject=subject, html=html)

    async def _send(self, *, to_email: str, subject: str, html: str):
        """Send an HTML email via SMTP."""
        msg = MIMEMultipart("alternative")
        msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
        msg["To"] = to_email
        msg["Subject"] = subject

        # Plain-text fallback
        plain = html.replace("<br>", "\n").replace("</p>", "\n")
        # Strip remaining tags
        import re
        plain = re.sub(r"<[^>]+>", "", plain)
        msg.attach(MIMEText(plain, "plain"))
        msg.attach(MIMEText(html, "html"))

        tls_context = ssl.create_default_context()
        tls_context.check_hostname = False
        tls_context.verify_mode = ssl.CERT_NONE  # self-signed cert on Mailcow

        try:
            await aiosmtplib.send(
                msg,
                hostname=settings.smtp_host,
                port=settings.smtp_port,
                username=settings.smtp_user,
                password=settings.smtp_password,
                start_tls=True,
                tls_context=tls_context,
            )
            logger.info(f"Sent email to {to_email}: {subject}")
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")

    def _render_confirmation_html(
        self,
        *,
        to_name: str | None,
        order_id: str,
        items: list[dict],
        total: float,
        currency: str,
    ) -> str:
        greeting = f"Hi {to_name}," if to_name else "Hi there,"
        order_url = f"{settings.public_url}/checkout/success?order_id={order_id}"
        currency_symbol = "$" if currency == "USD" else currency + " "

        items_html = ""
        for item in items:
            qty = item.get("quantity", 1)
            name = item.get("product_name", "Item")
            variant = item.get("variant", "")
            price = item.get("unit_price", 0)
            variant_str = f" ({variant})" if variant else ""
            items_html += f"""
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #222;">{name}{variant_str}</td>
              <td style="padding:8px 0;border-bottom:1px solid #222;text-align:center;">{qty}</td>
              <td style="padding:8px 0;border-bottom:1px solid #222;text-align:right;">{currency_symbol}{price:.2f}</td>
            </tr>"""

        return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#e5e5e5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">

    <!-- Header -->
    <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid #222;">
      <div style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#f59e0b);border-radius:10px;width:40px;height:40px;line-height:40px;font-size:12px;font-weight:900;color:#0a0a0a;text-align:center;">rSw</div>
      <h1 style="margin:12px 0 0;font-size:22px;color:#fff;">Order Confirmed</h1>
    </div>

    <!-- Greeting -->
    <p style="margin:24px 0 8px;font-size:15px;">{greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;">
      Thank you for your order! Your items are being prepared for production.
      Print-on-demand means each piece is made just for you at the nearest fulfillment center.
    </p>

    <!-- Order Summary -->
    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:12px;">Order Summary</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="color:#888;font-size:12px;">
          <td style="padding-bottom:8px;">Item</td>
          <td style="padding-bottom:8px;text-align:center;">Qty</td>
          <td style="padding-bottom:8px;text-align:right;">Price</td>
        </tr>
        {items_html}
        <tr>
          <td style="padding:12px 0 0;font-weight:700;color:#22d3ee;" colspan="2">Total</td>
          <td style="padding:12px 0 0;font-weight:700;color:#22d3ee;text-align:right;">{currency_symbol}{total:.2f}</td>
        </tr>
      </table>
    </div>

    <!-- Status Link -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="{order_url}" style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#0891b2);color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
        View Order Status
      </a>
    </div>

    <!-- What happens next -->
    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:12px;">What Happens Next</div>
      <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;">
        <li>Your design is sent to the nearest print facility</li>
        <li>Each item is printed on demand — just for you</li>
        <li>You'll get a shipping email with tracking info</li>
        <li>Revenue from your purchase supports the community</li>
      </ol>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:24px;border-top:1px solid #222;font-size:12px;color:#555;">
      <p style="margin:0;">Order #{order_id[:8]}</p>
      <p style="margin:8px 0 0;">{settings.app_name} — Community merch, on demand.</p>
      <p style="margin:4px 0 0;">Part of the <a href="https://rstack.online" style="color:#22d3ee;text-decoration:none;">rStack</a> ecosystem.</p>
    </div>

  </div>
</body>
</html>"""

    def _render_shipping_html(
        self,
        *,
        to_name: str | None,
        order_id: str,
        tracking_number: str | None,
        tracking_url: str | None,
    ) -> str:
        greeting = f"Hi {to_name}," if to_name else "Hi there,"
        order_url = f"{settings.public_url}/checkout/success?order_id={order_id}"

        tracking_html = ""
        if tracking_number:
            track_link = tracking_url or "#"
            tracking_html = f"""
    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:8px;">Tracking Number</div>
      <a href="{track_link}" style="font-size:18px;font-weight:700;color:#22d3ee;text-decoration:none;letter-spacing:1px;">{tracking_number}</a>
    </div>"""

        return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#e5e5e5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">

    <!-- Header -->
    <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid #222;">
      <div style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#f59e0b);border-radius:10px;width:40px;height:40px;line-height:40px;font-size:12px;font-weight:900;color:#0a0a0a;text-align:center;">rSw</div>
      <h1 style="margin:12px 0 0;font-size:22px;color:#fff;">Your Order Has Shipped!</h1>
    </div>

    <p style="margin:24px 0 8px;font-size:15px;">{greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;">
      Great news — your order is on its way! It was printed at the nearest fulfillment center and is now heading to you.
    </p>

    {tracking_html}

    <div style="text-align:center;margin-bottom:24px;">
      <a href="{order_url}" style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#0891b2);color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
        View Order
      </a>
    </div>

    <div style="text-align:center;padding-top:24px;border-top:1px solid #222;font-size:12px;color:#555;">
      <p style="margin:0;">Order #{order_id[:8]}</p>
      <p style="margin:8px 0 0;">{settings.app_name} — Community merch, on demand.</p>
    </div>

  </div>
</body>
</html>"""
