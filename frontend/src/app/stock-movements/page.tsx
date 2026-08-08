'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function StockMovementsPage() {
  const [movements, setMovements] = useState([]);
  
  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    try {
      const res = await api.get('/stock-movements');
      setMovements(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Stock Movements</h1>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Reason</th>
                <th>User</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {movements.length > 0 ? (
                movements.map((m: any) => (
                  <tr key={m.id}>
                    <td>
                      {m.movement_type === 'IN' ? (
                        <span className="badge" style={{ background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', gap: '4px', width: 'max-content' }}>
                          <ArrowDownLeft size={14} /> IN
                        </span>
                      ) : (
                        <span className="badge" style={{ background: '#fee2e2', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '4px', width: 'max-content' }}>
                          <ArrowUpRight size={14} /> OUT
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 500 }}>{m.product?.name} <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 400 }}>({m.product?.sku})</span></td>
                    <td style={{ fontWeight: 600 }}>{m.quantity}</td>
                    <td>{m.reason}</td>
                    <td>{m.created_by}</td>
                    <td>{format(new Date(m.created_at), 'dd MMM yyyy HH:mm')}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No stock movements found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
