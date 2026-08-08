'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, Users, Box, ArrowLeftRight, FileText, LogOut, Menu } from 'lucide-react';
import './AdminLayout.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, initAuth, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    initAuth();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname]);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user && pathname === '/login') return <>{children}</>;
  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { label: 'Customers', path: '/customers', icon: <Users size={20} /> },
    { label: 'Products', path: '/products', icon: <Box size={20} /> },
    { label: 'Stock Movements', path: '/stock-movements', icon: <ArrowLeftRight size={20} /> },
    { label: 'Sales Challans', path: '/challans', icon: <FileText size={20} /> },
  ];

  return (
    <div className="admin-layout flex h-screen">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header flex items-center justify-between">
          <h2>Mini ERP</h2>
        </div>
        <nav className="sidebar-nav flex flex-col">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`nav-item ${pathname === item.path ? 'active' : ''} flex items-center gap-2`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content flex flex-col w-full h-full">
        {/* Topbar */}
        <div className="topbar flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="menu-btn">
            <Menu size={24} />
          </button>
          
          <div className="user-info flex items-center gap-4">
            <div className="text-right">
              <div className="user-name font-medium">{user.name}</div>
              <div className="user-role badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>{user.role}</div>
            </div>
            <button onClick={handleLogout} className="logout-btn flex items-center gap-2">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
