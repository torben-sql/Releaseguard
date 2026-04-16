import React, { useEffect, useState } from 'react';
import EnvironmentForm from './EnvironmentForm';

interface Environment {
  id: string;
  name: string;
  displayOrder: number | null;
  jdbcUrl: string;
  dbUser: string;
  createdAt: string;
}

interface TestResult {
  status: 'success' | 'failure';
  message: string;
}

function EnvironmentList() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [showForm, setShowForm] = useState(false);
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
        <button onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {showForm && (
        <EnvironmentForm
          onSaved={() => {
            setShowForm(false);
            fetchEnvironments();
          }}
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
              <tr key={env.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={td}>{env.name}</td>
                <td style={{ ...td, fontFamily: 'monospace', fontSize: '0.85rem' }}>{env.jdbcUrl}</td>
                <td style={td}>
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
