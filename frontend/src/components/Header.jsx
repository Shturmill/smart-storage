import React from 'react';
import { Package, LogOut } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  return (
    <div className="bg-blue-600 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8" />
            <h1 className="text-xl font-bold">Умный склад - Ростелеком</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs opacity-90">{user.role}</div>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-blue-700 rounded-lg transition"
              title="Выйти из системы"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
