---
title: "Cloudflare Tunnel with Docker Compose: Secure Access to Containers Without Open Ports"
description: "How to set up Cloudflare Tunnel using Docker Compose and securely expose your containers over HTTPS without port forwarding."
pubDate: 09 11 2024
tags:
  - cloudflare
  - docker
  - reverse proxy
  - tunnel
  - security
series: server-guides
draft: false
---

## Introduction

Cloudflare Tunnel lets you securely expose your local services to the internet **without opening ports** or manually handling HTTPS. In this guide, you’ll learn how to configure the tunnel **using Docker Compose** to proxy access to your containers automatically — just like a regular public website.

## Why You Might Need It

- No public IP? No problem.
- No port forwarding on your router or firewall.
- Cloudflare gives you HTTPS, WAF, DDoS and bot protection.
- Everything runs in containers — no need to manually configure nginx, certbot, or anything else.

## Example: Exposing a Web App via Tunnel

Let’s say you have a container `my-app` running at `http://my-app:3000`. You want it to be publicly accessible at `https://app.example.com`.

## Step 1. Prepare Cloudflare

1. Sign up and add your domain to Cloudflare.
2. Install `cloudflared` locally and authenticate:

    ```bash
    cloudflared login
    ```

3. Create a tunnel:

    ```bash
    cloudflared tunnel create my-tunnel
    ```

4. Route DNS to the tunnel:

    ```bash
    cloudflared tunnel route dns my-tunnel app.example.com
    ```

5. Copy the credentials `.json` file (usually located in `~/.cloudflared/`) to your project directory, e.g., `./cloudflared`.

## Step 2. Project Structure

````

project/
├── docker-compose.yml
├── cloudflared/
│   ├── config.yml
│   └── <your tunnel-id>.json

````

## Step 3. `config.yml` — Tunnel Configuration

```yaml
tunnel: my-tunnel
credentials-file: /etc/cloudflared/<your tunnel-id>.json

ingress:
  - hostname: app.example.com
    service: http://my-app:3000
  - service: http_status:404
````

## Step 4. `docker-compose.yml`

```yaml
version: '3.8'

services:
  my-app:
    image: your-image
    container_name: my-app
    expose:
      - 3000
    networks:
      - app-network

  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    restart: always
    command: tunnel --config /etc/cloudflared/config.yml run
    volumes:
      - ./cloudflared:/etc/cloudflared
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## Step 5. Launch It

```bash
docker compose up -d
```

Now, when you visit `https://app.example.com`, you’ll be routed directly into your `my-app` container — **without opening any ports to the outside world**.

## Conclusion

Using Cloudflare Tunnel with Docker Compose allows you to:

* Simplify service exposure.
* Eliminate the need to set up HTTPS manually.
* Improve security without messing with `iptables` or nginx.

It all runs in containers — clean, transparent, and without magic. A great way to proxy admin panels, dashboards, or APIs you’d rather not expose directly.
