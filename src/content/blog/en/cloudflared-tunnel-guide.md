---
title: Running Cloudflare Tunnel on Your Server
description: A detailed guide on installing and configuring Cloudflare Tunnel (formerly Argo Tunnel) to secure your server.
tags:
  - cloudflare
  - tunnel
  - server
  - security
series: server-guides
draft: false
pubDate: 09 11 2024
---

## Introduction

Cloudflare Tunnel (formerly Argo Tunnel) is a powerful tool for creating a secure connection between your server and Cloudflare without the need to open public ports. This guide describes the steps to install and configure Cloudflare Tunnel on various operating systems.

## Setup Steps

### 1. Installing Cloudflare Tunnel (Cloudflared)

First, you need to install `cloudflared` on your server. Depending on the operating system you are using, run the following commands:

**For Ubuntu/Debian:**

```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

**For CentOS/RHEL:**

```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.rpm
sudo rpm -ivh cloudflared-linux-amd64.rpm
```

**For macOS:**

```bash
brew install cloudflare/cloudflare/cloudflared
```

### 2. Authorization in Cloudflare

To set up the tunnel, you need to log into your Cloudflare account. Run the following command for authorization:

```bash
cloudflared login
```

This command will open a browser window where you can log into your Cloudflare account. After successful authorization, a configuration file with a token will be created automatically.

### 3. Creating the Tunnel

After authorization, you can create the tunnel:

```bash
cloudflared tunnel create <tunnel_name>
```

This will create a unique tunnel with the name you specify. Save the tunnel ID — you'll need it later.

### 4. Configuring DNS

Now you need to set up a DNS record to link your domain with the tunnel:

```bash
cloudflared tunnel route dns <tunnel_name> example.com
```

Replace `example.com` with your actual domain.

### 5. Running the Tunnel

After configuring DNS, you can start the tunnel with the following command:

```bash
cloudflared tunnel run <tunnel_name>
```

### 6. Automating Tunnel Startup

To ensure the tunnel starts automatically when the system boots, configure a systemd service.

Create a file for systemd:

```bash
sudo nano /etc/systemd/system/cloudflared.service
```

Add the following code to the file:

```ini
[Unit]
Description=cloudflared
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/cloudflared tunnel run <tunnel_name>
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Save the file and close the editor.

Enable and start the service:

```bash
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

## Conclusion

Now your Cloudflare Tunnel starts automatically when the server boots, protecting it from external threats. This is a great way to enhance your server's security by leveraging Cloudflare's infrastructure.
