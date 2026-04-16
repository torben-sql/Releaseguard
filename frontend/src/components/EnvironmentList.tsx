import React, { useEffect, useState } from 'react';
import EnvironmentForm, { Environment } from './EnvironmentForm';

interface TestResult {
  status: 'success' | 'failure';
  message: string;
}

function EnvironmentList() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  const fetchEnvironments = () => {
    fetch('/api/environments')
      .then(res => res.json())
      .then(data => setEnvironments(data))
      .catch(err => console.error('Failed to load environments', err));
  };

  useEffect(() => {
    fetchEnvironments();
  }, []);

  const openEdit = (env: Environment) => {
    setShowAddForm(false);
    setEditingEnv(prev => (prev?.id === env.id ? null : env));
  };

  const openAdd = () => {
    setEditingEnv(null);
    setShowAddForm(v => !v);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingEnv(null);
  };

  const handleSaved = () => {
    closeForm();
    fetchEnvironments();
  };

  const deleteEnvironment = (env: Environment) => {
    if (!window.confirm(`Are you sure you want to delete ${env.name}?`)) return;
    fetch(`/api/environments/${env.id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        if (editingEnv?.id === env.id) setEditingEnv(null);
        fetchEnvironments();
      })
      .catch(err => console.error('Failed to delete environment', err));
  };

  const testConnection = (id: string) => {
    setTesting(prev => ({ ...prev, [id]: true }));
    fetch(`/api/environments/${id}/test`, { method: 'POST' })
      .then(res => res.json())
      .then(result => {
        setTestResults(prev => ({ ...prev, [id]: result }));
        setTesting(prev => ({ ...prev, [id]: false }));
      })
      .catch(() => {
        setTestResults(prev => ({ ...prev, [id]: { status: 'failure', message: 'Request failed' } }));
        setTesting(prev => ({ ...prev, [id]: false }));
      });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Environments</h2>
        <button onClick={openAdd}>
          {showAddForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {showAddForm && (
        <EnvironmentForm
          key="new"
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      )}

      {editingEnv && (
        <EnvironmentForm
          key={editingEnv.id}
          existing={editingEnv}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      )}

      {environments.length === 0 ? (
        <p style={{ color: '#888' }}>No environments configured yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
              <th style={th}>Name</th>
              <th style={th}>JDBC URL</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {environments.map(env => (
              <tr
                key={env.id}
                style={{
                  borderBottom: '1px solid #eee',
                  background: editingEnv?.id === env.id ? '#fffbe6' : undefined,
                }}
              >
                <td style={td}>{env.name}</td>
                <td style={{ ...td, fontFamily: 'monospace', fontSize: '0.85rem' }}>{env.jdbcUrl}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  <button
                    onClick={() => openEdit(env)}
                    style={{ marginRight: '0.5rem' }}
                  >
                    {editingEnv?.id === env.id ? 'Cancel Edit' : 'Edit'}
                  </button>
                  <button
                    onClick={() => deleteEnvironment(env)}
                    style={{ marginRight: '0.5rem', color: '#c0392b' }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => testConnection(env.id)}
                    disabled={testing[env.id]}
                  >
                    {testing[env.id] ? 'Testing…' : 'Test Connection'}
                  </button>
                  {testResults[env.id] && (
                    <span style={{
                      marginLeft: '0.75rem',
                      color: testResults[env.id].status === 'success' ? 'green' : 'red',
                      fontSize: '0.85rem',
                    }}>
                      {testResults[env.id].status === 'success' ? '✓' : '✗'} {testResults[env.id].message}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th: React.CSSProperties = { padding: '0.6rem 0.8rem', fontWeight: 600 };
const td: React.CSSProperties = { padding: '0.6rem 0.8rem' };

export default EnvironmentList;
