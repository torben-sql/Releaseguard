import React, { useState } from 'react';
import EnvironmentList from './components/EnvironmentList';

type View = 'environments' | 'releases';

const sidebarStyle: React.CSSProperties = {
  width: 200,
  minHeight: '100vh',
  background: '#2c3e50',
  color: 'white',
  padding: '1rem',
  boxSizing: 'border-box',
};

const navItemStyle = (active: boolean): React.CSSProperties => ({
  cursor: 'pointer',
  padding: '0.6rem 0.8rem',
  borderRadius: 4,
  marginBottom: '0.25rem',
  background: active ? '#34495e' : 'transparent',
  userSelect: 'none',
});

function App() {
  const [activeView, setActiveView] = useState<View>('environments');

  return (
    <div style={{ display: 'flex' }}>
      <nav style={sidebarStyle}>
        <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', letterSpacing: 1 }}>ReleaseGuard</h2>
        <div
          style={navItemStyle(activeView === 'environments')}
          onClick={() => setActiveView('environments')}
        >
          Environments
        </div>
        <div
          style={navItemStyle(activeView === 'releases')}
          onClick={() => setActiveView('releases')}
        >
          Releases
        </div>
      </nav>
      <main style={{ flex: 1, padding: '1.5rem' }}>
        {activeView === 'environments' && <EnvironmentList />}
        {activeView === 'releases' && <p>Releases — coming soon.</p>}
      </main>
    </div>
  );
}

export default App;
