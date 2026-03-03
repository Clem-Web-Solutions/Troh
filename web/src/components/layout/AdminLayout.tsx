import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { cn } from '../ui';

export function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        role="admin"
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        "md:ml-64",
        "min-h-screen flex flex-col w-full"
      )}>
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 font-bold text-lg sm:text-xl text-slate-600">
            <span className="text-red-600">TROH</span> Immo
          </div>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-x-hidden w-full p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 animate-in fade-in duration-500">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
