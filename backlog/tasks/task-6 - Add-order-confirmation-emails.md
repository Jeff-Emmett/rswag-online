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

Mailcow setup (2026-02-25): Created rswag.online domain with 2048-bit DKIM. Created noreply@rswag.online mailbox. DNS records (MX, SPF, DKIM, DMARC) added to Cloudflare. SMTP credentials stored in claude-ops /mail folder (RSWAG_SMTP_HOST, RSWAG_SMTP_USER, RSWAG_SMTP_PASSWORD). Entrypoint fetches from claude-ops at startup, overriding stale rSwag Infisical values. config.py uses AliasChoices to accept both SMTP_PASSWORD and SMTP_PASS env var names.
<!-- SECTION:NOTES:END -->
