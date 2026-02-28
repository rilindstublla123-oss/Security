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
                {navItems.map(item => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
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
