---
title: Marzban CLI
description: This guide provides detailed instructions for using the Marzban CLI.
tags:
  - CLI
  - Marzban
  - Command Line Interface
  - Guide
  - Admin Commands
  - Subscription Management
series: MarzbanGuide
draft: false
pubDate: 11 04 2024
---

# Command Line Interface (CLI)

The Marzban Command Line Interface (CLI) includes `4` primary commands, each with subcommands designed for specific tasks. This section explains the purpose of each command, with examples of commonly used commands provided at the end.

**1. How to Use**

Displays options and commands structure for `marzban cli`.

```bash
marzban cli [OPTIONS] COMMAND [ARGS]...
```

> `[ARGS]` refers to various subcommands to accomplish specific tasks.


**2. Options**

`--help`
- Displays help information for `marzban cli`.
```bash
marzban cli --help
```

> - When multiple options are available, you may specify only one; the system will prompt for the others. Alternatively, specifying all options at once executes the command immediately.
> - For example, to transfer user rights from one admin to another, specify the username, admin, and confirmation in one line to execute the command instantly.

```bash
marzban cli user set-owner -u TEXT --admin TEXT -y
```

Some options are optional and can be omitted.


**3. Commands**

`admin`
```bash
marzban cli admin
```

`completion`
```bash
marzban cli completion
```

`subscription`
```bash
marzban cli subscription
```

`user`
```bash
marzban cli user
```

## `admin`

**1. How to Use**

Displays options and commands for `admin`.
```bash
marzban cli admin [OPTIONS] COMMAND [ARGS]...
```

**2. Options**

`--help`
- Displays help for `admin`.
```bash
marzban cli admin --help
```

**3. Commands**

`create`
- Creates an admin user.
```bash
marzban cli admin create
```

`delete`
- Deletes an admin user.
```bash
marzban cli admin delete
```

`import-from-env`
- Imports a `sudo` admin from an environment file.
```bash
marzban cli admin import-from-env
```

`list`
- Displays a list of admins.
```bash
marzban cli admin list
```

`update`
- Updates an admin's data.
```bash
marzban cli admin update
```

## `admin create`

Used for creating an admin user.

**1. How to Use**

Displays options for `admin create`.
```bash
marzban cli admin create [OPTIONS]
```

**2. Options**

`-u, --username TEXT`
- Specifies the admin username.
```bash
marzban cli admin create -u TEXT
```

`--sudo`
- Creates a `sudo` admin.
```bash
marzban cli admin create -u TEXT --sudo
```

`--no-sudo`
- Creates an admin without `sudo`.
```bash
marzban cli admin create -u TEXT --no-sudo
```

`-tg, --telegram-id TEXT`
- Specifies the admin's Telegram ID.
```bash
marzban cli admin create -tg TEXT
```

`-dc, --discord-webhook TEXT`
- Specifies a Discord webhook for the admin.
```bash
marzban cli admin create -dc TEXT
```

`--help`
- Displays help for `admin create`.
```bash
marzban cli admin create --help
```

## `admin delete`
Deletes an admin user.

**1. How to Use**

Displays options for `admin delete`.
```bash
marzban cli admin delete [OPTIONS]
```

**2. Options**

`-u, --username TEXT`
- Specifies the admin username to delete.
```bash
marzban cli admin delete -u TEXT 
```

`-y, --yes`
- Bypasses the confirmation prompt.
```bash
marzban cli admin delete -u TEXT -y
```

`--help`
- Displays help for `admin delete`.
```bash
marzban cli admin delete --help
```

## `admin import-from-env`
Imports a `sudo` admin from an environment file.

**1. How to Use**

Displays options for `admin import-from-env`.
```bash
marzban cli admin import-from-env [OPTIONS]
```

**2. Options**

`-y, --yes`
- Bypasses the confirmation prompt.
```bash
marzban cli admin import-from-env -y
```

`--help`
- Displays help for `admin import-from-env`.
```bash
marzban cli admin import-from-env --help
```

## `admin list`
Displays a list of admins.

**1. How to Use**

Displays options for `admin list`.
```bash
marzban cli admin list [OPTIONS]
```

**2. Options**

`-o, --offset INTEGER`
- Starts the list from a specified point.
```bash
marzban cli admin list -o ITEMS
```

`-l, --limit INTEGER`
- Limits the number of displayed admins.
```bash
marzban cli admin list -l ITEMS
```

`-u, --username TEXT`
- Filters by a specific admin username.
```bash
marzban cli admin list -u TEXT
```

`--help`
- Displays help for `admin list`.
```bash
marzban cli admin list --help
```

## `admin update`
Updates an admin's data.

**1. How to Use**

Displays options for `admin update`.
```bash
marzban cli admin update [OPTIONS]
```

**2. Options**

`-u, --username TEXT`
- Specifies the admin username to update.
```bash
marzban cli admin update -u TEXT 
```

`--help`
- Displays help for `admin update`.
```bash
marzban cli admin update --help
```

## `subscription`

**1. How to Use**

Displays options and commands for `subscription`.
```bash
marzban cli subscription [OPTIONS] COMMAND [ARGS]...
```

**2. Options**

`--help`
- Displays help for `subscription`.
```bash
marzban cli subscription --help
```

**3. Commands**

`get-config`
- Retrieves the user’s proxy configuration.
```bash
marzban cli subscription get-config
```

`get-link`
- Retrieves the user’s subscription link.
```bash
marzban cli subscription get-link
```

## `subscription get-config`
Fetches the user’s proxy configuration.

**1. How to Use**

Displays options for `subscription get-config`.
```bash
marzban cli subscription get-config [OPTIONS]
```

**2. Options**

`-u, --username TEXT`
- Specifies the user’s username.
```bash
marzban cli subscription get-config -u TEXT
```

`-f, --format [v2ray|clash]`
- Outputs the proxy configuration in `v2ray` or `clash` format.
```bash
marzban cli subscription get-config -u TEXT -f [v2ray|clash]
```

`-o, --output TEXT`
- Saves the configuration to a file.
```bash
marzban cli subscription get-config -u TEXT -f v2ray -o v2ray_config.json
```

`--base64`
- Outputs the configuration in base64.
```bash
marzban cli subscription get-config -u TEXT -f [v2ray|clash] --base64
```

`--help`
- Displays help for `subscription get-config`.
```bash
marzban cli subscription get-config --help
```

## `user`

**1. How to Use**

Displays options and commands for `user`.
```bash
marzban cli user [OPTIONS] COMMAND [ARGS]...
```

**2. Options**

`--help`
- Displays help for `user`.
```bash
marzban cli user --help
```

**3. Commands**

`list`
- Lists users.
```bash
marzban cli user list
```

`set-owner`
- Changes the owner of a user.
```bash
marzban cli user set-owner
```

## `completion`

**1. How to Use**

Displays options and commands for `completion`.
```bash
marzban cli completion [OPTIONS] COMMAND [ARGS]...
```

**2. Options**

`--help`
- Displays help for `completion`.
```bash
marzban cli completion --help
```

**3. Commands**

`install`
```bash
marzban cli completion install
```

`show`
```bash
marzban cli completion show
```
