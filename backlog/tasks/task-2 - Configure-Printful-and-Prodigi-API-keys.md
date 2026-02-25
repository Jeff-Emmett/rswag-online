---
id: TASK-2
title: Configure Printful and Prodigi API keys
status: Done
assignee: []
created_date: '2026-02-18 19:51'
updated_date: '2026-02-25 07:34'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add PRINTFUL_API_TOKEN and PRODIGI_API_KEY to .env. Currently empty — orders will be created but not submitted to POD providers. Also implement the POD client code in backend/app/pod/ to actually submit orders after Stripe payment.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Printful API token configured. Prodigi API key also set up. POD client code in backend/app/pod/ submits orders after Mollie payment. Printful mockup generation working.
<!-- SECTION:NOTES:END -->
