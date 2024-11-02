---
title: IPv6 Configuration for 3x-ui in Docker with Bridge Network
description: Step-by-step guide to configuring IPv6 for 3x-ui in a Docker container with a bridge network, along with a Docker Compose example for using both IPv6 and IPv4 simultaneously.
tags:
  - docker
  - ipv6
  - 3x-ui
  - network
series: docker-guides
draft: false
hide: true
pubDate: 09 11 2024
---

## Introduction

When I started using 3x-ui in Docker, I encountered an issue with configuring IPv6 in a bridge network. By default, Docker doesn’t support IPv6 in bridge networks, although it works fine in host mode. To overcome this limitation and enable IPv6 capabilities in bridge networks, I created this guide.

## Setup Steps

### 1. Enabling IPv6 Support in Docker

First, you need to enable IPv6 support in Docker. To do this, edit the Docker configuration. Open or create the `/etc/docker/daemon.json` file and add the following parameters:

```json
{
  "ipv6": true,
  "fixed-cidr-v6": "2001:db8:1::/64"
}
```

This block enables IPv6 and sets a fixed subnet for containers. You can specify a different IPv6 address range instead of `2001:db8:1::/64` if you have other requirements.

### 2. Restart Docker

To apply the changes, restart the Docker service:

```bash
sudo systemctl restart docker
```

### 3. Creating a Bridge Network with IPv6 Support

The next step is to create a new network with IPv6 support. I like to name networks clearly to indicate their purpose. For example:

```bash
docker network create --ipv6 --subnet "2001:db8:1::/64" my-ipv6-network
```

Replace `2001:db8:1::/64` with your range if you’re using a different one. This will integrate your containers into your network infrastructure.

### 4. Running the Container with the New Network

Now you can launch the 3x-ui container, connecting it to the IPv6-enabled bridge network:

```bash
docker run --network my-ipv6-network -d your-container-image
```

Your container will automatically be set up to receive an IPv6 address and handle traffic through IPv6.

---

## Example Docker Compose File for IPv6 and IPv4

Below is an example `docker-compose.yml` file that enables both IPv6 and IPv4 for the 3x-ui container. Instead of using `network_mode: host`, we create a custom network supporting both protocols:

```yaml
version: "3.9"
services:
  3x-ui:
    image: ghcr.io/mhsanaei/3x-ui:latest
    container_name: 3x-ui
    hostname: yourhostname
    volumes:
      - $PWD/db/:/etc/x-ui/
      - $PWD/cert/:/root/cert/
    environment:
      XRAY_VMESS_AEAD_FORCED: "false"
    tty: true
    networks:
      - my-ipv6-network
    restart: unless-stopped

networks:
  my-ipv6-network:
    driver: bridge
    enable_ipv6: true
    ipam:
      driver: default
      config:
        - subnet: "2001:db8:1::/64"  # IPv6 subnet
        - subnet: "192.168.1.0/24"   # IPv4 subnet
```

### Explanation
- This file creates a 3x-ui container that will use a network supporting both IPv4 and IPv6.
- Two subnets are defined: `2001:db8:1::/64` for IPv6 and `192.168.1.0/24` for IPv4.
- The container will automatically obtain both IPv4 and IPv6 addresses.

---

## Conclusion

Now, your 3x-ui container in Docker operates with both IPv6 and IPv4 support in a bridge network. Configuring IPv6 and adding dual-protocol support through Docker Compose makes the infrastructure more flexible and ready for future demands. If you have questions or run into issues, consult Docker documentation or leave a comment. Setting up a dual-protocol network is a step towards a more universal infrastructure.