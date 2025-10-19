import React, { useState } from 'react';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import StatusBadge from './StatusBadge';

const HistoryPage = () => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    zones: [],
    categories: [],
    statuses: ['OK', 'LOW', 'CRITICAL'],
    search: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState([]);

  // Моковые данные для демонстрации
  const historyData = [
    {
      id: 1,
      date: '2024-03-15 14:32:15',
      robotId: 'RB-001',
      zone: 'A-12',
      sku: 'TEL-4567',
      product: 'Роутер RT-AC68U',
      expected: 50,
      actual: 45,
      difference: -5,
      status: 'OK'
    },
    {
      id: 2,
      date: '2024-03-15 14:32:08',
      robotId: 'RB-002',
      zone: 'B-5',
      sku: 'TEL-8901',
      product: 'Модем DSL-2640U',
      expected: 20,
      actual: 12,
      difference: -8,
      status: 'LOW'
    },
    {
      id: 3,
      date: '2024-03-15 14:31:55',
      robotId: 'RB-004',
      zone: 'D-15',
      sku: 'TEL-2345',
      product: 'Коммутатор SG-108',
      expected: 10,
      actual: 5,
      difference: -5,
      status: 'CRITICAL'
    }
  ];

  const summaryStats = {
    totalChecks: 1247,
    uniqueProducts: 156,
    discrepancies: 23,
    avgInventoryTime: 12.5
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === historyData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(historyData.map(item => item.id));
    }
  };

  const handleExport = (format) => {
    console.log(`Экспорт в ${format} для записей:`, selectedRows);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Панель фильтров */}
      <div className="bg-white border-b p-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">От</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">До</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Зоны</label>
              <select
                multiple
                value={filters.zones}
                onChange={(e) => handleFilterChange('zones', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">Зона A</option>
                <option value="B">Зона B</option>
                <option value="C">Зона C</option>
                <option value="D">Зона D</option>
                <option value="E">Зона E</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
              <div className="space-y-1">
                {['OK', 'LOW', 'CRITICAL'].map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes(status)}
                      onChange={(e) => {
                        const newStatuses = e.target.checked
                          ? [...filters.statuses, status]
                          : filters.statuses.filter(s => s !== status);
                        handleFilterChange('statuses', newStatuses);
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Поиск по артикулу или названию..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <Filter className="w-4 h-4" />
              Применить
            </button>
            <button 
              onClick={() => setFilters({
                dateFrom: '',
                dateTo: '',
                zones: [],
                categories: [],
                statuses: ['OK', 'LOW', 'CRITICAL'],
                search: ''
              })}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>

      {/* Сводная статистика */}
      <div className="bg-white border-b p-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{summaryStats.totalChecks}</div>
              <div className="text-sm text-gray-600">Всего проверок</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{summaryStats.uniqueProducts}</div>
              <div className="text-sm text-gray-600">Уникальных товаров</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summaryStats.discrepancies}</div>
              <div className="text-sm text-gray-600">Выявлено расхождений</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{summaryStats.avgInventoryTime}</div>
              <div className="text-sm text-gray-600">Среднее время (мин)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Основная таблица */}
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Исторические данные</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleExport('excel')}
                  disabled={selectedRows.length === 0}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
                <button 
                  onClick={() => handleExport('pdf')}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === historyData.length}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата и время</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID робота</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Зона</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Артикул</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ожидаемое</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Фактическое</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Расхождение</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historyData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.id)}
                        onChange={() => handleSelectRow(item.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.robotId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.zone}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.sku}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.product}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.expected}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.actual}</td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${
                      item.difference < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {item.difference > 0 ? '+' : ''}{item.difference}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Записей на странице:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Назад
              </button>
              <span className="text-sm text-gray-700">
                Страница {page + 1} из {Math.ceil(historyData.length / rowsPerPage)}
              </span>
              <button 
                onClick={() => setPage(Math.min(Math.ceil(historyData.length / rowsPerPage) - 1, page + 1))}
                disabled={page >= Math.ceil(historyData.length / rowsPerPage) - 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Вперед
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
