# DTFS2 Architecture Overview 🏗️

This document provides a comprehensive overview of the main packages/services in the DTFS2 (Digital Trade Finance Service) system and how
they interact to support UK Export Finance's trade finance operations.

## System Overview

The DTFS2 system consists of three main product areas, each with its own UI and API components:

1. **Portal (BSS/EWCS)** - Bond Support Scheme and Export Working Capital Scheme
2. **GEF** - General Export Facility
3. **TFM** - Trade Finance Manager (UKEF's internal system)

Additionally, there is a **Central API** that acts as an intermediary for data management across these systems.

## Main Packages

### 1. portal-ui 🏛️

**Purpose**: User interface for BSS/EWCS (Bond Support Scheme, Export Working Capital Scheme)

**Key Responsibilities**:

- Handles user authentication and login (including 2FA via email)
- Allows users to select which product to apply for (BSS or GEF)
- Provides the UI for creating and managing BSS/EWCS deals and facilities
- Communicates with `portal-api` for data operations

**Technology**: Node.js, Nunjucks templates, GovUK design system

**Access**: <http://localhost:5000> (when running locally)

**Key Features**:

- User login with email-based 2FA verification
- Deal creation and management for Bond Support Scheme
- Submission of deals to banks and UKEF
- Integration with session storage for authentication

**Note**: Portal UI currently serves both the login/product selection functionality AND the BSS-specific pages. The vision is to eventually
separate these concerns so Portal only handles login and product selection, with BSS moving to its own dedicated UI (similar to GEF).

---

### 2. gef-ui 🌐

**Purpose**: User interface for the General Export Facility (GEF) product

**Key Responsibilities**:

- Provides a modern, streamlined UI for GEF deal applications
- Handles GEF-specific deal and cash contingent facility creation
- Interacts with `/gef` endpoints in `portal-api`
- Allows users to complete and submit GEF deals to banks and UKEF

**Technology**: Node.js, Nunjucks templates, modern GovUK design system

**Access**: <http://localhost:5006> or <http://localhost> via reverse proxy (when running locally)

**Key Features**:

- Modern, cleaner design compared to the older BSS UI
- Simplified data structure for easier maintenance
- Streamlined user experience for deal creation
- Integration with Portal for authentication

**Architecture Notes**:

- GEF was developed after BSS with lessons learned from the BSS project
- Has a more modern design and simpler data structure than BSS
- The vision is to eventually align BSS with GEF's design and data structure
- Accessed via Portal UI after user selects the GEF product option

---

### 3. portal-api 🏛️

**Purpose**: Backend API serving both BSS and GEF products

**Key Responsibilities**:

- Provides REST endpoints for BSS (located in `/server/v1`)
- Provides REST endpoints for GEF (located in `/server/v1/gef`)
- Handles business logic for deal and facility operations
- Sends deals to TFM (Trade Finance Manager) upon submission
- Manages user authentication and session data

**Technology**: Node.js, Express, MongoDB

**Access**: <http://localhost:5001> (when running locally)

**Key Features**:

- Separate endpoint structures for BSS and GEF
- User authentication and authorization
- Deal submission workflow to TFM
- Integration with external UKEF APIs
- GraphQL support (partial implementation)

**Architecture Notes**:

- Initially developed for BSS with a complex structure
- GEF endpoints are cleaner and more streamlined
- BSS endpoints are gradually becoming legacy
- Active development focuses primarily on GEF endpoints
- Future vision: align BSS and GEF to share similar or same endpoints

---

### 4. dtfs-central-api 📦️

**Purpose**: Central hub for managing data and submissions between different APIs

**Key Responsibilities**:

- Acts as an intermediary to prevent direct API-to-API calls
- Provides centralized CRUD operations for deals and facilities
- Creates immutable snapshots of submitted data for TFM
- Facilitates data passing between Portal/GEF and TFM systems
- Maintains data integrity across the system

**Technology**: Node.js, Express, MongoDB

**Access**: <http://localhost:5005> (when running locally)

**Key Features**:

- Centralized deal and facility CRUD operations
- Snapshot creation for TFM (deal snapshots and facility snapshots)
- Minimal business logic - focuses on data management
- Separation of concerns between different systems

**Data Flow**:

1. **Portal (BSS)** calls Central API for all deal/facility CRUD operations
2. **TFM** calls Central API to:
   - Fetch deals from Portal MongoDB collection (`deals`)
   - Create snapshots in TFM MongoDB collections (`tfm-deals`, `tfm-facilities`)
   - Update deal status from "Submitted" to "Acknowledged"

**Snapshot Structure**:

```javascript
// TFM Deal Structure
{
  dealSnapshot: {
    // Original deal data - immutable in TFM
    submissionType: 'Automatic Inclusion Notice',
    dealType: 'BSS/EWCS',
    // ...
  },
  tfm: {
    // TFM-specific data - the only part TFM can update
    dateReceived: '20-12-2021',
    // ...
  }
}
```

**Architecture Notes**:

- Currently only BSS (Portal) uses Central API for CRUD operations
- GEF does not currently use Central API for CRUD operations
- Future alignment: Either GEF should use Central API, or CRUD operations should be moved back to Portal API
- When GEF and BSS are fully aligned, some Central API CRUD operations may become redundant

---

### 5. trade-finance-manager-api (TFM API) ⚙️

**Purpose**: Backend API for UKEF's internal Trade Finance Manager system

**Key Responsibilities**:

- Accepts deal submissions from Portal and GEF
- Creates snapshots of deals and facilities via Central API
- Calls external UKEF APIs for additional data (e.g., currency conversions)
- Manages TFM-specific data and updates
- Generates and manages tasks for TFM users
- Handles deal acknowledgment workflow

**Technology**: Node.js, Express, MongoDB, Microsoft SQL Server (TypeORM)

**Access**: <http://localhost:5004> (when running locally)

**Key Features**:

- Deal submission processing and acknowledgment
- Integration with external UKEF APIs (APIM, MDM, Number Generator)
- Task generation and management for deal processing
- Email notifications via GOV.UK Notify
- Status updates back to Portal/GEF

**Deal Submission Workflow**:

1. Receive deal submission from Portal/GEF
2. Fetch deal from database by deal ID
3. Create snapshots of deal and facilities (via Central API)
4. Add snapshots to TFM MongoDB collections
5. Map fields into a generic format
6. Update deal status in Portal to "Acknowledged"
7. Call external UKEF APIs to populate additional data
8. Generate tasks for TFM users
9. Send acknowledgment and notification emails

**Architecture Notes**:

- In TFM, a "deal" is part of a larger "Case" which includes deals, facilities, and tasks
- Handles both BSS and GEF deal types (with different data structures)
- BSS data structure is more complex; GEF is more streamlined
- Future: When BSS aligns with GEF structure, TFM will be refactored to use generic structure
- Snapshots ensure that original deal data remains immutable in TFM

---

### 6. trade-finance-manager-ui (TFM UI) 💻

**Purpose**: Internal user interface for UKEF staff to review and process trade finance deals

**Key Responsibilities**:

- Provides interface for reviewing submitted deals and facilities
- Displays deal information using GovUK and MOJ design components
- Allows TFM users to complete tasks required for deal processing
- Manages case workflow and status updates
- Communicates with `trade-finance-manager-api` via REST

**Technology**: Node.js, Nunjucks templates, GovUK and MOJ design systems

**Access**: <http://localhost:5003> (when running locally)

**Key Features**:

- Deal and facility review interface
- Task management for case processing
- Case status tracking
- User authentication for TFM staff
- Minimal business logic - focuses on data presentation

**Architecture Philosophy**:

- Prioritizes simplicity and clarity in codebase
- Avoids complex logic or business rules
- Focuses on rendering data for user review
- Uses REST API calls to TFM API for all data operations

---

## System Interaction Flow

### Basic Deal Workflow

1. **User Login**: User logs into Portal UI with 2FA authentication
2. **Product Selection**: User selects BSS or GEF product
3. **Deal Creation**: User creates deal using Portal UI (BSS) or GEF UI
4. **Deal Completion**: User completes all required information
5. **Bank Submission**: User submits deal to their bank
6. **Bank Approval**: Bank reviews and approves the deal
7. **UKEF Submission**: Bank submits approved deal to UKEF
8. **TFM Processing**: Deal is sent to Trade Finance Manager for UKEF review
9. **TFM Review**: UKEF staff review and process the deal in TFM UI
10. **Final Decision**: Deal is approved or declined

### Data Flow Between Services

```text
┌─────────────┐         ┌─────────────┐         ┌──────────────────┐
│  Portal UI  │────────▶│  Portal API │────────▶│  Central API     │
│   (BSS)     │         │   (BSS)     │         │  (CRUD + Snapshot)│
└─────────────┘         └─────────────┘         └──────────────────┘
                                                           │
                                                           ▼
┌─────────────┐         ┌─────────────┐         ┌──────────────────┐
│   GEF UI    │────────▶│  Portal API │         │    TFM API       │
│             │         │   (GEF)     │────────▶│  (Submission)    │
└─────────────┘         └─────────────┘         └──────────────────┘
                                                           │
                                                           ▼
                                                 ┌──────────────────┐
                                                 │     TFM UI       │
                                                 │   (Review)       │
                                                 └──────────────────┘
```

### Database Collections

- **Portal (BSS) Collections**: `deals`, `facilities`, `users`, `banks`
- **TFM Collections**: `tfm-deals`, `tfm-facilities`, `tfm-tasks`
- **Shared Collections**: Eligibility criteria, teams

---

## Design Evolution and Future Vision

### Current State

- **BSS (Portal)**: Older design, complex data structure, serves both login and BSS pages
- **GEF**: Modern design, simplified data structure, separate UI service
- **TFM**: Handles both product types with different data structures

### Future Vision

1. **UI Alignment**:
   - Separate Portal into login/product selection only
   - Move BSS to dedicated `bss-ui` service
   - Align BSS design with modern GEF design
   - Consistent user experience across products

2. **API Alignment**:
   - Use GEF data structure as standard for both products
   - Share endpoints between BSS and GEF where possible
   - Reduce data mapping complexity in other systems
   - Possibly consolidate into single set of endpoints with product flags

3. **Central API Strategy**:
   - Either extend Central API usage to GEF
   - Or remove CRUD operations from Central API and handle in Portal API
   - Decision to be made when BSS and GEF are fully aligned

4. **TFM Simplification**:
   - Refactor to use generic data structure (based on GEF)
   - Eliminate product-specific data mapping
   - Streamline snapshot creation and management

---

## Technology Stack

### Common Technologies

- **Runtime**: Node.js (Version 20+)
- **Package Manager**: NPM with workspaces
- **Databases**: MongoDB, Microsoft SQL Server
- **Containerization**: Docker and Docker Compose
- **Template Engine**: Nunjucks
- **Design Systems**: GovUK, MOJ (Ministry of Justice)
- **Testing**: Jest (unit tests), Cypress (E2E tests)
- **Build Tool**: Webpack

### API Technologies

- **Framework**: Express.js
- **API Documentation**: Swagger (OpenAPI 3.0)
- **GraphQL**: Partial implementation in Portal API
- **ORM**: TypeORM (for SQL Server)

### Security Features

- JWT authentication
- Session management with cookies
- CSRF protection
- Sub-resource integrity (SRI) for client-side scripts

---

## Development Guidelines

### When Working on Each Service

**portal-ui / gef-ui / trade-finance-manager-ui**:

- Minimal business logic - focus on presentation
- Run `npm run build` after changing SCSS or JS source files
- Update SRI hashes after recompiling JavaScript files
- Keep design consistent with GovUK guidelines

**portal-api**:

- BSS endpoints: Minimize new work (legacy focus)
- GEF endpoints: Active development area
- Consider alignment between BSS and GEF when adding features

**dtfs-central-api**:

- Keep business logic minimal
- Focus on data management and snapshots
- Ensure data integrity between systems

**trade-finance-manager-api**:

- Handle both BSS and GEF product types
- Maintain snapshot immutability
- Coordinate with external UKEF APIs

---

## Quick Reference

| Service | Port | Purpose | Key Technology |
| ------- | ---- | ------- | -------------- |
| portal-ui | 5000 | BSS/EWCS UI | Nunjucks, GovUK |
| portal-api | 5001 | BSS & GEF API | Express, MongoDB |
| gef-ui | 5006 | GEF UI | Nunjucks, GovUK |
| trade-finance-manager-ui | 5003 | TFM UI | Nunjucks, GovUK, MOJ |
| trade-finance-manager-api | 5004 | TFM API | Express, MongoDB, SQL Server |
| dtfs-central-api | 5005 | Central Data API | Express, MongoDB |

For more detailed information about each service, refer to their individual README files in their respective directories.

---
