---
title: Настройка WireGuard через Wgcf без warp-cli
description: Подробное руководство по настройке WireGuard с помощью Wgcf вместо warp-cli. Подходит для VPS, нод, прокси и маршрутизации трафика через Cloudflare WARP.
tags:
  - wireguard
  - cloudflare
  - remnawave
  - marzban
  - remnanode
  - wgcf
  - xray
  - proxy
series: remnanode
draft: false
pubDate: 05 21 2025
---

# Настройка WireGuard через Wgcf без warp-cli

Всем привет!

Я не очень люблю использовать `warp-cli` в режиме socks, поэтому стараюсь всегда использовать подключение через **WireGuard**.

У этого есть один главный плюс:  
> Не нужно устанавливать `warp-cli` на все ноды.

Давайте начнём!

## 1. Скачиваем Wgcf

Перейдите в репозиторий: [Releases · ViRb3/wgcf (GitHub)](https://github.com/ViRb3/wgcf/releases)

Выберите версию, подходящую вашей системе. Например, для `amd64`:

```bash
wget https://github.com/ViRb3/wgcf/releases/download/v2.2.26/wgcf_2.2.26_linux_amd64
```

## 2. Перемещаем файл в системную директорию

Переименуйте и переместите файл в `/usr/bin/`:

```bash
mv wgcf_2.2.26_linux_amd64 /usr/bin/wgcf
```

## 3. Разрешаем исполнение файла

Сделайте файл исполняемым:

```bash
chmod +x /usr/bin/wgcf
```

## 4. Регистрируемся и создаём конфигурационный файл

Выполните команду регистрации:

```bash
wgcf register
```

Эта команда создаёт файл `wgcf-account.toml`.

Затем создайте конфигурацию WireGuard:

```bash
wgcf generate
```

Теперь в текущей папке должен появиться файл `wgcf-profile.conf`.

## 5. Изучаем содержимое конфигурации

Посмотрим содержимое файла:

```bash
cat wgcf-profile.conf
```

Нас интересуют две строки:
- `PrivateKey`
- `PublicKey`

Они понадобятся при настройке маршрутизации в XRAY.

## 6. Настраиваем маршрутизацию в ядре XRAY

Добавьте новый outbound в конфигурацию XRAY:

```json
{
  "tag": "warp",
  "protocol": "wireguard",
  "settings": {
    "secretKey": "ЗНАЧЕНИЕ ИЗ PRIVATE_KEY ФАЙЛА wgcf-profile.conf",
    "DNS": "1.1.1.1",
    "kernelMode": false,
    "address": ["172.16.0.2/32"],
    "peers": [
      {
        "publicKey": "ЗНАЧЕНИЕ ИЗ PUBLIC_KEY ФАЙЛА wgcf-profile.conf",
        "endpoint": "engage.cloudflareclient.com:2408"
      }
    ]
  }
}
```

Подставьте свои значения из `wgcf-profile.conf`.

## 7. Пример готового блока `outbounds`

```json
"outbounds": [
  {
    "tag": "DIRECT",
    "protocol": "freedom",
    "settings": {
      "domainStrategy": "ForceIPv4"
    }
  },
  {
    "tag": "warp",
    "protocol": "wireguard",
    "settings": {
      "DNS": "1.1.1.1",
      "peers": [
        {
          "endpoint": "engage.cloudflareclient.com:2408",
          "publicKey": "bm00000000000000000Vo510h2wPfgyo="
        }
      ],
      "address": ["172.16.0.2/32"],
      "secretKey": "MISEK000000000000000000vim6zWY=",
      "kernelMode": false
    }
  },
  {
    "tag": "BLOCK",
    "protocol": "blackhole"
  },
  {
    "tag": "IPv4",
    "protocol": "freedom",
    "settings": {
      "domainStrategy": "ForceIPv4"
    }
  }
]
```

## 8. Добавляем `outboundTag` в раздел routing

Чтобы направить трафик определённых доменов через WARP, добавьте следующее правило:

```json
{
  "outboundTag": "warp",
  "domain": [
    "geosite:google-gemini",
    "openai.com",
    "ai.com",
    "ipinfo.io",
    "iplocation.net",
    "spotify.com",
    "canva.com"
  ],
  "type": "field"
}
```

## Итоговый вид в интерфейсе

Итоговый вид этого блока будет примерно таким:

![Пример конфигурации XRAY](https://openode.xyz/uploads/monthly_2025_05/image.png.93b56aab8af6f30d7b0ba327c3c2e533.png)

---

## Заключение

Настройка WireGuard через Wgcf — удобный и масштабируемый способ подключения к Cloudflare WARP без установки `warp-cli`. Это особенно актуально при работе с прокси-серверами, VPS и микросервисами.

Если вы используете XRAY или другой прокси-движок — такой метод отлично подойдёт для маршрутизации части трафика через защищённое соединение.

> ⚠️ **Совет:** Не публикуйте свой `PrivateKey` в открытых репозиториях или чатах — это может привести к компрометации вашего подключения.

---

## Полезные ссылки

- [Wgcf GitHub Releases](https://github.com/ViRb3/wgcf/releases)
- [Telegram канал NeoNode.cc](https://t.me/neonode_cc)
- [Telegram сообщество NeoNode](https://t.me/+cFdHT8DiMUA2MWVi)

