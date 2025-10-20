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
  const [wsConnected, setWsConnected] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [robots, setRobots] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [statistics, setStatistics] = useState({
    activeRobots: 0,
    totalRobots: 0,
    scannedToday: 0,
    criticalItems: 0,
    avgBattery: 0
  });
  const [aiPredictions, setAiPredictions] = useState([]);

  // Проверка авторизации при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setCurrentPage('dashboard');
    }
  }, []);

  // Подключение WebSocket и первичная загрузка данных
  useEffect(() => {
    if (currentPage !== 'dashboard') return;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://${window.location.host}/api/ws/dashboard`);
    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);
    ws.onmessage = (event) => {
      if (isPaused) return;
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'robot_update') {
          // Приходят обновления — перезагружаем текущие данные
          fetchDashboard();
        }
      } catch {}
    };
    fetchDashboard();
    return () => ws.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, isPaused]);

  const fetchDashboard = async () => {
    try {
      const resp = await fetch(`/api/dashboard/current`);
      const data = await resp.json();
      setRobots(data.robots.map(r => ({ id: r.id, zone: r.current_zone, row: r.current_row, shelf: r.current_shelf, battery: r.battery_level, status: r.status })));
      setRecentScans(data.recent_scans.map(s => ({ time: s.time, robotId: s.robot_id, zone: s.zone, product: s.product, sku: s.sku, quantity: s.quantity, status: s.status })));
      setStatistics(data.statistics);
    } catch (e) {
      console.error(e);
    }
  };

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

  const handleCSVUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    await fetch(`/api/inventory/import`, {
      method: 'POST',
      body: formData
    });
    fetchDashboard();
  };

  const handleAIPredictionRefresh = async () => {
    try {
      const resp = await fetch(`/api/ai/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period_days: 7, categories: [] })
      });
      const data = await resp.json();
      setAiPredictions(
        data.predictions.map(p => ({
          product: p.product_name || p.product_id,
          current: p.current_stock || 0,
          daysUntil: p.days_until_stockout,
          recommended: p.recommended_order_quantity
        }))
      );
    } catch (e) { console.error(e); }
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