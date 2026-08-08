'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

export default function AddStockPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product_id: '', quantity: '', reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/stock-movements', {
        product_id: formData.product_id,
        quantity: Number(formData.quantity),
        reason: formData.reason
      });
      router.push('/products');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add stock');
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
        <h1 className="page-title" style={{ margin: 0 }}>Add IN Stock</h1>
      </div>

      <div className="card" style={{ maxWidth: '500px' }}>
        {error && <div className="error-text" style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '6px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Product *</label>
            <select className="input-field" required value={formData.product_id} onChange={e => setFormData({...formData, product_id: e.target.value})}>
              <option value="">-- Select Product --</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} (Current: {p.current_stock})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Quantity to Add (IN) *</label>
            <input type="number" min="1" className="input-field" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
          </div>

          <div>
            <label className="label">Reason / Reference *</label>
            <input type="text" className="input-field" required placeholder="e.g. New Purchase PO-1234" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading || !formData.product_id} className="btn-primary flex items-center gap-2">
              <Plus size={18} /> {loading ? 'Adding...' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
