---
title: Запуск Cloudflare Tunnel на сервере
description: Подробное руководство по установке и настройке Cloudflare Tunnel (ранее Argo Tunnel) для защиты вашего сервера.
tags:
  - cloudflare
  - туннель
  - сервер
  - безопасность
series: server-guides
draft: false
pubDate: 09 11 2024
---

## Введение

Cloudflare Tunnel (ранее Argo Tunnel) — это мощный инструмент для создания безопасного подключения между вашим сервером и Cloudflare, без необходимости открывать публичные порты. В этом руководстве описаны шаги по установке и настройке Cloudflare Tunnel на различных операционных системах.

## Шаги по настройке

### 1. Установка Cloudflare Tunnel (Cloudflared)

Для начала необходимо установить `cloudflared` на ваш сервер. В зависимости от используемой операционной системы, выполните следующие команды:

**Для Ubuntu/Debian:**

```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

**Для CentOS/RHEL:**

```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.rpm
sudo rpm -ivh cloudflared-linux-amd64.rpm
```

**Для macOS:**

```bash
brew install cloudflare/cloudflare/cloudflared
```

### 2. Авторизация в Cloudflare

Для настройки туннеля вам необходимо войти в ваш аккаунт Cloudflare. Выполните следующую команду для авторизации:

```bash
cloudflared login
```

Эта команда откроет браузер, где вы сможете войти в ваш аккаунт Cloudflare. После успешной авторизации файл конфигурации с токеном будет создан автоматически.

### 3. Создание туннеля

После авторизации вы можете создать туннель:

```bash
cloudflared tunnel create <имя_туннеля>
```

Это создаст уникальный туннель с указанным вами именем. Сохраните идентификатор туннеля — он понадобится вам позже.

### 4. Настройка DNS

Теперь вам нужно настроить DNS-запись для связывания вашего домена с туннелем:

```bash
cloudflared tunnel route dns <имя_туннеля> example.com
```

Замените `example.com` на ваш реальный домен.

### 5. Запуск туннеля

После настройки DNS можно запустить туннель командой:

```bash
cloudflared tunnel run <имя_туннеля>
```

### 6. Автоматизация запуска туннеля

Чтобы обеспечить автоматический запуск туннеля при старте системы, настройте systemd-сервис.

Создайте файл для systemd:

```bash
sudo nano /etc/systemd/system/cloudflared.service
```

Добавьте в файл следующий код:

```ini
[Unit]
Description=cloudflared
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/cloudflared tunnel run <имя_туннеля>
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Сохраните файл и закройте редактор.

Активируйте и запустите сервис:

```bash
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

## Заключение

Теперь ваш Cloudflare Tunnel автоматически запускается при включении сервера, защищая его от внешних угроз. Это отличный способ улучшить безопасность вашего сервера, используя преимущества инфраструктуры Cloudflare.