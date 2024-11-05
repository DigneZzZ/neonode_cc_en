---
title: Configuring Notifications and Allowed Domains for the Marzban Panel
description: Learn how to set up traffic notifications and manage panel access in Marzban. A practical guide on automation and security.
tags:
  - Marzban
  - notifications
  - automation
  - admin panel
series: MarzbanGuide
draft: false
pubDate: 11 05 2024
---

# Configuring Notifications and Allowed Domains for the Marzban Panel

If you work with Marzban, these new settings can simplify your workflow and secure panel access. With environment variables, you can set up user notifications and restrict access to the admin panel to specific domains.

## 📢 Setting Up Notifications

Marzban now supports automated notifications sent to webhooks when specific thresholds are reached. For example, you can set notifications to be sent when a user’s remaining access days fall below a specified number or when they reach a defined percentage of their allotted traffic. These notifications can be integrated smoothly with a Telegram bot.

**Key Notification Variables:**

- **NOTIFY_IF_DATA_USAGE_PERCENT_REACHED** — sends a notification when a user’s traffic usage reaches 80% or another specified value.
  
  ``` 
  NOTIFY_IF_DATA_USAGE_PERCENT_REACHED=True 
  ```

- **NOTIFY_IF_DAYS_LEFT_REACHED** — sends a notification a few days before the user’s access expires, with a default of 3 days.

  ``` 
  NOTIFY_IF_DAYS_LEFT_REACHED=True 
  ```

- **NOTIFY_DAYS_LEFT** — defines the number of days before expiration to trigger a notification.

  ``` 
  NOTIFY_DAYS_LEFT=3,7 
  ```

- **NOTIFY_REACHED_USAGE_PERCENT** — sets the traffic usage percentage at which to send notifications.

  ``` 
  NOTIFY_REACHED_USAGE_PERCENT=80,90 
  ```

> **Important**: To use the last two variables, the first two need to be activated.

> **Note**: Marzban version 7 supports only one threshold value for notifications. The Dev version allows for multiple thresholds (e.g., notifications at 80% and 90%).

## 🌐 Configuring Allowed Domains for Admin Panel Access

If you want to restrict access to the Marzban admin panel to certain domains, use the `ALLOWED_ORIGINS` variable. This lets you specify which domains have access to the panel.

**Example configuration:**

```bash
ALLOWED_ORIGINS=http://localhost,http://localhost:8000,http://example.com
```

> **Tip**: If the link domain and panel domain are different, the panel will remain accessible from both domains. With `ALLOWED_ORIGINS`, you can specify exactly which domain or subdomain has access to the admin panel.

---

With these settings, you can automate user notifications and define clear access rules for the Marzban panel. This will not only improve the user experience but also enhance system security.
