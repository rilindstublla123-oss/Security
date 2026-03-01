import React from 'react';
import { LayoutDashboard, Calendar, ClipboardList, BarChart3, Settings, Plus, Zap } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ activeTab, setActiveTab, openModal }) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'calendar', label: 'Kalender', icon: Calendar },
        { id: 'summary', label: 'Übersicht', icon: ClipboardList },
        { id: 'statistics', label: 'Statistik', icon: BarChart3 },
        { id: 'settings', label: 'Einstellungen', icon: Settings }
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <span className="logo-icon">⏱️</span>
                <h1 className="logo-text">TimeTracker</h1>
            </div>

            <nav className="sidebar-nav">
                <button
                    className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'summary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('summary')}
                >
                    <ClipboardList size={20} />
                    <span>Übersicht</span>
                </button>

                {/* FAB: Floating Action Button (Prominent in middle for mobile) */}
                <button className="nav-item mobile-fab-button" onClick={() => openModal('quick')}>
                    <div className="fab-icon-wrapper">
                        <Plus size={24} color="white" />
                    </div>
                    <span>Eintrag</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
                    onClick={() => setActiveTab('calendar')}
                >
                    <Calendar size={20} />
                    <span>Kalender</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <Settings size={20} />
                    <span>Setup</span>
                </button>
            </nav>

            <div className="sidebar-actions">
                <button className="btn-primary full-width" onClick={() => openModal('full')}>
                    <Plus size={18} />
                    Neue Arbeitszeit
                </button>
                <button className="btn-success full-width" onClick={() => openModal('quick')}>
                    <Zap size={18} />
                    Schnelleintrag
                </button>
            </div>

            <div className="sidebar-footer">
                <span className="status-text">Bereit</span>
            </div>
        </aside>
    );
}
