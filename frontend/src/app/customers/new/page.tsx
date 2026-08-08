'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewCustomerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', business_name: '', gst_number: '', 
    customer_type: 'Retail', address: '', status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/customers', formData);
      router.push('/customers');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/customers" className="flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Customers
        </Link>
        <h1 className="page-title" style={{ margin: 0 }}>Add New Customer</h1>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        {error && <div className="error-text" style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '6px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="label">Contact Name *</label>
              <input type="text" className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="flex-1">
              <label className="label">Business Name *</label>
              <input type="text" className="input-field" required value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="label">Mobile Number *</label>
              <input type="text" className="input-field" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
            </div>
            <div className="flex-1">
              <label className="label">Email Address *</label>
              <input type="email" className="input-field" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="label">Customer Type</label>
              <select className="input-field" value={formData.customer_type} onChange={e => setFormData({...formData, customer_type: e.target.value})}>
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Distributor">Distributor</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="label">GST Number</label>
              <input type="text" className="input-field" value={formData.gst_number} onChange={e => setFormData({...formData, gst_number: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="label">Address *</label>
            <textarea className="input-field" required rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <Save size={18} /> {loading ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
