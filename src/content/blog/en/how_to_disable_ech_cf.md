---
title: Disabling Encrypted Client Hello (ECH) for Cloudflare Domains
description: Learn how to disable the Encrypted Client Hello (ECH) feature for your domain on Cloudflare to avoid Roskomnadzor’s blocking. A step-by-step guide for users in Russia.
tags:
  - Cloudflare
  - ECH
  - TLS 1.3
  - blocking
  - security
series: CloudflareGuide
draft: false
pubDate: 11 07 2024
---

# Disabling Encrypted Client Hello (ECH) for Cloudflare Domains

Roskomnadzor has blocked Encrypted Client Hello (ECH), causing issues for Cloudflare users in Russia. If you’re affected, follow these steps to disable ECH and maintain stable access to your resource.

## Option 0 - Disable TLS 1.3 - The Worst Option!

## Option 1 - Disable Proxying for Domains

This could work, but what's the point then? Let's move on!

## Option 2 - Disabling ECH via Cloudflare API

This is the best option!

### 🔍 Step 1: Check if ECH is Enabled

First, check if ECH is enabled for your domain. Follow this link, replacing `[YOUR_DOMAIN]` with your actual domain:

```bash
https://dns.google/resolve?name=\[YOUR\_DOMAIN\]&type=HTTPS
```

If the results indicate that ECH is enabled, move on to the next step.

### 🔑 Step 2: Obtain API Credentials for Cloudflare

To disable ECH, you’ll need your **Global API Key** and **Zone ID**. Here’s how to find them:

- **Global API Key**: Go to your [Cloudflare profile](https://dash.cloudflare.com/profile/api-tokens) and locate your global API key.
- **Zone ID**: Open the settings for your domain in Cloudflare, scroll down, and copy the Zone ID.

### ⚙️ Step 3: Disable ECH via Cloudflare API

Now, use the `curl` command to disable ECH. Run the following command in your terminal, replacing with your actual credentials:

```bash
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/{ID_ZONE}/settings/ech" \
    -H "X-Auth-Email: {ACCOUNT_EMAIL}" \
    -H "X-Auth-Key: {GLOBAL_API_KEY}" \
    -H "Content-Type:application/json" \
    --data '{"id":"ech","value":"off"}'
```

Replace `{ID_ZONE}`, `{ACCOUNT_EMAIL}`, and `{GLOBAL_API_KEY}` with your Zone ID, email, and API key.

### 🛠️ Alternative Method: Disabling ECH via Postman

If you prefer to use Postman, follow these steps:

1. In Postman, select **PATCH** and enter the URL:  
   `https://api.cloudflare.com/client/v4/zones/{ID_ZONE}/settings/ech`
2. In **Headers**, add:
   - `X-Auth-Email`: your Cloudflare email address
   - `X-Auth-Key`: your Global API Key
   - `Content-Type`: `application/json`
3. In **Body**, select **raw** and insert the JSON:
   ```json
   {"id": "ech", "value": "off"}
   ```

## 💼 Another Option: Disable ECH via Cloudflare Dashboard (for CF Paid Plans)

Paid plan users can disable ECH directly through the Cloudflare interface:

1. Go to SSL/TLS settings.
2. In the "Edge Certificates" section, find "Encrypted ClientHello (ECH)" and select "Disabled."

---

With these steps, you can bypass Roskomnadzor's blocking and ensure uninterrupted access to your resources. Protect your data and stay informed of changes!
