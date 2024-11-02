---
title: Webhooks in Marzban
description: This guide provides an in-depth look at configuring and using webhooks in Marzban for automated notifications and integration.
tags:
  - integration
  - automation
  - Marzban
  - webhook
series: MarzbanGuide
draft: false
pubDate: 02 11 2024
---

# Webhooks in Marzban

If you’re using Marzban and need a way to handle user events automatically, webhooks provide a flexible solution. They enable you to receive notifications about various events, such as user creation, updates, or expiration, which can be used for integration with external systems.

## Why Use Webhooks?

### Key Benefits:
- **Event Tracking**: Get notifications on user events like creation, updates, restrictions, and more.
- **Integration with External Systems**: Automate actions like updating a database, sending alerts, or performing other processes in response to events in Marzban.

## Setting Up Webhooks

To start using webhooks, follow these steps for configuration and implementation.

### Step 1: Configuring the Webhook URL

Define the URL where you want to receive notifications in the `.env` file or through environment variables:

```bash
WEBHOOK_ADDRESS=https://your-server.com/webhook
```

To add a secret key for request verification, set `WEBHOOK_SECRET`:

```bash
WEBHOOK_SECRET=your-secret-key
```

Now, Marzban will send POST requests to this URL when a specific user event occurs.

### Step 2: Processing Incoming Notifications

Your server receiving webhooks needs to handle POST requests with JSON content. Every request includes a `x-webhook-secret` header (if configured) for security, as well as event-specific details in the payload. Here’s a sample JSON payload:

```json
{
  "username": "example_user",
  "action": "user_created",
  "enqueued_at": 1680506457.636369,
  "tries": 0
}
```

- **`username`**: Username related to the event.
- **`action`**: Type of event (e.g., `user_created`, `user_updated`).
- **`enqueued_at`**: Timestamp of the event.
- **`tries`**: Retry count if notification delivery fails.

#### Event Types:
The `action` field may have the following values:
- `user_created` – Triggered when a user is created.
- `user_updated` – When a user’s details are updated.
- `user_deleted` – When a user is removed.
- `user_limited` – When limits are applied to a user.
- `user_expired` – When a user’s account expires.
- `user_disabled` / `user_enabled` – When a user is disabled or enabled.


### Step 3: Example Code for Receiving a Webhook

Here’s an example using Python and Flask to set up a server that verifies Marzban webhook notifications:

```python
from flask import Flask, request, jsonify
import hmac
import hashlib

app = Flask(__name__)
WEBHOOK_SECRET = 'your-secret-key'

def verify_signature(data, signature):
    expected_signature = hmac.new(WEBHOOK_SECRET.encode(), data, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected_signature, signature)

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('x-webhook-secret')
    if not signature or not verify_signature(request.data, signature):
        return jsonify({"error": "Invalid signature"}), 403

    payload = request.json
    print("Received event:", payload['action'], "for user:", payload['username'])
    
    # Process the event
    if payload['action'] == 'user_created':
        # Code to handle user creation
        pass
    elif payload['action'] == 'user_updated':
        # Code to handle user update
        pass
    # Additional event actions

    return jsonify({"status": "success"}), 200

if __name__ == '__main__':
    app.run(port=5000)
```

In this example, Flask validates the `x-webhook-secret` header with HMAC and handles events based on the `action` field.

---

Using Marzban’s webhooks opens up powerful options for automation and integration. With this guide, you can start streamlining your workflow with Marzban. For more details, check out Marzban’s official documentation.
