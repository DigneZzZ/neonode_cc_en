---
title: Enhanced MOTD Dashboard for Linux Servers
description: A new MOTD dashboard from NeoNode — modular, customizable, security-focused, and version-aware.
tags:
  - Linux
  - dashboard
  - monitoring
  - security
  - ssh
series: server-tools
pubDate: 04 25 2025
---

# Enhanced MOTD Dashboard for Linux Servers 🧩

This is no longer just a login greeting — it's a full-featured terminal monitoring dashboard. Minimalist, informative, and practical.

---

## 🔧 Installation

For root users:

```bash
bash <(wget -qO- https://dignezzz.github.io/server/dashboard.sh) --force
```

For regular users (no root required):

```bash
bash <(wget -qO- https://dignezzz.github.io/server/dashboard.sh) --force --not-root
```

Configure which blocks to display:

```bash
motd-config
```

---

## 📋 What the Dashboard Shows

- ✅ Uptime, CPU load, RAM usage, disk space
- 🌐 IPv4/IPv6 addresses — both local and public
- 📦 Docker container status (including crashed/stopped ones)
- 🔐 SSH security: port, root login, password auth status
- 🛡️ UFW, Fail2Ban, and CrowdSec status
- 📈 Network traffic (via vnstat)
- 📦 Available APT updates and auto-update status
- 🔄 Version check with update prompt if a newer release is available

---

## ⚙️ Customizable Sections

Each line of output can be individually enabled or disabled:

- Configuration is stored in `~/.motdrc` or `/etc/motdrc`
- Managed via the `motd-config` CLI utility
- Fully works in both root and non-root environments

Example: disable Docker, auto updates, and IP display — and they'll be hidden next login.

---

## 🧠 Features That Matter

- No `tput` coloring — works in mono environments like Proxmox, LXC, WebSSH
- Emoji status indicators (✅ ⚠️ ❌) — immediate clarity at a glance
- Shows critical SSH risks: root access, default port, password login
- No external APIs or dependencies — runs completely offline
- Fully compatible with colorless or limited terminals

---

## 📝 April 23–24 Updates

- ✅ Removed `tput` color — no more visual bugs in monochrome terminals
- ⚠️ Highlights security risks: root login, UFW disabled, Fail2Ban missing
- 📋 New: Kernel version, SSH port, password login status
- 🔄 Auto-check for new versions of the dashboard

---

## 🛠 Usage Examples

```bash
# Install the dashboard (root)
bash <(wget -qO- https://dignezzz.github.io/server/dashboard.sh) --force

# Install without root
bash <(wget -qO- https://dignezzz.github.io/server/dashboard.sh) --force --not-root

# Launch interactive block configuration
motd-config
```

---

## 💬 Join the Discussion

You can also share feedback, suggestions, or just say hi in the official discussion thread:

👉 [NeoNode MOTD Dashboard on the Forum](https://openode.xyz/topic/1529-novyy-motd-deshbord-ot-neonode/)

---
## ❓ Questions or Feedback

Want to suggest a feature, contribute a block, or found a bug? Reach out in [our Telegram](https://t.me/neonode_cc) or open an issue.

---

## 🎯 Final Thoughts

With the new NeoNode MOTD dashboard, your terminal becomes a control panel: no bloat, no ads — just clean, customizable, secure system insight right when you log in.
