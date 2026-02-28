import React, { useState, useEffect } from 'react';
import { Save, Download, Upload, AlertCircle } from 'lucide-react';
import { loadConfig, saveConfig, loadData, saveData } from '../utils/config';
import { parse, format, addDays } from 'date-fns';
import { calculateBonus } from '../utils/timeTracker';
import './Settings.css';

export default function Settings() {
    const [config, setConfig] = useState(null);
    const [status, setStatus] = useState({ text: '', type: '' });

    useEffect(() => {
        setConfig(loadConfig());
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: parseFloat(value) || value
        }));
    };

    const showStatus = (text, type = 'success') => {
        setStatus({ text, type });
        setTimeout(() => setStatus({ text: '', type: '' }), 4000);
    };

    const handleSave = () => {
        if (saveConfig(config)) {
            recalculateAllData(config);
            showStatus('Einstellungen erfolgreich gespeichert und Daten neu berechnet.');
        } else {
            showStatus('Fehler beim Speichern der Einstellungen.', 'error');
        }
    };

    // Recalculates all entries based on the new hourly rates / bonuses
    const recalculateAllData = (newConfig) => {
        const data = loadData();
        Object.keys(data).forEach(dateStr => {
            data[dateStr].forEach(entry => {
                try {
                    // recreate dates from strings
                    const startDt = parse(`${dateStr} ${entry.start}`, 'dd.MM.yyyy HH:mm', new Date());
                    const endDtStr = entry.end < entry.start ? addDays(startDt, 1) : startDt;
                    const endDt = parse(entry.end, 'HH:mm', endDtStr);

                    if (endDt <= startDt) return;

                    const { hours, earnings } = calculateBonus(startDt, endDt, dateStr, newConfig);
                    const baseEarnings = hours * newConfig.hourly_rate;

                    entry.hours = Number(hours.toFixed(6));
                    entry.earnings = Number(earnings.toFixed(6));
                    entry.base_earnings = Number(baseEarnings.toFixed(6));
                    entry.bonus_earnings = Number((earnings - baseEarnings).toFixed(6));
                } catch (e) {
                    console.error("Fehler bei Neuberechnung:", e);
                }
            });
        });
        saveData(data);
    };

    const handleExportData = () => {
        const data = loadData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `time_tracker_backup_${format(new Date(), 'yyyyMMdd_HHmm')}.json`;
        link.click();
        URL.revokeObjectURL(url);
        showStatus('Backup erfolgreich erstellt.');
    };

    const handleImportData = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const jsonData = JSON.parse(event.target.result);
                if (typeof jsonData === 'object') {
                    saveData(jsonData);
                    showStatus('Daten erfolgreich importiert. Bitte laden Sie die Seite neu.');
                }
            } catch (err) {
                showStatus('Fehler beim Lesen der Backup-Datei.', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input
    };

    if (!config) return <div>Laden...</div>;

    return (
        <div className="settings-view animate-fade-in">
            <div className="header-wrapper">
                <h1 className="page-title">Einstellungen</h1>
            </div>

            {status.text && (
                <div className={`status-banner ${status.type}`}>
                    <AlertCircle size={20} />
                    <span>{status.text}</span>
                </div>
            )}

            <div className="settings-grid">
                <div className="premium-card settings-card">
                    <h2 className="card-title">💰 Lohneinstellungen</h2>

                    <div className="input-group">
                        <label>Grundstundenlohn (€)</label>
                        <input
                            type="number" step="0.01"
                            name="hourly_rate"
                            value={config.hourly_rate}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="settings-row">
                        <div className="input-group">
                            <label>Feiertagszuschlag (Faktor)</label>
                            <input type="number" step="0.1" name="holiday_bonus" value={config.holiday_bonus} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Sonntagszuschlag (Faktor)</label>
                            <input type="number" step="0.1" name="sunday_bonus" value={config.sunday_bonus} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="settings-row">
                        <div className="input-group">
                            <label>Nachtzuschlag (Faktor)</label>
                            <input type="number" step="0.1" name="night_bonus" value={config.night_bonus} onChange={handleChange} />
                        </div>
                        <div className="input-group input-row">
                            <div>
                                <label>Nacht-Start (0-23h)</label>
                                <input type="number" min="0" max="23" name="night_start" value={config.night_start} onChange={handleChange} />
                            </div>
                            <span className="divider-dash">-</span>
                            <div>
                                <label>Nacht-Ende (0-23h)</label>
                                <input type="number" min="0" max="23" name="night_end" value={config.night_end} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <button className="btn-primary full-width mt-4" onClick={handleSave}>
                        <Save size={18} /> Einstellungen speichern & Anwenden
                    </button>
                </div>

                <div className="premium-card settings-card">
                    <h2 className="card-title">📁 Datenmanagement</h2>
                    <p className="description-text">
                        Exportieren Sie Ihre gespeicherten Daten als Backup oder importieren Sie ein bestehendes Backup.
                    </p>

                    <div className="action-buttons">
                        <button className="btn-secondary" onClick={handleExportData}>
                            <Download size={18} /> JSON Export (Backup)
                        </button>
                        <label className="btn-secondary file-upload-btn">
                            <Upload size={18} /> JSON Import
                            <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
