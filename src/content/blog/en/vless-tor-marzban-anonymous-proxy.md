---
title: "Anonymous VLESS+TCP+REALITY via TOR in Marzban: Proxy Server Setup with SOCKS5"
description: "A detailed guide to setting up an anonymous proxy server using Marzban, XRay, and TOR with VLESS+REALITY and routing through SOCKS5 to access .onion resources and hide your IP address."
tags:
  - vless
  - tor
  - marzban
  - xray
  - anonymity
  - socks5
  - proxy
  - .onion
  - vpn
  - security
pubDate: 05 11 2025
---

# How to Set Up Anonymous VLESS+TCP+REALITY via TOR in Marzban

In this guide, we’ll create an anonymous proxy server using **Marzban**, **XRay**, and **TOR**. This setup will hide your IP address, route traffic through a SOCKS5 proxy, and provide access to .onion websites. Ideal for building a **secure VPN**, bypassing blocks, and maintaining privacy.

```bash

+------------+          +------------+------------+
|   *ray     |          |   *ray     |   Tor      |
|  Client    +--------->+  Server    +  Client    +-------> TOR
|            |          |            |            |
+------------+          +------------+------------+

```

---

## 🔐 Benefits

### Traffic anonymization through TOR
All outgoing traffic will be routed through the **TOR** network, allowing you to **hide the server’s IP address**.

### Access to .onion sites
TOR provides access to closed resources on the **.onion** network that are not available on the regular internet.

### Privacy and censorship bypass
By using **VLESS TCP + Reality + TOR**, you get an **anonymous VPN with SOCKS5 routing**, which bypasses blocks and increases confidentiality.

---

## 🚀 Installing TOR Proxy (SOCKS5) on the Server

```bash
apt update
apt install tor -y
```

TOR starts automatically and listens on port `9050`.

Check functionality:

```bash
apt install curl -y
curl --socks5-hostname 127.0.0.1:9050 https://check.torproject.org
```

Expected result:

```text
Congratulations. This browser is configured to use Tor.
```

---

## ⚙️ Configuring XRay and Routing Traffic through TOR

Create an XRay configuration with a **VLESS REALITY inbound** and **TOR SOCKS5 outbound proxy**.

```json
{
  "log": { "loglevel": "warning" },
  "routing": {
    "rules": [
      {
        "ip": ["geoip:private"],
        "outboundTag": "BLOCK",
        "type": "field"
      },
      {
        "type": "field",
        "domain": ["geosite:category-ads-all"],
        "outboundTag": "tor-out"
      }
    ]
  },
  "inbounds": [
    {
      "tag": "VLESS+TCP+REALITY+8443",
      "listen": "0.0.0.0",
      "port": 8443,
      "protocol": "vless",
      "settings": {
        "clients": [],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "tcpSettings": { "header": { "type": "none" } },
        "realitySettings": {
          "show": false,
          "dest": "cloudflare.com:443",
          "xver": 0,
          "serverNames": ["cloudflare.com", "www.cloudflare.com"],
          "privateKey": "<your_private_key>",
          "publicKey": "<your_public_key>",
          "shortIds": ["<your_short_id>"],
          "spiderX": "/",
          "fingerprint": "chrome"
        }
      },
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      }
    }
  ],
  "outbounds": [
    {
      "tag": "tor-out",
      "protocol": "socks",
      "settings": {
        "servers": [
          { "address": "127.0.0.1", "port": 9050 }
        ]
      }
    },
    { "protocol": "freedom", "tag": "DIRECT" },
    { "protocol": "blackhole", "tag": "BLOCK" }
  ]
}
```

---

## 🔑 Generating Keys for Reality (x25519)

Open the Marzban container and generate keys:

```bash
docker ps
docker exec -it marzban bash
xray x25519
exit
```

Alternative:

```bash
docker exec marzban xray x25519
```

---

## 🔁 Generating shortId

```bash
openssl rand -hex 8
```

---

## 🕸 Choosing SNI for Camouflage

Avoid public domains like `cloudflare.com`. Use your own domain or find suitable SNI using [RealiTLScanner](https://github.com/XTLS/RealiTLScanner).

---

## ✅ Conclusion

You now have a **Linux-based anonymous proxy server** set up with **VLESS TCP REALITY + TOR**. It provides:

* IP address masking and censorship bypass
* Secure access to the .onion network
* SOCKS5 routing for sensitive traffic

Keep **XRay** updated, monitor **TOR** stability, and stay secure!

---

Perfect for those who want to run a **personal anonymous VPN**, hide their online presence, and protect traffic privacy.
