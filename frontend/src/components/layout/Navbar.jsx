import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Menu } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-100 shadow-neumorphic border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-kalam-orange to-kalam-blue rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">TK</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Todays Kalam</h1>
              <p className="text-xs text-gray-600">Foundation Dashboard</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 neumorphic-card px-3 py-2">
            <User className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
              {user?.role}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
