---
title: Log Rotation in Caddy
description: Log rotation in Caddy helps maintain necessary server control (especially for f2b/crowdsec monitoring) and prevents storage overflow due to high log output.
tags:
  - caddy
  - logrotate
  - logs
series: caddy
draft: false
pubDate: 09 11 2024
---

# Log Rotation in Caddy

Log rotation is the process of automatically archiving and deleting old logs to prevent disk space from filling up. For Caddy, log rotation can be set up using external tools like **logrotate**, widely used for log rotation on Linux.

## Configuring Log Rotation with logrotate

### 1. **Install logrotate** (if not already installed)

```bash
sudo apt install logrotate
```

### 2. **Create a Configuration for Caddy**

Open or create a configuration file for Caddy in `/etc/logrotate.d/caddy`:

```bash
sudo nano /etc/logrotate.d/caddy
```

### 3. **Sample Configuration for Caddy Log Rotation**

   Insert the following configuration into the file:

```bash
/var/log/caddy/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root  
    postrotate
        systemctl reload caddy
    endscript
}
```

If you are using a user other than `root`, replace it accordingly.

## Explanation of the Settings

- `daily`: Logs will be rotated daily. You can change this to `weekly` for weekly rotation.
- `rotate 14`: Retain up to 14 log archives.
- `compress`: Compress archives to save space.
- `delaycompress`: Delay compression until the next rotation.
- `notifempty`: Skip rotation if the log file is empty.
- `create 0640 root root`: Create a new file with 0640 permissions and `root` as the owner.
- `postrotate`: After rotation, restart the Caddy service to start writing to a new file.

## **Checking logrotate Configuration**

You can check the logrotate configuration with the following command:

```bash
sudo logrotate -d /etc/logrotate.d/caddy
```

   This command performs a test and shows how the rotation will proceed, without making changes.

## **Manually Running logrotate for Testing**

   To manually trigger rotation and verify functionality, run:

```bash
sudo logrotate -f /etc/logrotate.d/caddy
```

After these steps, logrotate will automatically rotate Caddy logs according to the specified settings.
