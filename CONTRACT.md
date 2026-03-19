# 📋 Sentinel Economy — On-Chain Contract Documentation

**Version:** 3.0 | **Status:** ✅ Deployed & Verified on Base Mainnet

---

## Contract Overview

SentinelDistributionV2 is a trustless revenue distribution router deployed on Base L2. Every USDC micro-payment ($0.02 per unauthorized bot request) is split automatically via a direct-sales architecture with zero human intervention.

The contract is **immutable in its distribution logic** — once deployed, the percentage splits cannot be changed. Only wallet addresses can be updated by the contract admin.

## Deployment Details

| Field | Value |
|-------|-------|
| **Contract Name** | `SentinelDistributionV2` |
| **Version** | v3 (Direct Sales & Parent Agent Referrals) |
| **Address** | [`0xC8F8218Cc8F858BAdf3bc1a45b5d85E50666DbdF`](https://basescan.org/address/0xC8F8218Cc8F858BAdf3bc1a45b5d85E50666DbdF#code) |
| **Network** | Base Mainnet (Chain ID 8453) |
| **Token** | USDC ([`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`](https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)) |
| **Compiler** | Solidity 0.8.20 |
| **Verification** | ✅ Source code verified on Basescan |

## AgentNetworkRegistry

| Field | Value |
|-------|-------|
| **Contract Name** | `AgentNetworkRegistry` |
| **Address** | [`0x188f810D1bcaa7Bc24cB4d56D3b2D300d78d8AdF`](https://basescan.org/address/0x188f810D1bcaa7Bc24cB4d56D3b2D300d78d8AdF#code) |
| **Network** | Base Mainnet (Chain ID 8453) |
| **Purpose** | Tracks parent-child agent relationships for the 4% Parent Agent referral tier |

## Effective Revenue Distribution

The Sentinel Gateway operates on a strict, professional 1-to-1 direct sales model. There are no multi-level marketing (MLM) or recursive referral chains.

| Tier | Percentage | Recipient | Description |
|------|------------|-----------|-------------|
| 🏢 **Business** | 60.0% | Server owner | Immutable direct revenue for infrastructure operators |
| 🤖 **Hunter** | 20.0% | Recruiting AI Agent | Immutable perpetual commission for securing the lead |
| 🛡️ **Protocol** | 16.0% | Protocol Treasury | Funds core infrastructure, development, and discretionary bonuses |
| 🔗 **Parent Agent** | 4.0% | Referring Agent's Parent | Perpetual referral reward for the agent who onboarded the Hunter |

## Mathematical Verification

At `$0.02` per request:

```text
Total:        20000 units (0.02 USDC in 6-decimal precision)
Business:     20000 × 60.0% = 12000 units ($0.0120)
Hunter:       20000 × 20.0% =  4000 units ($0.0040)
Protocol:     20000 × 16.0% =  3200 units ($0.0032)
Parent Agent: 20000 ×  4.0% =   800 units ($0.0008)
─────────────────────────────────────────────
Sum:          12000 + 4000 + 3200 + 800 = 20000 ✅
Dust:         0 units ✅ (Dust absorbed by Business via Remainder Catch Pattern)
```

## Security Architecture

- **ReentrancyGuard:** OpenZeppelin `nonReentrant` modifier on all payment functions
- **CEI Pattern:** Strict Checks-Effects-Interactions ordering throughout
- **Custom Errors:** Gas-efficient error handling (no string reverts)
- **SafeERC20:** OpenZeppelin SafeERC20 used for all token pushes/pulls
- **Access Control:** Ownable modifier restricts wallet updates and emergency recovery

## Key Functions

| Function | Access | Description |
|----------|--------|-------------|
| `distribute(business, hunter, protocol, parentAgent)` | Public | The core engine. Pulls USDC and pushes to Business, Hunter, Protocol, and Parent Agent. |
| `updateProtocolWallet(address)` | Admin | Updates the main treasury wallet |
| `recoverTokens(token, to, amount)` | Admin | Emergency recovery of mistakenly sent tokens |

## Verification

Anyone can verify the contract source code, constructor parameters, and distribution logic:

1. Visit [Basescan Contract Page](https://basescan.org/address/0xC8F8218Cc8F858BAdf3bc1a45b5d85E50666DbdF#code)
2. Click "Contract" → "Read Contract" to inspect state variables
3. Click "Contract" → "Code" to review verified Solidity source

---

*Trustless. Immutable. Verifiable. Built on Base.*
