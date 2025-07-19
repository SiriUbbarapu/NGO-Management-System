import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onMenuToggle={toggleSidebar} />
      
      <div className="flex">
        {user?.role === 'admin' && (
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        )}
        
        <main className={`flex-1 p-6 ${user?.role === 'admin' ? 'lg:ml-64' : ''}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
