---
title: Cloudflare Tunnel с Docker Compose: безопасный доступ к контейнерам без открытых портов
description: Как настроить Cloudflare Tunnel с помощью Docker Compose и обеспечить защищённый HTTPS-доступ к вашим контейнерам без проброса портов.
tags:
  - cloudflare
  - docker
  - обратный прокси
  - туннель
  - безопасность
series: server-guides
draft: false
pubDate: 09 11 2024
---

## Введение

Cloudflare Tunnel позволяет надёжно публиковать ваши локальные сервисы в интернете, **не открывая порты** и не обрабатывая HTTPS вручную. В этом гайде вы научитесь настраивать туннель **в связке с Docker Compose**, чтобы автоматически проксировать доступ к нужным контейнерам, как будто это обычный публичный сайт.

## Зачем это нужно

- Нет белого IP — и не надо.
- Никакого проброса портов на роутере или в фаерволе.
- Cloudflare даёт HTTPS, WAF, защиту от DDoS и ботов.
- Всё можно запускать в контейнерах — без лишней настройки nginx, certbot и прочего.

## Пример: публикуем веб-приложение через туннель

Допустим, у нас есть контейнер `my-app`, который работает на `http://my-app:3000`. Мы хотим, чтобы он был доступен по `https://app.example.com`.

## Шаг 1. Подготовка Cloudflare

1. Зарегистрируйтесь и добавьте домен в Cloudflare.
2. Установите `cloudflared` локально и выполните авторизацию:

    ```bash
    cloudflared login
    ```

3. Создайте туннель:

    ```bash
    cloudflared tunnel create my-tunnel
    ```

4. Привяжите DNS:

    ```bash
    cloudflared tunnel route dns my-tunnel app.example.com
    ```

5. Скопируйте `.json`-файл с credentials (обычно находится в `~/.cloudflared/`) в директорию проекта, например, `./cloudflared`.

## Шаг 2. Структура проекта

````

project/
├── docker-compose.yml
├── cloudflared/
│   ├── config.yml
│   └── <тут ваш tunnel-id>.json

````

## Шаг 3. `config.yml` — конфиг туннеля

```yaml
tunnel: my-tunnel
credentials-file: /etc/cloudflared/<тут ваш tunnel-id>.json

ingress:
  - hostname: app.example.com
    service: http://my-app:3000
  - service: http_status:404
````

## Шаг 4. `docker-compose.yml`

```yaml
version: '3.8'

services:
  my-app:
    image: your-image
    container_name: my-app
    expose:
      - 3000
    networks:
      - app-network

  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    restart: always
    command: tunnel --config /etc/cloudflared/config.yml run
    volumes:
      - ./cloudflared:/etc/cloudflared
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## Шаг 5. Запуск

```bash
docker compose up -d
```

Теперь при переходе на `https://app.example.com` вы попадёте в ваш контейнер `my-app`, **не открывая портов наружу**.

## Заключение

Использование Cloudflare Tunnel в связке с Docker Compose позволяет:

* Упростить публикацию сервисов.
* Убрать необходимость ручной настройки HTTPS.
* Увеличить безопасность без танцев с `iptables` и nginx.

Всё работает в контейнерах — прозрачно и без магии. Отличный способ проксировать административки, панели или API, которые не хочется выставлять напрямую.

```
