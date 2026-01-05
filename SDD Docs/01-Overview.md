# 01 Overview

## Purpose
Define the software design for the Test Drive application, including the user flows, data model, APIs, and system qualities.

## Goals
- Support a multi-step test drive form (customer, vehicle, signature, evaluation, return, confirmation).
- Support brand-aware theming (Mercedes, Andes Motor, Stellantis).
- Provide drafts management and view-only submitted forms.
- Provide QR generation for vehicle data.
- Provide customer survey creation (admin) and survey response flows (public link).
- Enable PDF export and email delivery of completed forms.

## Users
- Sales/ops users creating and submitting test drive forms.
- Admin users managing surveys and reviewing responses.
- Customers answering surveys through emailed links.

## Core user flows
- Login -> select brand -> start new form or view drafts.
- Form steps: customer -> vehicle -> signature -> evaluation -> return -> confirmation.
- Vehicle lookup by license plate or VIN with autofill and toasts.
- Signature capture and persistence (base64 data URL).
- Return step with required photos (min 1, max 3, total max 2 MB).
- Submit: status submitted if vehicle data confirmed, otherwise pending/draft.
- Drafts: continue editing vehicle/return and view rest of steps read-only.
- QR generation: manual vehicle info -> backend QR -> download.
- Survey: admin creates surveys and versions; public survey renders by brand.

## Business rules summary
- Vehicle is the source of location and color.
- Vehicle registerStatus: in progress or confirmed.
- Form status: draft, pending, submitted (pending used when vehicle not confirmed).
- Submitting a form triggers survey response creation and email send (backend).

## Out of scope
- Production authentication/authorization.
- Payments or billing.
- Multi-language support beyond Spanish UI text.
