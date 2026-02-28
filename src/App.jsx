import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import Summary from './components/Summary';
import Settings from './components/Settings';
import EntryModal from './components/EntryModal';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modalType, setModalType] = useState(null); // 'quick' | 'full' | null
  const [globalSelectedDate, setGlobalSelectedDate] = useState(new Date());

  const handleSaveSuccess = () => {
    // If we need to trigger a refresh across tabs, we could do it here
    // For now, React's re-render handles prop changes if we passed them,
    // but our components read directly from localStorage on mount.
    // Toggling the active tab forces a remount and thus a refresh:
    const current = activeTab;
    setActiveTab('');
    setTimeout(() => setActiveTab(current), 10);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'calendar':
        return <CalendarView
          globalSelectedDate={globalSelectedDate}
          setGlobalSelectedDate={setGlobalSelectedDate}
        />;
      case 'summary':
        return <Summary />;
      case 'statistics':
        return <div><h1 className="page-title">Statistik</h1><p>Diese Ansicht ist in Entwicklung...</p></div>;
      case 'settings':
        return <Settings />;
      default:
        return <div><h2>Wird geladen...</h2></div>;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} openModal={setModalType} />
      <main className="main-content">
        {renderContent()}
      </main>

      {modalType && (
        <EntryModal
          isQuick={modalType === 'quick'}
          onClose={() => setModalType(null)}
          onSaveSuccess={handleSaveSuccess}
          initialDate={globalSelectedDate}
        />
      )}
    </div>
  );
}

export default App;
