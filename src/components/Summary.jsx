import React, { useState, useEffect } from 'react';
import { Download, Trash2, CalendarDays } from 'lucide-react';
import { loadData, saveData } from '../utils/config';
import { exportToICS } from '../utils/icsExport';
import { parse, format } from 'date-fns';
import { de } from 'date-fns/locale';
import './Dashboard.css';

export default function Summary() {
    const [entries, setEntries] = useState([]);
    const [availableMonths, setAvailableMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('all');

    const loadAndFormatData = () => {
        const data = loadData();
        const flattened = [];

        Object.keys(data).forEach(dateStr => {
            const dt = parse(dateStr, 'dd.MM.yyyy', new Date());
            const dayName = format(dt, 'EEEE', { locale: de });

            data[dateStr].forEach((entry, idx) => {
                flattened.push({
                    id: `${dateStr}__${idx}`,
                    dt,
                    dateStr,
                    dayName,
                    ...entry
                });
            });
        });

        // Default sort by date descending
        flattened.sort((a, b) => b.dt.getTime() - a.dt.getTime());
        setEntries(flattened);

        // Compute available months for the filter dropdown
        const monthsSet = new Set();
        flattened.forEach(e => {
            const mStr = format(e.dt, 'yyyy-MM');
            monthsSet.add(mStr);
        });

        // Sort months descending (newest first)
        const sortedMonths = Array.from(monthsSet).sort().reverse();
        setAvailableMonths(sortedMonths);
    };

    useEffect(() => {
        loadAndFormatData();
    }, []);

    const handleDelete = (id) => {
        if (window.confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
            const [dateStr, idxStr] = id.split('__');
            const idx = parseInt(idxStr, 10);

            const data = loadData();
            if (data[dateStr]) {
                data[dateStr].splice(idx, 1);
                if (data[dateStr].length === 0) {
                    delete data[dateStr];
                }
                saveData(data);
                loadAndFormatData();
            }
        }
    };

    // Filter the entries based on the selected dropdown
    const filteredEntries = entries.filter(e => {
        if (selectedMonth === 'all') return true;
        const eMonth = format(e.dt, 'yyyy-MM');
        return eMonth === selectedMonth;
    });

    const exportCSV = () => {
        const header = ["Datum", "Wochentag", "Start", "Ende", "Ort", "Stunden", "Grundlohn", "Zuschlag", "Gesamt"];
        const rows = filteredEntries.map(e => [
            e.dateStr, e.dayName, e.start, e.end, e.location,
            e.hours.toFixed(2), e.base_earnings.toFixed(2), e.bonus_earnings.toFixed(2), e.earnings.toFixed(2)
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + header.join(";") + "\n"
            + rows.map(e => e.join(";")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `arbeitszeiten_export_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportICS = () => {
        exportToICS(filteredEntries);
    };

    const formatCurrency = (val) => `${val.toFixed(2)} €`;
    const formatHours = (val) => `${val.toFixed(2)}h`;

    return (
        <div className="summary-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="dashboard-header" style={{ alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h1 className="page-title" style={{ margin: 0 }}>Übersicht</h1>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-card)', fontSize: '15px' }}
                    >
                        <option value="all">Alle Monate</option>
                        {availableMonths.map(m => {
                            const [year, month] = m.split('-');
                            const dateObj = new Date(year, parseInt(month) - 1, 1);
                            const label = format(dateObj, 'MMMM yyyy', { locale: de });
                            return <option key={m} value={m}>{label}</option>;
                        })}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-secondary" onClick={handleExportICS} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CalendarDays size={18} /> Kalender-Export (.ics)
                    </button>
                    <button className="btn-success" onClick={exportCSV}>
                        <Download size={18} /> CSV Export
                    </button>
                </div>
            </div>

            <div className="premium-card">
                <div className="table-container" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <table className="premium-table">
                        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                            <tr>
                                <th>Datum</th>
                                <th>Wochentag</th>
                                <th>Zeit</th>
                                <th>Ort</th>
                                <th>Stunden</th>
                                <th>Grundlohn</th>
                                <th>Zuschlag</th>
                                <th>Gesamt</th>
                                <th>Aktion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEntries.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="empty-state">Keine Einträge vorhanden</td>
                                </tr>
                            ) : (
                                filteredEntries.map(entry => (
                                    <tr key={entry.id}>
                                        <td>{entry.dateStr}</td>
                                        <td>{entry.dayName}</td>
                                        <td>{entry.start} - {entry.end}</td>
                                        <td>{entry.location}</td>
                                        <td>{formatHours(entry.hours)}</td>
                                        <td>{formatCurrency(entry.base_earnings)}</td>
                                        <td>{formatCurrency(entry.bonus_earnings)}</td>
                                        <td className="text-success font-semibold">{formatCurrency(entry.earnings)}</td>
                                        <td>
                                            <button
                                                className="btn-ghost"
                                                style={{ color: 'var(--color-danger)', padding: '6px' }}
                                                onClick={() => handleDelete(entry.id)}
                                                title="Löschen"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {filteredEntries.length > 0 && (
                            <tfoot style={{ position: 'sticky', bottom: 0, backgroundColor: 'var(--color-bg-light)', borderTop: '2px solid var(--color-border)', fontWeight: '700', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'right' }}>{selectedMonth === 'all' ? 'Gesamtsumme (Alle):' : 'Summe Monat:'}</td>
                                    <td>{formatHours(filteredEntries.reduce((sum, e) => sum + e.hours, 0))}</td>
                                    <td>{formatCurrency(filteredEntries.reduce((sum, e) => sum + e.base_earnings, 0))}</td>
                                    <td>{formatCurrency(filteredEntries.reduce((sum, e) => sum + e.bonus_earnings, 0))}</td>
                                    <td className="text-success">{formatCurrency(filteredEntries.reduce((sum, e) => sum + e.earnings, 0))}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
}
