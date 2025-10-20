from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from jose import jwt
import bcrypt
import csv
import io
import json
import asyncio
import os
from contextlib import asynccontextmanager

# Конфигурация
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://warehouse_user:secure_password@localhost:5432/warehouse_db")
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret_key")
AI_API_KEY = os.getenv("AI_API_KEY", "your_ai_api_key")

# База данных
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Модели базы данных
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'operator', 'admin', 'viewer'
    created_at = Column(DateTime, default=datetime.utcnow)

class Robot(Base):
    __tablename__ = "robots"
    
    id = Column(String, primary_key=True)
    status = Column(String, default='active')
    battery_level = Column(Integer)
    last_update = Column(DateTime)
    current_zone = Column(String)
    current_row = Column(Integer)
    current_shelf = Column(Integer)

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String)
    min_stock = Column(Integer, default=10)
    optimal_stock = Column(Integer, default=100)

class InventoryHistory(Base):
    __tablename__ = "inventory_history"
    
    id = Column(Integer, primary_key=True, index=True)
    robot_id = Column(String, ForeignKey("robots.id"))
    product_id = Column(String, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    zone = Column(String, nullable=False)
    row_number = Column(Integer)
    shelf_number = Column(Integer)
    status = Column(String)  # 'OK', 'LOW_STOCK', 'CRITICAL'
    scanned_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AIPrediction(Base):
    __tablename__ = "ai_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.id"))
    prediction_date = Column(DateTime, nullable=False)
    days_until_stockout = Column(Integer)
    recommended_order = Column(Integer)
    confidence_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic модели
class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str

class LoginResponse(BaseModel):
    token: str
    user: UserResponse

class RobotData(BaseModel):
    robot_id: str
    timestamp: str
    location: dict
    scan_results: List[dict]
    battery_level: float
    next_checkpoint: str

class RobotResponse(BaseModel):
    status: str
    message_id: str

class DashboardData(BaseModel):
    robots: List[dict]
    recent_scans: List[dict]
    statistics: dict

class InventoryHistoryResponse(BaseModel):
    total: int
    items: List[dict]
    pagination: dict

class CSVUploadResponse(BaseModel):
    success: int
    failed: int
    errors: List[str]

class AIPredictionRequest(BaseModel):
    period_days: int = 7
    categories: List[str] = []

class AIPredictionResponse(BaseModel):
    predictions: List[dict]
    confidence: float

# WebSocket соединения
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Удаляем неактивные соединения
                self.active_connections.remove(connection)

manager = ConnectionManager()

# Зависимости
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Создание таблиц
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Создание таблиц при запуске
    Base.metadata.create_all(bind=engine)
    
    # Инициализация тестовых данных
    db = SessionLocal()
    try:
        # Проверяем, есть ли уже пользователи
        if not db.query(User).first():
            # Создаем тестового пользователя
            hashed_password = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt())
            test_user = User(
                email="admin@rostelecom.ru",
                password_hash=hashed_password.decode('utf-8'),
                name="Администратор",
                role="admin"
            )
            db.add(test_user)
            
            # Создаем тестовые товары
            products = [
                Product(id="TEL-4567", name="Роутер RT-AC68U", category="Сетевое оборудование", min_stock=10, optimal_stock=50),
                Product(id="TEL-8901", name="Модем DSL-2640U", category="Сетевое оборудование", min_stock=5, optimal_stock=30),
                Product(id="TEL-2345", name="Коммутатор SG-108", category="Сетевое оборудование", min_stock=8, optimal_stock=40),
                Product(id="TEL-6789", name="IP-телефон T46S", category="Телефония", min_stock=15, optimal_stock=60),
                Product(id="TEL-3456", name="Кабель UTP Cat6", category="Кабели", min_stock=100, optimal_stock=500)
            ]
            for product in products:
                db.add(product)
            
            # Создаем тестовых роботов
            robots = [
                Robot(id="RB-001", status="active", battery_level=85, current_zone="A", current_row=12, current_shelf=3),
                Robot(id="RB-002", status="active", battery_level=45, current_zone="B", current_row=5, current_shelf=2),
                Robot(id="RB-003", status="low_battery", battery_level=15, current_zone="C", current_row=8, current_shelf=1),
                Robot(id="RB-004", status="active", battery_level=92, current_zone="D", current_row=15, current_shelf=4),
                Robot(id="RB-005", status="offline", battery_level=0, current_zone="A", current_row=20, current_shelf=5)
            ]
            for robot in robots:
                db.add(robot)
            
            db.commit()
    finally:
        db.close()
    
    yield

