---
title: "Автоматическое резервное копирование данных с использованием Rclone и Cloudflare R2"
description: "Как я автоматизировал резервное копирование моего сервера с помощью Rclone и Cloudflare R2."
tags:
  - Rclone
  - Cloudflare R2
  - Backup
  - Bash
  - Crontab
series: server-tools
draft: false
pubDate: 09 12 2024
---

## Введение

Как любой человек, который следит за стабильностью и безопасностью своих серверов, я пришел к необходимости автоматизировать резервное копирование. Это не просто удобство, это важная часть администрирования. В этой статье я покажу, как именно я настроил автоматическое резервное копирование данных моего основного сервера с помощью Rclone и Cloudflare R2. Поделюсь своим скриптом, который архивирует данные, загружает их на Cloudflare R2 и отправляет уведомления в Telegram. Конечно, все это работает автоматически каждые 4 часа с помощью crontab.

## Что такое Rclone?

Rclone – это мощный инструмент, который я давно использую для работы с облачными хранилищами. Он поддерживает огромное количество сервисов, включая Cloudflare R2, которым я и решил воспользоваться. Rclone идеально подходит для автоматизации процессов резервного копирования и синхронизации файлов.

### Основные функции Rclone:

- **Synchronization** – синхронизация данных между локальными и облачными хранилищами.
- **Copy** – копирование файлов между папками.
- **Шифрование** – защита данных.
- **Automator** – автоматизация задач с crontab.
- Поддержка множества провайдеров, включая Cloudflare R2.

## Почему я выбрал Cloudflare R2?

Cloudflare R2 – это просто находка! Он предлагает стабильную и быструю работу, при этом не взимает платы за исходящий трафик. Плюс, у меня уже был аккаунт на Cloudflare, так что это было удобным решением для резервного копирования больших объемов данных с минимальными затратами.

### Преимущества Cloudflare R2:

- **Низкие затраты**: отсутствие платы за исходящий трафик.
- **Высокая производительность**: быстрый доступ к данным через сеть Cloudflare.
- **Совместимость с S3**: легко интегрируется с Rclone.

## Настройка Cloudflare R2

Первый шаг был прост – завести аккаунт на Cloudflare. Но, как и многие другие пользователи из России, я столкнулся с проблемой: Cloudflare не принимает карты РФ. Однако решение нашлось быстро – воспользовался сервисом Cashinout. Карта подошла, верификация прошла успешно, и я настроил Cloudflare R2 без проблем.

![Cloudflare R2](https://openode.xyz/uploads/monthly_2024_05/image.png.d33a9c2aaac69e7c14ae73a220b204c1.png)

## Установка и настройка Rclone

Теперь, когда с Cloudflare R2 разобрались, перехожу к Rclone. Весь процесс делается на моем сервере, где я уже установил Rclone. Вот что нужно сделать:

### Шаг 1: Установка Rclone

```bash
curl https://rclone.org/install.sh | sudo bash
```

### Шаг 2: Настройка Rclone

Конфигурация Rclone делается через команду:

```bash
rclone config
```

### Шаг 3: Настройка подключения к R2

В процессе настройки я выбрал хранилище `s3`, указал ключи доступа Cloudflare и настроил endpoint.

![Rclone Setup](https://openode.xyz/uploads/monthly_2024_05/image.png.63153573fb808842bd0a0f633034146f.png)

- Название подключения: `s3cf`
- Тип хранилища: `s3`
- AWS Access Key ID: `YOUR_CLOUDFLARE_ACCESS_KEY`
- AWS Secret Access Key: `YOUR_CLOUDFLARE_SECRET_KEY`
- Endpoint: `https://<account-id>.r2.cloudflarestorage.com`

![Rclone Config](https://openode.xyz/uploads/monthly_2024_05/image.png.0a052fef3da53cef90e1d712b21aec5d.png)

### Шаг 4: Проверка подключения

После настройки я всегда проверяю, что все работает корректно:

```bash
rclone ls s3cf:openode
```

## Автоматизация с помощью bash-скрипта

Теперь самое интересное. Написал скрипт, который автоматизирует процесс резервного копирования.

### Шаг 1: Создаем скрипт

Создаем файл скрипта:

```bash
nano /root/backup_script.sh
```

### Шаг 2: Добавляем код

Вот код моего скрипта:

```bash
#!/bin/bash

# Переменные для Telegram
TELEGRAM_BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN"
TELEGRAM_CHAT_ID="YOUR_TELEGRAM_CHAT_ID"

# Папки для архивации
SRC_DIRS=("/opt/marzban" "/var/lib/marzban")

# Папка для хранения архива
DEST_DIR="/root"

# Имя архива с датой и временем
DATE=$(date +'%Y-%m-%d_%H-%M-%S')
ARCHIVE_NAME="OPENODE_backup_$DATE.zip"
ARCHIVE_PATH="$DEST_DIR/$ARCHIVE_NAME"

# Создание архива
zip -r "$ARCHIVE_PATH" "${SRC_DIRS[@]}"

# Целевая папка в Cloudflare R2
TARGET_DIR="s3cf:openode/"

# Функция для отправки уведомления в Telegram
send_telegram_message() {
    local MESSAGE=$1
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage"     -d chat_id="${TELEGRAM_CHAT_ID}" -d text="${MESSAGE}"
}

# Загрузка архива в Cloudflare R2 и отправка уведомления
if rclone copy "$ARCHIVE_PATH" "$TARGET_DIR"; then
    send_telegram_message "Архив $ARCHIVE_NAME успешно загружен в Cloudflare R2."
    rm "$ARCHIVE_PATH"
else
    send_telegram_message "Ошибка при загрузке архива $ARCHIVE_NAME в Cloudflare R2."
fi

# Ротация архивов в Cloudflare R2 (оставить только за последние 7 дней)
rclone delete --min-age 7d "$TARGET_DIR"
```

### Шаг 3: Делаем скрипт исполняемым

```bash
chmod +x /root/backup_script.sh
```

### Шаг 4: Настраиваем crontab

И наконец, самое важное – автоматизация через `crontab`, чтобы скрипт запускался каждые 4 часа:

```bash
crontab -e
```

Добавляем строку:

```bash
0 */4 * * * /root/backup_script.sh > /dev/null 2>&1
```

## Заключение

Вот и все! Скрипт работает стабильно, уведомления приходят вовремя, а мои данные в безопасности. Настройка автоматического резервного копирования – это не просто полезно, это необходимо. Теперь я могу спать спокойно, зная, что все под контролем.
