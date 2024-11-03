---
title: Marzban CLI
description: This guide provides Marzban CLI usage
tags:
  - CLI
  - Marzban
series: MarzbanGuide
draft: false
pubDate: 11 02 2024
---

# Командная строка (CLI)

Командная строка (CLI) Marzban включает `4` основные команды, каждая из которых имеет подкоманды для выполнения специфических задач. В этом разделе объясняется назначение каждой из команд. В конце раздела вы найдете примеры наиболее часто используемых команд.

**1. Как использовать**

Показывает расположение опций и команд для `marzban cli`.

```bash
marzban cli [OPTIONS] COMMAND [ARGS]...
```

> В этом разделе `[ARGS]` (аргументы) обозначает использование различных подкоманд для выполнения специфических задач.


**2. Опции**

`--help`
- Используется для вывода справки по `marzban cli`.
```
marzban cli --help
```


> - Если у команды несколько опций и вы указали только одну, система запросит ввод остальных опций. Однако можно указать все опции сразу, и команда выполнится мгновенно.
> - Например, для передачи прав пользователя от одного администратора другому сразу указываются имя пользователя, администратора и подтверждение, после чего команда выполняется сразу.

```
marzban cli user set-owner -u TEXT --admin TEXT -y
```

- Некоторые опции необязательны и могут быть опущены.


**3. Команды**

`admin`
```
marzban cli admin
```

`completion`
```
marzban cli completion
```

`subscription`
```
marzban cli subscription
```

`user`
```
marzban cli user
```

## `admin`

**1. Как использовать**

Показывает расположение опций и команд для команды `admin`.
```
marzban cli admin [OPTIONS] COMMAND [ARGS]...
```

**2. Опции**

`--help`
- Используется для вывода справки по команде `admin`.
```
marzban cli admin --help
```

**3. Команды**

`create`
- Используется для создания администратора.
```
marzban cli admin create
```

`delete`
- Используется для удаления администратора.
```
marzban cli admin delete
```

`import-from-env`
- Импортирует администратора `sudo` из файла `env`.
```
marzban cli admin import-from-env
```

`list`
- Показывает список администраторов.
```
marzban cli admin list
```

`update`
- Обновляет данные администратора.
```
marzban cli admin update
```

## `admin create`

- Используется для создания администратора.

**1. Как использовать**

Показывает расположение опций для команды `admin create`.
```
marzban cli admin create [OPTIONS]
```

**2. Опции**

`-u, --username TEXT`
- Используется для задания имени пользователя администратора. Замените `TEXT` на имя.
```
marzban cli admin create -u TEXT
```

`--sudo`
- Создает администратора `sudo`.
```
marzban cli admin create -u TEXT --sudo
```

`--no-sudo`
- Создает администратора без `sudo`.
```
marzban cli admin create -u TEXT --no-sudo
```

`-tg, --telegram-id TEXT`
- Указывает ID администратора в Telegram.
```
marzban cli admin create -tg TEXT
```

`-dc, --discord-webhook TEXT`
- Указывает Webhook в Discord.
```
marzban cli admin create -dc TEXT
```

`--help`
- Используется для вывода справки по `admin create`.
```
marzban cli admin create --help
```

## `admin delete`
- Удаляет администратора.

**1. Как использовать**

Показывает расположение опций для команды `admin delete`.
```
marzban cli admin delete [OPTIONS]
```

**2. Опции**

`-u, --username TEXT`
- Укажите имя удаляемого администратора.
```
marzban cli admin delete -u TEXT 
```

`-y, --yes`
- Отключает запрос подтверждения.
```
marzban cli admin delete -u TEXT -y
```

`--help`
- Выводит справку по `admin delete`.
```
marzban cli admin delete --help
```

## `admin import-from-env`
- Импортирует администратора `sudo` из файла `env`.

**1. Как использовать**

Показывает расположение опций для команды `admin import-from-env`.
```
marzban cli admin import-from-env [OPTIONS]
```

**2. Опции**

`-y, --yes`
- Отключает запрос подтверждения.
```
marzban cli admin import-from-env -y
```

`--help`
- Выводит справку по `admin import-from-env`.
```
marzban cli admin import-from-env --help
```

## `admin list`
- Показывает список администраторов.

**1. Как использовать**

Показывает расположение опций для команды `admin list`.
```
marzban cli admin list [OPTIONS]
```

**2. Опции**

`-o, --offset INTEGER`
- Показ списка с определенного количества, замените `ITEMS` на число.
```
marzban cli admin list -o ITEMS
```

`-l, --limit INTEGER`
- Количество отображаемых администраторов.
```
marzban cli admin list -l ITEMS
```

`-u, --username TEXT`
- Укажите имя администратора.
```
marzban cli admin list -u TEXT
```

`--help`
- Выводит справку по `admin list`.
```
marzban cli admin list --help
```

## `admin update`
- Обновляет данные администратора.

**1. Как использовать**

Показывает расположение опций для команды `admin update`.
```
marzban cli admin update [OPTIONS]
```

**2. Опции**

`-u, --username TEXT`
- Укажите имя обновляемого администратора.
```
marzban cli admin update -u TEXT 
```

`--help`
- Выводит справку по `admin update`.
```
marzban cli admin update --help
```

## `subscription`

**1. Как использовать**

Показывает расположение опций и команд для команды `subscription`.
```
marzban cli subscription [OPTIONS] COMMAND [ARGS]...
```

**2. Опции**

`--help`
- Выводит справку по `subscription`.
```
marzban cli subscription --help
```

**3. Команды**

`get-config`
- Для получения прокси пользователя.
```
marzban cli subscription get-config
```

`get-link`
- Для получения ссылки подписки пользователя.
```
marzban cli subscription get-link
```

## `subscription get-config`
- Получает прокси пользователя.

**1. Как использовать**

Показывает расположение опций для команды `subscription get-config`.
```
marzban cli subscription get-config [OPTIONS]
```

**2. Опции**

`-u, --username TEXT`
- Укажите имя пользователя.
```
marzban cli subscription get-config -u TEXT
```

`-f, --format [v2ray|clash]`
- Показ прокси в формате `v2ray` или `clash`.
```
marzban cli subscription get-config -u TEXT -f [v2ray|clash]
```

`-o, --output TEXT`
- Сохранение прокси в файл.
```
marzban cli subscription get-config -u TEXT -f v2ray -o v2ray_config.json
```

`--base64`
- Показ прокси в base64.
```
marzban cli subscription get-config -u TEXT -f [v2ray|clash] --base64
```

`--help`
- Выводит справку по `subscription get-config`.
```
marzban cli subscription get-config --help
```

## `user`

**1. Как использовать**

Показывает расположение опций и команд для команды `user`.
```
marzban cli user [OPTIONS] COMMAND [ARGS]...
```

**2. Опции**

`--help`
- Выводит справку по `user`.
```
marzban cli user --help
```

**3. Команды**

`list`
- Показ списка пользователей.
```
marzban cli user list
```

`set-owner`
- Изменение владельца пользователя.
```
marzban cli user set-owner
```

## `completion`

**1. Как использовать**

Показывает расположение опций и команд для команды `completion`.
```
marzban cli completion [OPTIONS] COMMAND [ARGS]...
```

**2. Опции**

`--help`
- Выводит справку по `completion`.
```
marzban cli completion --help
```

**3. Команды**

`install`
```
marzban cli completion install
```

`show`
```
marzban cli completion show
```