'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';
import { Plus, Search, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Products & Inventory</h1>
        {(user?.role === 'Admin' || user?.role === 'Warehouse') && (
          <div className="flex gap-2">
            <Link href="/stock-movements/add" className="btn-secondary flex items-center gap-2">
              <Plus size={18} /> Add Stock
            </Link>
            <Link href="/products/new" className="btn-primary flex items-center gap-2">
              <Plus size={18} /> Add Product
            </Link>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center gap-4" style={{ marginBottom: '1.5rem' }}>
          <div className="flex items-center gap-2 w-full" style={{ maxWidth: '400px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
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
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p: any) => {
                  const isLowStock = p.current_stock <= p.minimum_stock;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td>{p.sku}</td>
                      <td>{p.category}</td>
                      <td>₹{p.unit_price}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span style={{ fontWeight: 600, color: isLowStock ? 'var(--danger-color)' : 'inherit' }}>
                            {p.current_stock}
                          </span>
                          {isLowStock && <span title="Low Stock" style={{ display: 'flex' }}><AlertCircle size={16} color="var(--danger-color)" /></span>}
                        </div>
                      </td>
                      <td>{p.location}</td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
