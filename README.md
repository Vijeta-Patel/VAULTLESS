<div align="center">

<img src="logo.png" alt="VAULTLESS Logo" width="80"/>

# ⬡ VAULTLESS

**Behavioural biometric authentication anchored to the Ethereum blockchain.**  
*Your typing rhythm is your password. You can't steal a habit.*

[![Video Demo](https://img.shields.io/badge/▶%20Video%20Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/H1GDiib1YAI?si=nnAmtng34_nXSFHa)
[![Visit Site](https://img.shields.io/badge/🌐%20Visit%20Site-1a1a2e?style=for-the-badge)](https://vaultless-sys.vercel.app/)
[![Devfolio](https://img.shields.io/badge/🏆%20Devfolio-3770FF?style=for-the-badge)](https://devfolio.co/projects/vaultless-dea4)

</div>

---

## 📖 Table of Contents

1. [Why VAULTLESS](#-why-vaultless)
2. [Social Impact](#-social-impact)
3. [What It Does](#-what-it-does)
4. [How Keystrokes Are Captured](#-how-keystrokes-are-captured)
5. [Z-Score Normalisation — Speed-Independent Identity](#-z-score-normalisation--speed-independent-identity)
6. [Enrollment — Building the Biometric Profile](#-enrollment--building-the-biometric-profile)
7. [Authentication Scoring Engine](#-authentication-scoring-engine)
8. [Full System Workflow — End-to-End](#-full-system-workflow--end-to-end)
9. [Blockchain Integration — Real Mode](#-blockchain-integration--real-mode)
10. [Duress Protocol & Ghost Session](#-duress-protocol--ghost-session)
11. [Duress Alert Email](#-duress-alert-email)
12. [Smart Contract Reference](#-smart-contract-reference)
13. [Tech Stack](#-tech-stack)
14. [Routes](#-routes)
15. [Project Structure](#-project-structure)
16. [Getting Started](#-getting-started)
17. [Environment Variables](#-environment-variables)
18. [Behaviour Engine Tuning](#-behaviour-engine-tuning)
19. [Notes](#-notes)

---

## 🔐 Why VAULTLESS

Digital security still depends too heavily on secrets that can be **stolen, guessed, phished, leaked, or coerced** out of people. Passwords, OTPs, and even many forms of 2FA fail at the exact moment a person is under pressure.

VAULTLESS explores a safer model: **authentication based on how a person naturally behaves**, not just what they know. Instead of trusting a static secret, the system looks at behavioural signals — typing rhythm, mouse movement, touch behaviour, and device motion — then uses that signal to make authentication harder to fake and easier to adapt under real-world conditions.

---

## 🌍 Social Impact

VAULTLESS is designed as a prototype for security that protects people, not just accounts:

| Who it helps | How |
|---|---|
| Students & workers | Reduces hijacking via phishing or leaked passwords |
| Families | Adds a behaviour layer that static passwords lack |
| Journalists & activists | Coercion-aware duress flow avoids obvious alert to attacker |
| Security teams | Transparent on-chain event log for high-trust systems |

The **duress flow** is especially important: in a coercive situation, the goal is not only to block access but to protect the user without obviously alerting the attacker — making VAULTLESS a prototype for more *humane* security.

---

## ✅ What It Does

VAULTLESS replaces static credentials with a **behavioural profile** built from multiple signals:

| Signal | Desktop | Mobile |
|---|---|---|
| Keystroke hold times | ✅ | ✅ |
| Keystroke flight times | ✅ | ✅ |
| Mouse velocity & direction | ✅ | — |
| Touch movement & pressure | — | ✅ |
| Gyroscope (rotation rate) | — | ✅ (where supported) |
| Accelerometer | — | ✅ (where supported) |
| Rhythm variance / stress | ✅ | ✅ |

The app guides a user through **enrollment**, compares live behaviour during **authentication**, and routes the session into one of three outcomes:

| Result | Score | Action |
|---|---|---|
| ✅ `authenticated` | ≥ 0.70 | Normal session granted |
| 🟡 `duress` | 0.60 – 0.70 + stress | Ghost session loaded; alert sent |
| ❌ `rejected` | < 0.60 | Access denied |

---

## 🎹 How Keystrokes Are Captured

When a user types the enrollment phrase `"Secure my account"`, the browser captures precise sub-millisecond timing for every key press using `performance.now()`.

```
┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│    S    │    e    │    c    │    u    │    r    │    e    │  ···18 keys total
│  key 1  │  key 2  │  key 3  │  key 4  │  key 5  │  key 6  │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

   ████      ██     ████        ██      ████     ██
───┤  ├──────┤ ├────┤  ├────────┤ ├─────┤  ├─────┤ ├──────────▶ time

   ████ = Hold time (how long each key is pressed)
   ──── = Flight time (gap between releasing one key and pressing next)
```

Two arrays are extracted per sample:

| Array | Contents |
|---|---|
| `holdTimes[]` | Duration each key was physically held down, in milliseconds |
| `flightTimes[]` | Gap from key-up to next key-down, in milliseconds |

**Example values for `"Secure my account"`:**
```
holdTimes[]   = [130, 72, 96, 152, 80, 112 ...]  ms per key
flightTimes[] = [128, 184, 160, 104, 176 ...]     ms between keys
```

---

## 📐 Z-Score Normalisation — Speed-Independent Identity

Raw timing values differ between a fast typist and a slow typist even when they have the *same rhythm*. Z-score normalisation removes speed and preserves **shape** — the relative pattern that is unique to each person.

```
Person A — fast typist                    Person B — slow typist, same rhythm
Raw: [55, 29, 45, 17, 39, 51] ms         Raw: [110, 58, 90, 34, 78, 102] ms
     mean ≈ 39ms                               mean ≈ 79ms

                     z-score normalise ───▶

              Both become the same z-normalised shape:
              [+1.1, −0.7, +0.3, −1.6, −0.1, +0.9]
              mean=0   std=1   speed removed ✓

Two different people → very different z-shape ✗
```

**Formula:**
```
z = (value − mean) / std
```

Each value is re-expressed as standard deviations from the session mean. This means:

- A fast typist and a slow typist with the *same style* produce **identical** z-vectors
- Two different people produce **divergent** z-vectors even at the same speed

This is why VAULTLESS uses `holdTimesZ` and `flightTimesZ` (not raw arrays) as the primary identity fingerprint.

---

## 📋 Enrollment — Building the Biometric Profile

Enrollment requires **3 separate samples** of the phrase `"Secure my account"`. This multi-sample approach reduces noise and produces a stable baseline.

```
 ┌─────────────┐
 │  Sample 1   │  holdTimes[ ]
 │  holdTimes[]│ ─────────────────┐
 └─────────────┘                  │
                                  ▼
 ┌─────────────┐          ┌──────────────────────┐      ┌──────────────────┐      ┌───────────────┐
 │  Sample 2   │  ──────▶ │   Average profile    │ ───▶ │  Float32Array    │ ───▶ │  keccak256    │
 │  holdTimes[]│          │  min-length aligned  │      │  64-dim vector   │      │  bytes32 hash │
 └─────────────┘          │  3-sample mean/key   │      │  normalised 0–1  │      │  → Ethereum   │
                          └──────────────────────┘      └──────────────────┘      └───────────────┘
 ┌─────────────┐
 │  Sample 3   │  holdTimes[ ]
 │  holdTimes[]│ ─────────────────┘
 └─────────────┘

 ◀─────────────────────────────────────────────▶    ◀──────────────────────────────────────────▶
     Stored locally: full keystroke profile               On-chain: commitment hash only
              (context + raw arrays)                            (irreversible, private)
```

**What gets stored where:**

| Data | Location | Contains |
|---|---|---|
| Full keystroke profile | `localStorage` | `holdTimes[]`, `flightTimes[]`, z-vectors, scalars |
| Mouse / touch profile | `localStorage` | Velocity, direction, pressure, gyro |
| Commitment hash | Ethereum Sepolia | `bytes32` keccak256 of Float32Array vector |
| Wallet address | `localStorage` + chain | Used to look up identity in contract |

The commitment hash is computed from the first 32 bytes of the Float32Array (each `float → uint8` scaled 0–255, packed as hex), then registered via `contract.register(commitmentHash)`.

---

## 🧠 Authentication Scoring Engine

When the user types the phrase during authentication, a live sample is compared against the enrolled baseline using four weighted components:

```
 Live holdTimesZ ────────────▶ ┌──────────────────────────┐
                               │  Hold shape (Pearson)     │
 Enrolled holdTimesZ ────────▶ │  which keys do you linger │ × 0.40 weight
                               │  on?                      │ ──────────────┐
                               └──────────────────────────┘               │
                                                                           │
 Live holdTimes ─────────────▶ ┌──────────────────────────┐               │    ┌──────────────────────────┐
                               │  Hold magnitude (zMAD)    │               │    │      Final score          │
 Enrolled holdTimes ─────────▶ │  are relative key         │ × 0.25 weight ├──▶ │       0.0 – 1.0           │
                               │  durations the same?      │ ──────────────┤    │  weighted sum of all 4    │
                               └──────────────────────────┘               │    │  components               │
                                                                           │    └───────────┬──────────────┘
 Live flightTimesZ ──────────▶ ┌──────────────────────────┐               │                │
                               │  Flight shape (Pearson)   │               │    ┌───────────▼──────────────┐
 Enrolled flightTimesZ ──────▶ │  your between-key rhythm  │ × 0.25 weight │    │  ≥ 0.70 → Authenticated  │
                               └──────────────────────────┘ ──────────────┘    ├──────────────────────────┤
                                                                                │  0.60–0.70 → Duress      │
                               ┌──────────────────────────┐                    ├──────────────────────────┤
                               │  Duration ratio           │ × 0.10 weight ───▶ │  < 0.60 → Rejected       │
                               │  overall speed match      │                    └──────────────────────────┘
                               └──────────────────────────┘
```

**Score component breakdown:**

| Component | Weight | Method | What it measures |
|---|---|---|---|
| Hold shape | 40% | Pearson correlation on `holdTimesZ` | Which keys you linger on — your personal key identity |
| Hold magnitude | 25% | Ratio similarity on raw `holdTimes` | Per-key duration proportions, speed-normalised |
| Flight shape | 25% | Pearson correlation on `flightTimesZ` | Between-key rhythm and pacing style |
| Duration ratio | 10% | `min/max` of total duration | Overall typing speed match |

When mouse / touch / motion data is available from enrollment, a fifth component is blended in:

```
Final score = keystroke score × 0.85 + mouse/gesture score × 0.15
```

**Stress detection** fires when live rhythm variance exceeds `2.5×` the enrollment baseline — a signal that the user may be under pressure — which pushes a borderline score into the duress classification path.

---

## 🔄 Full System Workflow — End-to-End

```
╔══════════════════════════════════════════════════════════════════════════════════════════════╗
║                              VAULTLESS — COMPLETE SYSTEM FLOW                               ║
╠══════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────────────────────┐    ║
║  │                            PHASE 1 — ENROLLMENT                                     │    ║
║  └─────────────────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                              ║
║   User visits /enroll                                                                        ║
║        │                                                                                     ║
║        ▼                                                                                     ║
║   Types "Secure my account" × 3 ──▶ keystroke.onKeyDown / onKeyUp capture                  ║
║        │                             mouse.onMouseMove / onTouchMove capture                ║
║        │                             gyro + accelerometer (mobile, if permitted)            ║
║        │                                                                                     ║
║        ▼                                                                                     ║
║   extractVector() per sample                                                                 ║
║        │                                                                                     ║
║        ▼                                                                                     ║
║   Average 3 samples ──▶ enrollmentKeystroke { holdTimes, flightTimes, holdTimesZ, ... }     ║
║        │                enrollmentMouse     { velocities, angleDiffs, gyroMag, ... }        ║
║        │                                                                                     ║
║        ▼                                                                                     ║
║   buildCombinedVector() ──▶ Float32Array[64]  (hold[0–19], flight[20–39], scalars[40–63])  ║
║        │                                                                                     ║
║        ▼                                                                                     ║
║   vectorToHash() ──▶ bytes32 commitmentHash  (first 32 bytes → keccak256)                  ║
║        │                                                                                     ║
║        ├──▶ [LOCAL]  localStorage  ← full profile + wallet address + recovery email        ║
║        │                                                                                     ║
║        └──▶ [CHAIN]  contract.register(commitmentHash)                                      ║
║                            │                                                                 ║
║                            ▼                                                                 ║
║                      Sepolia contract stores:                                                ║
║                        identities[walletAddress] = {                                         ║
║                          commitmentHash,                                                     ║
║                          enrolledAt: block.timestamp,                                        ║
║                          isLocked: false,                                                    ║
║                          exists: true                                                        ║
║                        }                                                                     ║
║                      emit Registered(user, timestamp) ──▶ visible on Etherscan              ║
║                                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────────────────────┐    ║
║  │                          PHASE 2 — AUTHENTICATION                                   │    ║
║  └─────────────────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                              ║
║   User visits /auth                                                                          ║
║        │                                                                                     ║
║        ▼                                                                                     ║
║   Types "Secure my account" once ──▶ live keystroke + mouse/touch capture                   ║
║        │                                                                                     ║
║        ▼                                                                                     ║
║   extractVector() ──▶ liveKeystroke, liveMouse                                              ║
║        │                                                                                     ║
║        ▼                                                                                     ║
║   cosineSimilarity(liveKeystroke, enrolledKeystroke, liveMouse, enrolledMouse)               ║
║        │                                                                                     ║
║        │   holdShape (Pearson) × 0.40                                                       ║
║        │ + holdMagnitude (ratio) × 0.25                                                     ║
║        │ + flightShape (Pearson) × 0.25                                                     ║
║        │ + durationRatio × 0.10                                                              ║
║        │ [+ mouseScore × 0.15 if enrolled mouse data exists]                                ║
║        │                                                                                     ║
║        ▼                                                                                     ║
║   score = 0.0 – 1.0                                                                          ║
║        │                                                                                     ║
║        │   detectStress()  ←  liveVariance > enrollVariance × 2.5 ?                        ║
║        │                                                                                     ║
║        ▼                                                                                     ║
║   classifyScore(score, isStress)                                                             ║
║        │                                                                                     ║
║   ┌────┴──────────────────────────────────────────────────────┐                             ║
║   │                                                           │                             ║
║   ▼                          ▼                                ▼                             ║
║ score ≥ 0.70            0.60–0.70 + stress            score < 0.60                         ║
║ AUTHENTICATED              DURESS                        REJECTED                           ║
║   │                          │                                │                             ║
║   │                          │                                │                             ║
║   ▼                          ▼                                ▼                             ║
║ [CHAIN]                  [CHAIN]                          [CHAIN]                           ║
║ generateNullifier()      triggerDuress()                 authFailed()                       ║
║ contract.authenticate    emit DuressActivated            emit AuthFailed                    ║
║ (nullifier)              (nullifier used once)           (logged on chain)                  ║
║ emit AuthSuccess         │                                │                                 ║
║   │                      │                                │                                 ║
║   ▼                      ▼                                ▼                                 ║
║ /dashboard           sendDuressAlert()               /auth (retry)                          ║
║ (real session)       via EmailJS                     or lockout                             ║
║                          │                                                                  ║
║                          ├──▶ [LOCAL] setIsDuressMode(true)                                ║
║                          │                                                                  ║
║                          └──▶ /ghost  (decoy dashboard,                                    ║
║                                        attacker sees normal session)                        ║
║                                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## ⛓️ Blockchain Integration — Real Mode

> Applies when `VITE_DEMO_MODE=false` and MetaMask is connected to Sepolia.

```
  USER BROWSER                    METAMASK WALLET                  SEPOLIA BLOCKCHAIN
  ─────────────                   ───────────────                  ──────────────────

  [Enroll page]
  Build Float32Array[64]
  vectorToHash() ──▶ bytes32 ──▶  Sign tx with private key  ──▶   VaultlessCore.register(hash)
                                                                    identities[addr] = {hash, ts}
                                                                    emit Registered(addr, ts)
                                                                         │
                                                              ◀──── tx receipt / txHash
  addEtherscanLink("Enrolled", txHash)
  Link shown in Dashboard panel


  [Auth page]
  Live sample captured
  Score computed: 0.87
  classifyScore() = "authenticated"

  generateNullifier(vector, addr)  ─────────────────────────────▶  usedNullifiers[nullifier] = true
  (keccak256(hash + addr + ts))                                     (prevents replay attacks)
                                   Sign tx with private key  ──▶   contract.authenticate(nullifier)
                                                                    emit AuthSuccess(addr, nullifier, ts)
  ◀──── tx receipt
  Redirect to /dashboard


  [Auth page — duress path]
  Score: 0.65 + stress detected

                                   Sign tx with private key  ──▶   contract.triggerDuress()
                                                                    emit DuressActivated(addr, ts)
  ◀──── tx receipt
  sendDuressAlert() via EmailJS ──▶ Recovery email inbox
  Redirect to /ghost (decoy)


  [Auth page — rejected path]
  Score: 0.42

                                   Sign tx with private key  ──▶   contract.authFailed()
                                                                    emit AuthFailed(addr, ts)
  ◀──── tx receipt
  Show rejection UI
```

**Replay attack protection:** Every successful authentication burns a unique nullifier (derived from the biometric vector + wallet address + timestamp). The contract stores used nullifiers and rejects any repeat submission — so a captured authentication transaction cannot be replayed.

**Contract address:** Set via `VITE_CONTRACT_ADDRESS` in `.env`. Deployed on Ethereum Sepolia Testnet (chainId `11155111`).

---

## 👻 Duress Protocol & Ghost Session

If the typing pattern scores in the duress band **and** stress is detected (live rhythm variance > 2.5× enrollment baseline), VAULTLESS activates the duress protocol silently:

```
  Score: 0.65   Stress: TRUE
       │
       ▼
  classifyScore() = "duress"
       │
       ├──▶ [CHAIN]   contract.triggerDuress()
       │              emit DuressActivated(addr, ts) ──▶ Etherscan (public, permanent)
       │
       ├──▶ [EMAIL]   sendDuressAlert() via EmailJS
       │              → recovery email (wallet addr, timestamp, Etherscan link)
       │
       ├──▶ [LOCAL]   setIsDuressMode(true)
       │              Real account context is protected / isolated
       │
       └──▶ [ROUTE]   navigate('/ghost')
                       Ghost.jsx renders Dashboard.jsx with isGhost=true
                       URL does NOT visibly change
                       Attacker sees a normal authenticated session
                       Real account is safe
```

The `/ghost` route renders **the exact same Dashboard component** — the attacker sees no visual difference. Meanwhile, the real account is flagged on-chain and the owner receives an alert.

---

## 📧 Duress Alert Email

When duress is detected, VAULTLESS sends an automated alert to the recovery email address provided during enrollment. The email is sent via EmailJS and contains the following:

```
╔══════════════════════════════════════════════════════════════════════════╗
║   ⬡ VAULTLESS  Security Engine                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║   🚨 Duress Alert — Protective Mode Activated                           ║
║                                                                          ║
║   VAULTLESS detected a potential coercion or high-stress                ║
║   authentication attempt and automatically activated protection.        ║
║                                                                          ║
║   ┌──────────────────────────────────────────────────────────────────┐  ║
║   │  Incident Details                                                │  ║
║   │  Wallet Address:  0xABC...1234                                   │  ║
║   │  Time:            14/03/2026, 19:11:27                           │  ║
║   │  Transaction:     View on Etherscan ↗                            │  ║
║   └──────────────────────────────────────────────────────────────────┘  ║
║                                                                          ║
║   Recommended Actions                                                    ║
║   1. Verify recent account activity immediately                         ║
║   2. Rotate critical credentials if needed                              ║
║   3. Re-authenticate from a trusted device/network                      ║
║   4. Contact your security/admin team if this was not expected          ║
║                                                                          ║
║   If this was you and safe, you can continue using VAULTLESS            ║
║   normally after verification.                                           ║
║                                                                          ║
║   Stay safe,                                                             ║
║   ⬡ VAULTLESS Security Engine                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Email payload fields sent via EmailJS template:**

| Field | Value |
|---|---|
| `to_email` | Recovery email set during enrollment (falls back to `VITE_ALERT_EMAIL`) |
| `subject` | `🚨 VAULTLESS DURESS ALERT` |
| `wallet_address` | Full wallet address of the affected account |
| `timestamp` | Human-readable local timestamp of the event |
| `etherscan_link` | Direct link to the `DuressActivated` transaction on Sepolia Etherscan |
| `message` | Full incident summary including wallet, time, Etherscan URL, and status |

Configure via `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, and `VITE_EMAILJS_PUBLIC_KEY` in `.env`.

---

## 📜 Smart Contract Reference

Contract: `src/contracts/VaultlessCore.sol` — Solidity `^0.8.20`, deployed on Ethereum Sepolia.

### Data Structures

```solidity
struct Identity {
    bytes32 commitmentHash;   // keccak256 of biometric vector
    uint256 enrolledAt;       // block.timestamp of registration
    bool    isLocked;         // duress/lockout flag
    bool    exists;           // registration guard
}

mapping(address => Identity) public identities;
mapping(bytes32 => bool)     public usedNullifiers;  // replay protection
```

### Functions

| Function | Access | Description |
|---|---|---|
| `register(bytes32 hash)` | Public | Register a new biometric commitment. Fails if already registered. |
| `authenticate(bytes32 nullifier)` | Registered, not locked | Record successful auth. Burns nullifier to block replay. |
| `authFailed()` | Registered | Log a failed authentication attempt. |
| `triggerDuress()` | Registered | Log duress event on-chain. Does not lock account. |
| `refine(bytes32 newHash)` | Registered, not locked | Update commitment hash (e.g., after re-enrollment). |
| `unlockAccount()` | Registered | Self-service unlock after lockout. |
| `getIdentity(address)` | View | Return identity record for any address. |
| `isNullifierUsed(bytes32)` | View | Check if a nullifier has been consumed. |

### Events

| Event | Emitted when | Indexed fields |
|---|---|---|
| `Registered` | Successful enrollment | `user`, `timestamp` |
| `AuthSuccess` | Authentication passes | `user`, `nullifier`, `timestamp` |
| `AuthFailed` | Score below threshold | `user`, `timestamp` |
| `DuressActivated` | Duress band + stress | `user`, `timestamp` |
| `Refined` | Commitment hash updated | `user`, `timestamp` |

### Deploy to Sepolia

1. Open [Remix IDE](https://remix.ethereum.org)
2. Paste `src/contracts/VaultlessCore.sol`
3. Compile with Solidity `0.8.20`
4. Deploy using **Injected Provider — MetaMask** on Sepolia
5. Copy deployed address → `VITE_CONTRACT_ADDRESS` in `.env`
6. Set `VITE_DEMO_MODE=false`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + Vite 5 |
| Routing | React Router v6 |
| Blockchain client | Ethers.js v6 |
| Smart contract | Solidity 0.8.20 |
| Network | Ethereum Sepolia Testnet |
| Charts | Recharts |
| Styling | Tailwind CSS + PostCSS |
| Email alerts | EmailJS (`@emailjs/browser`) |
| Sensor capture | Browser DeviceMotion / DeviceOrientation APIs |
| State persistence | `localStorage` via `VaultlessContext.jsx` |
| Deployment | Vercel |

---

## 🗺️ Routes

| Route | Page | Purpose |
|---|---|---|
| `/` | `Landing.jsx` | Product overview, demo mode toggle |
| `/gmail` | `Gmail.jsx` | Gmail-style entry point (realistic context) |
| `/enroll` | `Enroll.jsx` | 3-sample behavioural enrollment flow |
| `/auth` | `Auth.jsx` | Live authentication, scoring ring, classification |
| `/dashboard` | `Dashboard.jsx` | Authenticated session with on-chain event panel |
| `/ghost` | `Ghost.jsx` | Decoy session shown silently during duress |

Unknown routes redirect to `/`.

---

## 📁 Project Structure

```text
src/
├── components/
│   ├── DataStream.jsx          Animated data visualisation
│   ├── HexLoader.jsx           Hexagonal loading spinner
│   ├── PageShell.jsx           Shared page wrapper
│   └── ParticleBackground.jsx  Ambient particle effect
│
├── contracts/
│   └── VaultlessCore.sol       Sepolia smart contract
│
├── hooks/
│   ├── behaviouralEngine.js    ← Core DNA engine
│   │     useKeystrokeDNA()       hold/flight capture + z-normalisation
│   │     useMouseDNA()           velocity, angle, touch, gyro, accelerometer
│   │     buildCombinedVector()   Float32Array[64] builder
│   │     cosineSimilarity()      4-component weighted scorer
│   │     detectStress()          rhythm variance stress signal
│   │     classifyScore()         authenticated / duress / rejected
│   └── useViewport.js          Mobile/desktop detection
│
├── lib/
│   ├── ethereum.js             MetaMask, contract calls, nullifier, demo stubs
│   ├── VaultlessContext.jsx    Global state, localStorage persistence
│   └── duressAlert.js         EmailJS duress email integration
│
└── pages/
    ├── Landing.jsx
    ├── Gmail.jsx
    ├── Enroll.jsx
    ├── Auth.jsx
    ├── Dashboard.jsx
    └── Ghost.jsx              Imports Dashboard with isGhost=true
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 18+ | Required |
| npm | Any recent | Bundled with Node |
| MetaMask | Latest | Only for live blockchain mode |
| Sepolia ETH | Any amount | From [sepoliafaucet.com](https://sepoliafaucet.com) |

### Install

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Default dev URL: `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
# ── Core mode ──────────────────────────────────────────────────────────────
VITE_DEMO_MODE=true
# true  → no wallet needed, simulates tx hashes (for UI demos)
# false → MetaMask required, real Sepolia contract calls

# ── Blockchain ─────────────────────────────────────────────────────────────
VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
# Paste deployed VaultlessCore.sol address after Remix deploy

VITE_ALCHEMY_KEY=
# Optional: Alchemy API key for reliable Sepolia RPC

# ── Email alerts (duress) ──────────────────────────────────────────────────
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
VITE_ALERT_EMAIL=alert@example.com
# Fallback email if user didn't set a recovery email during enrollment

# ── Debug ──────────────────────────────────────────────────────────────────
VITE_SHOW_SENSOR_DEBUG=false
# true → shows live gyro/touch debug graphs during enrollment
VITE_AUTH_DEBUG=false
# true → logs detailed per-component scores to browser console
```

### Modes at a Glance

| Variable | Value | Behaviour |
|---|---|---|
| `VITE_DEMO_MODE` | `true` | No wallet, simulated tx hashes, ideal for demos |
| `VITE_DEMO_MODE` | `false` | MetaMask + Sepolia required, real on-chain events |

### Mobile Sensor Notes

- Motion/orientation capture may require an explicit **permission prompt** on iOS Safari.
- Sensor APIs require **HTTPS** (secure context). They are silently unavailable on plain HTTP.
- On unsupported or blocked devices, VAULTLESS continues with keystroke-only signals — it does not fail completely.
- `VITE_SHOW_SENSOR_DEBUG=true` renders live gyro/touch graphs alongside the enrollment input.

---

## 🔧 Behaviour Engine Tuning

The scoring weights in `behaviouralEngine.js` can be adjusted if needed:

| Scenario | Recommended change |
|---|---|
| Scores too similar between people | Raise hold time weight from 0.40 → 0.50 in `cosineSimilarity()` |
| Duress triggers too easily | Raise stress variance multiplier from `2.5` → `3.0` in `detectStress()` |
| Enrollment keeps failing | Check MetaMask is on Sepolia (chainId `11155111`) and wallet has Sepolia ETH |
| Mouse score drags down legitimate users | Lower mouse blend from `0.15` → `0.08` in `cosineSimilarity()` |
| Mobile scores inconsistent | Increase `mobileConfidence` base from `0.65` → `0.75` |

---

## 📝 Notes

- This project is a **prototype**, not a production-hardened authentication system.
- Behavioural data is processed entirely **client-side** and reduced to a commitment hash before any blockchain interaction. The full biometric profile never leaves the browser.
- The contract is written for **Sepolia testing** and has not been audited for mainnet deployment.
- The broader goal is to prototype authentication that is more resilient, more human-aware, and more socially protective than passwords alone.
- Enrollment phrase is hardcoded as **`"Secure my account"`** across `Enroll.jsx`, `Auth.jsx`, and `behaviouralEngine.js`.

---

<div align="center">

Built with ⬡ VAULTLESS — *your behaviour is your key.*

[![Video Demo](https://img.shields.io/badge/▶%20Video%20Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/H1GDiib1YAI?si=nnAmtng34_nXSFHa)
[![Visit Site](https://img.shields.io/badge/🌐%20Visit%20Site-1a1a2e?style=for-the-badge)](https://vaultless-sys.vercel.app/)
[![Devfolio](https://img.shields.io/badge/🏆%20Devfolio-3770FF?style=for-the-badge)](https://devfolio.co/projects/vaultless-dea4)

</div>
