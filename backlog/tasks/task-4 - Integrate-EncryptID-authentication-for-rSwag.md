---
id: TASK-4
title: Integrate EncryptID authentication for rSwag
status: Done
assignee: []
created_date: '2026-02-18 19:51'
updated_date: '2026-02-25 07:28'
labels: []
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace email/password admin auth with EncryptID passkeys to be consistent with other rApps (rWork, rFiles, rNotes). Use @encryptid/sdk, WebAuthn flow, DID-based user identity, space role checking. See /home/jeffe/Github/encryptid-sdk/ and rwork-online for patterns.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
EncryptID auth integrated with passkey sign-in via vendored @encryptid/sdk. AuthButton + Zustand auth store matching rMaps pattern.
<!-- SECTION:NOTES:END -->
