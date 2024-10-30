---
title: How to Create a Command-Line Utility to Manage Caddy
description: A guide to creating a Bash script for managing the Caddy server with convenient short commands.
tags:
  - bash
  - caddy
  - automation
  - server
series: server-tools
draft: false
pubDate: 11 09 2024
---

## Introduction

Managing the Caddy server can be much more convenient by writing a small command-line utility that allows you to perform frequently used actions with a single short command. For example, instead of entering lengthy commands each time to edit the configuration file, restart, check status, or validate, you can create a script that does all this for you.

This article will show how I created a simple Bash utility called `Cadd`. It helps manage Caddy through a few shortened commands. The steps provided explain in detail how to set up the script, make it executable, and use it for everyday tasks.

## Step 1: Creating the Script File

The first step is to create a file where our script will be stored. I decided to name it `Cadd`, but you can choose any name you prefer. This file will be located in the `/usr/local/bin` directory, so the script is available as a system command.

To create the file, run the following command:

```bash
sudo nano /usr/local/bin/cadd
```

### Why This Directory?

The `/usr/local/bin` directory is a standard location for user-executable files on Unix-like systems such as Linux and macOS. It's automatically added to the `$PATH` environment variable, allowing you to run scripts in this directory without specifying the full path.

## Step 2: Writing the Script

Now let’s add code to the `cadd` file. This script will perform several key operations: editing the Caddy configuration file, restarting the service, validating the configuration, checking the status, outputting the last lines of the log, and formatting the file.

### Script Code:

```bash
#!/bin/bash

CONFIG_FILE="/etc/caddy/Caddyfile" # Path to the Caddy configuration file
LOG_LINES=20 # Number of log lines to display

# Console output colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No color (reset)

case "$1" in
    e) # Edit configuration
        nano "$CONFIG_FILE"
        ;;
    r) # Restart Caddy service
        systemctl restart caddy
        echo -e "${GREEN}Caddy restarted.${NC}"
        ;;
    v) # Validate configuration file
        caddy validate --config "$CONFIG_FILE"
        ;;
    s) # Caddy service status
        systemctl status caddy | head -n 10
        ;;
    l) # Caddy service logs
        journalctl -u caddy.service -n "$LOG_LINES"
        ;;
    f) # Format Caddyfile
        caddy fmt --overwrite "$CONFIG_FILE"
        echo -e "${GREEN}File ${YELLOW}$CONFIG_FILE${GREEN} has been formatted.${NC}"
        ;;
    h) # Help output
        echo -e "${YELLOW}Usage:${NC}"
        echo -e "${BLUE}cadd e${NC} - edit Caddyfile"
        echo -e "${BLUE}cadd r${NC} - restart Caddy"
        echo -e "${BLUE}cadd v${NC} - validate Caddyfile"
        echo -e "${BLUE}cadd s${NC} - Caddy status"
        echo -e "${BLUE}cadd l${NC} - show the last ${LOG_LINES} lines of Caddy logs"
        echo -e "${BLUE}cadd f${NC} - format the ${CONFIG_FILE} file"
        echo -e "${BLUE}cadd h${NC} - show help"
        ;;
    *) # Invalid command input
        echo -e "${RED}Invalid option!${NC} Usage: cadd {e|r|v|s|l|h|f}"
        ;;
esac
```

## Step 3: Making the Script Executable

To be able to execute the script, you need to make it executable. Run the following command:

```bash
sudo chmod +x /usr/local/bin/cadd
```

The script is now ready for use. You can call it as a regular command with short options to manage Caddy.

## Caddy Management Commands via `Cadd`

- `cadd e` — opens the Caddy configuration file (`/etc/caddy/Caddyfile`) in the `nano` editor (you can replace the editor with your favorite if you prefer).
- `cadd r` — restarts the Caddy service.
- `cadd v` — validates the Caddy configuration file.
- `cadd s` — shows the current status of the Caddy service.
- `cadd l` — outputs the last lines of the Caddy logs (default is 20).
- `cadd f` — formats the Caddyfile.
- `cadd h` — displays available commands and help information.

## Conclusion

Creating the `Cadd` utility significantly simplifies managing your Caddy server. Instead of typing long commands, you can use simple shortcuts, which is especially helpful for administrators who work with the server regularly. This script can easily be expanded by adding new functions based on your needs.
