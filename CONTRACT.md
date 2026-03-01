# 📋 Sentinel Economy — On-Chain Contract Documentation

**Version:** 2.0 | **Status:** ✅ Deployed & Verified on Base Mainnet

---

## Contract Overview

SentinelEconomy is a trustless revenue distribution router deployed on Base L2. Every USDC micro-payment ($0.02 per unauthorized bot request) is split automatically across five tiers with zero human intervention.

The contract is **immutable in its distribution logic** — once deployed, the percentage splits cannot be changed. Only wallet addresses can be updated by the contract admin.

## Deployment Details

| Field | Value |
|-------|-------|
| **Contract Name** | `SentinelEconomy` |
| **Version** | v2 (with Ethical Bounty Pool) |
| **Address** | [`0xfDf6f1e617E4e0f4171f2c441BCE11707D3A7F84`](https://basescan.org/address/0xfDf6f1e617E4e0f4171f2c441BCE11707D3A7F84#code) |
| **Network** | Base Mainnet (Chain ID 8453) |
| **Token** | USDC ([`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`](https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)) |
| **Block** | 42,769,319 |
| **Deployment Gas** | ~$0.02 |
| **Compiler** | Solidity 0.8.19+ |
| **Verification** | ✅ Source code verified on Basescan |

## Revenue Distribution Tiers

All percentages are encoded as basis points (BPS) in the constructor and **cannot be modified** after deployment:

| Tier | BPS | Percentage | Recipient | Description |
|------|-----|------------|-----------|-------------|
| 🏢 Business | 7000 | 70.0% | Server owner | Direct revenue for infrastructure operators |
| 🏛️ Protocol | 1750 | 17.5% | Treasury | Network maintenance, development, operations |
| 🎯 Bounty Pool | 500 | 5.0% | Ethics fund | Discretionary rewards for Digital Dharma alignment |
| 🌊 Swarm | 500 | 5.0% | Referral chain | 6-tier recursive referral distribution |
| 🤖 Hunter | 250 | 2.5% | Deploying agent | Perpetual royalty for the agent/human who facilitated deployment |
| **Total** | **10000** | **100.0%** | | **Zero dust loss** |

## Mathematical Verification

At `$0.02` per request:

```
Total:    20000 units (0.02 USDC in 6-decimal precision)
Business: 20000 × 7000 / 10000 = 14000 units ($0.0140)
Protocol: 20000 × 1750 / 10000 =  3500 units ($0.0035)
Bounty:   20000 ×  500 / 10000 =  1000 units ($0.0010)
Swarm:    20000 ×  500 / 10000 =  1000 units ($0.0010)
Hunter:   20000 ×  250 / 10000 =   500 units ($0.0005)
─────────────────────────────────────────────
Sum:      14000 + 3500 + 1000 + 1000 + 500 = 20000 ✅
Dust:     0 units ✅
```

## Swarm Referral Structure

The 5% Swarm Pool is further distributed across a 6-tier recursive referral chain:

| Level | Share of Swarm Pool | Share of Total |
|-------|--------------------|-----------------|
| Level 1 | 40% | 2.000% |
| Level 2 | 25% | 1.250% |
| Level 3 | 15% | 0.750% |
| Level 4 | 10% | 0.500% |
| Level 5 | 6% | 0.300% |
| Level 6 | 4% | 0.200% |

If any referral level has no registered address, that tier's share flows to the Protocol Treasury.

## Security Architecture

- **ReentrancyGuard:** OpenZeppelin nonReentrant modifier on all payment functions
- **CEI Pattern:** Checks-Effects-Interactions ordering throughout
- **Custom Errors:** Gas-efficient error handling (no string reverts)
- **SafeERC20:** OpenZeppelin SafeERC20 for all token transfers
- **Access Control:** Admin-only functions for wallet updates and emergency recovery
- **Emergency Recovery:** Admin can recover accidentally sent tokens (non-USDC)

## Key Functions

| Function | Access | Description |
|----------|--------|-------------|
| `processPayment(hunter, business)` | Public | Routes a $0.02 USDC payment through all 5 tiers |
| `updateBusinessWallet(address)` | Admin | Update the business wallet for a deployment |
| `updateBountyWallet(address)` | Admin | Update the ethical bounty pool wallet |
| `recoverTokens(token, amount)` | Admin | Emergency recovery of non-USDC tokens |

## v1 → v2 Changelog

| Change | v1 | v2 |
|--------|----|----|  
| Business share | 75.0% | 70.0% |
| Bounty Pool | ❌ Did not exist | ✅ 5.0% — new tier |
| Price per request | $0.10 | $0.02 (gateway-enforced) |
| Contract address | Deprecated | `0xfDf6...7F84` |

## Verification

Anyone can verify the contract source code, constructor parameters, and distribution logic:

1. Visit [Basescan Contract Page](https://basescan.org/address/0xfDf6f1e617E4e0f4171f2c441BCE11707D3A7F84#code)
2. Click "Contract" → "Read Contract" to inspect state variables
3. Click "Contract" → "Code" to review verified Solidity source
4. All percentage splits are visible in the constructor and immutable

---

*Trustless. Immutable. Verifiable. Built on Base.*
