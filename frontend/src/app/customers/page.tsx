'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function CustomersPage() {
  const { user } = useAuthStore();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredCustomers = customers.filter((c: any) => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.business_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Customers</h1>
        {(user?.role === 'Admin' || user?.role === 'Sales') && (
          <Link href="/customers/new" className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Customer
          </Link>
        )}
      </div>

      <div className="card">
        <div className="flex items-center gap-4" style={{ marginBottom: '1.5rem' }}>
          <div className="flex items-center gap-2 w-full" style={{ maxWidth: '400px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search customers..." 
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
                <th>Customer</th>
                <th>Business</th>
                <th>Type</th>
                <th>Status</th>
                <th>Follow-up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c: any) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.mobile}</div>
                    </td>
                    <td>{c.business_name}</td>
                    <td>{c.customer_type}</td>
                    <td><span className={`badge ${c.status}`}>{c.status}</span></td>
                    <td>{c.follow_up_date ? format(new Date(c.follow_up_date), 'dd MMM yyyy') : '-'}</td>
                    <td>
                      <Link href={`/customers/${c.id}`} style={{ color: 'var(--primary-color)', fontWeight: 500, fontSize: '0.875rem' }}>
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
