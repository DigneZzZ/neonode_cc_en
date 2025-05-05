---

title: "Настройка безопасного Cloudflare Tunnel для Remnawave VPN через Docker Compose (без проброса портов)"
description: "Пошаговая инструкция по безопасному развёртыванию панели управления Remnawave VPN и страницы подписки через Docker Compose и Cloudflare Tunnel — с HTTPS, без nginx и открытых портов."
tags:
  - cloudflare
  - remnawave
  - remnawave panel
  - cloudflare tunnel
  - Remnawave VPN
  - No port forwarding
  - docker
  - reverse proxy
  - tunnel
  - security
series: remnawave-guides
Draft: false
pubDate: 05 05 2025

---

## Как настроить Cloudflare Tunnel для панели Remnawave VPN через Docker Compose?

Вы можете развернуть панель управления Remnawave VPN и страницу подписки с помощью Docker Compose за защищённым Cloudflare Tunnel. Этот подход исключает необходимость проброса портов, настройки nginx или ручного получения HTTPS — идеально подходит для продакшн-сред или домашних серверов без публичного IP.

---

## Что такое Remnawave Panel?

[Remnawave Panel](https://remna.st) — это современная система управления VPN и прокси на базе XRay, с акцентом на автоматизацию, гибкость и поддержку Telegram-бота. Включает:

* Удобную административную панель
* Telegram-бота для уведомлений
* Активную разработку и обновления
* PostgreSQL как основную базу данных
* Интеграции через OpenAPI 3.0
* Поддержку независимых нод (в отличие от Marzban)
* Эстетичную страницу подписки

---

## Преимущества использования Cloudflare Tunnel для VPN через Docker

* Нет публичного IP? Не проблема.
* Не нужен проброс портов в роутере или фаерволе.
* Cloudflare предоставляет HTTPS, WAF, защиту от DDoS и ботов.
* Всё работает в контейнерах — без nginx, certbot и прочих лишних зависимостей.

С помощью Cloudflare Tunnel можно безопасно опубликовать локальные **панели управления VPN**, страницы подписки и любые другие Docker-приложения. Это особенно полезно при размещении **самостоятельного VPN-сервиса** без публичного IP или при желании скрыть сервер за **HTTPS и WAF от Cloudflare**.

> ⚠️ В некоторых регионах (например, в России) доступ к Cloudflare может быть ограничен.

---

## Как запустить VPN-панель без проброса портов

Настроим туннель для:

* **Панели Remnawave** (`remnawave:3000`) → `https://panel.example.com`
* **Страницы подписки** (`remnawave-subscription-page:3010`) → `https://sub.example.com`

---

## Шаг 1. Создание туннеля

Устанавливаем `cloudflared` на сервер:

```bash
curl -fsSL https://developers.cloudflare.com/cloudflare-one/static/downloads/cloudflared-install.sh | bash
```

Авторизуемся и создаём туннель:

```bash
cloudflared login
cloudflared tunnel create remnawave-tunnel
```

Скопируйте JSON-файл из `~/.cloudflared/remnawave-tunnel.json` в каталог проекта, например, `./cloudflared/`.

---

## Шаг 2. Настройка DNS

Создаём маршруты для поддоменов:

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

Файл config.yml определяет параметры работы туннеля Cloudflare. Вот пример с пояснениями:
```yaml
tunnel: remnawave-tunnel # имя туннеля, которое вы задали при создании
credentials-file: /etc/cloudflared/remnawave-tunnel.json # путь к JSON-файлу авторизации

ingress:
  - hostname: panel.example.com # поддомен, через который будет доступна панель
    service: http://remnawave:3000 # локальный адрес панели внутри Docker-сети

  - hostname: sub.example.com # поддомен для страницы подписки
    service: http://remnawave-subscription-page:3010 # локальный адрес сервиса подписки

  - service: http_status:404 # заглушка на все остальные неописанные маршруты
```

Обязательно укажите реальные поддомены, настроенные в зоне Cloudflare, и убедитесь, что контейнеры находятся в одной Docker-сети, иначе туннель не сможет их достичь.

---

## Шаг 5. `docker-compose.yml`

Используем файл `docker-compose.yml` из официального репозитория с добавлением сервиса страницы подписки:

```yaml
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

## Полный запуск через Docker и Cloudflare Tunnel

```bash
docker compose up -d
```

Проверка:

* `https://panel.example.com` — откроется панель управления
* `https://sub.example.com` — откроется страница подписки

Полная установка Remnawave опущена — акцент на **Cloudflare Tunnel**.

---

## 🔐 Защита панели Remnawave через Cloudflare Access

Если вы хотите добавить дополнительный уровень авторизации для доступа к панели Remnawave или странице подписки, не прибегая к nginx или собственным механизмам аутентификации, используйте **Cloudflare Access** — компонент Cloudflare Zero Trust.

### Что даёт Cloudflare Access:

* Доступ только для авторизованных пользователей (Google, GitHub, e-mail и т.д.)
* Многофакторная аутентификация
* Политики доступа по e-mail, IP-адресу, группе, стране и т.п.
* Журнал событий и попыток входа
* Работает *до* попадания запроса на ваш сервер

---

### Как включить авторизацию через Cloudflare Access

1. **Откройте панель Cloudflare Zero Trust**:
   [https://one.cloudflare.com](https://one.cloudflare.com)

2. Перейдите в **Access > Applications** и нажмите **+ Add an application**.

3. Выберите тип: **Self-hosted**.

4. Заполните поля:

   * **Application Name**: `Remnawave Panel`
   * **Subdomain**: `panel.example.com`
   * **Session duration**: например, 8 часов

5. Создайте политику доступа:

   * **Rule name**: `Allow company users`
   * **Include** → Emails ending with `@example.com` *(или любой другой фильтр)*

6. Сохраните и активируйте приложение.

Теперь любой запрос к `https://panel.example.com` будет сначала проверяться Cloudflare — и только после прохождения авторизации перенаправляться в ваш туннель.

---

💡 **Важно**: для работы Access необходимо, чтобы ваш домен использовал **Cloudflare Nameservers** и был активен в панели Cloudflare.

---


## Доступ к панели VPN через HTTPS без открытых портов

Посетите мой форум [**Openode Club**](https://openode.xyz) — десятки практических гайдов по настройке Remnawave, Cloudflare, Docker, Telegram-ботов, автоматизации и монетизации VPN.

Часть материалов бесплатна, но **подробные инструкции доступны по подписке**:

* Скрипты установки Remnawave
* Telegram-боты и интеграции
* Инструкции по панели SHM
* Гайды по настройке Marzban
* Рекомендации по защите VPS

🔐 **Подпишитесь, чтобы получить доступ к премиум-контенту — [перейти к подписке](https://openode.xyz/subscriptions/)**

---

## Заключение

Cloudflare Tunnel — надёжный способ опубликовать локальные сервисы, такие как **панель управления Remnawave VPN**, в интернет с полной поддержкой **HTTPS**, **без открытых портов** и через **reverse proxy в Docker Compose**.

Подходит как для продакшна, так и для домашней лаборатории. Вы получаете простую и безопасную схему запуска из коробки.

👉 Ищете полные скрипты установки и автоматизации VPN? Вступайте в [Openode Club](https://openode.xyz) и получите доступ ко всем гайдам и утилитам.

---

## VPS за 10\$ + 100\$ кредита — альтернатива Kamatera

Ищете **дешёвый VPS для VPN**, прокси, CI/CD или Docker?
Попробуйте **VPSserver** — ребрендинг Kamatera, дающий **\$100 бесплатного кредита на месяц** при пополнении счёта всего на \$10.

🌍 Более 20 локаций: США, Германия, Франция, Нидерланды, Великобритания, Япония и др.
🔐 Без верификации, лояльны к РФ — подходит под **VPN**, **Docker-панели**, **облачные лаборатории**, **тестовые стенды**.

🎯 Отличный выбор, если вы ищете:

* VPS для туннелей и Cloudflare Tunnel
* Сервер под Marzban, SHM, Remnawave
* Надёжный хостинг для микросервисов

👉 **[Получить VPS с бонусом \$100](https://go.cloudwm.com/visit/?bta=36601&brand=vpsserver)** — пока РКН не в курсе.

