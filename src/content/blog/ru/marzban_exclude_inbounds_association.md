---
title: "Как управлять доступом пользователей к inbound'ам?"
description: "В этой статье описывается механизм управления доступом к inbound'ам с помощью таблицы exclude_inbounds_association, позволяющий гибко включать и отключать доступ для отдельных групп пользователей или для всех сразу."
tags:
  - SQL
  - Database
  - Access Control
  - Inbound
series: "MarzbanGuide"
draft: false
pubDate: 02 07 2025
---

# Как управлять доступом пользователей к inbound'ам? 🤔

В базе данных существует таблица **exclude_inbounds_association**, которая отвечает за запрет использования определённых inbound'ов пользователями. Если в этой таблице есть запись для конкретного пользователя и inbound'а, значит доступ к этому inbound'у **запрещён**. Если записи нет — доступ разрешён.

В данной статье рассмотрим, как с помощью этой таблицы можно:

- Отключать inbound'ы для пользователей конкретного администратора.
- Отключать inbound'ы для всех пользователей.
- Включать inbound'ы для пользователей конкретного администратора.
- Включать inbound'ы для всех пользователей.

---

## Отключение inbound'а для пользователей конкретного администратора

Предположим, необходимо запретить использование **INBOUND_NAME** для всех пользователей администратора с именем **ADMIN**. Для этого в таблицу `exclude_inbounds_association` добавляются записи, связывающие proxy ID пользователей данного администратора с указанным inbound'ом:

```sql
INSERT INTO exclude_inbounds_association (proxy_id, inbound_tag)
SELECT proxies.id, "INBOUND_NAME"
FROM users
INNER JOIN admins ON users.admin_id = admins.id
INNER JOIN proxies ON proxies.user_id = users.id
WHERE admins.username = "ADMIN";
```

После выполнения данного запроса пользователи администратора **ADMIN** не смогут использовать inbound **INBOUND_NAME**.

---

## Отключение inbound'а для всех пользователей

Если требуется заблокировать inbound **INBOUND_NAME** для всех пользователей, независимо от администратора, выполняется следующий запрос:

```sql
INSERT INTO exclude_inbounds_association (proxy_id, inbound_tag)
SELECT proxies.id, "INBOUND_NAME"
FROM users
INNER JOIN admins ON users.admin_id = admins.id
INNER JOIN proxies ON proxies.user_id = users.id;
```

После выполнения запроса данный inbound станет недоступным для всех пользователей.

---

## Включение inbound'а для пользователей конкретного администратора

Чтобы снова разрешить использование inbound **INBOUND_NAME** для пользователей администратора **ADMIN**, необходимо удалить соответствующие записи из таблицы:

```sql
DELETE FROM exclude_inbounds_association 
WHERE proxy_id IN (
    SELECT proxies.id
    FROM users
    INNER JOIN admins ON users.admin_id = admins.id
    INNER JOIN proxies ON proxies.user_id = users.id
    WHERE admins.username = 'ADMIN'
) AND inbound_tag = 'INBOUND_NAME';
```

После выполнения этого запроса пользователи администратора **ADMIN** смогут вновь подключаться через inbound **INBOUND_NAME**.

---

## Включение inbound'а для всех пользователей

Для восстановления доступа ко всем inbound'ам для всех пользователей следует удалить записи по нужному inbound'у без фильтрации по администратору:

```sql
DELETE FROM exclude_inbounds_association 
WHERE proxy_id IN (
    SELECT proxies.id
    FROM users
    INNER JOIN admins ON users.admin_id = admins.id
    INNER JOIN proxies ON proxies.user_id = users.id
) AND inbound_tag = 'INBOUND_NAME';
```

После выполнения запроса доступ к inbound **INBOUND_NAME** будет восстановлен для всех пользователей.

---

## Вывод

Таблица **exclude_inbounds_association** является удобным инструментом для гибкого управления доступом к inbound'ам. Добавляя или удаляя записи в этой таблице, можно быстро отключать или включать inbound'ы как для пользователей конкретного администратора, так и для всех пользователей одновременно.

Обсудить можно в нашей группе: https://t.me/c/2177153546/402
