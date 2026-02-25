---
id: TASK-5
title: Add real Printful mockup API integration
status: In Progress
assignee: []
created_date: '2026-02-18 19:51'
updated_date: '2026-02-21 20:54'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Current upload page uses client-side Canvas compositing with simple template images. When Printful API token is configured, enhance with real Printful Mockup Generator API (POST /mockup-generator/create-task) for photorealistic product previews showing actual garment colors and fabric texture.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-02-21: Printful client code is DONE and deployed. Blocking issue: API token not scoped to store.

What's done:
- backend/app/pod/printful_client.py created (catalog, mockups, orders)
- designs.py updated (Printful mockup path + Pillow fallback)
- order_service.py refactored (provider-aware routing: printful vs prodigi)
- Token stored at ~/.secrets/printful_api_token and in Netcup .env
- Deployed to fungiswag.jeffemmett.com (Pillow fallback working)

Blocking:
- Token u5WU...R2d returns "This endpoint requires store_id" on mockup/order APIs
- Need to create a NEW token on developers.printful.com scoped to "Fungi Flows" store
- Select the store in the "Access" dropdown (not "Account (all stores)")

Once new token is set, just update ~/.secrets/printful_api_token and Netcup .env, rebuild, done.
<!-- SECTION:NOTES:END -->
