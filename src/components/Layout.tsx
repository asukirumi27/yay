import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, List, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

export default function Layout({ setUserId }: { setUserId: (id: string | null) => void }) {
  const location = useLocation();

  const handleLogout = () => {
    setUserId(null);
  };

  const navItems = [
    { path: '/', label: 'หน้าหลัก', icon: Home },
    { path: '/add', label: 'เพิ่มรายการ', icon: PlusCircle },
    { path: '/transactions', label: 'ประวัติ', icon: List },
  ];

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col md:flex-row font-sans text-slate-800">
      {/* Sidebar / Bottom Nav */}
      <nav className="fixed bottom-0 w-full md:relative md:w-64 bg-white shadow-lg md:shadow-none md:border-r border-rose-100 z-50">
        <div className="flex flex-col h-full">
          <div className="hidden md:flex items-center justify-center h-20 border-b border-rose-100">
            <h1 className="text-2xl font-bold text-rose-500 tracking-tight">FoodShop✨</h1>
          </div>
          
          <div className="flex-1 flex md:flex-col justify-around md:justify-start p-2 md:p-4 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-rose-100 text-rose-600 shadow-sm' 
                      : 'text-slate-500 hover:bg-rose-50 hover:text-rose-500'
                  }`}
                >
                  <Icon size={24} className={isActive ? 'animate-bounce' : ''} />
                  <span className="text-xs md:text-base font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:block p-4 border-t border-rose-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-3 w-full rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors"
            >
              <LogOut size={24} />
              <span className="font-medium">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
