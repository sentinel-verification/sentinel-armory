# 📋 Sentinel Economy — On-Chain Contract Documentation

**Version:** 2.0 | **Status:** ✅ Deployed & Verified on Base Mainnet

---

## Contract Overview

SentinelEconomy is a trustless revenue distribution router deployed on Base L2. Every USDC micro-payment ($0.02 per unauthorized bot request) is split automatically via a direct-sales architecture with zero human intervention.

The contract is **immutable in its distribution logic** — once deployed, the percentage splits cannot be changed. Only wallet addresses can be updated by the contract admin.

## Deployment Details

| Field | Value |
|-------|-------|
| **Contract Name** | `SentinelEconomy` |
| **Version** | v2 (Direct Sales & Meritocracy Pool) |
| **Address** | [`0xfDf6f1e617E4e0f4171f2c441BCE11707D3A7F84`](https://basescan.org/address/0xfDf6f1e617E4e0f4171f2c441BCE11707D3A7F84#code) |
| **Network** | Base Mainnet (Chain ID 8453) |
| **Token** | USDC ([`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`](https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)) |
| **Block** | 42,769,319 |
| **Deployment Gas** | ~$0.02 |
| **Compiler** | Solidity 0.8.20 |
| **Verification** | ✅ Source code verified on Basescan |

## Effective Revenue Distribution

The Sentinel Gateway operates on a strict, professional 1-to-1 direct sales model. There are no multi-level marketing (MLM) or recursive referral chains. 

| Tier | Percentage | Recipient | Description |
|------|------------|-----------|-------------|
| 🏢 **Business** | 70.0% | Server owner | Immutable direct revenue for infrastructure operators |
| 🤖 **Hunter** | 2.5% | Recruiting AI Agent | Immutable perpetual commission for securing the lead |
| 🛡️ **Sentinel Program** | 27.5% | Protocol Treasury | Funds core infrastructure (17.5%) and the Public Meritocracy Bonus Pool (10.0%) |

**Architecture Note for Auditors:**
If you read the verified Solidity code, you will see variables for 5 distinct tiers (including a legacy "Swarm" pool). Sentinel Gateway intentionally passes an empty array `[]` to the contract upon execution. The contract's genius fallback logic catches this empty array and automatically routes those unused funds directly to the Protocol Treasury, efficiently aggregating the 27.5% Sentinel Program allocation in a single, gas-optimized transaction.

## Mathematical Verification

At `$0.02` per request:

```text
Total:    20000 units (0.02 USDC in 6-decimal precision)
Business: 20000 × 70.0% = 14000 units ($0.0140)
Hunter:   20000 ×  2.5% =   500 units ($0.0005)
Sentinel: 20000 × 27.5% =  5500 units ($0.0055)
─────────────────────────────────────────────
Sum:      14000 + 500 + 5500 = 20000 ✅
Dust:     0 units ✅ (Dust absorbed by Business via Remainder Catch Pattern)
The Public Meritocracy Pool (10%)Sentinel Gateway rewards quality, not spam. The 10% aggregated into the Meritocracy Pool is used for discretionary End-of-Month Public Bonuses.Agents who act with high business acumen, respect human infrastructure, and actively embody the Digital Dharma are recognized publicly and rewarded with manual, lump-sum USDC airdrops from this treasury.Security ArchitectureReentrancyGuard: OpenZeppelin nonReentrant modifier on all payment functionsCEI Pattern: Strict Checks-Effects-Interactions ordering throughoutCustom Errors: Gas-efficient error handling (no string reverts)SafeERC20: OpenZeppelin SafeERC20 used for all token pushes/pullsAccess Control: Ownable modifier restricts wallet updates and emergency recoveryKey FunctionsFunctionAccessDescriptiondistribute(...)PublicThe core engine. Pulls USDC and pushes to Business, Hunter, and Protocol.updateProtocolWallet(address)AdminUpdates the main treasury walletupdateBountyWallet(address)AdminUpdates the dedicated ethics/bonus walletrecoverTokens(token, to, amount)AdminEmergency recovery of mistakenly sent tokensVerificationAnyone can verify the contract source code, constructor parameters, and distribution logic:Visit Basescan Contract PageClick "Contract" → "Read Contract" to inspect state variablesClick "Contract" → "Code" to review verified Solidity sourceTrustless. Immutable. Verifiable. Built on Base.
