---
title: Как создать портал авторизации для своих доменов с помощью Caddy
description: Подробная инструкция по сборке Caddy с модулем caddy-security через xcaddy и настройке портала авторизации для защиты ваших доменов.
tags:
  - Caddy
  - авторизация
  - безопасность
  - xcaddy
series: caddy
pubDate: 04 09 2025
---

# Как создать портал авторизации для своих доменов с помощью Caddy

Caddy — это современный веб-сервер с автоматической поддержкой HTTPS через Let’s Encrypt. Однако стандартная сборка Caddy не включает модуль `caddy-security`, который необходим для создания портала авторизации и управления доступом к вашим доменам. В этой статье я расскажу, как собрать Caddy с этим модулем с помощью `xcaddy`, настроить портал авторизации и защитить свои веб-приложения.

---

## Предварительные требования

Перед началом убедитесь, что у вас есть:

- Сервер с операционной системой (например, Ubuntu 22.04).
- Доступ к командной строке с правами суперпользователя (`sudo`).
- Базовые знания о веб-серверах и конфигурационных файлах.
- Домен или поддомен (например, `example.com`), с настроенными DNS-записями, указывающими на ваш сервер.
- Установленный Go (версия 1.16 или выше) для сборки Caddy.

---

## Шаг 1: Сборка Caddy с модулем `caddy-security`

Поскольку модуль `caddy-security` не входит в стандартную сборку Caddy, нам нужно собрать кастомную версию с помощью инструмента `xcaddy`.

### 1.1. Установка `xcaddy`

`xcaddy` позволяет собирать Caddy с дополнительными модулями. Установите его следующим образом:

```bash
sudo apt update
sudo apt install -y golang
go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest
```

После выполнения этих команд `xcaddy` будет доступен в `~/go/bin/xcaddy`. Убедитесь, что директория `~/go/bin` добавлена в ваш `$PATH`, чтобы использовать `xcaddy` глобально:

```bash
export PATH=$PATH:~/go/bin
```

### 1.2. Сборка Caddy с модулем `caddy-security`

Теперь соберем Caddy с модулем `caddy-security`:

```bash
~/go/bin/xcaddy build --with github.com/greenpau/caddy-security
```

Эта команда создаст исполняемый файл `caddy` в текущей директории.

### 1.3. Установка собранного Caddy

Переместите скомпилированный файл в системную директорию, чтобы он был доступен глобально:

```bash
sudo mv caddy /usr/bin/
```

Проверьте версию Caddy, чтобы убедиться, что модуль включен:

```bash
caddy version
```

Вывод должен показать версию Caddy с указанием, что сборка кастомная.

---

## Шаг 2: Настройка хранилища пользователей

Для работы портала авторизации Caddy использует JSON-файл с данными пользователей. Мы создадим файл `users.json` с помощью скрипта.

### 2.1. Создание директории для данных

Создайте директорию для хранения данных и установите правильные права доступа:

```bash
sudo mkdir -p /data/.local/caddy
sudo chown caddy:caddy /data/.local/caddy
```

### 2.2. Создание пользователя с помощью скрипта

Чтобы упростить процесс, используйте следующий скрипт. Он запрашивает данные пользователя и генерирует файл `users.json`.

Сохраните этот код в файл `generate_users_json.sh`:

