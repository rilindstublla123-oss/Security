import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, TrendingUp, ChevronRight, Trash2 } from 'lucide-react';
import { loadData, saveData } from '../utils/config';
import { parse } from 'date-fns';
import './Dashboard.css';

export default function Dashboard({ setActiveTab }) {
    const [stats, setStats] = useState({
        hours: 0,
        earnings: 0,
        avg: 0,
        recent: []
    });

    const loadStats = () => {
        const data = loadData();
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        let totalHours = 0;
        let totalEarnings = 0;
        let allEntries = [];

        Object.keys(data).forEach(dateStr => {
            const dt = parse(dateStr, 'dd.MM.yyyy', new Date());
            const entries = data[dateStr];

            entries.forEach((entry, idx) => {
                allEntries.push({ id: `${dateStr}__${idx}`, dateStr, idx, dt, ...entry });

                // Sum only for the current month
                if (dt.getMonth() === currentMonth && dt.getFullYear() === currentYear) {
                    totalHours += entry.hours || 0;
                    totalEarnings += entry.earnings || 0;
                }
            });
        });

        const avg = totalHours > 0 ? (totalEarnings / totalHours) : 0;

        // Sort all entries descending by date to get recent ones
        allEntries.sort((a, b) => b.dt.getTime() - a.dt.getTime());

        setStats({
            hours: totalHours,
            earnings: totalEarnings,
            avg: avg,
            recent: allEntries.slice(0, 8)
        });
    };

    useEffect(() => {
        loadStats();
    }, []);

    const handleDelete = (entryToDelete) => {
        if (window.confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
            const data = loadData();
            if (data[entryToDelete.dateStr]) {
                data[entryToDelete.dateStr].splice(entryToDelete.idx, 1);
                if (data[entryToDelete.dateStr].length === 0) {
                    delete data[entryToDelete.dateStr];
                }
                saveData(data);
                loadStats();
            }
        }
    };

    const formatCurrency = (val) => `${val.toFixed(2)} €`;
    const formatHours = (val) => `${val.toFixed(2)}h`;

    return (
        <div className="dashboard-view animate-fade-in">
            <div className="dashboard-header">
                <h1 className="page-title">Dashboard</h1>
                <span className="current-date">
                    {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
            </div>

            <div className="stat-cards-container">
                <div className="stat-card premium-card">
                    <div className="stat-icon primary-icon"><Clock size={28} /></div>
                    <div className="stat-content">
                        <span className="stat-value">{formatHours(stats.hours)}</span>
                        <span className="stat-label">Stunden (Monat)</span>
                    </div>
                </div>

                <div className="stat-card premium-card">
                    <div className="stat-icon success-icon"><DollarSign size={28} /></div>
                    <div className="stat-content">
                        <span className="stat-value">{formatCurrency(stats.earnings)}</span>
                        <span className="stat-label">Verdienst (Monat)</span>
                    </div>
                </div>

                <div className="stat-card premium-card">
                    <div className="stat-icon purple-icon"><TrendingUp size={28} /></div>
                    <div className="stat-content">
                        <span className="stat-value">{formatCurrency(stats.avg)}</span>
                        <span className="stat-label">Ø Stundenlohn</span>
                    </div>
                </div>
            </div>

            <div className="recent-entries-section premium-card">
                <div className="section-header">
                    <h2>📋 Letzte Einträge</h2>
                    <button className="btn-ghost" onClick={() => setActiveTab('summary')}>
                        Alle anzeigen <ChevronRight size={16} />
                    </button>
                </div>

                <div className="table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Datum</th>
                                <th>Zeit</th>
                                <th>Stunden</th>
                                <th>Verdienst</th>
                                <th>Aktion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recent.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-state">Keine Einträge vorhanden</td>
                                </tr>
                            ) : (
                                stats.recent.map((entry) => (
                                    <tr key={entry.id}>
                                        <td>{entry.dateStr}</td>
                                        <td>{entry.start} - {entry.end}</td>
                                        <td>{formatHours(entry.hours)}</td>
                                        <td className="text-success font-semibold">{formatCurrency(entry.earnings)}</td>
                                        <td>
                                            <button
                                                className="btn-ghost"
                                                style={{ color: '#FF3B30', padding: '6px' }}
                                                onClick={() => handleDelete(entry)}
                                                title="Löschen"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
