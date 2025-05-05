---
title: Remnawave and Cloudflare Tunnel with Docker Compose: Secure Container Access Without Open Ports
description: How to set up Cloudflare Tunnel with Docker Compose and provide secure HTTPS access to your containers without port forwarding. We walk through an example with the Remnawave panel and subscription page.
tags:
  - cloudflare
  - remnawave
  - remnawave panel
  - cloudflare tunnel
  - docker
  - reverse proxy
  - tunnel
  - security
series: remnawave-guides
Draft: false
pubDate: 05 05 2025
---

## Introduction

Cloudflare Tunnel lets you securely expose your local services to the internet **without opening ports** or handling HTTPS manually. In this guide, we’ll configure a CF Tunnel **in combination with the Remnawave Panel’s Docker Compose setup**, enabling automatic proxy access to the required containers—just like a public website.

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

## Why Use CF Tunnel?

* Don’t have a public IP? No problem.
* No need for port forwarding in your router or firewall.
* Cloudflare provides HTTPS, WAF, DDoS and bot protection.
* Everything runs in containers — no need to configure nginx, certbot, etc.

On the downside, CF Tunnel uses automatic proxying which may be **restricted or blocked** in some regions like Russia.

---

## Goal

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

Copy the JSON file from `~/.cloudflared/remnawave-tunnel.json` into your project directory (e.g., `./cloudflared/`).

---

## Step 2. Configure DNS

Create DNS routes for your subdomains:

```bash
cloudflared tunnel route dns remnawave-tunnel panel.example.com
cloudflared tunnel route dns remnawave-tunnel sub.example.com
```

---

## Step 3. Project Structure

```yaml
project/
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

## Step 6. Launch

```bash
docker compose up -d
```

Check:

* `https://panel.example.com` — should open the panel
* `https://sub.example.com` — should open the subscription page

I intentionally left out the full Remnawave setup to focus on **using CF Tunnel**.

---

## Where to Find More Guides?

Visit my forum [**Openode Club**](https://openode.xyz) for dozens of practical guides on setting up Remnawave, Cloudflare, Docker, Telegram bots, automation, and VPN monetization.

Some materials are free, but the **most detailed content is available through a subscription**. It includes:

* Remnawave installation scripts
* Telegram bots and integrations
* SHM panel instructions
* Marzban setup guides (if relevant)
* Secure VPS configuration tips

🔐 **Subscribe to access premium content — [click here to subscribe](https://openode.xyz/subscriptions/)**

---

## Conclusion

Now your containers are accessible via a secure Cloudflare tunnel, protected by HTTPS — **without port forwarding or server exposure**. It’s simple, safe, and flexible — perfect for both local and production environments.