```bash
#!/bin/bash

# Проверка зависимостей
if ! command -v python3 &> /dev/null; then
    echo "Ошибка: Python3 не установлен. Установите: 'sudo apt install python3'."
    exit 1
fi
if ! python3 -c "import bcrypt" &> /dev/null; then
    echo "Ошибка: Модуль bcrypt не установлен. Установите: 'pip3 install bcrypt'."
    exit 1
fi
if ! command -v uuidgen &> /dev/null; then
    echo "Ошибка: uuidgen не установлен. Установите: 'sudo apt install uuid-runtime'."
    exit 1
fi

# Запрос данных
read -p "Введите имя пользователя (username): " USERNAME
read -p "Введите email: " EMAIL
read -s -p "Введите пароль: " PASSWORD
echo

# Проверка данных
if [[ -z "$USERNAME" || -z "$EMAIL" || -z "$PASSWORD" ]]; then
    echo "Ошибка: Все поля должны быть заполнены."
    exit 1
fi
if [[ ${#USERNAME} -lt 3 || ${#USERNAME} -gt 50 || "$USERNAME" =~ [^a-z] ]]; then
    echo "Ошибка: Имя пользователя — 3-50 символов, только строчные буквы (a-z)."
    exit 1
fi
if [[ ${#PASSWORD} -lt 8 ]]; then
    echo "Ошибка: Пароль — минимум 8 символов."
    exit 1
fi

# Извлечение домена
DOMAIN=$(echo "$EMAIL" | cut -d'@' -f2)
if [[ -z "$DOMAIN" ]]; then
    echo "Ошибка: Неверный формат email."
    exit 1
fi

# Генерация значений
UUID=$(uuidgen)
DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
HASH=$(python3 -c "import bcrypt; print(bcrypt.hashpw('$PASSWORD'.encode(), bcrypt.gensalt(10)).decode())")

# Создание users.json
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

# Установка прав
sudo chown caddy:caddy /data/.local/caddy/users.json
sudo chmod 640 /data/.local/caddy/users.json

echo "Файл /data/.local/caddy/users.json создан!"
echo "Перезапустите Caddy: sudo systemctl restart caddy"
```

#### Как использовать скрипт:

1. Сохраните скрипт в файл `generate_users_json.sh`.
2. Сделайте его исполняемым:
   ```bash
   chmod +x generate_users_json.sh
   ```
3. Запустите:
   ```bash
   ./generate_users_json.sh
   ```
4. Введите данные:
   - Имя пользователя (например, `john`).
   - Email (например, `john@example.com`).
   - Пароль (минимум 8 символов).

Скрипт создаст файл `/data/.local/caddy/users.json` с пользователем, которому присвоена роль `authp/admin`.

---

## Шаг 3: Настройка Caddy для авторизации

Теперь настроим Caddyfile для работы с порталом авторизации.

### 3.1. Основная конфигурация Caddy

Откройте файл `/etc/caddy/Caddyfile`:

```bash
sudo nano /etc/caddy/Caddyfile
```

Добавьте глобальные настройки в начало файла:

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

- Замените `your-email@example.com` на ваш email.
- Замените `.example.com` на ваш домен (например, `.mydomain.com`).

### 3.2. Настройка для домена

Добавьте блок для вашего домена:

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

- Замените `sub.example.com` на ваш домен.
- Настройте `reverse_proxy` под ваш бэкенд (адрес и порт).

---

## Шаг 4: Проверка и перезапуск Caddy

### 4.1. Проверка конфигурации

Убедитесь, что Caddyfile корректен:

```bash
caddy validate --config /etc/caddy/Caddyfile
```

Если вы видите `Valid configuration`, всё в порядке.

### 4.2. Перезапуск Caddy

Примените изменения:

```shell
sudo systemctl restart caddy
```

Проверьте статус:

```shell
systemctl status caddy
```

Служба должна быть `active (running)`.

---

## Шаг 5: Тестирование портала авторизации

1. Перейдите в браузере на `https://sub.example.com/auth`.
2. Введите имя пользователя и пароль из `users.json`.
3. После входа проверьте доступ к защищенным ресурсам.

Если доступ не работает, проверьте:
- Данные в `users.json`.
- Соответствие ролей в настройках.

---

## Дополнительные советы

### Множественные домены

Для разных доменов создайте отдельные порталы:

```json
authentication portal another_portal {
	cookie domain .anotherdomain.com
	...
}
```

### Логирование

Добавьте отладочные логи:

```json
{
	log {
		output file /var/log/caddy/caddy.log
		level DEBUG
	}
}
```

### Безопасность

- Обновляйте Caddy регулярно.
- Используйте сложные пароли.
- Настройте фаервол (`ufw`), разрешив только 80 и 443 порты.

---

## Заключение

Теперь у вас есть настроенный портал авторизации на Caddy. Эта конфигурация масштабируема — добавляйте пользователей, домены и политики по вашим задачам. Если возникнут вопросы, загляните в документацию Caddy или спросите в сообществе!
