'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Save, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function CustomerDetailsPage() {
  const params = useParams();
  const { user } = useAuthStore();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [params.id]);

  const fetchCustomer = async () => {
    try {
      const res = await api.get(`/customers/${params.id}`);
      setCustomer(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    
    setSavingNote(true);
    try {
      const res = await api.post(`/customers/${params.id}/followups`, { note });
      // update local state
      setCustomer({
        ...customer,
        followUps: [res.data, ...customer.followUps]
      });
      setNote('');
    } catch (err) {
      console.error(err);
      alert('Failed to add note');
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!customer) return <div className="error-text">Customer not found.</div>;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/customers" className="flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Customers
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="page-title" style={{ margin: 0 }}>
            {customer.business_name}
          </h1>
          <span className={`badge ${customer.status}`} style={{ fontSize: '1rem', padding: '0.25rem 0.75rem' }}>
            {customer.status}
          </span>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="card flex-1" style={{ alignSelf: 'flex-start' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Customer Profile</h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-secondary">Contact Name</span>
              <strong className="font-medium">{customer.name}</strong>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-secondary">Mobile</span>
              <span>{customer.mobile}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-secondary">Email</span>
              <span>{customer.email}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-secondary">Type</span>
              <span>{customer.customer_type}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-secondary">GST Number</span>
              <span>{customer.gst_number || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-secondary">Address</span>
              <span style={{ textAlign: 'right', maxWidth: '60%' }}>{customer.address}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <div className="card">
            <h2 className="flex items-center gap-2" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
              <MessageSquare size={18} /> Follow-up Notes
            </h2>
            
            {(user?.role === 'Admin' || user?.role === 'Sales') && (
              <form onSubmit={handleAddNote} style={{ marginBottom: '1.5rem' }}>
                <textarea 
                  className="input-field" 
                  rows={3} 
                  placeholder="Add a new follow-up note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ resize: 'none', marginBottom: '0.5rem' }}
                ></textarea>
                <div className="flex justify-end">
                  <button type="submit" className="btn-primary flex items-center gap-2" disabled={savingNote || !note.trim()}>
                    <Save size={16} /> {savingNote ? 'Saving...' : 'Save Note'}
                  </button>
                </div>
              </form>
            )}

            <div className="flex flex-col gap-4">
              {customer.followUps?.length > 0 ? (
                customer.followUps.map((f: any) => (
                  <div key={f.id} style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', borderLeft: '3px solid var(--primary-color)' }}>
                    <p style={{ margin: '0 0 0.5rem 0' }}>{f.note}</p>
                    <div className="flex justify-between items-center" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>By <strong>{f.created_by}</strong></span>
                      <span>{format(new Date(f.created_at), 'dd MMM yyyy HH:mm')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>
                  No follow-up notes added yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
