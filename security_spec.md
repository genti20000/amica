# Security Specification for AMICA SOHO Firestore Database

## Data Invariants
1. Reservations can be created publicly with valid shape and sanitized guest details.
2. Blocked dates and venue settings can only be written by authenticated venue staff or system admin.
3. Every document write must be bounded in size and field keys to prevent shadow updates or wallet exhaustion.

## Dirty Dozen Payloads Test Matrix
1. Excessively long guest name (> 100 characters) -> REJECT
2. Negative pax count or > 20 pax -> REJECT
3. Injecting non-allowed fields into reservation creation -> REJECT
4. Malformed date format for blocked_date -> REJECT
5. Anonymous write to venue_settings -> REJECT
6. Non-email string in reservation email field -> REJECT
7. Modifying created_at timestamp during updates -> REJECT
8. Unauthenticated deletion of reservations -> REJECT
9. Unauthenticated creation of blocked dates -> REJECT
10. System settings update missing required key/value -> REJECT
11. Path variable poisoning with special characters in reservation ID -> REJECT
12. Shadow update attempting to elevate permissions -> REJECT
