import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  GraduationCap, 
  Heart, 
  BarChart3, 
  X 
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, roles: ['admin'] },
    { name: 'Families', href: '/families', icon: Users, roles: ['admin', 'tutor'] },
    { name: 'Students', href: '/students', icon: GraduationCap, roles: ['admin', 'tutor'] },
    { name: 'Women Skills', href: '/women', icon: Heart, roles: ['admin', 'tutor'] },
    { name: 'Analytics', href: '/admin/dashboard', icon: BarChart3, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-gray-100 shadow-neumorphic-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-primary-500 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-200 neumorphic-button"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
