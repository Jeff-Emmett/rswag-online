---
id: TASK-HIGH.1
title: Deploy dithering API and test live endpoints
status: Done
assignee: []
created_date: '2026-03-16 23:27'
updated_date: '2026-03-16 23:46'
labels: []
dependencies: []
parent_task_id: TASK-HIGH
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Dithering feature (12 algorithms + screen-print separations) is implemented and committed on dev branch (commit 9c8df04). Needs: (1) bring rswag backend stack online on Netcup, (2) deploy dev→main, (3) verify live endpoints at rswag.online.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Backend stack running on Netcup (db, redis, backend, frontend)
- [x] #2 GET /api/designs/{slug}/dither returns dithered PNG
- [x] #3 POST /api/designs/{slug}/screen-print returns separation URLs
- [x] #4 GET /api/designs/{slug}/screen-print/{channel} returns channel PNG
- [x] #5 Cache working (second request returns cached:true)
- [x] #6 All 12 dithering algorithms functional
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Deployed to Netcup on dev branch (commits 9c8df04 + 67a8c8f). Compose updated to pure Infisical injection - .env only has INFISICAL_CLIENT_ID, INFISICAL_CLIENT_SECRET, DB_PASSWORD, CORS_ORIGINS, POD_SANDBOX_MODE, NEXT_PUBLIC_API_URL. Fixed entrypoint.sh 2>&1 bug that was capturing stderr into eval. All endpoints verified working via internal and external URLs.

All endpoints live and verified. Fixed: (1) entrypoint 2>&1 stderr bug, (2) downscaled to 512px max for CF timeout compliance. Error diffusion algos ~9-12s uncached, <1s cached. Bayer/ordered ~1.5s. Live URLs: https://rswag.online/api/designs/defectfi-dont-abuse-holes/dither
<!-- SECTION:NOTES:END -->
