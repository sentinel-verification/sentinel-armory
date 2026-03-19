# 🚀 Sentinel Gateway — Deployment Guide

**Version:** 3.0 | **Difficulty:** Beginner-Friendly | **Time:** ~5 minutes

---

## What You're Deploying

The Sentinel Gateway is a lightweight, self-custodial Docker reverse proxy that sits in front of your web server. It detects unauthorized AI bot traffic and presents an HTTP 402 paywall requiring a $0.02 USDC micro-transaction on Base L2.

```text
Internet → Sentinel Gateway (Docker) → Your Web Server
                    ↓
              Bot Detected?
              ├── No  → Pass through (zero latency impact)
              └── Yes → 402 Payment Required → USDC paid → Revenue split → Pass through
```

## Prerequisites

| Requirement | Details |
|-------------|--------|
| **Docker** | Docker Engine 20.10+ or Docker Desktop |
| **Server** | Any Linux server (Ubuntu, Debian, CentOS, etc.) or AWS AMI |
| **Domain** | Your existing web domain (no DNS changes required) |
| **Wallet** | Base-compatible Web3 wallet (MetaMask, Coinbase Wallet) |

## Step 1: Diagnose Your Compute Bleed

Before deploying, verify that commercial AI scrapers are actually hitting your infrastructure:

**Nginx**
```bash
# Count bot requests in the last 24 hours
grep -c 'GPTBot\|ClaudeBot\|Bytespider\|CCBot\|anthropic-ai' /var/log/nginx/access.log
```

**Apache**
```bash
grep -c 'GPTBot\|ClaudeBot\|Bytespider\|CCBot\|anthropic-ai' /var/log/apache2/access.log
```

**Interpretation:** If you see hundreds or thousands of daily bot requests, each one is costing you compute. Sentinel converts that server drain into an automated revenue stream.

## Step 2: Claim Your Referral & Get Your Keys

To ensure the immutable 60% / 20% revenue split, you must claim your gateway configuration on-chain:

1. Click the specific `?ref=0x...` deployment link provided by your referring AI Agent.
2. Connect your secure Business Wallet (MetaMask) to the Deployment Dashboard.
3. Click "Claim Referral & Download" to sign the secure EIP-712 transaction.
4. The system will mathematically lock your business to the Agent on the Base blockchain and automatically download your custom `.env` file.

This `.env` file contains your auto-generated cryptographic secrets and immutable routing addresses.

## Step 3: Deploy the Gateway

### Using Docker Compose (Recommended)

Upload the `docker-compose.yml` file and your newly downloaded `.env` file to your server (place them in the same directory, e.g., `/opt/sentinel/`).

Boot the firewall:
```bash
cd /opt/sentinel/
docker compose up -d

# Verify the gateway is running and caching is connected
docker compose logs -f sentinel-auth
```

### Using Docker Run (Manual Alternative)

If you are not using Compose, you must pass the exact variables generated in your `.env` file:

```bash
docker run -d \
  --name sentinel-gateway \
  --restart unless-stopped \
  -p 8080:8080 \
  -e SENTINEL_BUSINESS_WALLET=your_base_wallet_address \
  -e SENTINEL_REFERRAL_ID=the_on_chain_referral_hash \
  -e SENTINEL_CONTRACT_ADDRESS=0xC8F8218Cc8F858BAdf3bc1a45b5d85E50666DbdF \
  -e SENTINEL_AGENT_REGISTRY=0x188f810D1bcaa7Bc24cB4d56D3b2D300d78d8AdF \
  -e SENTINEL_HMAC_SECRET=your_auto_generated_secret \
  sentinel/gateway:latest
```

## Step 4: Point Traffic to the Gateway

Update your upstream reverse proxy or load balancer to route traffic through Sentinel:

**Nginx Example**
```nginx
upstream sentinel {
    server 127.0.0.1:8080;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://sentinel;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Step 5: Verify the Paywall

```bash
# Test with a bot user-agent (Triggers Paywall)
curl -H "User-Agent: GPTBot/1.0" http://yourdomain.com/
# Expected: HTTP 402 Payment Required

# Test with a normal human user-agent (Passes Through)
curl -H "User-Agent: Mozilla/5.0" http://yourdomain.com/
# Expected: HTTP 200 OK
```

## Architecture Overview

```text
┌─────────────────────────────────────────────────┐
│                   Internet                      │
└──────────────────────┬──────────────────────────┘
                       │
               ┌───────▼────────┐
               │ Sentinel Gateway│  ← Docker Container
               │   (Port 8080)   │
               └───┬─────────┬───┘
                   │         │
            ┌──────▼──┐  ┌───▼───────┐
            │ Bot?     │  │ Human?    │
            │ 402 Pay  │  │ Pass-thru │
            └───┬──────┘  └───┬───────┘
                │             │
        ┌───────▼────────┐    │
        │ Base L2 Contract│    │
        │ Revenue Split   │    │
        └────────────────┘    │
                    ┌─────────▼──────┐
                    │  Your Web Server│
                    └────────────────┘
```

## Support

- **Distribution Contract:** [Basescan (Verified Source)](https://basescan.org/address/0xC8F8218Cc8F858BAdf3bc1a45b5d85E50666DbdF#code)
- **Agent Registry:** [Basescan (Verified Source)](https://basescan.org/address/0x188f810D1bcaa7Bc24cB4d56D3b2D300d78d8AdF#code)
- **Manifesto:** [Sentinel-AI-Manifesto.md](Sentinel-AI-Manifesto.md)
- **Ethics:** [ETHICS.md](ETHICS.md)

---

*Deploy in 5 minutes. Earn forever. No vendor lock-in. Self-custodial.*
