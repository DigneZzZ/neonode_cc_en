---
title: Disabling Two-Way Ping
description: Want to mask your VPN or proxy? Learn how to disable two-way ping to enhance anonymity.
tags:
  - icmp
  - ping
  - linux
  - two-way ping
  - ICMP ping
series: server
draft: false
pubDate: 09 10 2024
---

# Disabling Two-Way Ping

**Looking to maximize the anonymity of your VPN or proxy?** Disabling two-way ping might be what you need to hide the tunnel and prevent detection.

In this short but helpful guide, I’ll explain how to disable ICMP ping responses on both Linux and Windows.

---

## What is Two-Way Ping?

Two-way ping allows others to verify that a server is online by sending ICMP requests and receiving responses. Disabling ICMP responses helps hide the tunnel, making your VPN or proxy less detectable.

---

## Steps to Disable Two-Way Ping on Linux

### 1. Connect to Your Server

Connect to your server via `ssh` and log in as `root`:

```bash
ssh root@your-server-ip
```

### 2. Edit UFW Firewall Settings

First, edit the **ufw** firewall rules. Open the `before.rules` configuration file with the **nano** editor:

```bash
nano /etc/ufw/before.rules
```

### 3. Add ICMP Blocking Rules

Add the following lines to block various types of ICMP requests:

```bash
# Disable ICMP ping responses
-A ufw-before-input -p icmp --icmp-type destination-unreachable -j DROP
-A ufw-before-input -p icmp --icmp-type source-quench -j DROP
-A ufw-before-input -p icmp --icmp-type time-exceeded -j DROP
-A ufw-before-input -p icmp --icmp-type parameter-problem -j DROP
-A ufw-before-input -p icmp --icmp-type echo-request -j DROP
```

These rules will disable various ICMP request types, including `echo-request`, commonly used for standard ping requests.

### 4. Restart UFW

After making changes, restart the UFW firewall to apply the new rules:

```bash
ufw disable && ufw enable
```

### 5. Verify

Now, your server should not respond to ICMP requests, making it less detectable to anyone attempting to “ping” your tunnel.

You can check your anonymity level on [2ip.io](https://2ip.io/privacy/).

---

## Important Notes

- **Limitations**: Disabling ICMP ping may make network diagnostics more challenging, as ping requests are often used to verify server availability.
- **Alternative**: If completely disabling ICMP isn’t suitable, consider partially limiting ICMP by blocking only certain types of requests.

---

## Conclusion

Disabling two-way ping is a straightforward and effective way to enhance the anonymity of your server, VPN tunnel, or proxy. However, be cautious when changing network settings, as this may impact server availability for monitoring and diagnostics.

If you aim for maximum traffic masking, this method will help you achieve greater privacy.

Below is an article update explaining how to allow ICMP echo-request for a specific IP and additional recommendations for working with Uptime Kuma.

---

## Update: Allowing ICMP Echo-Request for a Specific IP

Recently, I encountered a situation where a server with disabled ping for anonymity was also running monitoring via Uptime Kuma. Of course, monitoring needs ICMP access, but enabling ping for everyone wasn’t ideal. Here’s how I solved the issue by allowing ICMP echo-request only for a specific IP.

### 1. Allow ICMP Echo-Request from Uptime Kuma’s IP

First, I allowed ICMP requests from a specific IP address for monitoring. For example, if Uptime Kuma’s IP is `1.2.3.4`:

```bash
sudo iptables -A INPUT -p icmp --icmp-type echo-request -s 1.2.3.4 -j ACCEPT
```

### 2. Block All Other ICMP Requests

To protect the server, I blocked all other ICMP requests from other IPs:

```bash
sudo iptables -A INPUT -p icmp --icmp-type echo-request -j DROP
```

### 3. Additional ICMP Types for Monitoring

Some monitoring systems, like Uptime Kuma, may use other ICMP types for diagnostics, so I allowed a couple of key request types:

```bash
# Allow Destination Unreachable from specific IP
sudo iptables -A INPUT -p icmp --icmp-type destination-unreachable -s 1.2.3.4 -j ACCEPT

# Allow Time Exceeded from specific IP
sudo iptables -A INPUT -p icmp --icmp-type time-exceeded -s 1.2.3.4 -j ACCEPT
```

This preserved monitoring functionality without opening ICMP for the entire internet.

### 4. Save iptables Settings

After configuring, I saved the iptables rules to apply after reboot:

```bash
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

Now, Uptime Kuma monitoring works, and the server remains protected from unwanted ICMP requests.