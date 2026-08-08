'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function ChallansPage() {
  const { user } = useAuthStore();
  const [challans, setChallans] = useState([]);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetchChallans();
  }, []);

  const fetchChallans = async () => {
    try {
      const res = await api.get('/challans');
      setChallans(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredChallans = challans.filter((c: any) => 
    c.challan_number.toLowerCase().includes(search.toLowerCase()) || 
    (c.customer?.business_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Sales Challans</h1>
        {(user?.role === 'Admin' || user?.role === 'Sales') && (
          <Link href="/challans/new" className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Create Challan
          </Link>
        )}
      </div>

      <div className="card">
        <div className="flex items-center gap-4" style={{ marginBottom: '1.5rem' }}>
          <div className="flex items-center gap-2 w-full" style={{ maxWidth: '400px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search challan no or customer..." 
              className="input-field" 
              style={{ paddingLeft: '2.5rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Challan No</th>
                <th>Customer</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChallans.length > 0 ? (
                filteredChallans.map((c: any) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.challan_number}</td>
                    <td>{c.customer?.business_name || c.customer?.name}</td>
                    <td>{c.total_quantity}</td>
                    <td><span className={`badge ${c.status}`}>{c.status}</span></td>
                    <td>{c.created_by}</td>
                    <td>{format(new Date(c.created_at), 'dd MMM yyyy')}</td>
                    <td>
                      <Link href={`/challans/${c.id}`} style={{ color: 'var(--primary-color)', fontWeight: 500, fontSize: '0.875rem' }}>
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No challans found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
