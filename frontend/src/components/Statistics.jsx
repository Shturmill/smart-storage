import React from 'react';

const Statistics = ({ statistics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-gray-500 text-xs mb-1">Активных роботов</div>
        <div className="text-2xl font-bold text-gray-800">
          {statistics.activeRobots}/{statistics.totalRobots}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-gray-500 text-xs mb-1">Проверено сегодня</div>
        <div className="text-2xl font-bold text-gray-800">{statistics.scannedToday}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-gray-500 text-xs mb-1">Критических</div>
        <div className="text-2xl font-bold text-red-600">{statistics.criticalItems}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-gray-500 text-xs mb-1">Средний заряд</div>
        <div className="text-2xl font-bold text-gray-800">{statistics.avgBattery}%</div>
      </div>
    </div>
  );
};

export default Statistics;
