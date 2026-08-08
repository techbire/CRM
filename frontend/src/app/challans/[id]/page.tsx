'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';
import { CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ChallanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [challan, setChallan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchChallan();
  }, [params.id]);

  const fetchChallan = async () => {
    try {
      const res = await api.get(`/challans/${params.id}`);
      setChallan(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load challan details');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    setError('');
    
    try {
      const res = await api.post(`/challans/${params.id}/confirm`);
      setSuccess('Challan confirmed successfully! Stock has been deducted.');
      setChallan(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to confirm challan');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!challan) return <div className="error-text">Challan not found.</div>;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/challans" className="flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Challans
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="page-title" style={{ margin: 0 }}>
            Challan {challan.challan_number}
          </h1>
          <span className={`badge ${challan.status}`} style={{ fontSize: '1rem', padding: '0.25rem 0.75rem' }}>
            {challan.status}
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem', padding: '1rem', background: '#d1fae5', color: '#065f46', borderRadius: '8px' }}>
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      <div className="flex gap-6">
        <div className="card flex-1" style={{ alignSelf: 'flex-start' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Customer Details</h2>
          <div className="flex flex-col gap-2">
            <div><span style={{ color: 'var(--text-secondary)' }}>Business Name:</span> <strong>{challan.customer?.business_name}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Contact Person:</span> {challan.customer?.name}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Mobile:</span> {challan.customer?.mobile}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Address:</span> {challan.customer?.address}</div>
          </div>
        </div>

        <div className="card flex-1" style={{ alignSelf: 'flex-start' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Challan Info</h2>
          <div className="flex flex-col gap-2">
            <div><span style={{ color: 'var(--text-secondary)' }}>Created By:</span> {challan.created_by}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Date:</span> {format(new Date(challan.created_at), 'dd MMM yyyy HH:mm')}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Total Items:</span> {challan.total_quantity}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Products (Snapshot)</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {challan.items.map((item: any) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>{item.product_name_snapshot}</td>
                  <td>{item.sku_snapshot}</td>
                  <td>₹{item.unit_price_snapshot}</td>
                  <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                  <td>₹{item.unit_price_snapshot * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {challan.status === 'Draft' && (user?.role === 'Admin' || user?.role === 'Sales') && (
        <div className="flex justify-end pt-6" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <button 
            onClick={handleConfirm} 
            disabled={confirming} 
            className="btn-primary flex items-center gap-2"
            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
          >
            <CheckCircle size={20} /> {confirming ? 'Confirming...' : 'Confirm Challan & Deduct Stock'}
          </button>
        </div>
      )}
    </div>
  );
}
