---
title: Setting up Warp Routing via WireGuard (Wgcf) on Xray-core
description: A detailed guide on configuring Warp routing through a WireGuard connection using Wgcf instead of warp-cli. Suitable for VPS, nodes, proxies, and routing traffic through Cloudflare WARP.
tags:
  - wireguard
  - cloudflare
  - remnawave
  - warp
  - marzban
  - remnanode
  - wgcf
  - xray
  - proxy
series: remnanode
draft: false
pubDate: 05 21 2025
---

# Setting up Warp Routing via WireGuard (Wgcf) without warp-cli

Hello everyone!

I'm not a big fan of using `warp-cli` in SOCKS mode, so I always prefer connecting via WireGuard.

There's one main advantage to this approach:  
> You don’t need to install `warp-cli` on every node.

Let’s get started!

## 1. Download Wgcf

Go to the repository: [Releases · ViRb3/wgcf (GitHub)](https://github.com/ViRb3/wgcf/releases)

Choose the version suitable for your system. For example, for `amd64`:

```bash
wget https://github.com/ViRb3/wgcf/releases/download/v2.2.26/wgcf_2.2.26_linux_amd64
```

## 2. Move the file to the system directory

Rename and move the file to `/usr/bin/`:

```bash
mv wgcf_2.2.26_linux_amd64 /usr/bin/wgcf
```

## 3. Allow execution of the file

Make the file executable:

```bash
chmod +x /usr/bin/wgcf
```

## 4. Register and generate the configuration file

Run the registration command:

```bash
wgcf register
```

This creates the file `wgcf-account.toml`.

Then generate the WireGuard configuration:

```bash
wgcf generate
```

Now, a file named `wgcf-profile.conf` should appear in the current directory.

## 5. View the contents of the configuration file

Check the content of the file:

```bash
cat wgcf-profile.conf
```

We are interested in two lines:
- `PrivateKey`
- `PublicKey`

These will be needed when configuring routing in XRAY.

## 6. Configure routing in the XRAY core

Add a new outbound to your XRAY configuration:

```json
{
  "tag": "warp",
  "protocol": "wireguard",
  "settings": {
    "secretKey": "VALUE FROM PRIVATE_KEY IN wgcf-profile.conf",
    "DNS": "1.1.1.1",
    "kernelMode": false,
    "address": ["172.16.0.2/32"],
    "peers": [
      {
        "publicKey": "VALUE FROM PUBLIC_KEY IN wgcf-profile.conf",
        "endpoint": "engage.cloudflareclient.com:2408"
      }
    ]
  }
}
```

Replace the placeholders with values from your `wgcf-profile.conf`.

## 7. Example of a complete `outbounds` block

```json
"outbounds": [
  {
    "tag": "DIRECT",
    "protocol": "freedom",
    "settings": {
      "domainStrategy": "ForceIPv4"
    }
  },
  {
    "tag": "warp",
    "protocol": "wireguard",
    "settings": {
      "DNS": "1.1.1.1",
      "peers": [
        {
          "endpoint": "engage.cloudflareclient.com:2408",
          "publicKey": "bm00000000000000000Vo510h2wPfgyo="
        }
      ],
      "address": ["172.16.0.2/32"],
      "secretKey": "MISEK000000000000000000vim6zWY=",
      "kernelMode": false
    }
  },
  {
    "tag": "BLOCK",
    "protocol": "blackhole"
  },
  {
    "tag": "IPv4",
    "protocol": "freedom",
    "settings": {
      "domainStrategy": "ForceIPv4"
    }
  }
]
```

## 8. Add `outboundTag` to the routing section

To route traffic for specific domains through WARP, add the following rule:

```json
{
  "outboundTag": "warp",
  "domain": [
    "geosite:google-gemini",
    "openai.com",
    "ai.com",
    "ipinfo.io",
    "iplocation.net",
    "spotify.com",
    "canva.com"
  ],
  "type": "field"
}
```

## Final View in Interface

The final view of this block will look approximately like this:

![Routing Configuration](https://openode.xyz/uploads/monthly_2025_05/image.png.93b56aab8af6f30d7b0ba327c3c2e533.png)

## Conclusion

Setting up WireGuard through Wgcf is a convenient and scalable way to connect to Cloudflare WARP without installing `warp-cli`. This is especially useful when working with proxy servers, VPS instances, and microservices.

If you use XRAY or another proxy engine, this method works well for routing part of the traffic through a secure connection.

> ⚠️ Tip: Do not publish your `PrivateKey` in public repositories or chats — it can lead to compromise of your connection.

## Useful Links

- [Wgcf GitHub Releases](https://github.com/ViRb3/wgcf/releases)
- [NeoNode.cc Telegram Channel](https://t.me/neonode_cc)
- [NeoNode Telegram Community](https://t.me/+cFdHT8DiMUA2MWVi)
