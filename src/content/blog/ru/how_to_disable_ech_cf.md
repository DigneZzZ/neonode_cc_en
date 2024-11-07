---
title: Отключение Encrypted Client Hello (ECH) для доменов на Cloudflare
description: Узнайте, как отключить функцию Encrypted Client Hello (ECH) для вашего домена на Cloudflare, чтобы избежать блокировок Роскомнадзора. Пошаговое руководство для пользователей из России.
tags:
  - Cloudflare
  - ECH
  - TLS 1.3
  - РКН
  - блокировка
  - безопасность
series: CloudflareGuide
draft: false
pubDate: 11 07 2024
---

# Отключение Encrypted Client Hello (ECH) для доменов на Cloudflare

Роскомнадзор заблокировал Encrypted Client Hello (ECH), что создаёт проблемы для пользователей Cloudflare в России. Если вы столкнулись с этим, выполните следующие шаги, чтобы отключить ECH и обеспечить стабильный доступ к вашему ресурсу.

## Вариант 0 - отключить TLS 1.3 - Самый плохой вариант!

## Вариант 1 - отключить проксирование для доменов

Тоже выход, но какой тогда смысл? :)
Идем дальше!

## Вариант 2 - отключаем ECH через API Cloudflare

Этот вариант самый лучший!

### 🔍 Шаг 1: Проверка, включен ли ECH

Сначала проверьте, включен ли ECH для вашего домена. Перейдите по следующей ссылке, заменив `[ВАШ_ДОМЕН]` на ваш реальный домен:

```bash
https://dns.google/resolve?name=\[ВАШ\_ДОМЕН\]&type=HTTPS
```

Если в результатах указано, что ECH включен, переходите к следующему шагу.

### 🔑 Шаг 2: Получение данных для API Cloudflare

Для отключения ECH вам понадобятся **Global API Key** и **Zone ID** вашего домена. Получить их можно следующим образом:

- **Global API Key**: войдите в [профиль Cloudflare](https://dash.cloudflare.com/profile/api-tokens) и найдите глобальный API-ключ.
- **Zone ID**: откройте настройки вашего домена на Cloudflare, прокрутите вниз страницу и скопируйте Zone ID.

### ⚙️ Шаг 3: Отключение ECH через API Cloudflare

Теперь используем команду `curl`, чтобы отключить ECH. Выполните следующую команду в терминале, подставив свои данные:

```bash
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/{ID_ZONE}/settings/ech" \
    -H "X-Auth-Email: {ACCOUNT_EMAIL}" \
    -H "X-Auth-Key: {GLOBAL_API_KEY}" \
    -H "Content-Type:application/json" \
    --data '{"id":"ech","value":"off"}'
```

Замените `{ID_ZONE}`, `{ACCOUNT_EMAIL}`, и `{GLOBAL_API_KEY}` на свои Zone ID, email и API-ключ соответственно.

### 🛠️ Альтернативный вариант: Отключение ECH через Postman

Если предпочитаете использовать Postman, выполните следующие шаги:

1. В Postman выберите метод **PATCH** и введите URL:  
   `https://api.cloudflare.com/client/v4/zones/{ID_ZONE}/settings/ech`
2. В **Headers** добавьте:
   - `X-Auth-Email`: ваш email-адрес Cloudflare
   - `X-Auth-Key`: ваш Global API Key
   - `Content-Type`: `application/json`
3. В **Body** выберите **raw** и вставьте JSON:
   ```json
   {"id": "ech", "value": "off"}
   ```

## 💼 Другой вариант: Отключение через панель Cloudflare (для платных тарифов CF)

Пользователи платных тарифов могут отключить ECH через интерфейс Cloudflare:

1. Перейдите в настройки SSL/TLS.
2. В разделе "Edge Certificates" найдите "Encrypted ClientHello (ECH)" и выберите "Disabled".

---

С помощью этих шагов вы сможете обойти блокировки Роскомнадзора и обеспечить бесперебойный доступ к вашим ресурсам. Берегите свои данные и будьте в курсе изменений!
