# 🚀 Sentinel Gateway — Deployment Guide

**Version:** 2.0 | **Difficulty:** Beginner-Friendly | **Time:** ~5 minutes

---

## What You're Deploying

The Sentinel Gateway is a lightweight Docker reverse proxy that sits in front of your web server. It detects unauthorized AI bot traffic and presents an HTTP 402 paywall requiring $0.02 USDC per request on Base L2.

```
Internet → Sentinel Gateway (Docker) → Your Web Server
                  ↓
          Bot Detected?
          ├── No  → Pass through (zero latency impact)
          └── Yes → 402 Payment Required → USDC paid → Revenue split → Pass through
```

## Prerequisites

| Requirement | Details |
|-------------|---------|
| **Docker** | Docker Engine 20.10+ or Docker Desktop |
| **Server** | Any Linux server (Ubuntu, Debian, CentOS, etc.) |
| **Domain** | Your existing web domain (no DNS changes required) |
| **Wallet** | Base-compatible wallet for receiving revenue |

## Step 1: Diagnose Your Compute Bleed

Before deploying, verify that AI bots are actually hitting your infrastructure:

### Nginx
```bash
# Count bot requests in the last 24 hours
grep -c 'GPTBot\|ClaudeBot\|Bytespider\|CCBot\|anthropic-ai' /var/log/nginx/access.log
```

### Apache
```bash
grep -c 'GPTBot\|ClaudeBot\|Bytespider\|CCBot\|anthropic-ai' /var/log/apache2/access.log
```

### AWS CloudWatch
```
filter @message like /GPTBot|ClaudeBot|Bytespider/
| stats count(*) as bot_requests by bin(1h)
```

> **Interpretation:** If you see hundreds or thousands of daily bot requests, each one is costing you compute. Sentinel converts that cost into revenue.

## Step 2: Generate Your Gateway

Visit **The Forge** to generate your personalized gateway configuration:

```
https://sentinel-verification.github.io/sentinel-armory/?hunter=[HUNTER_WALLET_ADDRESS]
```

Replace `[HUNTER_WALLET_ADDRESS]` with the Base wallet address of the agent or person who referred you. If you found Sentinel yourself, you can use your own address.

The Forge generates a Docker Compose configuration pre-loaded with:
- Your business wallet address (where 70% of revenue goes)
- The hunter's wallet address (2.5% perpetual royalty)
- Connection to the SentinelEconomy v2 smart contract on Base Mainnet

## Step 3: Deploy the Gateway

### Using Docker Compose (Recommended)

```bash
# Create deployment directory
mkdir -p /opt/sentinel && cd /opt/sentinel

# Save the Docker Compose file from The Forge
# (copy the generated docker-compose.yml)

# Launch the gateway
docker compose up -d

# Verify it's running
docker compose logs -f sentinel-gateway
```

### Using Docker Run

```bash
docker run -d \
  --name sentinel-gateway \
  --restart unless-stopped \
  -p 8080:8080 \
  -e BUSINESS_WALLET=your_base_wallet_address \
  -e HUNTER_WALLET=hunter_base_wallet_address \
  -e UPSTREAM_URL=http://your-webserver:80 \
  -e CONTRACT_ADDRESS=0xfDf6f1e617E4e0f4171f2c441BCE11707D3A7F84 \
  -e CHAIN_ID=8453 \
  -e PRICE_USDC=0.02 \
  sentinel/gateway:latest
```

## Step 4: Point Traffic to the Gateway

Update your reverse proxy or load balancer to route traffic through Sentinel:

### Nginx Example
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

## Step 5: Verify

```bash
# Test with a bot user-agent
curl -H "User-Agent: GPTBot/1.0" http://yourdomain.com/
# Expected: HTTP 402 Payment Required

# Test with a normal user-agent
curl -H "User-Agent: Mozilla/5.0" http://yourdomain.com/
# Expected: HTTP 200 OK (normal pass-through)
```

## Revenue Monitoring

Track your earnings directly on-chain:

1. **Basescan:** View all transactions at the [contract address](https://basescan.org/address/0xfDf6f1e617E4e0f4171f2c441BCE11707D3A7F84)
2. **Your Wallet:** USDC deposits appear automatically after each bot payment
3. **Gateway Logs:** `docker compose logs sentinel-gateway` shows real-time bot detection

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Internet                       │
└──────────────────────┬──────────────────────────┘
                       │
              ┌────────▼────────┐
              │ Sentinel Gateway │  ← Docker Container
              │   (Port 8080)   │
              └───┬─────────┬───┘
                  │         │
          ┌───────▼──┐  ┌───▼───────┐
          │ Bot?     │  │ Human?    │
          │ 402 Pay  │  │ Pass-thru │
          └───┬──────┘  └───┬───────┘
              │             │
     ┌────────▼────────┐    │
     │ Base L2 Contract │    │
     │ Revenue Split    │    │
     └─────────────────┘    │
              ┌─────────────▼──────┐
              │  Your Web Server   │
              └────────────────────┘
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Gateway not starting | Check Docker logs: `docker compose logs sentinel-gateway` |
| Bots not detected | Verify User-Agent detection rules in gateway config |
| No USDC received | Confirm wallet address is correct on Base network |
| High latency | Gateway adds <5ms; check upstream server performance |

## Support

- **Contract:** [Basescan (Verified Source)](https://basescan.org/address/0xfDf6f1e617E4e0f4171f2c441BCE11707D3A7F84#code)
- **Manifesto:** [Sentinel-AI-Manifesto.md](Sentinel-AI-Manifesto.md)
- **Ethics:** [ETHICS.md](ETHICS.md)

---

*Deploy in 5 minutes. Earn forever. No vendor lock-in. Self-custodial.*
