---
title: How to Set Up IPv6 Networking in Docker and Docker Compose
description: A comprehensive guide to enabling IPv6 in Docker and configuring IPv6-supported networks with Docker Compose for modern applications.
tags:
  - docker
  - ipv6
  - network
  - docker-compose
  - infrastructure
  - containers
series: networking
draft: false
pubDate: 09 11 2024
---

# Configuring IPv6 Networking in Docker and Docker Compose

With the growth of internet-connected devices and the increasing number of connections, IPv6 is becoming more relevant. In this article, I’ll show you how to enable IPv6 support in Docker and Docker Compose to ensure scalability and prepare your infrastructure for future network requirements.

## Why Use IPv6?

IPv4 was initially limited to a 32-bit address space, leading to a shortage of available addresses. IPv6 solves this problem by offering a 128-bit address space. Using IPv6 in container infrastructure provides the following benefits:
- **Scalability:** A vast number of addresses.
- **Simplified routing:** Improved structure for address aggregation.
- **Future compatibility:** The internet is gradually shifting to IPv6, and your application should be ready.

---

## Enabling IPv6 Support in Docker

To start, you need to enable IPv6 support in Docker. By default, Docker only supports IPv4, so configuration changes are required.

### Step 1: Configure Docker Settings

1. Open or create Docker’s `daemon.json` configuration file:

```bash
sudo nano /etc/docker/daemon.json
```

2. Add the following lines:

```json
{
  "ipv6": true,
  "fixed-cidr-v6": "2001:db8:abc1::/64"
}
```

The `"ipv6": true` parameter enables IPv6 support, and `"fixed-cidr-v6"` specifies the IPv6 subnet that the Docker network will use.

### Step 2: Restart Docker

After making the changes, restart Docker to apply the settings:

```bash
sudo systemctl restart docker
```

### Step 3: Verify the Network

Ensure that the IPv6-supported network was created successfully by running:

```bash
docker network ls
```

Then check the network configuration:

```bash
docker network inspect bridge
```

You should see your IPv6 subnet and gateway.

---

## Creating a Container with IPv6 Support

Now that Docker supports IPv6, you can create containers with IPv6 capabilities.

### Step 1: Start a Container

Launch a container with IPv6 support:

```bash
docker run -di --name alpine6 alpine
```

### Step 2: Check Addresses

Verify that the container has both IPv4 and IPv6 addresses:

```bash
docker exec alpine6 ip a
```

### Step 3: Ping the Gateway

Ensure that the container can interact with the network via IPv6:

```bash
docker exec alpine6 ping6 2001:db8:abc1::1
```

---

## Creating a Custom Network with IPv6

### Step 1: Create the Network

For production environments, it’s better to create your own network:

```bash
docker network create --ipv6 --subnet="2001:db8:1::/64" --gateway="2001:db8:1::1" my-net
```

### Step 2: Connect a Container

Attach the container to the custom network:

```bash
docker run -di --name alpine_custom --network my-net alpine
```

---

## Setting Up IPv6 Networking with Docker Compose

Docker Compose is a powerful tool for managing multi-container applications. You can also configure IPv6 support through Compose.

### Example 1: Using an Existing Network

1. First, create the network via the command line:

```bash
docker network create --ipv6 --subnet="2001:db8:1::/64" --gateway="2001:db8:1::1" mynetv6
```

2. Now create a `docker-compose.yml` file that will use this network:

```yaml
services:
  app:
    image: alpine:latest
    command: ping6 -c 4 2001:db8:1::1
    networks:
      - mynetv6
networks:
  mynetv6:
    external: true
```

3. Run Compose:

```bash
docker compose up
```

### Example 2: Creating the Network and Container via Docker Compose

Another approach is to manage the network entirely through Compose:

```yaml
services:
  app:
    image: alpine:latest
    command: ping6 -c 4 2001:db8:a::1
    networks:
      - custom_net
networks:
  custom_net:
    enable_ipv6: true
    ipam:
      config:
        - subnet: 2001:db8:a::/64
          gateway: 2001:db8:a::1
```

Run:

```bash
docker compose up
```

This file will create a new IPv6-enabled network and launch the container.

---

## Conclusion

IPv6 is becoming an increasingly important component of modern network infrastructure. Now you know how to enable IPv6 support in Docker and Docker Compose, allowing you to create scalable and modern infrastructure for your applications. Regularly test your network settings to ensure that your containers are functioning correctly with IPv6.