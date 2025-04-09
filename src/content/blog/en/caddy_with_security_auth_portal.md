---
title: How to Create an Authentication Portal for Your Domains with Caddy
description: A detailed guide on building Caddy with the caddy-security module using xcaddy and setting up an authentication portal to secure your domains.
tags:
  - Caddy
  - authentication
  - security
  - xcaddy
series: caddy
pubDate: 04 09 2025
---

# How to Create an Authentication Portal for Your Domains with Caddy

Caddy is a modern web server that automatically provides HTTPS via Let’s Encrypt. However, the standard Caddy build does not include the `caddy-security` module, which is required to create an authentication portal and manage access to your domains. In this article, I’ll walk you through building Caddy with this module using `xcaddy`, configuring an authentication portal, and securing your web applications.

---

## Prerequisites

Before starting, ensure you have:

- A server with an operating system (e.g., Ubuntu 22.04).
- Command-line access with superuser privileges (`sudo`).
- Basic knowledge of web servers and configuration files.
- A domain or subdomain (e.g., `example.com`) with DNS records pointing to your server.
- Go installed (version 1.16 or higher) for building Caddy.

---

## Step 1: Building Caddy with the `caddy-security` Module

Since the `caddy-security` module isn’t included in the standard Caddy build, we’ll compile a custom version using `xcaddy`.

### 1.1. Installing `xcaddy`

`xcaddy` is a tool for building Caddy with additional modules. Install it as follows:

```bash
sudo apt update
sudo apt install -y golang
go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest
```

After running these commands, `xcaddy` will be available in `~/go/bin/xcaddy`. Ensure `~/go/bin` is in your `$PATH` for global access:

```bash
export PATH=$PATH:~/go/bin
```

### 1.2. Building Caddy with `caddy-security`

Now, build Caddy with the `caddy-security` module:

```bash
~/go/bin/xcaddy build --with github.com/greenpau/caddy-security
```

This command creates an executable `caddy` file in the current directory.

### 1.3. Installing the Custom Caddy Build

Move the compiled file to a system directory for global access:

```bash
sudo mv caddy /usr/bin/
```

Verify the version to ensure the module is included:

```bash
caddy version
```

The output should show a custom build version of Caddy.

---

## Step 2: Setting Up User Storage

The authentication portal in Caddy uses a JSON file to store user data. We’ll create a `users.json` file using a script.

### 2.1. Creating a Data Directory

Create a directory for storing data and set appropriate permissions:

```bash
sudo mkdir -p /data/.local/caddy
sudo chown caddy:caddy /data/.local/caddy
```

### 2.2. Generating a User with a Script

Use this script to simplify user creation. It prompts for user details and generates `users.json`.

Save this code as `generate_users_json.sh`:

```bash
#!/bin/bash

# Check dependencies
if ! command -v python3 &> /dev/null; then
    echo "Error: Python3 is not installed. Install it with: 'sudo apt install python3'."
    exit 1
fi
if ! python3 -c "import bcrypt" &> /dev/null; then
    echo "Error: Python bcrypt module is not installed. Install it with: 'pip3 install bcrypt'."
    exit 1
fi
if ! command -v uuidgen &> /dev/null; then
    echo "Error: uuidgen is not installed. Install it with: 'sudo apt install uuid-runtime'."
    exit 1
fi

# Prompt for input
read -p "Enter username: " USERNAME
read -p "Enter email: " EMAIL
read -s -p "Enter password: " PASSWORD
echo

# Validate input
if [[ -z "$USERNAME" || -z "$EMAIL" || -z "$PASSWORD" ]]; then
    echo "Error: All fields must be filled."
    exit 1
fi
if [[ ${#USERNAME} -lt 3 || ${#USERNAME} -gt 50 || "$USERNAME" =~ [^a-z] ]]; then
    echo "Error: Username must be 3-50 characters, lowercase letters (a-z) only."
    exit 1
fi
if [[ ${#PASSWORD} -lt 8 ]]; then
    echo "Error: Password must be at least 8 characters."
    exit 1
fi

# Extract domain
DOMAIN=$(echo "$EMAIL" | cut -d'@' -f2)
if [[ -z "$DOMAIN" ]]; then
    echo "Error: Invalid email format."
    exit 1
fi

# Generate values
UUID=$(uuidgen)
DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
HASH=$(python3 -c "import bcrypt; print(bcrypt.hashpw('$PASSWORD'.encode(), bcrypt.gensalt(10)).decode())")

# Create users.json
cat <<EOF > /data/.local/caddy/users.json
{
  "version": "1.1.7",
  "policy": {
    "password": {
      "min_length": 8,
      "max_length": 128
    },
    "user": {
      "min_length": 3,
      "max_length": 50,
      "allow_non_alpha_numeric": false,
      "allow_uppercase": false
    }
  },
  "revision": 1,
  "last_modified": "$DATE",
  "users": [
    {
      "id": "$UUID",
      "username": "$USERNAME",
      "email_address": {
        "address": "$EMAIL",
        "domain": "$DOMAIN"
      },
      "email_addresses": [
        {
          "address": "$EMAIL",
          "domain": "$DOMAIN"
        }
      ],
      "passwords": [
        {
          "purpose": "generic",
          "algorithm": "bcrypt",
          "hash": "$HASH",
          "cost": 10,
          "expired_at": "0001-01-01T00:00:00Z",
          "created_at": "$DATE",
          "disabled_at": "0001-01-01T00:00:00Z"
        }
      ],
      "created": "$DATE",
      "last_modified": "$DATE",
      "roles": [
        {
          "name": "admin",
          "organization": "authp"
        }
      ]
    }
  ]
}
EOF

# Set permissions
sudo chown caddy:caddy /data/.local/caddy/users.json
sudo chmod 640 /data/.local/caddy/users.json

echo "File /data/.local/caddy/users.json created successfully!"
echo "Restart Caddy: sudo systemctl restart caddy"
```

