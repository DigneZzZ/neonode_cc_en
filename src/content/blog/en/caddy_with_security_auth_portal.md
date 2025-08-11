---
title: How to Create an Authentication Portal for Your Domains with Caddy
description: A detailed guide on building Caddy with the caddy-security module using xcaddy and setting up an authentication portal with local authentication and OAuth providers to secure your domains.
tags:
  - Caddy
  - authentication
  - security
  - xcaddy
  - OAuth
  - Google
series: caddy
pubDate: 04 09 2025
---

# How to Create an Authentication Portal for Your Domains with Caddy

Caddy is a modern web server that automatically provides HTTPS via Let's Encrypt. However, the standard Caddy build does not include the `caddy-security` module, which is required to create an authentication portal and manage access to your domains. In this article, I'll walk you through building Caddy with this module using `xcaddy`, configuring an authentication portal with local authentication and OAuth providers (Google), and securing your web applications. to Create an Authentication Portal for Your Domains with Caddy
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

```json
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

```json
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

## Step 6: Advanced Configuration - OAuth Authentication

In addition to local authentication, Caddy Security supports OAuth providers such as Google. This allows users to sign in using their existing Google accounts.

### 6.1. Setting Up Google Cloud Platform

To integrate with Google OAuth, you need to configure a project in Google Cloud Platform:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" → "Credentials"
4. Click "Configure Consent Screen"
   - Choose user type: "External"
   - Fill in required fields: application name, developer email
   - In "Scopes" section add: `openid`, `email`, `profile`
5. Create OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Add authorized redirect URIs:
     ```
     https://auth.example.com/oauth2/google/authorization-code-callback
     https://auth.example.com/auth/oauth2/google/authorization-code-callback
     ```
6. Save the Client ID and Client Secret

### 6.2. Updating Caddy Configuration

Update your Caddyfile to support Google OAuth:

```json
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

        oauth identity provider google {
            realm google
            driver google
            client_id {env.GOOGLE_CLIENT_ID}.apps.googleusercontent.com
            client_secret {env.GOOGLE_CLIENT_SECRET}
            scopes openid email profile
        }

        authentication portal my_portal {
            crypto default token lifetime 3600
            crypto key sign-verify {env.JWT_SHARED_KEY}
            enable identity store localdb
            enable identity provider google
            cookie domain .example.com
            ui {
                links {
                    "Dashboard" "/dashboard" icon "las la-tachometer-alt"
                    "My Identity" "/auth/whoami" icon "las la-user"
                    "Portal Settings" "/settings" icon "las la-cog"
                }
            }
            transform user {
                match origin local
                action add role authp/user
                ui link "Portal Settings" /settings icon "las la-cog"
            }
            transform user {
                match origin local
                match email admin@example.com
                action add role authp/admin
            }
            transform user {
                match realm google
                action add role authp/user
            }
            transform user {
                match realm google
                match email admin@example.com
                action add role authp/admin
            }
        }

        authorization policy my_policy {
            set auth url /auth
            crypto key verify {env.JWT_SHARED_KEY}
            allow roles authp/admin authp/user
            validate bearer header
            inject headers with claims
            acl rule {
                comment "Allow authenticated users"
                match role authp/admin authp/user
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

### 6.3. Environment Variables Configuration

Create `/etc/caddy/env.conf` file with necessary variables:

```bash
# JWT key for token signing (minimum 100 characters)
JWT_SHARED_KEY=your-very-long-random-string-here-minimum-100-characters

# Google OAuth credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Ensure the Caddy service loads environment variables. Add to `/lib/systemd/system/caddy.service` in the `[Service]` section:

```ini
EnvironmentFile=/etc/caddy/env.conf
```

### 6.4. Advanced Transform Rules

Transform rules allow you to configure roles and UI elements for users based on authentication source:

- **match origin local** - for local users
- **match realm google** - for Google OAuth users
- **match email** - for specific email addresses
- **action add role** - assign role to user
- **ui link** - add link to interface

### 6.5. Additional Authorization Policy Options

- **validate bearer header** - validate JWT tokens in headers
- **inject headers with claims** - add user information to headers for backend services
- **acl rule** - detailed access control rules

---

## Step 7: Configuring Additional OAuth Providers

Caddy Security supports various OAuth providers through the generic driver. Example configuration for arbitrary OIDC provider:

```json
oauth identity provider custom {
    realm custom
    driver generic
    client_id {env.CUSTOM_CLIENT_ID}
    client_secret {env.CUSTOM_CLIENT_SECRET}
    server_id {env.CUSTOM_SERVER_ID}
    tenant_id {env.CUSTOM_TENANT_ID}
    base_auth_url https://custom-provider.com/oauth2/authorize
    metadata_url https://custom-provider.com/.well-known/openid_configuration
    scopes openid email profile
}
```

---

## Additional Tips

### Enhanced Portal UI

Configure a more functional portal interface:

```json
ui {
    links {
        "Dashboard" "/dashboard" icon "las la-tachometer-alt"
        "My Identity" "/whoami" icon "las la-user"
        "Portal Settings" "/settings" icon "las la-cog"
        "Admin Panel" "/admin" icon "las la-tools"
        "Logs" "/logs" icon "las la-file-alt"
    }
    theme dark
    custom_css_required no
    custom_js_required no
}
```

### Multiple Domains

For different domains, create separate portals:

```json
authentication portal another_portal {
	cookie domain .anotherdomain.com
	...
}
```

### Advanced Logging

Enable debug logs:

```json
{
	log {
		output file /var/log/caddy/caddy.log
		level DEBUG
	}
}
```

### Token Lifetime Configuration

Various token settings:

```json
authentication portal my_portal {
    crypto default token lifetime 3600    # 1 hour
    crypto key sign-verify {env.JWT_SHARED_KEY}
    # Settings for refresh tokens
    token sources {
        config {
            token_lifetime 300      # 5 minutes for access token
            token_name "access_token"
        }
        config {
            token_lifetime 86400    # 24 hours for refresh token
            token_name "refresh_token"
        }
    }
}
```

### Security

- Keep Caddy updated.
- Use strong passwords.
- Configure a firewall (e.g., `ufw`) to allow only ports 80 and 443.

---

## Conclusion

You now have a comprehensive authentication portal with Caddy supporting both local authentication and OAuth providers. Key features include:

- **Local authentication** with automated user creation via script
- **OAuth integration** with Google and other providers
- **Flexible role system** and access control
- **Advanced capabilities** for validation and header injection
- **Modern UI** with customizable links

This configuration is easily scalable—add users, domains, authentication providers, and authorization policies according to your needs.

For additional OAuth providers, see the [generic OIDC documentation](https://github.com/authp/authp.github.io/blob/main/assets/conf/oauth/generic/Caddyfile).

For further assistance, refer to the Caddy Security documentation or ask in the community!
