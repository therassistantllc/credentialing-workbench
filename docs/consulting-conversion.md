# THERASSISTANT Consulting Portal Conversion

This branch converts the existing credentialing workbench's staff navigation and dashboard to on-demand mental health revenue cycle consulting. **Existing credentialing database tables and records are preserved**, not dropped.

## Advisory-only scope
Claim review findings, explanation and written recommended next steps. No claim corrections, resubmissions, direct payer follow-up, collections or implementation of recommendations.

## Intake & proposed pricing
- 1 related claim: $19
- 2–3 related claims: $39
- 4–5 related claims: $59
- 6–10 related claims: $99
- More than 10 affected claims: packaged Health Check selection, with each package's separate review limits.
- Non-related or credentialing/network review requests: manual scope review.

Package pricing: 10-Denial $395, Overpayment/Recoupment $395, Credentialing/Enrollment $495, Network/Roster $595, Comprehensive RCM $995.

## Mandatory documents before payment
The submitted claim, front and back of insurance card, denial EOB/ERA, and claim history, per affected claim. Uploading patient documents is **not yet enabled**. The project remains documentation_pending; it cannot collect a payment until HIPAA-appropriate storage, access controls, a BAA, document verification, and Square checkout are implemented and validated.

## Existing database
Supabase credentialing workbench project. Separate new tables `consulting_practices` and `consulting_projects` added with row-level security for staff roles. Contractors and client accounts require a distinct role and RLS implementation before opening these routes to them. Never put PHI into free-text intake.

## Existing partner portal
The separate THERASSISTANT partner portal retains the current contractor referral and attribution workflow. Migration/connection work is a later step.
