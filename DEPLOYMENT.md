# 🚀 Инструкции по развертыванию

## Быстрый запуск

### 1. Предварительные требования
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM
- 2GB свободного места

### 2. Запуск системы
```bash
# Клонирование репозитория
git clone <repository-url>
cd smart-storage

# Запуск всех сервисов
docker-compose up --build

# Запуск в фоновом режиме
docker-compose up -d --build
```

### 3. Проверка работоспособности
- Frontend: http://localhost:80
- Backend API: http://localhost:3000
- API документация: http://localhost:3000/docs
- База данных: localhost:5432

### 4. Тестовые данные
**Авторизация:**
- Email: `admin@rostelecom.ru`
- Пароль: `password123`

## Архитектура системы

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
│   Port: 80      │    │   Port: 3000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   WebSocket     │    │   Redis         │
│   (Reverse      │    │   (Real-time    │    │   (Cache)       │
│   Proxy)        │    │   Updates)      │    │   Port: 6379    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Robot         │
                       │   Emulator      │
                       │   (Python)      │
                       └─────────────────┘
```

## Компоненты системы

### Frontend (React + Tailwind CSS)
- **Порт:** 80
- **Технологии:** React 18, Tailwind CSS, Lucide Icons
- **Функции:** 
  - Авторизация
  - Мониторинг в реальном времени
  - Исторические данные
  - Загрузка CSV

### Backend (FastAPI + SQLAlchemy)
- **Порт:** 3000
- **Технологии:** FastAPI, SQLAlchemy, PostgreSQL, Redis
- **Функции:**
  - REST API
  - WebSocket
  - JWT авторизация
  - ИИ прогнозы

### База данных (PostgreSQL)
- **Порт:** 5432
- **База:** warehouse_db
- **Пользователь:** warehouse_user
- **Пароль:** secure_password

### Redis
- **Порт:** 6379
- **Функции:** Кеширование, WebSocket

### Эмулятор роботов
- **Технологии:** Python, Requests
- **Функции:** Симуляция 5 роботов

## API Endpoints

### Авторизация
```
POST /api/auth/login
Content-Type: application/json
{
  "email": "admin@rostelecom.ru",
  "password": "password123"
}
```

### WebSocket
```
WS /api/ws/dashboard
```

### Данные
```
GET /api/dashboard/current
GET /api/inventory/history?from=2024-01-01&to=2024-12-31
POST /api/inventory/import
POST /api/ai/predict
```

## Мониторинг

### Логи
```bash
# Все сервисы
docker-compose logs

# Конкретный сервис
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### Статус сервисов
```bash
docker-compose ps
```

### Перезапуск
```bash
# Перезапуск всех сервисов
docker-compose restart

# Перезапуск конкретного сервиса
docker-compose restart backend
```

## Масштабирование

### Увеличение количества роботов
```bash
# В docker-compose изменить
ROBOTS_COUNT: 10
```

### Увеличение интервала обновления
```bash
# В docker-compose изменить
UPDATE_INTERVAL: 5
```

## Безопасность

### Смена паролей
1. Изменить в `docker-compose`:
   - `POSTGRES_PASSWORD`
   - `JWT_SECRET`

2. Пересоздать контейнеры:
```bash
docker-compose down
docker-compose up --build
```

### SSL сертификаты
1. Добавить сертификаты в `frontend/nginx.conf`
2. Настроить HTTPS редирект

## Резервное копирование

### База данных
```bash
# Создание бэкапа
docker-compose exec postgres pg_dump -U warehouse_user warehouse_db > backup.sql

# Восстановление
docker-compose exec -T postgres psql -U warehouse_user warehouse_db < backup.sql
```

### Файлы загрузок
```bash
# Копирование директории uploads
cp -r uploads/ backup/uploads/
```

## Производительность

### Оптимизация
- **База данных:** Настроены индексы
- **Кеширование:** Redis для частых запросов
- **WebSocket:** Эффективные обновления
- **Frontend:** Минификация и сжатие

### Мониторинг ресурсов
```bash
# Использование ресурсов
docker stats
```

## Устранение неполадок

### Проблемы с запуском
1. **Порты заняты:**
   ```bash
   # Проверить занятые порты
   netstat -tulpn | grep :80
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :5432
   ```

2. **Проблемы с Docker:**
   ```bash
   # Очистка Docker
   docker system prune -a
   docker-compose down -v
   ```

3. **Проблемы с базой данных:**
   ```bash
   # Пересоздание базы данных
   docker-compose down -v
   docker-compose up --build
   ```

### Логи ошибок
```bash
# Детальные логи
docker-compose logs --tail=100 -f
```

## Обновление системы

### Обновление кода
```bash
git pull origin main
docker-compose down
docker-compose up --build
```

### Обновление зависимостей
```bash
# Frontend
cd frontend
npm update
docker-compose build frontend

# Backend
cd backend
pip install --upgrade -r requirements.txt
docker-compose build backend
```

## Продакшн развертывание

### 1. Подготовка сервера
- Ubuntu 20.04+ или CentOS 8+
- Docker и Docker Compose
- SSL сертификаты
- Firewall настройки

### 2. Конфигурация
```bash
# Создание .env файла
cp .env.example .env
# Редактирование переменных окружения
```

### 3. Запуск
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Мониторинг
- Настройка логирования
- Мониторинг ресурсов
- Алерты и уведомления

---

**Ростелеком: Технологии возможностей** 🚀
