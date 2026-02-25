---
id: TASK-11
title: Migrate all SMTP references to mail.rmail.online
status: Done
assignee: []
created_date: '2026-02-25 08:00'
updated_date: '2026-02-25 08:25'
labels: [infrastructure, email]
dependencies: [TASK-6]
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace all references to mx.jeffemmett.com with mail.rmail.online across all repositories. Set up rswag.online domain in Mailcow with noreply@ mailbox, DNS records, and SMTP credentials wired into rSwag backend via Infisical.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Cross-repo cleanup: Updated 10 backlog/doc files across 6 repos (rinbox-online, rmail-online, dev-ops, payment-infra, cadcad-discourse-forum, configuration dotfiles). Updated live CLAUDE.md. Only 2 intentional references remain (ADDITIONAL_SAN backward compat in task-11 migration notes).

Mailcow setup: Created rswag.online domain (2048-bit DKIM), noreply@rswag.online mailbox. Cloudflare DNS: MX (mail.rmail.online, priority 10), SPF (v=spf1 ip4:159.195.32.209 ~all), DKIM (dkim._domainkey), DMARC (p=quarantine).

Infisical wiring: Stored RSWAG_SMTP_HOST, RSWAG_SMTP_USER, RSWAG_SMTP_PASSWORD in claude-ops /mail folder. Added rswag-container identity as viewer on claude-ops project. Entrypoint.sh fetches SMTP config from claude-ops at startup, overriding stale values from .env and rSwag Infisical project. config.py AliasChoices accepts both SMTP_PASSWORD and SMTP_PASS.

Deploy: Triggered via webhook with correct HMAC secret. Container logs confirm: "[infisical] Loaded SMTP config from claude-ops/mail".
<!-- SECTION:NOTES:END -->
