import React, { useState } from 'react';

export interface Environment {
  id: string;
  name: string;
  displayOrder: number | null;
  jdbcUrl: string;
  dbUser: string;
  dbPassword: string;
  createdAt: string;
}

interface Props {
  onSaved: () => void;
  onCancel: () => void;
  existing?: Environment;
}

interface FormState {
  name: string;
  displayOrder: number | '';
  jdbcUrl: string;
  dbUser: string;
  dbPassword: string;
}

const fields: { key: keyof FormState; label: string; type: string; required: boolean }[] = [
  { key: 'name',         label: 'Name',         type: 'text',     required: true  },
  { key: 'displayOrder', label: 'Display Order', type: 'number',   required: false },
  { key: 'jdbcUrl',      label: 'JDBC URL',      type: 'text',     required: false },
  { key: 'dbUser',       label: 'DB User',       type: 'text',     required: false },
  { key: 'dbPassword',   label: 'DB Password',   type: 'password', required: false },
];

function EnvironmentForm({ onSaved, onCancel, existing }: Props) {
  const [form, setForm] = useState<FormState>({
    name:         existing?.name          ?? '',
    displayOrder: existing?.displayOrder  ?? '',
    jdbcUrl:      existing?.jdbcUrl       ?? '',
    dbUser:       existing?.dbUser        ?? '',
    dbPassword:   existing?.dbPassword    ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = existing !== undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'displayOrder' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url    = isEdit ? `/api/environments/${existing!.id}` : '/api/environments';
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        displayOrder: form.displayOrder === '' ? null : form.displayOrder,
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then(() => onSaved())
      .catch(err => {
        setError(err.message);
        setSaving(false);
      });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ border: '1px solid #ddd', borderRadius: 6, padding: '1rem', marginBottom: '1.5rem', maxWidth: 480 }}
    >
      <h3 style={{ margin: '0 0 1rem' }}>{isEdit ? 'Edit Environment' : 'New Environment'}</h3>

      {fields.map(({ key, label, type, required }) => (
        <div key={key} style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ width: 120, flexShrink: 0, fontSize: '0.9rem' }}>{label}</label>
          <input
            name={key}
            type={type}
            value={form[key]}
            onChange={handleChange}
            required={required}
            style={{ flex: 1, padding: '0.3rem 0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>
      ))}

      {error && <p style={{ color: 'red', margin: '0.5rem 0' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default EnvironmentForm;
