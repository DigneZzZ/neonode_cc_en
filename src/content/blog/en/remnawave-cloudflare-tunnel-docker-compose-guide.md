---
title: "Set Up a Secure Cloudflare Tunnel for Remnawave VPN with Docker Compose (No Port Forwarding)"
description: "Step-by-step guide to securely deploy Remnawave VPN and subscription page using Docker Compose and Cloudflare Tunnel — with HTTPS, no nginx, and zero open ports."
tags:
  - cloudflare
  - remnawave
  - remnawave panel
  - cloudflare tunnel
  - Remnawave VPN
  - No port forwarding
  - docker
  - reverse proxy
  - tunnel
  - security
series: remnawave-guides
Draft: false
pubDate: 05 05 2025
---

## How to Set Up a Cloudflare Tunnel for Remnawave VPN Panel with Docker Compose?

You can deploy the Remnawave VPN panel and its subscription page using Docker Compose behind a secure Cloudflare Tunnel. This approach eliminates the need for port forwarding, nginx configuration, or manual HTTPS setup — making it ideal for production or home environments without a public IP.

---

## What is Remnawave Panel?

[Remnawave Panel](https://remna.st) is a modern VPN and proxy management system based on XRay, built with a focus on flexibility, automation, and Telegram bot support. It includes:

* A convenient admin panel
* A Telegram bot for notifications
* Active and stable development
* Clean architecture with PostgreSQL as the database
* OpenAPI 3.0 and universal integrations
* Independent nodes (unlike Marzban)
* A beautifully designed subscription page

---

## Benefits of Using Cloudflare Tunnel for Docker VPN Panels

* Don’t have a public IP? No problem.
* No need for port forwarding in your router or firewall.
* Cloudflare provides HTTPS, WAF, DDoS and bot protection.
* Everything runs in containers — no need to configure nginx, certbot, etc.

Cloudflare Tunnel lets you securely expose your local **VPN management panel**, subscription pages, or any other Docker-based web service. This is especially useful when deploying a **self-hosted VPN** without a public IP or when you want to protect your server behind **Cloudflare’s WAF and HTTPS** layer.

On the downside, CF Tunnel uses automatic proxying which may be **restricted or blocked** in some regions like Russia.

---

## Running a VPN Panel Without Port Forwarding

We’ll configure Cloudflare Tunnel access to:

* **Remnawave panel** (`remnawave:3000`) → `https://panel.example.com`
* **Subscription page** (`remnawave-subscription-page:3010`) → `https://sub.example.com`

---

## Step 1. Create the Tunnel

Install `cloudflared` on your server:

```bash
curl -fsSL https://developers.cloudflare.com/cloudflare-one/static/downloads/cloudflared-install.sh | bash
```

Authorize and create the tunnel:

```bash
cloudflared login
cloudflared tunnel create remnawave-tunnel
```

---

## Step 2. Configure DNS

Create DNS routes for your subdomains:

```bash
cloudflared tunnel route dns remnawave-tunnel panel.example.com
cloudflared tunnel route dns remnawave-tunnel sub.example.com
```
This command registers the panel.example.com subdomain in the Cloudflare zone and binds it to the remnawave-tunnel.

It is independent of where you have `remnawave-tunnel.json` lying around. This command works through your authorized `cloudflared`, and the settings go directly to your Cloudflare account via the API.

---

## Step 3. Project Structure

After creating the tunnel and configuring DNS routes, copy the JSON file from `~/.cloudflared/remnawave-tunnel.json` to the project directory `/opt/remnawave/cloudflared/`.

```yaml
/opt/remnawave/
├── docker-compose.yml
├── .env
└── cloudflared/
    ├── remnawave-tunnel.json
    └── config.yml
```

---

## Step 4. `config.yml` — Tunnel Configuration

```yaml
tunnel: remnawave-tunnel
credentials-file: /etc/cloudflared/remnawave-tunnel.json

ingress:
  - hostname: panel.example.com
    service: http://remnawave:3000
  - hostname: sub.example.com
    service: http://remnawave-subscription-page:3010
  - service: http_status:404
```

---

## Step 5. `docker-compose.yml`

We’ll use the `docker-compose.yml` file from the official repository, adding the subscription page service:

```yaml
version: '3.8'

services:
  remnawave-db:
    image: postgres:17
    container_name: remnawave-db
    hostname: remnawave-db
    restart: always
    env_file:
      - .env
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
      - TZ=UTC
    ports:
      - '127.0.0.1:6767:5432'
    volumes:
      - remnawave-db-data:/var/lib/postgresql/data
    networks:
      - remnawave-network
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}']
      interval: 3s
      timeout: 10s
      retries: 3

  remnawave:
    image: remnawave/backend:latest
    container_name: remnawave
    hostname: remnawave
    restart: always
    ports:
      - '127.0.0.1:3000:3000'
    env_file:
      - .env
    networks:
      - remnawave-network
    depends_on:
      remnawave-db:
        condition: service_healthy
      remnawave-redis:
        condition: service_healthy

  remnawave-subscription-page:
    image: remnawave/subscription-page:latest
    container_name: remnawave-subscription-page
    hostname: remnawave-subscription-page
    restart: always
    environment:
      - REMNAWAVE_PLAIN_DOMAIN=panel.com
      - SUBSCRIPTION_PAGE_PORT=3010
      - META_TITLE="Subscription Page Title"
      - META_DESCRIPTION="Subscription Page Description"
    ports:
      - '127.0.0.1:3010:3010'
    networks:
      - remnawave-network

  remnawave-redis:
    image: valkey/valkey:8.0.2-alpine
    container_name: remnawave-redis
    hostname: remnawave-redis
    restart: always
    networks:
      - remnawave-network
    volumes:
      - remnawave-redis-data:/data
    healthcheck:
      test: ['CMD', 'valkey-cli', 'ping']
      interval: 3s
      timeout: 10s
      retries: 3

  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    restart: always
    command: tunnel --config /etc/cloudflared/config.yml run
    volumes:
      - ./cloudflared:/etc/cloudflared
    networks:
      - remnawave-network

networks:
  remnawave-network:
    name: remnawave-network
    driver: bridge

volumes:
  remnawave-db-data:
    driver: local
    name: remnawave-db-data
  remnawave-redis-data:
    driver: local
    name: remnawave-redis-data
```

---

## Full Docker Setup with Cloudflare Tunnel

```bash
docker compose up -d
```

Check:

* `https://panel.example.com` — should open the panel
* `https://sub.example.com` — should open the subscription page

I intentionally left out the full Remnawave setup to focus on **using CF Tunnel**.

---

## 🔐 Securing the Remnawave Panel with Cloudflare Access

If you want to add an extra layer of authentication to your Remnawave panel or subscription page — without using nginx or custom login systems — you can use **Cloudflare Access**, part of Cloudflare Zero Trust.

### What Cloudflare Access offers:

* Restrict access to authorized users (Google, GitHub, email, etc.)
* Multi-factor authentication (MFA)
* Access policies by email, IP, group, country, and more
* Audit logs and login tracking
* Filters requests **before** they reach your server

---

### How to Enable Authentication with Cloudflare Access

1. **Go to the Cloudflare Zero Trust Dashboard**:
   [https://one.cloudflare.com](https://one.cloudflare.com)

2. Navigate to **Access > Applications** and click **+ Add an application**.

3. Choose application type: **Self-hosted**.

4. Fill in the following fields:

   * **Application Name**: `Remnawave Panel`
   * **Subdomain**: `panel.example.com`
   * **Session duration**: e.g., 8 hours

5. Create an access policy:

   * **Rule name**: `Allow company users`
   * **Include** → Emails ending with `@example.com` *(or any filter you prefer)*

6. Save and activate the application.

Now, any request to `https://panel.example.com` will first be validated by Cloudflare Access — only authenticated users will reach your tunnel and Docker container.

---

💡 **Note**: To use Cloudflare Access, your domain must be using **Cloudflare Nameservers** and be active in your Cloudflare dashboard.

---

## Accessing VPN Panel via HTTPS on a Private Server

Visit my forum [**Openode Club**](https://openode.xyz) for dozens of practical guides on setting up Remnawave, Cloudflare, Docker, Telegram bots, automation, and VPN monetization.

Some materials are free, but the **most detailed content is available through a subscription**. It includes:

* Remnawave installation scripts
* Telegram bots and integrations
* SHM panel instructions
* Marzban setup guides (if relevant)
* Secure VPS configuration tips

🔐 **Subscribe to access premium content — [click here to subscribe](https://openode.xyz/subscriptions/)**

---

## Final Thoughts

Cloudflare Tunnel is a reliable way to expose self-hosted applications like **Remnawave VPN Panel** to the internet — with full **HTTPS encryption**, **no open ports**, and **reverse proxying via Docker Compose**.

Whether you’re building a **VPN business**, testing in a home lab, or deploying a **secure production environment**, this method provides simplicity and strong security out of the box.

👉 Looking for full Remnawave installation scripts and VPN automation? Join the [Openode Club](https://openode.xyz) and get access to premium guides and tools.

---

## Get a VPS for \$10 + \$100 Credit — Kamatera Alternative

Looking for a **cheap VPS for VPN**, proxies, CI/CD or Docker hosting?
Try **VPSserver** — a rebranded Kamatera provider offering **\$100 in free credit** for just a **\$10 top-up**.

🌐 20+ global data centers: USA, Germany, Netherlands, UK, France, Japan, and more
🛡️ No ID verification, **Russia-friendly**, ideal for **VPN servers**, **Docker panels**, **cloud labs**, and **test environments**

🎯 Perfect for:

* Cloudflare Tunnel setups
* Marzban, SHM, or Remnawave deployment
* Lightweight or burstable workloads

👉 **[Claim your \$100 VPS credit](https://go.cloudwm.com/visit/?bta=36601&brand=vpsserver)** — before it gets blocked

