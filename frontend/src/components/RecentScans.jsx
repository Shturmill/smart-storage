import React from 'react';
import { Pause, Play } from 'lucide-react';
import StatusBadge from './StatusBadge';

const RecentScans = ({ scans, isPaused, onTogglePause }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Последние сканирования</h2>
        <button 
          onClick={onTogglePause}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title={isPaused ? 'Возобновить обновления' : 'Приостановить обновления'}
        >
          {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
        </button>
      </div>
      <div className="overflow-auto" style={{ maxHeight: '200px' }}>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Время</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Робот</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Зона</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Товар</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Кол-во</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Статус</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((scan, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">{scan.time}</td>
                <td className="px-3 py-2">{scan.robotId}</td>
                <td className="px-3 py-2">{scan.zone}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{scan.product}</div>
                  <div className="text-xs text-gray-500">{scan.sku}</div>
                </td>
                <td className="px-3 py-2 text-right">{scan.quantity}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={scan.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentScans;
