---
title: Полезные твики и утилиты для Ubuntu Server
description: Практическое руководство по улучшению повседневной работы с Ubuntu Server. Утилиты, алиасы и инструменты, которые действительно нужны — без перегруза и лишнего.
tags:
  - ubuntu
  - server
  - администрирование
  - автоматизация
  - оптимизация
series: UbuntuServerGuide
draft: false
pubDate: 04 17 2025
---

# Полезные твики и утилиты для Ubuntu Server

Ubuntu Server — это надёжная платформа, но "из коробки" она довольно минималистична. Здесь вы найдёте **полезные твики и современные CLI-инструменты**, которые действительно помогут в работе. Без банального `ufw`, без Docker-зависимостей — только лаконичные и понятные утилиты, которые ставятся одной командой и работают сразу.

---

## ⚙️ Полезные алиасы

1. **Обновление и очистка:**
```bash
alias aptf='apt update && apt upgrade -y && apt autoremove -y'
```

2. **Очистка системы от мусора и логов:**
```bash
alias cleanup='apt autoremove -y && apt autoclean && journalctl --vacuum-time=7d'
```

3. **Поиск больших файлов (например, при нехватке места):**
```bash
alias bigfiles='find / -type f -size +100M 2>/dev/null'
```

4. **Просмотр логов в реальном времени:**
```bash
alias logs='journalctl -xe -f'
```

5. **Перегенерация GRUB:**
```bash
alias update-grub2='grub-mkconfig -o /boot/grub/grub.cfg'
```

---

## 📟 Современные утилиты CLI

### Мониторинг и ресурсы:

- `btop` — красивый монитор системы с графиками, работает из коробки:
```bash
snap install btop
```
Запусти просто командой `btop`

- `glances` — мощный универсальный мониторинг, с web-интерфейсом (`glances -w`):
```bash
apt install -y glances
```

- `tldr` — краткие объяснения Linux-команд:
```bash
apt install -y tldr
```
Например: `tldr rsync`

---

### Удобная работа с файлами:

- `bat` — замена `cat`, с подсветкой синтаксиса и нумерацией строк:
```bash
apt install -y bat
```
Используй: `batcat filename`
Но можно назначить алиас для короткой команды: `alias bat='batcat'`

Потом обнови сессию: `source ~/.bashrc`

А потом используй `bat file.cfg` для чтения



- `exa` — улучшенный `ls`, с цветами и древовидным выводом:
```bash
apt install -y exa
```
Используй: `exa -lh --tree`

- `fd` — альтернатива `find`, проще и быстрее:
```bash
apt install -y fd-find
```
Пример: `fd config .` ищет файл в текущем каталоге и ниже

- `ripgrep` (`rg`) — быстрый текстовый поиск в файлах, альтернатива `grep`:
```bash
apt install -y ripgrep
```
Пример: `rg "search_text"`

---

## 💾 Управление пространством и резервные копии

- `ncdu` — визуальный анализ диска, сортировка по размеру:
```bash
apt install -y ncdu
```
Просто набери `ncdu` в нужной папке.

- `duf` — визуальный `df`, показывает диски и разделы красиво и понятно:
```bash
apt install -y duf
```

- `restic` — шифрованные резервные копии с дедупликацией:
```bash
apt install -y restic
```
Создание бэкапа: `restic -r /backup init` и далее `restic -r /backup backup /etc`

---

## 🌐 Сеть и диагностика

- `mtr` — интерактивная трассировка сети с обновлением в реальном времени:
```bash
apt install -y mtr
```
Запуск: `mtr google.com`

- `iperf3` — тестирование пропускной способности между двумя хостами:
```bash
apt install -y iperf3
```
Пример: `iperf3 -s` на сервере и `iperf3 -c IP` на клиенте

- `bandwhich` — покажет, какие процессы потребляют трафик:
```bash
snap install bandwhich
```
Запуск: `sudo bandwhich`

---

## 🔐 Безопасность и удобные утилиты

- `age` — простой и современный инструмент для шифрования файлов:
```bash
apt install -y age
```
Пример: `age -e -r <public_key> file.txt > file.txt.age`

- `pass` — минималистичный CLI-менеджер паролей (основан на GPG):
```bash
apt install -y pass
```
Пример: `pass init "Your GPG ID" && pass insert my/password`

- `goss` — тестирование конфигурации системы (инфраструктура как код):
```bash
curl -L https://github.com/goss-org/goss/releases/latest/download/goss-linux-amd64 -o /usr/local/bin/goss && chmod +x /usr/local/bin/goss
```
Пример: `goss validate` — проверка, что всё работает как нужно.

---

## 🧩 Заключение

В этой подборке только **легковесные и реально применимые инструменты**, не требующие Docker или лишней настройки. Всё запускается буквально одной командой и сразу начинает приносить пользу.

Можно расширить это в виде install-скрипта, шаблона или даже собственной сборки. Если интересно — напиши.

Пусть ваш сервер работает как часы — просто, понятно и удобно!