#### How to Use the Script:

1. Save it as `generate_users_json.sh`.
2. Make it executable:
   ```bash
   chmod +x generate_users_json.sh
   ```
3. Run it:
   ```bash
   ./generate_users_json.sh
   ```
4. Enter details:
   - Username (e.g., `john`).
   - Email (e.g., `john@example.com`).
   - Password (minimum 8 characters).

The script creates `/data/.local/caddy/users.json` with a user assigned the `authp/admin` role.

---

## Step 3: Configuring Caddy for Authentication

Now, configure the Caddyfile to enable the authentication portal.

### 3.1. Base Caddy Configuration

Open `/etc/caddy/Caddyfile`:

```bash
sudo nano /etc/caddy/Caddyfile
```

Add global settings at the top:

```caddy
{
	storage file_system {
		root /var/lib/caddy
	}
	email your-email@example.com
	order authenticate before respond
	order authorize before respond

	security {
		local identity store localdb {
			realm local
			path /data/.local/caddy/users.json
		}

		authentication portal my_portal {
			crypto default token lifetime 3600
			enable identity store localdb
			cookie domain .example.com
			ui {
				links {
					"Dashboard" "/dashboard" icon "las la-tachometer-alt"
					"My Identity" "/auth/whoami" icon "las la-user"
				}
			}
			transform user {
				match origin local
				action add role authp/admin
			}
		}

		authorization policy my_policy {
			set auth url /auth
			allow roles authp/admin
			acl rule {
				comment "Allow authenticated admins"
				match role authp/admin
				allow stop log info
			}
			acl rule {
				comment "Deny all others"
				match any
				deny log warn
			}
		}
	}
}
```

- Replace `your-email@example.com` with your email.
- Replace `.example.com` with your domain (e.g., `.mydomain.com`).

### 3.2. Domain Configuration

Add a block for your domain:

```caddy
sub.example.com {
	route {
		handle /auth {
			rewrite * /auth
			request_header +X-Forwarded-Prefix /auth
			authenticate with my_portal
		}

		route /auth* {
			authenticate with my_portal
			reverse_proxy 127.0.0.1:8080 {
				header_up X-Real-IP {remote}
				header_up Host {host}
			}
		}

		route /* {
			authorize with my_policy
			reverse_proxy 127.0.0.1:8080 {
				header_up X-Real-IP {remote}
				header_up Host {host}
			}
		}
	}

	log {
		output file /var/log/caddy/sub.example.com-access.log {
			roll_size 30mb
			roll_keep 10
			roll_keep_for 720h
		}
		level ERROR
	}
}
```

- Replace `sub.example.com` with your domain.
- Adjust `reverse_proxy` to match your backend (address and port).

---

## Step 4: Validating and Restarting Caddy

### 4.1. Validate Configuration

Check the Caddyfile for errors:

```bash
caddy validate --config /etc/caddy/Caddyfile
```

If you see `Valid configuration`, proceed.

### 4.2. Restart Caddy

Apply changes:

```bash
sudo systemctl restart caddy
```

Verify the status:

```bash
systemctl status caddy
```

The service should be `active (running)`.

---

## Step 5: Testing the Authentication Portal

1. Open a browser and go to `https://sub.example.com/auth`.
2. Enter the username and password from `users.json`.
3. After logging in, verify access to protected resources.

If access fails, check:
- Data in `users.json`.
- Role consistency in the configuration.

---

## Additional Tips

### Multiple Domains

For different domains, create separate portals:

```caddy
authentication portal another_portal {
	cookie domain .anotherdomain.com
	...
}
```

### Logging

Enable debug logs:

```caddy
{
	log {
		output file /var/log/caddy/caddy.log
		level DEBUG
	}
}
```

### Security

- Keep Caddy updated.
- Use strong passwords.
- Configure a firewall (e.g., `ufw`) to allow only ports 80 and 443.

---

## Conclusion

You now have a fully configured authentication portal with Caddy. This setup is scalable—add users, domains, and policies as needed. For further assistance, refer to the Caddy documentation or ask in the community!
