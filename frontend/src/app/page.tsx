'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/utils/api';
import { Users, Box, AlertTriangle, FileText } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    lowStock: 0,
    draftChallans: 0
  });
  const [recentChallans, setRecentChallans] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [customers, products, challans] = await Promise.all([
          api.get('/customers'),
          api.get('/products'),
          api.get('/challans')
        ]);

        const lowStock = products.data.filter((p: any) => p.current_stock <= p.minimum_stock);
        const drafts = challans.data.filter((c: any) => c.status === 'Draft');

        setStats({
          customers: customers.data.length,
          products: products.data.length,
          lowStock: lowStock.length,
          draftChallans: drafts.length
        });

        setRecentChallans(challans.data.slice(0, 5));
        setLowStockProducts(lowStock.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { title: 'Total Customers', value: stats.customers, icon: <Users size={24} color="#4f46e5" />, bg: '#e0e7ff' },
    { title: 'Total Products', value: stats.products, icon: <Box size={24} color="#10b981" />, bg: '#d1fae5' },
    { title: 'Low Stock Alerts', value: stats.lowStock, icon: <AlertTriangle size={24} color="#f59e0b" />, bg: '#fef3c7' },
    { title: 'Draft Challans', value: stats.draftChallans, icon: <FileText size={24} color="#ef4444" />, bg: '#fee2e2' },
  ];

  return (
    <div>
      <h1 className="page-title">Welcome back, {user?.name}</h1>
      
      <div className="flex gap-6" style={{ marginBottom: '2rem' }}>
        {statCards.map((card, idx) => (
          <div key={idx} className="card flex-1 flex items-center gap-4">
            <div style={{ background: card.bg, padding: '1rem', borderRadius: '12px' }}>
              {card.icon}
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{card.title}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        <div className="card flex-1">
          <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent Challans</h2>
            <Link href="/challans" style={{ color: 'var(--primary-color)', fontSize: '0.875rem', fontWeight: 500 }}>View All</Link>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Challan No</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentChallans.length > 0 ? (
                  recentChallans.map((c: any) => (
                    <tr key={c.id}>
                      <td><Link href={`/challans/${c.id}`} style={{ fontWeight: 500, color: 'var(--primary-color)' }}>{c.challan_number}</Link></td>
                      <td>{c.customer?.business_name || c.customer?.name}</td>
                      <td><span className={`badge ${c.status}`}>{c.status}</span></td>
                      <td>{format(new Date(c.created_at), 'dd MMM yyyy')}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No recent challans found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card flex-1">
          <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Low Stock Products</h2>
            <Link href="/products" style={{ color: 'var(--primary-color)', fontSize: '0.875rem', fontWeight: 500 }}>View Inventory</Link>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((p: any) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.sku}</td>
                      <td>
                        <span style={{ color: 'var(--danger-color)', fontWeight: 600 }}>{p.current_stock}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginLeft: '4px' }}>(Min: {p.minimum_stock})</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>All products have sufficient stock.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
