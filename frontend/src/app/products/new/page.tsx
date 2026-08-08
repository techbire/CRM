'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', unit_price: '', current_stock: '', minimum_stock: '', location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/products', formData);
      router.push('/products');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/products" className="flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <h1 className="page-title" style={{ margin: 0 }}>Add New Product</h1>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        {error && <div className="error-text" style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '6px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="label">Product Name *</label>
              <input type="text" className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="flex-1">
              <label className="label">SKU / Code *</label>
              <input type="text" className="input-field" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="label">Category *</label>
              <input type="text" className="input-field" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            </div>
            <div className="flex-1">
              <label className="label">Unit Price (₹) *</label>
              <input type="number" min="0" className="input-field" required value={formData.unit_price} onChange={e => setFormData({...formData, unit_price: e.target.value})} />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="label">Initial Stock</label>
              <input type="number" min="0" className="input-field" value={formData.current_stock} onChange={e => setFormData({...formData, current_stock: e.target.value})} />
            </div>
            <div className="flex-1">
              <label className="label">Minimum Stock Alert</label>
              <input type="number" min="0" className="input-field" value={formData.minimum_stock} onChange={e => setFormData({...formData, minimum_stock: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="label">Warehouse Location *</label>
            <input type="text" className="input-field" required placeholder="e.g. A-12" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <Save size={18} /> {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
