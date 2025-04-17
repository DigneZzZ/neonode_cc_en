---
title: Useful Tweaks and Utilities for Ubuntu Server
description: A practical guide to improving your daily experience with Ubuntu Server. No bloat, just essential CLI tools, aliases, and scripts that truly help.
tags:
  - ubuntu
  - server
  - administration
  - automation
  - optimization
series: UbuntuServerGuide
draft: false
pubDate: 04 17 2025
---

# Useful Tweaks and Utilities for Ubuntu Server

Ubuntu Server is a reliable platform, but out of the box it’s fairly minimal. This guide collects **practical tweaks and modern CLI tools** that truly help in everyday server work. No generic `ufw`, no Docker dependencies—just clear, lightweight utilities that install with one command and deliver immediate value.

## ⚙️ Handy Aliases

1. **Update and clean up:**
```bash
alias aptf='apt update && apt upgrade -y && apt autoremove -y'
```

2. **Remove system clutter and old logs:**
```bash
alias cleanup='apt autoremove -y && apt autoclean && journalctl --vacuum-time=7d'
```

3. **Find large files (useful when disk space runs low):**
```bash
alias bigfiles='find / -type f -size +100M 2>/dev/null'
```

4. **View real-time logs:**
```bash
alias logs='journalctl -xe -f'
```

5. **Regenerate GRUB config:**
```bash
alias update-grub2='grub-mkconfig -o /boot/grub/grub.cfg'
```

## 📟 Modern CLI Tools

### Monitoring and Resources

- `btop` — a beautiful system monitor with charts:
```bash
snap install btop
```
Just run `btop`

- `glances` — a powerful resource monitor with optional web interface (`glances -w`):
```bash
apt install -y glances
```

- `tldr` — concise help pages for Linux commands:
```bash
apt install -y tldr
```
Example: `tldr rsync`

### File Handling and Navigation

- `bat` — a `cat` replacement with syntax highlighting and line numbers:
```bash
apt install -y bat
```
Use: `batcat filename` (or alias `bat='batcat'`)

- `exa` — a modern `ls` with colors and tree view:
```bash
apt install -y exa
```
Use: `exa -lh --tree`

- `fd` — a simpler, faster alternative to `find`:
```bash
apt install -y fd-find
```
Example: `fd config .`

- `ripgrep` (`rg`) — fast text search across files, better than `grep`:
```bash
apt install -y ripgrep
```
Example: `rg "search_text"`

## 💾 Disk Usage and Backups

- `ncdu` — visual disk usage analyzer, sorts folders by size:
```bash
apt install -y ncdu
```
Run `ncdu` in any folder.

- `duf` — modern replacement for `df`, with colorful output:
```bash
apt install -y duf
```

- `restic` — encrypted, deduplicated backups:
```bash
apt install -y restic
```
Example:
```bash
restic -r /backup init
restic -r /backup backup /etc
```
Note: I don’t use this daily, but it’s a modern and reliable backup tool worth exploring.

## 🌐 Networking and Diagnostics

- `mtr` — interactive traceroute with live updates:
```bash
apt install -y mtr
```
Run: `mtr google.com`

- `iperf3` — network bandwidth testing between hosts:
```bash
apt install -y iperf3
```
Usage: `iperf3 -s` on the server, `iperf3 -c IP` on the client

- `bandwhich` — displays bandwidth usage per process:
```bash
snap install bandwhich
```
Run: `sudo bandwhich`

## 🔐 Security and Utility Tools

- `age` — modern, minimal file encryption:
```bash
apt install -y age
```
Example:
```bash
age -e -r <public_key> file.txt > file.txt.age
```

- `pass` — CLI password manager based on GPG:
```bash
apt install -y pass
```
Example:
```bash
pass init "Your GPG ID"
pass insert my/password
```

- `goss` — system configuration testing (infrastructure-as-code):
```bash
curl -L https://github.com/goss-org/goss/releases/latest/download/goss-linux-amd64 -o /usr/local/bin/goss && chmod +x /usr/local/bin/goss
```
Example: `goss validate`

## 🧩 Conclusion

This list features only **lightweight and truly useful tools**, requiring no Docker or complicated configuration. Everything runs with a single command and delivers real benefit.

You can expand this into a script, a setup template, or even your own server image. Interested? Just ask.

Let your server run like clockwork—clean, stable, and efficient!

