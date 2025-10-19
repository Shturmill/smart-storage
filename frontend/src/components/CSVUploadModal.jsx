import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const CSVUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file && onUpload) {
      onUpload(file);
      setFile(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Загрузка данных инвентаризации</h2>
        </div>
        <div className="p-6">
          <div 
            className={`border-2 border-dashed rounded-lg p-12 text-center transition cursor-pointer ${
              dragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 bg-gray-50 hover:border-blue-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {file ? file.name : 'Перетащите CSV файл сюда или нажмите для выбора'}
            </h3>
            <div className="text-sm text-gray-500 mt-4">
              <div>Формат: CSV с разделителем ";"</div>
              <div>Кодировка: UTF-8</div>
              <div>Обязательные колонки: product_id, product_name, quantity, zone, date</div>
            </div>
            <input
              id="file-input"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          
          {file && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-800">
                <strong>Выбран файл:</strong> {file.name}
              </div>
              <div className="text-xs text-green-600 mt-1">
                Размер: {(file.size / 1024).toFixed(2)} KB
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
          >
            Отмена
          </button>
          <button 
            onClick={handleUpload}
            disabled={!file}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Загрузить
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSVUploadModal;
