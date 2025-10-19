import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Target } from 'lucide-react';

const WarehouseMap = ({ robots, onRobotHover }) => {
  const [zoom, setZoom] = useState(1);
  const [hoveredRobot, setHoveredRobot] = useState(null);

  const zones = ['A', 'B', 'C', 'D', 'E'];
  
  const getRobotColor = (robot) => {
    if (robot.status === 'offline') return '#ef4444';
    if (robot.status === 'low_battery') return '#f59e0b';
    return '#10b981';
  };

  const handleRobotHover = (robot) => {
    setHoveredRobot(robot);
    if (onRobotHover) onRobotHover(robot);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Карта склада</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Увеличить"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Уменьшить"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setZoom(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Сбросить масштаб"
          >
            <Target className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="overflow-auto border rounded-lg relative" style={{ height: 'calc(100% - 60px)' }}>
        <svg width={600 * zoom} height={400 * zoom}>
          {/* Сетка зон */}
          {zones.map((zone, zoneIdx) => (
            Array.from({ length: 4 }).map((_, rowIdx) => (
              <rect
                key={`${zone}-${rowIdx}`}
                x={zoneIdx * 120 * zoom}
                y={rowIdx * 100 * zoom}
                width={110 * zoom}
                height={90 * zoom}
                fill="#f9fafb"
                stroke="#e5e7eb"
                strokeWidth={1}
              />
            ))
          ))}
          
          {/* Подписи зон */}
          {zones.map((zone, idx) => (
            <text
              key={zone}
              x={idx * 120 * zoom + 55 * zoom}
              y={20 * zoom}
              textAnchor="middle"
              fontSize={14 * zoom}
              fontWeight="bold"
              fill="#374151"
            >
              {zone}
            </text>
          ))}

          {/* Роботы */}
          {robots.map((robot) => {
            const zoneIdx = zones.indexOf(robot.zone);
            const x = zoneIdx * 120 * zoom + (robot.shelf * 10 * zoom);
            const y = (robot.row / 5) * 100 * zoom + 40 * zoom;
            
            return (
              <g key={robot.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={12 * zoom}
                  fill={getRobotColor(robot)}
                  stroke="white"
                  strokeWidth={2 * zoom}
                  onMouseEnter={() => handleRobotHover(robot)}
                  onMouseLeave={() => setHoveredRobot(null)}
                  style={{ cursor: 'pointer' }}
                />
                <text
                  x={x}
                  y={y + 4 * zoom}
                  textAnchor="middle"
                  fontSize={10 * zoom}
                  fill="white"
                  fontWeight="bold"
                >
                  {robot.id.split('-')[1]}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* Tooltip для робота */}
        {hoveredRobot && (
          <div className="absolute bg-white shadow-lg rounded-lg p-3 mt-2 border z-10">
            <div className="text-sm font-semibold">{hoveredRobot.id}</div>
            <div className="text-xs text-gray-600">Зона: {hoveredRobot.zone}-{hoveredRobot.row}</div>
            <div className="text-xs text-gray-600">Батарея: {hoveredRobot.battery}%</div>
            <div className="text-xs text-gray-600">Статус: {hoveredRobot.status}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseMap;
