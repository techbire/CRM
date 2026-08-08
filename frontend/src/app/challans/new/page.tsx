'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { Trash2, Plus, Save } from 'lucide-react';

export default function CreateChallanPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('/customers'),
          api.get('/products')
        ]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSaveDraft = async () => {
    setError('');
    
    if (!selectedCustomer) return setError('Please select a customer.');
    if (items.length === 0) return setError('Please add at least one item.');
    
    // Validate items
    for (let i = 0; i < items.length; i++) {
      if (!items[i].product_id) return setError(`Please select a product for item ${i + 1}.`);
      if (items[i].quantity <= 0) return setError(`Quantity must be greater than 0 for item ${i + 1}.`);
    }

    setLoading(true);
    try {
      const res = await api.post('/challans', {
        customer_id: selectedCustomer,
        items: items.map(i => ({ product_id: i.product_id, quantity: Number(i.quantity) }))
      });
      router.push(`/challans/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create challan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Create Sales Challan</h1>
      
      <div className="card" style={{ maxWidth: '800px' }}>
        {error && <div className="error-text" style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '6px' }}>{error}</div>}
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label">Select Customer</label>
          <select 
            className="input-field"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">-- Select Customer --</option>
            {customers.map((c: any) => (
              <option key={c.id} value={c.id}>{c.business_name} ({c.name})</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
            <label className="label" style={{ margin: 0 }}>Products</label>
            <button onClick={addItem} className="btn-secondary flex items-center gap-2" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
              <Plus size={16} /> Add Product
            </button>
          </div>
          
          {items.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-color)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
              No products added yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item, index) => (
                <div key={index} className="flex items-end gap-4" style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px' }}>
                  <div className="flex-1">
                    <label className="label">Product</label>
                    <select 
                      className="input-field"
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.current_stock})</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ width: '120px' }}>
                    <label className="label">Quantity</label>
                    <input 
                      type="number" 
                      min="1"
                      className="input-field"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <button onClick={() => removeItem(index)} style={{ color: 'var(--danger-color)', padding: '0.5rem' }}>
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button onClick={handleSaveDraft} disabled={loading} className="btn-primary flex items-center gap-2">
            <Save size={18} /> {loading ? 'Saving...' : 'Save as Draft'}
          </button>
        </div>
      </div>
    </div>
  );
}
