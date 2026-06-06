# Zapret Proxy v4.12a

**Обход блокировок YouTube, Discord и Telegram**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-4.12a-red.svg)](https://github.com/faer5511/MyZapret)
[![Python](https://img.shields.io/badge/Python-3.10+-green.svg)](https://python.org)

## 📋 Описание

**Zapret Proxy** - это графическое приложение для обхода DPI (Deep Packet Inspection) блокировок популярных сервисов:

- 🎬 **YouTube** - просмотр видео без замедлений
- 💬 **Discord** - голосовые каналы и обмен сообщениями
- ✈️ **Telegram** - работа через MTProto прокси

Приложение предоставляет удобный интерфейс для управления 12 различными профилями обхода, статистикой трафика и быстрым переключением между режимами.

## ✨ Возможности

### 🎮 Основные функции
- ✅ 12 готовых профилей обхода (ALT1-ALT12)
- ✅ Быстрое переключение профилей (кнопки или клавиши 1-9)
- ✅ Автоматический перезапуск сервисов при смене профиля
- ✅ Запуск от имени администратора (встроено)

### ⌨️ Горячие клавиши
| Комбинация | Действие |
|------------|----------|
| `Ctrl+Shift+P` | Подключить / Отключить |
| `Ctrl+Shift+←` | Предыдущий профиль |
| `Ctrl+Shift+→` | Следующий профиль |
| `Ctrl+Shift+L` | Очистить лог событий |
| `1-9` | Быстрый выбор профиля ALT1-ALT9 |
| `Escape` | Закрыть меню / модальное окно |

### 📊 Статистика в реальном времени
- **Скорость** - текущая скорость соединения (Kbps)
- **Трафик** - общее использование трафика (MB)
- **Пинг** - задержка соединения (ms)
- **Аптайм** - время активного соединения
- **Статистика сессии** - трафик за сегодня, время работы, количество запусков

### 🎨 Интерфейс
- **Тёмная / Светлая тема** - с сохранением выбора
- **Анимированные частицы** - на фоне главного окна
- **Glassmorphism эффекты** - современный стиль окон
- **Адаптивный дизайн** - корректное отображение на разных разрешениях

### 📁 Управление данными
- **Экспорт профилей** - резервное копирование настроек
- **Импорт профилей** - восстановление из бэкапа
- **Экспорт логов** - сохранение истории событий
- **Очистка лога** - удаление устаревших записей
- **Сброс всех настроек** - возврат к исходному состоянию

### ⭐ Дополнительно
- **Избранные профили** - пометка часто используемых
- **Поиск по профилям** - фильтрация в меню
- **Нативные уведомления** - оповещения Windows при подключении/отключении
- **Звуковые эффекты** - при изменении статуса соединения

## 📥 Установка

### Способ 1: Готовый EXE файл
1. Скачайте последний релиз из раздела [Releases](https://github.com/faer5511/MyZapret/releases)
2. Распакуйте архив в любую папку
3. Запустите `Zapret.exe` **от имени администратора**

### Способ 2: Запуск из исходников
```bash
git clone https://github.com/faer5511/MyZapret.git
cd MyZapret
pip install eel pyinstaller bottle
python main.py

Способ 3: Сборка EXE самостоятельно

# Установка зависимостей
pip install eel pyinstaller bottle

# Запуск сборки
build.bat
# или
python -m PyInstaller --onefile --windowed --name Zapret --add-data "web;web" --add-data "bat_files;bat_files" --add-data "tg_proxy;tg_proxy" --hidden-import eel --icon "web/logo.ico" main.py


📁 Структура проекта

MyZapret/
├── bat_files/              # Профили и конфиги zapret
│   ├── lists/              # Списки для фильтрации трафика
│   │   ├── ipset-all.txt
│   │   ├── ipset-exclude-user.txt
│   │   ├── ipset-exclude.txt
│   │   ├── list-exclude-user.txt
│   │   ├── list-exclude.txt
│   │   ├── list-general-user.txt
│   │   ├── list-general.txt
│   │   └── list-google.txt
│   ├── utils/              # Вспомогательные утилиты
│   │   ├── check_updates.enabled
│   │   ├── targets.txt
│   │   └── test zapret.ps1
│   ├── general (ALT1).bat  # Профиль ALT1
│   ├── general (ALT2).bat  # Профиль ALT2
│   ├── ...                 # ALT3-ALT11
│   ├── general (ALT12).bat # Профиль ALT12
│   ├── general.bat         # Базовый профиль
│   └── service.bat         # Сервис управления
├── tg_proxy/               # Telegram MTProto прокси
│   └── TgWsProxy_windows.exe
├── web/                    # Web интерфейс (EEL)
│   ├── modules/            # JavaScript модули
│   │   ├── animations.js   # Анимации и графика
│   │   ├── network.js      # Сетевые операции
│   │   ├── shortcuts.js    # Горячие клавиши
│   │   ├── storage.js      # Работа с localStorage
│   │   └── ui.js          # UI компоненты
│   ├── index.html          # Главная страница
│   ├── logo.ico            # Иконка приложения
│   ├── logo.png            # Логотип
│   ├── script.js           # Главный JS файл
│   └── style.css           # Стили
├── .gitignore              # Git исключения
├── LICENSE                 # MIT лицензия
├── README.md               # Документация
├── build.bat               # Скрипт сборки
├── main.py                 # Основной Python файл
└── version.txt             # Версия для сборки


🚀 Использование
Первый запуск
Запустите программу от имени администратора

Выберите профиль (рекомендуется ALT1)

Нажмите кнопку ПОДКЛЮЧИТЬ

Дождитесь зелёного статуса "Подключено"

Переключение профилей
Кнопками ◀ ▶ в интерфейсе

Цифрами 1-9 на клавиатуре

Через меню - клик по любому профилю в списке

Модальное окно - клик по активному профилю

Подключение Telegram
После запуска прокси в логе появится ссылка:

text
🔗 ПОДКЛЮЧИТЬ TELEGRAM — нажми для подключения
Кликните по ссылке - откроется Telegram с предложением подключить прокси.

Смена темы
Нажмите на иконку 🌙/☀️ в правом верхнем углу.

Поиск профилей
В меню есть поле поиска - введите ALT5 или general для фильтрации.

⚠️ Системные требования
OS: Windows 10 / 11 (64-bit)

Python: 3.10+ (для запуска из исходников)

Права: Администратор (обязательно)

RAM: от 256 MB

Диск: от 50 MB свободного места

🔧 Устранение проблем
Не запускается / ошибка прав
Запустите программу от имени администратора

Отключите антивирус временно (WinDivert может определяться как подозрительный)

Не работает YouTube
Попробуйте другой профиль (ALT2, ALT3)

Очистите кэш браузера

Проверьте что нет других VPN/прокси

Не работает Discord
Перезапустите Discord после подключения

Очистите кэш Discord через меню Diagnostics

Telegram прокси не подключается
Дождитесь появления ссылки в логе (10-15 секунд)

Убедитесь что Telegram не заблокирован на уровне DNS

WinDivert конфликт
Запустите Diagnostics из меню

Программа автоматически обнаружит и удалит конфликтующие сервисы

🛠️ Для разработчиков
Технологии
Python + EEL - бэкенд и нативный GUI

HTML/CSS/JS - фронтенд интерфейс

PyInstaller - сборка EXE

zapret - ядро обхода DPI

TgWsProxy - MTProto прокси для Telegram

Зависимости
bash
pip install eel bottle pyinstaller
API (EEL экспорты)
python
@eel.expose
def get_profiles() -> list          # Список профилей
def get_current_profile() -> str    # Текущий профиль
def switch_profile(profile: str)    # Смена профиля
def start_connection() -> dict      # Запуск сервисов
def stop_connection() -> dict       # Остановка сервисов
def get_tg_proxy_link() -> str      # Ссылка для Telegram
def update_zapret() -> bool         # Обновление zapret

📜 Лицензии сторонних компонентов
Данный проект является графической оболочкой и использует следующие сторонние компоненты:

Компонент zapret (ядро обхода DPI)
Автор: bol-van

Репозиторий: https://github.com/bol-van/zapret

Лицензия: MIT

Файл лицензии: bat_files/LICENSE.zapret

Компонент TgWsProxy (Telegram MTProto прокси)
Автор: TgWsProxy

Репозиторий: https://github.com/TgWsProxy/TgWsProxy

Лицензия: MIT

Файл лицензии: tg_proxy/LICENSE.tgwsproxy

Конфигурационные файлы (профили ALT1-ALT12)
Автор: Flowseal

Репозиторий: https://github.com/Flowseal/zapret-discord-youtube

Лицензия: MIT

Файл лицензии: bat_files/LICENSE.flowseal

📝 Лицензия
Проект распространяется под лицензией MIT. Подробности в файле LICENSE.

🙏 Благодарности
bol-van - за создание zapret (ядро обхода DPI)

TgWsProxy - за Telegram MTProto прокси

Flowseal - за готовые профили ALT1-ALT12

EEL - за Python-JS мост

Font Awesome - за иконки

<div align="center"> <sub>Built with ❤️ | Thanks to bol-van, TgWsProxy and Flowseal</sub> </div> ```