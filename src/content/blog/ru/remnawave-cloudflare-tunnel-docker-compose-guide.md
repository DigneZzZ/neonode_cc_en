---
title: "Remnawave и Cloudflare Tunnel с Docker Compose: безопасный доступ к контейнерам без открытых портов"
description: "Как настроить Cloudflare Tunnel с помощью Docker Compose и обеспечить защищённый HTTPS-доступ к вашим контейнерам без проброса портов. Разбираем на примере панели Remnawave и страницы подписки."
tags:
  - cloudflare
  - remnawave
  - remnawave panel
  - cloudflare tunnel
  - docker
  - обратный прокси
  - туннель
  - безопасность
series: remnawave-guides
draft: false
pubDate: 05 05 2025
---

## Введение

Cloudflare Tunnel позволяет надёжно публиковать ваши локальные сервисы в интернете, **не открывая порты** и не обрабатывая HTTPS вручную. В этом гайде мы сделаем настройка CF Tunnel **в связке с Docker Compose RemnaWave панеди**, чтобы автоматически проксировать доступ к нужным контейнерам, как будто это обычный публичный сайт.

---

## Что такое Remnawave Panel?

[Remnawave Panel](https://remna.st) — это современная система управления VPN и прокси на базе XRay, разработанная с упором на гибкость, автоматизацию и поддержку Telegram-ботов. Она включает:

- Удобную панель администратора
- Telegram-бот для уведомлений
- Активную и стабильную разработку
- Разработку на правильной архитектуре и с БД PostgresDB
- OpenAPI 3.0 и интеграцию с чем угодно
- Независимые ноды (в отличии от Marzban)
- Красивую страницу оформления подписки

---

## Зачем нужно использовать CF Tunnel?

- Нет белого IP — и не надо.
- Никакого проброса портов на роутере или в фаерволе.
- Cloudflare даёт HTTPS, WAF, защиту от DDoS и ботов.
- Всё можно запускать в контейнерах — без лишней настройки nginx, certbot и прочего.

Из минусов стоит отметить, что CF Tunnel подразумевает и автоматическое проксирование запросов, которое в РФ могут быть не доступны (или заблокированы на глобальном уровне)

---

## Цель

Настроим доступ через Cloudflare Tunnel к:

- **панели Remnawave** (`remnawave:3000`) → `https://panel.example.com`
- **странице подписки** (`remnawave-subscription-page:3010`) → `https://sub.example.com`

---

## Шаг 1. Создание туннеля

Установи cloudflared на сервер:

```bash
curl -fsSL https://developers.cloudflare.com/cloudflare-one/static/downloads/cloudflared-install.sh | bash
````

Авторизуйся и создай туннель:

```bash
cloudflared login
cloudflared tunnel create remnawave-tunnel
```

Скопируй JSON-файл из `~/.cloudflared/remnawave-tunnel.json` в проект (например, в `./cloudflared/`).

---

## Шаг 2. Настрой DNS

Создай маршруты DNS для поддоменов:

```bash
cloudflared tunnel route dns remnawave-tunnel panel.example.com
cloudflared tunnel route dns remnawave-tunnel sub.example.com
```

---

## Шаг 3. Структура проекта

```yaml
project/
├── docker-compose.yml
├── .env
└── cloudflared/
    ├── remnawave-tunnel.json
    └── config.yml
```

---

## Шаг 4. `config.yml` — конфигурация туннеля

```yaml
tunnel: remnawave-tunnel
credentials-file: /etc/cloudflared/remnawave-tunnel.json

ingress:
  - hostname: panel.example.com
    service: http://remnawave:3000
  - hostname: sub.example.com
    service: http://remnawave-subscription-page:3010
  - service: http_status:404
```

---

## Шаг 5. `docker-compose.yml`

Для запуска панели возьмем docker-compose.yml из официального репозитория (добавив в него и сервис страницы подписки)

```yaml
version: '3.8'

services:
  remnawave-db:
    image: postgres:17
    container_name: remnawave-db
    hostname: remnawave-db
    restart: always
    env_file:
      - .env
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
      - TZ=UTC
    ports:
      - '127.0.0.1:6767:5432'
    volumes:
      - remnawave-db-data:/var/lib/postgresql/data
    networks:
      - remnawave-network
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}']
      interval: 3s
      timeout: 10s
      retries: 3

  remnawave:
    image: remnawave/backend:latest
    container_name: remnawave
    hostname: remnawave
    restart: always
    ports:
      - '127.0.0.1:3000:3000'
    env_file:
      - .env
    networks:
      - remnawave-network
    depends_on:
      remnawave-db:
        condition: service_healthy
      remnawave-redis:
        condition: service_healthy

  remnawave-subscription-page:
    image: remnawave/subscription-page:latest
    container_name: remnawave-subscription-page
    hostname: remnawave-subscription-page
    restart: always
    environment:
      - REMNAWAVE_PLAIN_DOMAIN=panel.com
      - SUBSCRIPTION_PAGE_PORT=3010
      - META_TITLE="Subscription Page Title"
      - META_DESCRIPTION="Subscription Page Description"
    ports:
      - '127.0.0.1:3010:3010'
    networks:
      - remnawave-network

  remnawave-redis:
    image: valkey/valkey:8.0.2-alpine
    container_name: remnawave-redis
    hostname: remnawave-redis
    restart: always
    networks:
      - remnawave-network
    volumes:
      - remnawave-redis-data:/data
    healthcheck:
      test: ['CMD', 'valkey-cli', 'ping']
      interval: 3s
      timeout: 10s
      retries: 3

  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    restart: always
    command: tunnel --config /etc/cloudflared/config.yml run
    volumes:
      - ./cloudflared:/etc/cloudflared
    networks:
      - remnawave-network

networks:
  remnawave-network:
    name: remnawave-network
    driver: bridge

volumes:
  remnawave-db-data:
    driver: local
    name: remnawave-db-data
  remnawave-redis-data:
    driver: local
    name: remnawave-redis-data
```

---

## Шаг 6. Запуск

```bash
docker compose up -d
```

Проверь:

* `https://panel.example.com` — открывает панель
* `https://sub.example.com` — открывает страницу подписки

Я умышленно не стал расписывать всю инструкцию по настройки панели, чтобы была возможность подсветить использование именно CF Tunnel.

---

## Где найти больше инструкций?

На моём форуме [**Openode Club**](https://openode.xyz) вы найдёте десятки практических гайдов по установке и настройке Remnawave, Cloudflare, Docker, Telegram-ботов, автоматизации и монетизации VPN.

Часть материалов доступна бесплатно, но самые подробные руководства находятся в **закрытом клубе по подписке**. Там собраны:

* Скрипты установки Remnawave
* Telegram-боты и интеграции
* Инструкции по SHM панеле
* Инструкции по Marzban (кому это актуально)
* Гайды по настройке безопасного VPS

🔐 **Клубы доступны по подписке — [купить подписку можно здесь](https://openode.xyz/subscriptions/)**

---

## Заключение

Теперь ваши контейнеры работают через безопасный туннель, защищены Cloudflare и доступны по HTTPS — **без проброса портов и риска для сервера**. Это удобно, просто и гибко. Подходит как для локальных проектов, так и для продакшн-окружений.

---
