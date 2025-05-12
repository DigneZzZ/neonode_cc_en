---
title: "Анонимный VLESS+TCP+REALITY через TOR в Marzban: настройка прокси-сервера с SOCKS5"
description: "Подробное руководство по настройке анонимного прокси-сервера на базе Marzban, XRay и TOR с использованием VLESS+REALITY и маршрутизации через SOCKS5 для доступа к .onion-ресурсам и сокрытия IP-адреса."
tags:
  - vless
  - tor
  - marzban
  - xray
  - анонимность
  - socks5
  - прокси
  - .onion
  - vpn
  - безопасность
pubDate: 05 11 2025
---

# Как настроить анонимный VLESS+TCP+REALITY через TOR в Marzban

В этом руководстве мы создадим анонимный прокси-сервер с помощью **Marzban**, **XRay** и **TOR**. Настройка позволит скрывать IP-адрес, направлять трафик через SOCKS5-прокси и открывать доступ к сайтам из сети .onion. Идеально для создания **безопасного VPN**, обхода блокировок и обеспечения приватности.

```bash

+----------+        +--------+--------+
\| \*ray     |        | \*ray   | Tor    |
\| Client   +------->+ Server + Client +------> TOR
\|          |        |        |        |
+----------+        +--------+--------+

```

---

## 🔐 Преимущества

### Анонимизация трафика через TOR
Весь исходящий трафик будет маршрутизироваться через сеть **TOR**, что позволяет **скрыть IP-адрес** сервера.

### Доступ к .onion-сайтам
TOR открывает доступ к закрытым ресурсам в сети **.onion**, которых нет в обычной сети.

### Приватность и обход цензуры
Применяя **VLESS TCP + Reality + TOR**, вы получаете **анонимный VPN с SOCKS5-маршрутизацией**, который обходит блокировки и повышает конфиденциальность.

---

## 🚀 Установка TOR-прокси (SOCKS5) на сервер

```bash
apt update
apt install tor -y
```

TOR автоматически запускается и слушает на порту `9050`.

Проверьте работоспособность:

```bash
apt install curl -y
curl --socks5-hostname 127.0.0.1:9050 https://check.torproject.org
```

Ожидаемый результат:

```text
Congratulations. This browser is configured to use Tor.
```

---

## ⚙️ Настройка XRay и маршрутизация трафика через TOR

Создайте конфигурацию XRay с **входом VLESS REALITY** и **выходом через socks5-прокси TOR**.

```json
{
  "log": { "loglevel": "warning" },
  "routing": {
    "rules": [
      {
        "ip": ["geoip:private"],
        "outboundTag": "BLOCK",
        "type": "field"
      },
      {
        "type": "field",
        "domain": ["geosite:category-ads-all"],
        "outboundTag": "tor-out"
      }
    ]
  },
  "inbounds": [
    {
      "tag": "VLESS+TCP+REALITY+8443",
      "listen": "0.0.0.0",
      "port": 8443,
      "protocol": "vless",
      "settings": {
        "clients": [],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "tcpSettings": { "header": { "type": "none" } },
        "realitySettings": {
          "show": false,
          "dest": "cloudflare.com:443",
          "xver": 0,
          "serverNames": ["cloudflare.com", "www.cloudflare.com"],
          "privateKey": "<your_private_key>",
          "publicKey": "<your_public_key>",
          "shortIds": ["<your_short_id>"],
          "spiderX": "/",
          "fingerprint": "chrome"
        }
      },
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      }
    }
  ],
  "outbounds": [
    {
      "tag": "tor-out",
      "protocol": "socks",
      "settings": {
        "servers": [
          { "address": "127.0.0.1", "port": 9050 }
        ]
      }
    },
    { "protocol": "freedom", "tag": "DIRECT" },
    { "protocol": "blackhole", "tag": "BLOCK" }
  ]
}
```

---

## 🔑 Генерация ключей для Reality (x25519)

Откройте контейнер Marzban и выполните генерацию:

```bash
docker ps
docker exec -it marzban-backend bash
xray x25519
exit
```

Альтернатива:

```bash
docker exec marzban-backend xray x25519
```

---

## 🔁 Генерация shortId

```bash
head /dev/urandom | tr -dc 'a-f0-9' | head -c 16
# или
openssl rand -hex 8
```

---

## 🕸 Подбор SNI для маскировки

Не используйте публичные домены вроде `cloudflare.com`. Используйте свой домен или найдите подходящие SNI через [RealiTLScanner](https://github.com/XTLS/RealiTLScanner).

---

## ✅ Заключение

Теперь у вас настроен **анонимный прокси-сервер на Linux**, основанный на **VLESS TCP REALITY + TOR**. Он обеспечивает:

* Скрытие IP-адреса и обход цензуры
* Безопасный доступ к сети .onion
* SOCKS5-маршрутизацию для чувствительного трафика

Обновляйте ядро **XRay**, следите за стабильностью **TOR** и пользуйтесь безопасно!

---

Идеально подходит для тех, кто хочет запустить **личный анонимный VPN**, скрыть присутствие в сети и обеспечить приватность трафика.
