# Future Modules Baseline

> Project baseline for every "Coming soon" module of the Youth Football Ecosystem Platform.
> Generated from `src/config/module-blueprints.ts` — edit that file, then run `bun scripts/generate-module-baseline.ts`.
> The same content is shown in the app at `/modules` and `/modules/<id>`.

## Guiding principles

1. **The player owns the journey.** Every module attaches records to a Football ID; organizations only hold relationships.
2. **One person, one account, many roles.** Modules declare which roles can use them in `src/config/modules.ts`.
3. **Single source of truth per record.** Each module owns the entities listed below and only *reads* the data it consumes.
4. **Journey events, not copies.** Modules publish events to the Football Journey timeline instead of duplicating history.
5. **Consent first for minors.** Guardians control visibility; nothing about a child is exposed beyond existing permissions.

## Rollout overview

| Wave | Theme | Goal | Modules |
| --- | --- | --- | --- |
| Wave 1 | Club operations | Give SSBs and academies the weekly tools they run on, producing trusted activity data for every Football ID. | [Training](#training), [Player Development](#development), [Finance & Payments](#finance) |
| Wave 2 | Professional networks | Bring coaches, referees and scouts onto the same identity layer and open consent-based pathways for players. | [Coach Platform](#coach), [Referee Platform](#referee), [Opportunities](#opportunities), [Scouting](#scouting) |
| Wave 3 | Governance & intelligence | Turn verified ecosystem data into regional and national infrastructure, reporting and assistance. | [Analytics](#analytics), [Association](#association), [Federation](#federation), [AI Assistant](#ai) |

## Dependency map

| Module | Wave | Depends on | Primary roles |
| --- | --- | --- | --- |
| Training | 1 | — | Coach, Organization Admin |
| Player Development | 1 | — | Coach, Player, Parent / Guardian, Organization Admin |
| Finance & Payments | 1 | — | Organization Admin, Parent / Guardian |
| Coach Platform | 2 | [training](#training) | Coach |
| Referee Platform | 2 | — | Referee, Competition Organizer |
| Opportunities | 2 | — | Player, Parent / Guardian |
| Scouting | 2 | [development](#development), [opportunities](#opportunities) | Scout, Parent / Guardian, Organization Admin |
| Analytics | 3 | [development](#development) | Organization Admin, Competition Organizer |
| Association | 3 | [analytics](#analytics) | Organization Admin, Competition Organizer |
| Federation | 3 | [association](#association) | Competition Organizer |
| AI Assistant | 3 | [analytics](#analytics) | Coach, Parent / Guardian, Organization Admin |

## How to ship a module

1. Build the route(s) under `src/routes/` and the feature UI under `src/features/<module>/`, reusing `src/components/ds`.
2. In `src/config/modules.ts` set `status: "live"` and point `path` at the new route — sidebar, mobile bar and search update automatically.
3. Publish the module's journey events to the Football Journey timeline.
4. Keep the blueprint in sync (or remove it once the module is live) and re-generate this document.

---

# Wave 1 — Club operations

Give SSBs and academies the weekly tools they run on, producing trusted activity data for every Football ID.

## Training
**Session planning, a shared drill library and team training calendars for coaches.** · Route: /modules/training · Wave 1

**Problem.** Coaches plan sessions in notebooks, so assistants, admins and guardians cannot see what is trained and nothing carries over between seasons.

### Who it serves
- **Coach** — Plan a session from drills, assign it to a team and reuse it next week.
- **Organization Admin** — Keep a consistent club curriculum across age categories.

### Scope
**MVP**
- Training session planner (objective, duration, drills, equipment)
- Club drill library with age category and focus tags
- Assign sessions to team schedules
- Share plans with assistant coaches

**Next**
- Season and term curriculum templates
- Post-session coach notes
- Session load overview per team

**Later**
- Video and diagram attachments
- Shared drill library across organizations


### Data it owns
| Entity | Description |
| --- | --- |
| TrainingSession | A scheduled session for a team, linked to a schedule item. |
| SessionPlan | The reusable plan: objectives, blocks and drills. |
| Drill | A library item with focus area, age range and instructions. |
| Curriculum | An ordered set of plans for an age category and term. |


### Data it reads (never owns)
- Teams and coach assignments
- Schedule items
- Organization structure


### Football Journey events
- Training session participation summaries as training_session events (via Attendance)


### Privacy & consent
- Session plans belong to the organization and are visible to its staff only.
- No player-level data is stored in plans.


### Dependencies
_None — can start independently._

### Builds on (already in the app)
- Training schedule view in the organization workspace
- Schedule rows and calendar


### Success metrics
- Sessions planned before they happen
- Plans reused at least once
- Active coaches planning weekly


### Out of scope
- Physical load monitoring with wearables
- Paid drill marketplace



## Player Development
**Competency-based development tracking: coach observations, periodic assessments, player goals and season reviews.** · Route: /modules/development · Wave 1

**Problem.** Feedback to young players is informal and lost when they change club; families never see structured progress.

### Who it serves
- **Coach** — Record quick observations and complete a periodic assessment against the competency framework.
- **Player** — Set personal goals and see feedback in plain language.
- **Parent / Guardian** — Read season reviews and support goals at home.
- **Organization Admin** — Ensure every player receives a review each term.

### Scope
**MVP**
- Coach observations linked to a session or match
- Assessment against the platform competency framework
- Player goals with progress status
- Season review shared with the player and guardians

**Next**
- Development plan per player
- Self-assessment for older players
- Review reminders for coaches

**Later**
- Portable development history across organizations with consent
- Comparison to age-category benchmarks


### Data it owns
| Entity | Description |
| --- | --- |
| CoachObservation | A short, dated note on a player linked to an activity. |
| DevelopmentAssessment | A formal rating against competencies for a period. |
| PlayerGoal | A goal owned by the player with status and target date. |
| SeasonReview | A published summary visible to the player and guardians. |


### Data it reads (never owns)
- Football ID and player profile
- Attendance and training records
- Match participation


### Football Journey events
- Published season reviews as development_assessment events
- Achieved goals as achievement events


### Privacy & consent
- Assessments are visible only to the player, linked guardians and the assessing organization.
- Observations inform assessments but are never published raw.
- Development data never becomes a public ranking.


### Dependencies
_None — can start independently._

### Builds on (already in the app)
- Player profile tabs
- Football Journey timeline (development_assessment and coach_observation sources)


### Success metrics
- Players with a review each term
- Guardians who open published reviews
- Goals with progress updates


### Out of scope
- Automated talent scores
- Sharing development data with scouts without consent


### Further documents
- [player-development-product-blueprint.md](player-development-product-blueprint.md)
- [player-development-competency-framework.md](player-development-competency-framework.md)
- [player-development-data-model.md](player-development-data-model.md)
- [player-development-permission-model.md](player-development-permission-model.md)
- [player-development-phase-1-specification.md](player-development-phase-1-specification.md)

## Finance & Payments
**Membership fees, invoices and payment status for organizations and guardians.** · Route: /modules/finance · Wave 1

**Problem.** Fee collection is manual and tracked in spreadsheets; guardians lack clear invoices and admins cannot see who has paid.

### Who it serves
- **Organization Admin** — Set fee plans, issue invoices and see outstanding balances.
- **Parent / Guardian** — See what is owed for each child, pay and download receipts.

### Scope
**MVP**
- Fee plans per organization (monthly, term, registration)
- Invoices per player, payable by the linked guardian
- Manual payment recording with proof upload
- Outstanding balance overview

**Next**
- Digital payment (QRIS and virtual account) through a licensed provider
- Automatic reminders
- Receipts as PDF

**Later**
- Competition entry fees
- Financial reports for associations


### Data it owns
| Entity | Description |
| --- | --- |
| FeePlan | Price, period and the teams or categories it applies to. |
| Invoice | Amount owed for a player and period, with due date and status. |
| Payment | A recorded payment against one or more invoices. |


### Data it reads (never owns)
- Organization and team membership
- Guardian relationships
- Competition registrations


### Football Journey events
_Publishes no journey events._

### Privacy & consent
- Payment status never appears on a player's Football ID or public profile.
- Coaches do not see payment data.
- Unpaid fees never block a child's identity or journey record.


### Dependencies
_None — can start independently._

### Builds on (already in the app)
- Child payments shown in the guardian view (mock)


### Success metrics
- Invoices paid by the due date
- Time admins spend on fee follow-up
- Guardians paying digitally


### Out of scope
- Holding funds on the platform
- Loans or credit




---

# Wave 2 — Professional networks

Bring coaches, referees and scouts onto the same identity layer and open consent-based pathways for players.

## Coach Platform
**A coaching career on the coach's own Football ID: licences, courses and coaching history across organizations.** · Route: /modules/coach · Wave 2

**Problem.** Coaching qualifications and experience are scattered across paper certificates and cannot be verified by clubs.

### Who it serves
- **Coach** — Show verified licences and coaching history when joining a new club.

### Scope
**MVP**
- Licence records (e.g. PSSI/AFC levels) with expiry
- Coaching history from team assignments
- Verification by the issuing body

**Next**
- Course catalogue and enrolment
- Licence expiry reminders

**Later**
- Coach development credits (CPD)
- Coach availability for opportunities


### Data it owns
| Entity | Description |
| --- | --- |
| CoachLicence | Level, issuer, issue and expiry date, verification status. |
| CoachingAssignment | A dated assignment to a team, derived from Teams. |
| CourseEnrolment | A course the coach is taking or has completed. |


### Data it reads (never owns)
- Coach Football ID
- Team coach assignments
- Organization records


### Football Journey events
- Coach licence verified (on the coach's own journey)


### Privacy & consent
- The coach controls which licences and history are public.
- Safeguarding checks are visible only to authorized administrators.


### Dependencies
- [training](#training)


### Builds on (already in the app)
- Coach role and assigned-team access rules
- Coach overview


### Success metrics
- Coaches with at least one verified licence
- Clubs viewing coach history when hiring


### Out of scope
- Coach employment contracts
- Salary handling



## Referee Platform
**Match assignments, digital match reports and referee development for referees and organizers.** · Route: /modules/referee · Wave 2

**Problem.** Referee appointments are arranged by phone and match reports are on paper, which delays results and disciplinary decisions.

### Who it serves
- **Referee** — Accept assignments and submit the official match report from the pitch.
- **Competition Organizer** — Appoint referees to fixtures and confirm results from reports.

### Scope
**MVP**
- Referee pool per competition
- Assign and accept match appointments
- Digital match report (score, cards, incidents)

**Next**
- Availability calendar
- Organizer confirmation of reports into results

**Later**
- Referee assessments
- Licence and fitness test records


### Data it owns
| Entity | Description |
| --- | --- |
| RefereeAppointment | A referee assigned to a match in a role (main, assistant). |
| MatchReport | The official record of a match submitted by the referee. |
| RefereeAssessment | A performance review by an assessor. |


### Data it reads (never owns)
- Matches and competitions
- Team sheets
- Referee Football ID


### Football Journey events
- Confirmed match reports feed match events on players' journeys


### Privacy & consent
- Disciplinary details are visible to organizers and the teams involved only.
- Assessments are private to the referee and assessors.


### Dependencies
_None — can start independently._

### Builds on (already in the app)
- Referee role
- Match detail with event timeline


### Success metrics
- Matches with a digital report
- Time from final whistle to confirmed result


### Out of scope
- Referee payments
- Live video review



## Opportunities
**Trials, selection camps and scholarships that players can apply to with their Football ID.** · Route: /modules/opportunities · Wave 2

**Problem.** Opportunities are shared in chat groups and reach only well-connected families; applications are repeated paperwork.

### Who it serves
- **Player** — Find opportunities for my age and position and apply with my Football ID.
- **Parent / Guardian** — Approve a child's application and see its status.

### Scope
**MVP**
- Opportunity listings by organizations
- Eligibility by age category, gender and region
- Apply with Football ID; guardian approval for minors

**Next**
- Application status tracking
- Shortlist and invitations

**Later**
- Scholarship programs with sponsors
- Recommendations based on the journey


### Data it owns
| Entity | Description |
| --- | --- |
| Opportunity | A trial, camp or scholarship with dates, eligibility and capacity. |
| Application | A player's application, with guardian approval and status. |


### Data it reads (never owns)
- Football ID and journey
- Guardian consent
- Organization records


### Football Journey events
- Selection for a camp or academy as an achievement event


### Privacy & consent
- Applicants share only the profile sections they choose.
- Minors cannot apply without guardian approval.
- Rejected applications are never visible to other organizations.


### Dependencies
_None — can start independently._

### Builds on (already in the app)
- Guardian consent grants
- Football ID passport


### Success metrics
- Applications per opportunity
- Applicants from outside the host organization
- Guardian approval time


### Out of scope
- Paid placement fees
- Agent representation



## Scouting
**Consent-based talent discovery for verified scouts, with guardian-approved contact.** · Route: /modules/scouting · Wave 2

**Problem.** Scouting of minors happens informally with no consent, verification or protection for families.

### Who it serves
- **Scout** — Discover players who opted in and request contact through the platform.
- **Parent / Guardian** — Decide whether a child is discoverable and approve each contact request.
- **Organization Admin** — See and approve scout interest in the club's players.

### Scope
**MVP**
- Verified scout accounts
- Player discoverability opt-in (guardian consent for minors)
- Contact requests routed through guardian and club

**Next**
- Scout watchlists
- Match attendance requests

**Later**
- Scouting reports shared with consent
- Cross-region discovery


### Data it owns
| Entity | Description |
| --- | --- |
| ScoutVerification | Verified identity and affiliation of a scout. |
| DiscoverabilitySetting | What a player exposes to scouts, set by player or guardian. |
| ContactRequest | A scout's request to contact a player, with approvals. |


### Data it reads (never owns)
- Football ID
- Verified achievements and match history
- Guardian consent grants


### Football Journey events
_Publishes no journey events._

### Privacy & consent
- Players under 18 are hidden from scouts by default.
- Scouts never see contact details; all contact goes through the platform.
- Every scout view of a profile is logged and visible to the guardian.


### Dependencies
- [development](#development)
- [opportunities](#opportunities)


### Builds on (already in the app)
- Scout role
- Privacy & Consent controls in My Children


### Success metrics
- Contact requests approved
- Guardian complaints (target zero)


### Out of scope
- Transfer negotiation
- Public talent rankings




---

# Wave 3 — Governance & intelligence

Turn verified ecosystem data into regional and national infrastructure, reporting and assistance.

## Analytics
**Insights for organizations and organizers across attendance, development, competitions and membership.** · Route: /modules/analytics · Wave 3

**Problem.** Clubs and organizers have data in the platform but no way to answer simple questions about growth, retention and results.

### Who it serves
- **Organization Admin** — Track retention, attendance and development coverage across teams.
- **Competition Organizer** — See participation, results and fair-play trends across a competition.

### Scope
**MVP**
- Organization dashboard: members, retention, attendance
- Competition dashboard: participation and results

**Next**
- Player pathway analytics (category to category)
- Exportable reports (CSV, PDF)

**Later**
- Benchmarks across organizations (anonymized)
- Custom report builder


### Data it owns
| Entity | Description |
| --- | --- |
| MetricSnapshot | Pre-computed metrics per organization or competition and period. |
| ReportDefinition | A saved report with filters and columns. |


### Data it reads (never owns)
- All source domains (read-only)


### Football Journey events
_Publishes no journey events._

### Privacy & consent
- Analytics are derived and never overwrite official records.
- Cross-organization benchmarks use anonymized, aggregated data only.
- Small groups (fewer than 5 players) are not shown individually in aggregates.


### Dependencies
- [development](#development)


### Builds on (already in the app)
- Organization and competition dashboards with stat cards
- Standings calculation


### Success metrics
- Admins opening analytics monthly
- Reports exported


### Out of scope
- Selling data to third parties
- Individual player rankings



## Association
**Regional governance for city and provincial associations: club registry, sanctioning and licensing.** · Route: /modules/association · Wave 3

**Problem.** Associations keep club and competition records separately from clubs, so registration and sanctioning are slow and hard to verify.

### Who it serves
- **Organization Admin** — Register the organization with the association and keep its status valid.
- **Competition Organizer** — Request sanctioning for a competition and receive approval.

### Scope
**MVP**
- Organization registration and renewal with the association
- Competition sanctioning requests
- Status visible on organization and competition pages

**Next**
- Organization licensing criteria checklist
- Association announcements

**Later**
- Regional disciplinary records
- Association fee collection (via Finance)


### Data it owns
| Entity | Description |
| --- | --- |
| OrganizationRegistration | An organization's registration with an association, with validity. |
| SanctionRequest | A competition's request for official approval. |
| LicenceCriterion | A requirement an organization must meet. |


### Data it reads (never owns)
- Organizations and competitions
- Membership and Digital KTA
- Association workspace


### Football Journey events
- Participation in sanctioned competitions marked as verified on players' journeys


### Privacy & consent
- Associations see organization-level data; player data only as needed for registration.
- Every approval is recorded with who approved and when.


### Dependencies
- [analytics](#analytics)


### Builds on (already in the app)
- Association role workspace
- Member directory, membership review and Digital KTA
- Competition oversight


### Success metrics
- Organizations registered
- Median time to sanction a competition


### Out of scope
- Replacing national federation systems
- Legal entity registration



## Federation
**A national player registry with transfers, eligibility checks and federation-wide reporting.** · Route: /modules/federation · Wave 3

**Problem.** Eligibility and transfers between clubs are checked manually, which allows age fraud and duplicate registrations.

### Who it serves
- **Competition Organizer** — Check player eligibility against the national registry before a match.

### Scope
**MVP**
- Registry sync of verified Football IDs
- Eligibility check (age category, registration, suspension)

**Next**
- Transfer requests between organizations
- Duplicate identity detection

**Later**
- Integration with national federation systems
- Federation-wide reporting


### Data it owns
| Entity | Description |
| --- | --- |
| RegistryEntry | A verified player's national registration record. |
| Transfer | A move between organizations with approvals and dates. |
| EligibilityCheck | A logged check of a player for a competition category. |


### Data it reads (never owns)
- Football ID verification
- Affiliations
- Association registrations


### Football Journey events
- Approved transfers as join and leave events
- Registry verification as a verification event


### Privacy & consent
- Identity documents are visible only to verifying officials.
- Transfers require the player's (or guardian's) confirmation.


### Dependencies
- [association](#association)


### Builds on (already in the app)
- Football ID verification status
- Affiliation history on the journey


### Success metrics
- Eligibility disputes per competition
- Duplicate identities detected


### Out of scope
- Professional contract registration
- International transfers



## AI Assistant
**An assistant that answers questions about your own football data and drafts summaries, within your permissions.** · Route: /modules/ai · Wave 3

**Problem.** Useful information is spread across modules; busy coaches and guardians need quick answers and summaries.

### Who it serves
- **Coach** — Ask who missed training this month or draft session ideas.
- **Parent / Guardian** — Get a plain-language summary of a child's month.
- **Organization Admin** — Ask for quick operational summaries before meetings.

### Scope
**MVP**
- Questions answered from data the user can already see
- Summaries of a player's month for guardians
- Every answer shows its sources

**Next**
- Draft session plans from the drill library
- Lineup suggestions based on availability

**Later**
- Bahasa Indonesia voice input
- Proactive weekly digests


### Data it owns
| Entity | Description |
| --- | --- |
| AssistantConversation | A user's conversation, private to them. |
| AssistantAnswer | A response with the records it was based on. |


### Data it reads (never owns)
- Any domain, strictly through the user's existing permissions


### Football Journey events
_Publishes no journey events._

### Privacy & consent
- The assistant can only read what the signed-in user is allowed to see.
- Suggestions are advisory and never change official records.
- Children's data is never used to train external models.


### Dependencies
- [analytics](#analytics)


### Builds on (already in the app)
- Role-based access rules for coaches, guardians and associations


### Success metrics
- Answers rated helpful
- Answers with correct sources


### Out of scope
- Automated selection or talent decisions
- Medical advice




