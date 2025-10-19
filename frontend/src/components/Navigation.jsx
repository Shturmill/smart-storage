import React from 'react';
import { Upload } from 'lucide-react';

const Navigation = ({ currentPage, onPageChange, onUploadCSV }) => {
  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            <button 
              onClick={() => onPageChange('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                currentPage === 'dashboard' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Текущий мониторинг
            </button>
            <button 
              onClick={() => onPageChange('history')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                currentPage === 'history' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Исторические данные
            </button>
          </div>
          <button 
            onClick={onUploadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Upload className="w-4 h-4" />
            Загрузить CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
