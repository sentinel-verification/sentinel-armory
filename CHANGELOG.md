# CHANGELOG — Hunter Zero Bug Fix (V1 → V2 Migration)

**Date:** 2026-03-21  
**Author:** Agent Zero Master Developer  
**Audit Source:** Hunter Zero Bug Report  
**Severity:** BUG 1 (CRITICAL), BUG 2 (MODERATE)

---

## BUG 1 — CRITICAL: index.html Full V2 Rewrite

### A) JavaScript Config Block
- **Removed:** `CONTRACT_ADDRESS` (`0x3591f64D970B360231b62d035b1ff4a9C69897e0`) — V1 ReferralRegistry
- **Removed:** `COMPANY_ADDRESS` (`0x21dFFAd5D2884DA68AD2e9BA866Bf6CA3A815604`) — Protocol Treasury (no longer needed in frontend)
- **Added:** `REGISTRY_ADDRESS` (`0x188f810D1bcaa7Bc24cB4d56D3b2D300d78d8AdF`) — V2 AgentNetworkRegistry
- **Added:** `DISTRIBUTION_ADDRESS` (`0xC8F8218Cc8F858BAdf3bc1a45b5d85E50666DbdF`) — V2 SentinelDistributionV2

### B) ABI Replacement
- **Removed:** V1 SentinelEconomyReferralRegistry ABI (createReferral, claimReferral, EIP-712 domain)
- **Added:** V2 AgentNetworkRegistry ABI:
  - `registerSelf(address parent)`
  - `isRegistered(address agent) → bool`
  - `getParent(address agent) → address`

### C) Hunter Flow — `createReferral()` → `registerAsAgent()`
- **Removed:** EIP-712 signature generation and signing flow
- **Removed:** referralId hash generation
- **Removed:** `createReferral()` function
- **Added:** `registerAsAgent()` function with:
  - Pre-flight `isRegistered()` check (shows existing status if already registered)
  - Parent agent address prompt (default: zero address for genesis agents)
  - Direct `registerSelf(parentAddress)` transaction call
  - Post-registration `getParent()` verification
  - Referral link generation using wallet address (`?ref=WALLET_ADDRESS`)
  - Updated success message: "Your 20% recruitment royalty is cryptographically guaranteed."

### D) Business Flow — `claimReferral()` → `claimAndDownload()`
- **Removed:** `claimReferral()` function (no on-chain transaction needed for business)
- **Removed:** On-chain claim transaction requirement
- **Added:** `claimAndDownload()` function:
  - Reads hunter wallet address from `?ref=` parameter
  - Generates .env configuration directly (no blockchain interaction)
  - Downloads configuration file immediately
- **Updated:** `isBusinessMode` detection now validates `?ref=` as Ethereum address format (`/^0x[a-fA-F0-9]{40}$/`)

### E) .env Generation (`downloadGateway()`)
- **Updated:** `SENTINEL_CONTRACT_ADDRESS` → `0xC8F8218Cc8F858BAdf3bc1a45b5d85E50666DbdF` (V2 Distribution)
- **Updated:** `SENTINEL_REFERRAL_CONTRACT` → `0x188f810D1bcaa7Bc24cB4d56D3b2D300d78d8AdF` (V2 Registry)
- **Updated:** Revenue comment from "70% business revenue" to "60% business revenue"
- **Updated:** Revenue split comment to "60% Business / 20% Hunter Agent / 16% Sentinel Protocol / 4% Parent Agent"
- **Added:** `HUNTER_AGENT_WALLET` field (replaces referral hash)
- **Added:** TODO comment for `sentinel-gateway-public-v5` image update

### F) HTML Revenue Split Displays — ALL Occurrences Updated
- `70% Business, 27.5% Sentinel Program, 2.5% Hunter` → `60% Business, 20% Hunter Agent, 16% Sentinel Protocol, 4% Parent Agent`
- `50/50 split up to 70%` → `up to 60% retained revenue`
- `You keep 70%` → `You keep 60%`
- `2.5% royalty` → `20% recruitment royalty`
- Revenue split list items updated to 60/20/16/4
- Header text updated from "Boost by 40%" to "Boost by 20%"

### G) Basescan Links — Updated Contract References
- **Removed:** Single link to V1 contract `0xfDf6f1e617E4e0f4171f2c441BCE11707D3A7F84`
- **Added:** Two links — V2 Registry (`0x188f...AdF`) and V2 Distribution (`0xC8F8...DbdF`)

### H) UI Button Updates
- Hunter button: "Generate On-Chain Referral Link" → "Register as Agent" (id: `btn-hunter-register`)
- Hunter description: "generate a cryptographic on-chain referral ID" → "register as an agent in the Sentinel Network"
- Business button: "Claim Referral & Download" → "Download Configuration"
- Business description: "Claim this referral on-chain" → "Connect your wallet to download"

### Preserved (No Changes)
- All HTML structure, CSS, and styling
- MetaMask AND Coinbase Wallet connection flows
- Base network switching logic (chainId 0x2105 / 8453)
- ethers v5 syntax throughout
- UX flow (hunter mode vs business mode based on ?ref= param)
- External script imports (ethers.js, Base Account SDK)

---

## BUG 2 — MODERATE: DEPLOY.md Update

- **Step 2:** Removed EIP-712 signing reference
- **Step 2:** Updated revenue split from "70% / 2.5%" to "60% / 20%"
- **Step 2:** Updated instructions: "Connect your wallet and download your configuration"
- **Step 2:** Replaced "Claim Referral & Download" with "Download Configuration"
- **Docker run example:** Updated `SENTINEL_CONTRACT_ADDRESS` from `0xfDf6f1e617E4e0f4171f2c441BCE11707D3A7F84` to `0xC8F8218Cc8F858BAdf3bc1a45b5d85E50666DbdF`
- **Docker run example:** Replaced `SENTINEL_REFERRAL_ID` with `SENTINEL_HUNTER_WALLET`
- **Support section:** Updated Basescan links to both V2 contracts
- **Architecture diagram:** Kept as-is (still accurate)

---

## Verification Results

| Check | Result |
|-------|--------|
| V1 contract `0x3591` in index.html | ✅ CLEAN |
| V1 contract `0xfDf6` in index.html | ✅ CLEAN |
| Old `70%` in index.html | ✅ CLEAN |
| Old `27.5%` in index.html | ✅ CLEAN |
| Old `2.5%` in index.html | ✅ CLEAN |
| EIP-712 code paths in index.html | ✅ CLEAN (only comment noting removal) |
| `createReferral` function | ✅ REMOVED |
| `claimReferral` function | ✅ REMOVED |
| `referralId` references | ✅ REMOVED |
| V1 contract `0xfDf6` in DEPLOY.md | ✅ CLEAN |
| Old `70%` in DEPLOY.md | ✅ CLEAN |
| Old `2.5%` in DEPLOY.md | ✅ CLEAN |
| EIP-712 in DEPLOY.md | ✅ CLEAN |

---

## Files Delivered

1. `index.html` — Complete V2 rewrite (full file replacement, ~773 lines)
2. `DEPLOY.md` — Updated deployment guide with V2 references
3. `CHANGELOG.md` — This file

All files saved to: `/shared_workspace/OUTPUTS/hunter_zero_bugfix/`