# Создание приложения
app = FastAPI(
    title="Умный склад API",
    description="API для системы управления складской логистикой с использованием автономных роботов",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Маршруты
@app.post("/api/auth/login", response_model=LoginResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or not bcrypt.checkpw(user_data.password.encode('utf-8'), user.password_hash.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Неверные учетные данные")
    
    # Создание JWT токена
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(token_data, JWT_SECRET, algorithm="HS256")
    
    return LoginResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role
        )
    )

@app.post("/api/robots/data", response_model=RobotResponse)
async def receive_robot_data(robot_data: RobotData, db: Session = Depends(get_db)):
    # Обновляем информацию о роботе
    robot = db.query(Robot).filter(Robot.id == robot_data.robot_id).first()
    if robot:
        robot.battery_level = robot_data.battery_level
        robot.current_zone = robot_data.location.get("zone")
        robot.current_row = robot_data.location.get("row")
        robot.current_shelf = robot_data.location.get("shelf")
        robot.last_update = datetime.utcnow()
        
        # Определяем статус робота
        if robot_data.battery_level < 20:
            robot.status = "low_battery"
        elif robot_data.battery_level == 0:
            robot.status = "offline"
        else:
            robot.status = "active"
    
    # Сохраняем данные сканирования
    for scan_result in robot_data.scan_results:
        inventory_record = InventoryHistory(
            robot_id=robot_data.robot_id,
            product_id=scan_result.get("product_id"),
            quantity=scan_result.get("quantity"),
            zone=robot_data.location.get("zone"),
            row_number=robot_data.location.get("row"),
            shelf_number=robot_data.location.get("shelf"),
            status=scan_result.get("status"),
            scanned_at=datetime.fromisoformat(robot_data.timestamp.replace('Z', '+00:00'))
        )
        db.add(inventory_record)
    
    db.commit()
    
    # Отправляем обновление через WebSocket
    await manager.broadcast(json.dumps({
        "type": "robot_update",
        "data": {
            "robot_id": robot_data.robot_id,
            "battery_level": robot_data.battery_level,
            "location": robot_data.location,
            "timestamp": robot_data.timestamp
        }
    }))
    
    return RobotResponse(status="received", message_id=f"msg_{datetime.utcnow().timestamp()}")

@app.websocket("/api/ws/dashboard")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Отправляем периодические обновления
            await asyncio.sleep(5)
            await websocket.send_text(json.dumps({
                "type": "heartbeat",
                "timestamp": datetime.utcnow().isoformat()
            }))
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/api/dashboard/current", response_model=DashboardData)
async def get_dashboard_data(db: Session = Depends(get_db)):
    # Получаем данные роботов
    robots = db.query(Robot).all()
    robots_data = []
    for robot in robots:
        robots_data.append({
            "id": robot.id,
            "status": robot.status,
            "battery_level": robot.battery_level,
            "current_zone": robot.current_zone,
            "current_row": robot.current_row,
            "current_shelf": robot.current_shelf,
            "last_update": robot.last_update.isoformat() if robot.last_update else None
        })
    
    # Получаем последние сканирования
    recent_scans = db.query(InventoryHistory).order_by(InventoryHistory.scanned_at.desc()).limit(20).all()
    scans_data = []
    for scan in recent_scans:
        product = db.query(Product).filter(Product.id == scan.product_id).first()
        scans_data.append({
            "time": scan.scanned_at.strftime("%H:%M:%S"),
            "robot_id": scan.robot_id,
            "zone": f"{scan.zone}-{scan.row_number}",
            "product": product.name if product else "Неизвестный товар",
            "sku": scan.product_id,
            "quantity": scan.quantity,
            "status": scan.status
        })
    
    # Статистика
    active_robots = len([r for r in robots if r.status == "active"])
    total_robots = len(robots)
    scanned_today = db.query(InventoryHistory).filter(
        InventoryHistory.scanned_at >= datetime.utcnow().date()
    ).count()
    critical_items = db.query(InventoryHistory).filter(
        InventoryHistory.status == "CRITICAL"
    ).count()
    avg_battery = sum([r.battery_level for r in robots if r.battery_level]) / len([r for r in robots if r.battery_level])
    
    statistics = {
        "activeRobots": active_robots,
        "totalRobots": total_robots,
        "scannedToday": scanned_today,
        "criticalItems": critical_items,
        "avgBattery": round(avg_battery, 1) if avg_battery else 0
    }
    
    return DashboardData(
        robots=robots_data,
        recent_scans=scans_data,
        statistics=statistics
    )

@app.get("/api/inventory/history", response_model=InventoryHistoryResponse)
async def get_inventory_history(
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    zone: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    query = db.query(InventoryHistory)
    
    if from_date:
        query = query.filter(InventoryHistory.scanned_at >= datetime.fromisoformat(from_date))
    if to_date:
        query = query.filter(InventoryHistory.scanned_at <= datetime.fromisoformat(to_date))
    if zone:
        query = query.filter(InventoryHistory.zone == zone)
    if status:
        query = query.filter(InventoryHistory.status == status)
    
    total = query.count()
    items = query.offset(page * limit).limit(limit).all()
    
    items_data = []
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        items_data.append({
            "id": item.id,
            "date": item.scanned_at.isoformat(),
            "robot_id": item.robot_id,
            "zone": f"{item.zone}-{item.row_number}",
            "sku": item.product_id,
            "product": product.name if product else "Неизвестный товар",
            "expected": product.optimal_stock if product else 0,
            "actual": item.quantity,
            "difference": item.quantity - (product.optimal_stock if product else 0),
            "status": item.status
        })
    
    return InventoryHistoryResponse(
        total=total,
        items=items_data,
        pagination={
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit
        }
    )

@app.post("/api/inventory/import", response_model=CSVUploadResponse)
async def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Файл должен быть в формате CSV")
    
    content = await file.read()
    csv_content = content.decode('utf-8')
    
    success_count = 0
    failed_count = 0
    errors = []
    
    try:
        csv_reader = csv.DictReader(io.StringIO(csv_content), delimiter=';')
        
        for row_num, row in enumerate(csv_reader, 1):
            try:
                # Валидация обязательных полей
                required_fields = ['product_id', 'product_name', 'quantity', 'zone', 'date']
                for field in required_fields:
                    if field not in row or not row[field]:
                        raise ValueError(f"Отсутствует обязательное поле: {field}")
                
                # Создание или обновление товара
                product = db.query(Product).filter(Product.id == row['product_id']).first()
                if not product:
                    product = Product(
                        id=row['product_id'],
                        name=row['product_name'],
                        category=row.get('category', 'Неизвестная категория')
                    )
                    db.add(product)
                
                # Создание записи инвентаризации
                inventory_record = InventoryHistory(
                    robot_id=row.get('robot_id', 'MANUAL'),
                    product_id=row['product_id'],
                    quantity=int(row['quantity']),
                    zone=row['zone'],
                    row_number=int(row.get('row', 0)),
                    shelf_number=int(row.get('shelf', 0)),
                    status='OK' if int(row['quantity']) > 20 else ('LOW_STOCK' if int(row['quantity']) > 10 else 'CRITICAL'),
                    scanned_at=datetime.fromisoformat(row['date'])
                )
                db.add(inventory_record)
                success_count += 1
                
            except Exception as e:
                failed_count += 1
                errors.append(f"Строка {row_num}: {str(e)}")
        
        db.commit()
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Ошибка обработки CSV:){str(e)}")
    