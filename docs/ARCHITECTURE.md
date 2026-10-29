# RedFlow — System Architecture & Technical Design

> **A Secure Blood Supply Ecosystem with Decentralized Donor Verification and Traceability**

RedFlow implements a **4-tier hybrid Web3 architecture** designed for high-throughput clinical operations, strict patient privacy compliance (GDPR/HIPAA-aligned zero-PII on chain), and cryptographic tamper-evidence using Ethereum smart contracts.

---

## 1. System Architecture Overview

```mermaid
flowchart TD
    %% Styling Classes
    classDef client fill:#F8FAFC,stroke:#0284C7,stroke-width:2px,color:#0F172A;
    classDef gateway fill:#F8FAFC,stroke:#4F46E5,stroke-width:2px,color:#0F172A;
    classDef database fill:#F0FDF4,stroke:#16A34A,stroke-width:2px,color:#0F172A;
    classDef blockchain fill:#FEF2F2,stroke:#DC2626,stroke-width:2px,color:#0F172A;
    classDef service fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E293B;

    %% 1. Presentation Layer
    subgraph Tier1 ["1. Presentation Layer (React 18 SPA + Vite)"]
        direction LR
        DonorUI["Donor Portal<br/>(Self-Registration, Cooldown, Badges)"]:::client
        HospUI["Hospital Dashboard<br/>(Emergency Requests, Pincode Search)"]:::client
        AdminUI["Admin Console<br/>(KYC Verification, Unit Intake, Testing)"]:::client
        VerifyUI["Public Verification Portal<br/>(Zero-Auth QR Scan, Tamper Detection)"]:::client
    end

    %% Network Transport
    DonorUI & HospUI & AdminUI -->|"HTTPS / REST (JWT Auth)"| Gateway
    VerifyUI -->|"HTTPS / Public REST"| Gateway

    %% 2. Application Layer
    subgraph Tier2 ["2. Application & Gateway Layer (Node.js & Express)"]
        direction TB
        Gateway["Express API Gateway & Router (`/api/*`)"]:::service
        
        subgraph LogicEngines ["Core Business & Crypto Services"]
            AuthGuard["Auth & Role Guard (JWT, Bcrypt)"]:::service
            IntervalChecker["90-Day Donation Cooldown Engine"]:::service
            StateMachine["Blood Unit State Machine Engine"]:::service
            HashEngine["Keccak-256 Deterministic Hash Engine"]:::service
            Web3Service["Ethers.js v6 Blockchain Service"]:::service
        end

        Gateway --> AuthGuard
        Gateway --> IntervalChecker
        Gateway --> StateMachine
        Gateway --> HashEngine
        Gateway --> Web3Service
    end

    %% Storage Connections
    StateMachine -->|"Mongoose ODM (Read/Write)"| DB
    AuthGuard -->|"Credentials & Roles"| DB
    HashEngine -.->|"Verify DB State"| DB

    Web3Service -->|"JSON-RPC (Port 7545 / Signed Tx)"| Contract
    Web3Service -->|"Audit Receipts"| TxCollection

    %% 3. Off-Chain Persistence Layer
    subgraph Tier3 ["3. Off-Chain Persistence Layer (MongoDB NoSQL)"]
        direction TB
        DB[("MongoDB Instance<br/>`mongodb://127.0.0.1:27017/redflow`")]:::database
        
        subgraph Collections ["Private Off-Chain Collections"]
            UserColl["Users & Credentials (Bcrypt Hash)"]:::database
            DonorColl["Donor Records (Private PII: Name, Phone, Address)"]:::database
            UnitColl["Blood Units (Metadata, Storage, QR DataURL)"]:::database
            TraceColl["Trace Events (Immutable Chronological Log)"]:::database
            ReqColl["Emergency Requests (Hospital Allocations)"]:::database
            TxCollection["Blockchain Transactions (Audit Trail)"]:::database
        end

        DB --- UserColl & DonorColl & UnitColl & TraceColl & ReqColl & TxCollection
    end

    %% 4. Blockchain Trust Layer
    subgraph Tier4 ["4. Blockchain Trust Layer (EVM / Ganache)"]
        direction TB
        Contract["Smart Contract: `RedFlow.sol`<br/>(Solidity 0.8.20 @ Chain ID 5777)"]:::blockchain
        
        subgraph OnChainStorage ["Immutable Ledger State (Zero PII)"]
            DonorMap["mapping(string => DonorRecord)<br/>`bytes32 dataHash`, `bool verified`, `bool flagged`"]:::blockchain
            UnitMap["mapping(string => BloodUnitRecord)<br/>`bytes32 dataHash`, `string status`"]:::blockchain
            EventsMap["Emitted EVM Events<br/>`DonorVerified`, `BloodUnitStatusUpdated`"]:::blockchain
        end

        Contract --- DonorMap & UnitMap & EventsMap
    end

    %% Cross-tier verification link
    UnitColl -.->|"Audit: dbHash == chainHash"| UnitMap
    DonorColl -.->|"Audit: dbHash == chainHash"| DonorMap
```

---

## 2. Architectural Tiers Breakdown

### Tier 1: Client & Presentation Layer (React 18 SPA)
* **Framework:** React 18, Vite build tooling, React Router DOM v6.
* **State & Authentication:** Custom `AuthContext` with JWT storage in `localStorage`, automatic token injection via Axios request interceptors.
* **Component Libraries & Styling:** RedFlow Design Language (RDL) based on strict 8px spatial grid, high-contrast healthcare palette (Navy `#172B4D`, Medical Teal `#007C91`, Emergency Crimson `#D32F2F`).
* **Actor Portals:**
  * **Donor Portal:** Self-registration, digital profile, 90-day cooldown status indicator, gamified donation tier badges (Bronze, Silver, Gold, Platinum).
  * **Hospital Portal:** Pincode-based blood unit availability lookup, emergency blood request dispatcher, allocation tracking.
  * **Admin Console:** Donor KYC document review, blood unit intake, laboratory testing status updates (`pending` → `safe` / `rejected`), request fulfillment.
  * **Public QR Verification:** Unauthenticated camera/upload QR verification route (`/verify/:unitId`), displaying cryptographic validation status.

### Tier 2: Application & Gateway Layer (Node.js & Express)
* **API Engine:** Express.js REST API with modular controllers and error-handling envelopes.
* **Security & RBAC:**
  * JWT Bearer authentication (`verifyToken`) with 24-hour expiration.
  * Role-Based Access Control (`roleGuard`) for `donor`, `hospital`, and `admin` roles.
  * Passwords hashed via Bcrypt (salt rounds: 10).
* **Cryptographic Hash Engine ([hashService.js](file:///c:/Users/prajw/Desktop/RedFlow/backend/src/services/hashService.js)):**
  * Generates deterministic Keccak-256 fingerprints across fixed schema fields.
  * Guaranteed identical calculation on write (minting/status update) and read (verification).
* **Web3 Blockchain Service ([blockchainService.js](file:///c:/Users/prajw/Desktop/RedFlow/backend/src/services/blockchainService.js)):**
  * Singleton `ethers.JsonRpcProvider` connecting to Ganache (HTTP `127.0.0.1:7545`, Chain ID `5777`).
  * Server-side `ethers.Wallet` signing transactions using the admin private key (users and browsers never handle gas fees or private keys).

### Tier 3: Off-Chain Persistence Layer (MongoDB)
* **Database:** MongoDB running locally on `mongodb://127.0.0.1:27017/redflow`.
* **Privacy Compliance:** Stores all Personally Identifiable Information (PII) including legal names, contact numbers, residential addresses, hospital coordinates, and laboratory diagnosis flags.
* **Traceability Engine:** Logs every state change into `TraceEvent` with timestamp, actor, and associated blockchain transaction receipt.

### Tier 4: Blockchain Trust & Audit Layer (Ethereum EVM)
* **Smart Contract:** `RedFlow.sol` written in Solidity 0.8.20 and compiled via Hardhat.
* **Core Ledger Records:**
  * `DonorRecord`: `{ bytes32 dataHash, bool verified, bool flagged, address verifiedBy, address flaggedBy, uint256 timestamp }`
  * `BloodUnitRecord`: `{ bytes32 dataHash, string status, address createdBy, address updatedBy, uint256 timestamp }`
* **Zero PII Guarantee:** Zero donor names, phones, or medical notes ever enter smart contract storage or EVM event logs.

---

## 3. Blood Unit Lifecycle State Machine

Each blood unit follows a strict, irreversible finite state machine to prevent cross-contamination, unauthorized dispensing, or usage of expired units:

```mermaid
stateDiagram-v2
    [*] --> Collected: Admin Intake (Collection Date Recorded)
    
    Collected --> Testing: Dispatched to Pathology Lab
    
    Testing --> Available: Lab Test Safe (testStatus = 'safe')
    Testing --> Rejected: Contaminated / Positive (testStatus = 'rejected')
    
    Available --> Requested: Matched with Hospital Emergency Request
    Available --> Expired: Exceeded 35-Day Shelf Life
    
    Requested --> Issued: Handed over / Dispatched to Hospital
    Requested --> Available: Request Cancelled / Allocation Released
    
    Collected --> Rejected: Screening Failure
    Available --> Rejected: Secondary Testing Failure
    
    Rejected --> [*]: Quarantined & Incinerated (Terminal)
    Issued --> [*]: Transfused into Patient (Terminal)
    Expired --> [*]: Safely Disposed (Terminal)
```

---

## 4. End-to-End Cryptographic Verification Flow

The following sequence diagram details how a blood unit is collected, anchored to the Ethereum ledger, and publicly audited for tampering:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Blood Bank Admin
    participant Client as Frontend (React)
    participant API as Express Gateway
    participant HashSvc as Hash Service
    participant Mongo as MongoDB
    participant Web3 as Blockchain Service
    participant EVM as Smart Contract (EVM)
    actor Auditor as Public Auditor / Recipient

    %% 1. Blood Unit Creation
    Note over Admin, EVM: 1. Unit Collection & Blockchain Anchoring
    Admin->>Client: Submit Unit Intake (Donor ID, Blood Group, Date)
    Client->>API: POST /api/blood-units (Bearer Admin JWT)
    API->>Mongo: Check Donor Eligibility & Cooldown (>= 90 Days)
    Mongo-->>API: Donor Verified & Eligible
    API->>HashSvc: hashBloodUnit(chainId, unitId, donorId, group, dates, status)
    HashSvc-->>API: Computed Keccak-256 Hash
    API->>Web3: addBloodUnitOnChain(unitId, unitHash, "collected")
    Web3->>EVM: execute addBloodUnit() (Signed with Admin Private Key)
    EVM-->>Web3: Tx Receipt (txHash, blockNumber)
    Web3->>Mongo: Save BlockchainTransaction record
    API->>Mongo: Insert BloodUnit (QR code dataURL, txHash)
    API->>Mongo: Create TraceEvent ('created')
    API-->>Client: 201 Created + Unit Details & QR Code

    %% 2. Public Verification
    Note over Auditor, EVM: 2. Zero-Auth Public Verification Flow
    Auditor->>Client: Scan Unit QR Code (/verify/:unitId)
    Client->>API: GET /api/verify/:unitId (No Auth Required)
    API->>Mongo: Query BloodUnit by unitId
    Mongo-->>API: Return DB Record
    API->>HashSvc: Recalculate hash from current DB fields
    HashSvc-->>API: dbHash
    API->>Web3: getOnChainBloodUnit(unitId)
    Web3->>EVM: Call getBloodUnitHash(unitId) [Zero Gas Read]
    EVM-->>Web3: chainHash, chainStatus
    API->>API: Compare: match = (dbHash === chainHash)
    API-->>Client: Return { match, dbHash, chainHash, dbStatus, chainStatus }
    
    alt dbHash === chainHash
        Client-->>Auditor: Display Green Badge: "Cryptographically Verified"
    else dbHash !== chainHash (Tampered DB)
        Client-->>Auditor: Display Red Alert: "RECORD TAMPERING DETECTED"
    end
```

---

## 5. Data Model & Privacy Boundary (Off-Chain vs On-Chain)

| Field / Attribute | Storage Location | Privacy Level | Cryptographic Handling |
| :--- | :--- | :--- | :--- |
| **Donor Legal Name** | MongoDB (`donors.name`) | Private PII | Kept strictly off-chain; never hashed |
| **Donor Phone & Email** | MongoDB (`donors.phone`) | Private PII | Kept strictly off-chain |
| **Residential Address & Pincode** | MongoDB (`donors.address`) | Private PII | Kept strictly off-chain |
| **Medical Flag Reason** | MongoDB (`donors.flagReason`) | Sensitive Medical | Only reason's `keccak256` hash is sent on flag event |
| **Donor Composite Identity** | Smart Contract (`donors[id].dataHash`)| Public Proof | `keccak256(chainId\|donorId\|bloodGroup\|lastDonationDate)` |
| **Donor Verification Status** | Smart Contract (`donors[id].verified`)| Public Proof | Boolean flag set by authorized admin wallet |
| **Blood Unit Composite State** | Smart Contract (`bloodUnits[id].dataHash`)| Public Proof | `keccak256(chainId\|unitId\|donorId\|group\|dates\|statuses)`|
| **Unit Status Tag** | Smart Contract (`bloodUnits[id].status`)| Public Proof | State tag (`collected`, `testing`, `available`, `issued`)|
| **Detailed Lab Diagnosis** | MongoDB (`bloodUnits.testNotes`)| Clinical Data | Kept strictly off-chain |
| **QR Code Image Payload** | MongoDB / Client | Operational Data| Contains URL `http://host:port/verify/<unitId>` |

---

## 6. Deterministic Hashing Specification

To ensure cryptographic integrity, the hash calculation order is fixed and immutable across all tiers:

### Donor Hash Formula
$$\text{donorHash} = \text{keccak256}\left(\text{chainId} \parallel \text{donorId} \parallel \text{bloodGroup} \parallel \text{lastDonationDate}\right)$$

### Blood Unit Hash Formula
$$\text{unitHash} = \text{keccak256}\left(\text{chainId} \parallel \text{unitId} \parallel \text{donorId} \parallel \text{bloodGroup} \parallel \text{collectionDate} \parallel \text{expiryDate} \parallel \text{testStatus} \parallel \text{availabilityStatus}\right)$$

> **Tamper Evident Property:** If an attacker alters any field in the database (e.g., changes an expired unit's `expiryDate` or changes an ineligible donor's `lastDonationDate`), recalculating the hash produces a radically different 32-byte digest, immediately triggering the **Tamper Warning** on verification.

---

## 7. Pre-Rendered Vector Visuals

A vector diagram formatted for presentations and technical project reviews is located in the repository at:
* **Vector File:** [`docs/redflow_system_architecture.svg`](file:///c:/Users/prajw/Desktop/RedFlow/docs/redflow_system_architecture.svg)
