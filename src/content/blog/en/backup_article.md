---
title: "Automatic Data Backup Using Rclone and Cloudflare R2"
description: "How I automated my server backup using Rclone and Cloudflare R2."
tags:
  - Rclone
  - Cloudflare R2
  - Backup
  - Bash
  - Crontab
series: server-tools
draft: false
pubDate: 09 12 2024
---

## Introduction

As someone who values the stability and security of their servers, I realized the need to automate my backups. It’s not just a convenience; it’s a vital part of administration. In this article, I’ll show exactly how I set up automated data backup for my main server using Rclone and Cloudflare R2. I’ll share my script, which archives data, uploads it to Cloudflare R2, and sends notifications to Telegram. Naturally, all of this runs automatically every 4 hours via crontab.

## What is Rclone?

Rclone is a powerful tool I've long used for working with cloud storage, enabling you to copy, sync, and move data between your server and various cloud providers. It supports dozens of providers, from Amazon S3 and Google Drive to Cloudflare R2, and has a wide range of features that make it ideal for backups and file management.

## Why Cloudflare R2?

Cloudflare R2 is a competitive storage solution that offers attractive pricing and high availability, similar to Amazon S3 but without egress fees, which makes it a great option for frequent backups and data recovery. With Cloudflare R2, I can store my server backups efficiently without worrying about high traffic costs when retrieving data.

## Setting Up Rclone with Cloudflare R2

To start, I installed and configured Rclone to connect with my Cloudflare R2 account.

1. **Install Rclone:** If you haven’t installed it yet, follow the instructions on the [Rclone website](https://rclone.org/).
2. **Configure Cloudflare R2 in Rclone:**

Run the command below to start the configuration process:
   
   ```bash
   rclone config
   ```

Choose `New remote` and enter the following settings:

- **Name:** cloudflare-r2
- **Storage:** S3 Compatible
- **Provider:** Other
- **Access Key ID:** Your Cloudflare R2 Access Key
- **Secret Access Key:** Your Cloudflare R2 Secret Key
- **Endpoint:** `https://<account_id>.r2.cloudflarestorage.com`

Save and exit the configuration.

## Creating the Backup Script

Below is the backup script I use. It compresses the specified folders, uploads the backup to Cloudflare R2, and sends a notification to Telegram upon completion.

```bash
#!/bin/bash

# Set the directory for the backup
BACKUP_DIR="/backup"

# Set the directories to be backed up
DATA_DIRS=(
  "/var/www"
  "/etc"
  "/home"
)

# Set the archive name with a timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M")
ARCHIVE_NAME="backup_${TIMESTAMP}.tar.gz"

# Create the archive
tar -czf $BACKUP_DIR/$ARCHIVE_NAME ${DATA_DIRS[@]}

# Upload the archive to Cloudflare R2
rclone copy $BACKUP_DIR/$ARCHIVE_NAME cloudflare-r2:backups

# Send a notification to Telegram
TELEGRAM_TOKEN="your_telegram_bot_token"
CHAT_ID="your_chat_id"
MESSAGE="Backup ${ARCHIVE_NAME} has been successfully uploaded to Cloudflare R2."

curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_TOKEN/sendMessage" -d chat_id=$CHAT_ID -d text="$MESSAGE"

# Delete old backups (older than 7 days)
find $BACKUP_DIR -type f -name "*.tar.gz" -mtime +7 -exec rm {} \;
```

Save the script, for example as `backup.sh`, and make it executable:

```bash
chmod +x backup.sh
```

## Automating with Crontab

To ensure the backup runs regularly, add it to crontab:

```bash
crontab -e
```

Then add the following line to schedule the script to run every 4 hours:

```bash
0 */4 * * * /path/to/backup.sh
```

## Conclusion

With this setup, my server's data is backed up automatically every 4 hours, stored securely in Cloudflare R2, and I receive real-time notifications via Telegram. This setup gives me peace of mind and saves time, allowing me to focus on other tasks knowing my data is protected and easily accessible if needed.