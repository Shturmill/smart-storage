import React from 'react';
import { RefreshCw } from 'lucide-react';

const AIPredictions = ({ predictions, onRefresh, wsConnected }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Прогноз ИИ на следующие 7 дней</h2>
        <button 
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
          Обновить
        </button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Товар</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Текущий</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Дней до 0</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Заказать</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((pred, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50">
              <td className="px-3 py-2">{pred.product}</td>
              <td className="px-3 py-2 text-right">{pred.current}</td>
              <td className="px-3 py-2 text-right">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  pred.daysUntil <= 1 ? 'bg-red-100 text-red-800' :
                  pred.daysUntil <= 3 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {pred.daysUntil}
                </span>
              </td>
              <td className="px-3 py-2 text-right font-medium">{pred.recommended}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="text-xs text-gray-500">Достоверность прогноза: 87%</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">WebSocket:</span>
          <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
      </div>
    </div>
  );
};

export default AIPredictions;
