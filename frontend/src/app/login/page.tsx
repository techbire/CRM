'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/utils/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { setUser } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data.user, response.data.token);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
      <div className="card" style={{ width: '400px', padding: '2.5rem' }}>
        <h1 className="page-title text-center" style={{ marginBottom: '0.5rem' }}>Mini ERP Portal</h1>
        <p className="text-center" style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Sign in to your account</p>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="label">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="admin@erp.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="••••••••"
            />
          </div>
          
          {error && <div className="error-text">{error}</div>}
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <p><strong>Test Accounts:</strong></p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li>admin@erp.com</li>
            <li>sales@erp.com</li>
            <li>warehouse@erp.com</li>
            <li>accounts@erp.com</li>
          </ul>
          <p style={{ marginTop: '0.5rem' }}>Password for all: <strong>password123</strong></p>
        </div>
      </div>
    </div>
  );
}
