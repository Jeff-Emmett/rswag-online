---
id: TASK-6
title: Add order confirmation emails
status: Done
assignee: []
created_date: '2026-02-18 19:51'
updated_date: '2026-02-25 07:34'
labels: []
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
OrderService has TODO for sending confirmation emails after payment. Connect to Mailcow SMTP (mail.rmail.online:587) or email-relay API. Send order confirmation with items, total, and tracking link.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
EmailService created with aiosmtplib. Order confirmation email sent after successful Mollie payment. Shipping notification email sent when POD provider reports shipped status with tracking info. HTML templates with rSwag dark theme branding. SMTP via Mailcow (mail.rmail.online:587 STARTTLS). Non-blocking: failures logged but don't break order flow.
<!-- SECTION:NOTES:END -->
