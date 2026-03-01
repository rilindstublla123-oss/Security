import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import Summary from './components/Summary';
import Settings from './components/Settings';
import EntryModal from './components/EntryModal';
import { startFirebaseSync } from './utils/config';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modalType, setModalType] = useState(null); // 'quick' | 'full' | null
  const [globalSelectedDate, setGlobalSelectedDate] = useState(new Date());
  const [syncKey, setSyncKey] = useState(0);

  useEffect(() => {
    // Start listening to Firebase in the background
    const unsubscribe = startFirebaseSync(() => {
      // Whenever new data arrives from the cloud, increment syncKey
      // This forces the React components to remount and read the new localStorage
      setSyncKey(prev => prev + 1);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSaveSuccess = () => {
    // Force local refresh when saving manually
    setSyncKey(prev => prev + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'calendar':
        return <CalendarView
          globalSelectedDate={globalSelectedDate}
          setGlobalSelectedDate={setGlobalSelectedDate}
          openModal={setModalType}
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
      <main className="main-content" key={syncKey}>
        {renderContent()}
      </main>

      {modalType && (
        <EntryModal
          key={`modal-${syncKey}`}
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
