import React from 'react';
import { Check, AlertTriangle, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const config = {
    OK: { label: 'OK', bg: 'bg-green-100', text: 'text-green-800', icon: Check },
    LOW: { label: 'Низкий остаток', bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle },
    CRITICAL: { label: 'Критично', bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
  };
  
  const { label, bg, text, icon: Icon } = config[status] || config.OK;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
};

export default StatusBadge;
