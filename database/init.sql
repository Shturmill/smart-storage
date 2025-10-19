-- Инициализация базы данных для системы "Умный склад"

-- Пользователи системы
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'operator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Роботы
CREATE TABLE IF NOT EXISTS robots (
    id VARCHAR(50) PRIMARY KEY,
    status VARCHAR(50) DEFAULT 'active',
    battery_level INTEGER,
    last_update TIMESTAMP,
    current_zone VARCHAR(10),
    current_row INTEGER,
    current_shelf INTEGER
);

-- Товары
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    min_stock INTEGER DEFAULT 10,
    optimal_stock INTEGER DEFAULT 100
);

-- История инвентаризации
CREATE TABLE IF NOT EXISTS inventory_history (
    id SERIAL PRIMARY KEY,
    robot_id VARCHAR(50) REFERENCES robots(id),
    product_id VARCHAR(50) REFERENCES products(id),
    quantity INTEGER NOT NULL,
    zone VARCHAR(10) NOT NULL,
    row_number INTEGER,
    shelf_number INTEGER,
    status VARCHAR(50),
    scanned_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Прогнозы ИИ
CREATE TABLE IF NOT EXISTS ai_predictions (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id),
    prediction_date DATE NOT NULL,
    days_until_stockout INTEGER,
    recommended_order INTEGER,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_inventory_scanned ON inventory_history(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_history(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_zone ON inventory_history(zone);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_history(status);

-- Вставка тестовых данных
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@rostelecom.ru', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2W', 'Администратор', 'admin'),
('operator@rostelecom.ru', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2W', 'Оператор склада', 'operator')
ON CONFLICT (email) DO NOTHING;

INSERT INTO products (id, name, category, min_stock, optimal_stock) VALUES 
('TEL-4567', 'Роутер RT-AC68U', 'Сетевое оборудование', 10, 50),
('TEL-8901', 'Модем DSL-2640U', 'Сетевое оборудование', 5, 30),
('TEL-2345', 'Коммутатор SG-108', 'Сетевое оборудование', 8, 40),
('TEL-6789', 'IP-телефон T46S', 'Телефония', 15, 60),
('TEL-3456', 'Кабель UTP Cat6', 'Кабели', 100, 500)
ON CONFLICT (id) DO NOTHING;

INSERT INTO robots (id, status, battery_level, current_zone, current_row, current_shelf) VALUES 
('RB-001', 'active', 85, 'A', 12, 3),
('RB-002', 'active', 45, 'B', 5, 2),
('RB-003', 'low_battery', 15, 'C', 8, 1),
('RB-004', 'active', 92, 'D', 15, 4),
('RB-005', 'offline', 0, 'A', 20, 5)
ON CONFLICT (id) DO NOTHING;
