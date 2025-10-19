import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import Navigation from './components/Navigation';
import WarehouseMap from './components/WarehouseMap';
import Statistics from './components/Statistics';
import RecentScans from './components/RecentScans';
import AIPredictions from './components/AIPredictions';
import HistoryPage from './components/HistoryPage';
import CSVUploadModal from './components/CSVUploadModal';

const App = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [wsConnected, setWsConnected] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Моковые данные
  const robots = [
    { id: 'RB-001', zone: 'A', row: 12, shelf: 3, battery: 85, status: 'active' },
    { id: 'RB-002', zone: 'B', row: 5, shelf: 2, battery: 45, status: 'active' },
    { id: 'RB-003', zone: 'C', row: 8, shelf: 1, battery: 15, status: 'low_battery' },
    { id: 'RB-004', zone: 'D', row: 15, shelf: 4, battery: 92, status: 'active' },
    { id: 'RB-005', zone: 'A', row: 20, shelf: 5, battery: 0, status: 'offline' }
  ];

  const recentScans = [
    { time: '14:32:15', robotId: 'RB-001', zone: 'A-12', product: 'Роутер RT-AC68U', sku: 'TEL-4567', quantity: 45, status: 'OK' },
    { time: '14:32:08', robotId: 'RB-002', zone: 'B-5', product: 'Модем DSL-2640U', sku: 'TEL-8901', quantity: 12, status: 'LOW' },
    { time: '14:31:55', robotId: 'RB-004', zone: 'D-15', product: 'Коммутатор SG-108', sku: 'TEL-2345', quantity: 5, status: 'CRITICAL' },
    { time: '14:31:42', robotId: 'RB-001', zone: 'A-13', product: 'IP-телефон T46S', sku: 'TEL-6789', quantity: 28, status: 'OK' },
    { time: '14:31:30', robotId: 'RB-003', zone: 'C-8', product: 'Кабель UTP Cat6', sku: 'TEL-3456', quantity: 15, status: 'LOW' }
  ];

  const aiPredictions = [
    { product: 'Модем DSL-2640U', current: 12, daysUntil: 3, recommended: 50 },
    { product: 'Коммутатор SG-108', current: 5, daysUntil: 1, recommended: 100 },
    { product: 'IP-телефон T46S', current: 8, daysUntil: 2, recommended: 75 },
    { product: 'Кабель UTP Cat6', current: 15, daysUntil: 4, recommended: 60 },
    { product: 'Роутер RT-AC68U', current: 45, daysUntil: 7, recommended: 30 }
  ];

  const statistics = {
    activeRobots: 4,
    totalRobots: 5,
    scannedToday: 1247,
    criticalItems: 3,
    avgBattery: 58
  };

  // Проверка авторизации при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setCurrentPage('dashboard');
    }
  }, []);

  // WebSocket симуляция
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused && wsConnected) {
        // Симуляция обновления данных
        console.log('WebSocket update received');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, wsConnected]);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setCurrentPage('login');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleUploadCSV = () => {
    setUploadModalOpen(true);
  };

  const handleCSVUpload = (file) => {
    console.log('Uploading CSV file:', file.name);
    // Здесь будет логика загрузки файла
  };

  const handleAIPredictionRefresh = () => {
    console.log('Refreshing AI predictions...');
    // Здесь будет вызов API для обновления прогнозов
  };

  const DashboardPage = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={handleLogout} />
        <Navigation 
          currentPage={currentPage} 
          onPageChange={handlePageChange}
          onUploadCSV={handleUploadCSV}
        />

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[600px]">
              <WarehouseMap robots={robots} />
            </div>

            <div className="space-y-6">
              <Statistics statistics={statistics} />
              <RecentScans 
                scans={recentScans} 
                isPaused={isPaused} 
                onTogglePause={() => setIsPaused(!isPaused)} 
              />
              <AIPredictions 
                predictions={aiPredictions}
                onRefresh={handleAIPredictionRefresh}
                wsConnected={wsConnected}
              />
            </div>
          </div>
        </div>

        <CSVUploadModal 
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUpload={handleCSVUpload}
        />
      </div>
    );
  };

  return (
    <div>
      {currentPage === 'login' && <LoginPage onLogin={handleLogin} />}
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'history' && (
        <div className="min-h-screen bg-gray-50">
          <Header user={user} onLogout={handleLogout} />
          <Navigation 
            currentPage={currentPage} 
            onPageChange={handlePageChange}
            onUploadCSV={handleUploadCSV}
          />
          <HistoryPage />
        </div>
      )}
    </div>
  );
};

export default App;