import React, { useState, useEffect } from 'react';
import { X, Zap, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { createEntry } from '../utils/timeTracker';
import { loadData, saveData } from '../utils/config';
import './EntryModal.css';

const QUICK_TEMPLATES = [
    { id: 'early', icon: '🌅', label: 'Frühdienst', times: '06:00-14:00', start: '06:00', end: '14:00' },
    { id: 'late', icon: '🌆', label: 'Spätdienst', times: '14:00-22:00', start: '14:00', end: '22:00' },
    { id: 'night', icon: '🌙', label: 'Nachtdienst', times: '22:00-06:00', start: '22:00', end: '06:00' },
    { id: 'part', icon: '⏰', label: 'Teilzeit', times: '09:00-13:00', start: '09:00', end: '13:00' }
];

export default function EntryModal({ isQuick, onClose, onSaveSuccess, initialDate }) {
    // If the modal was opened via the Calendar, we have a specific day selected.
    // Otherwise it defaults to today.
    const startingDate = initialDate || new Date();
    const [dateStr, setDateStr] = useState(format(startingDate, 'dd.MM.yyyy'));
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [error, setError] = useState(null);
    const [recentLocations, setRecentLocations] = useState([]);

    // Extract unique past locations for autocomplete
    useEffect(() => {
        const data = loadData();
        const locations = new Set();
        Object.values(data).forEach(dayEntries => {
            dayEntries.forEach(entry => {
                if (entry.location && entry.location.trim() !== '') {
                    locations.add(entry.location.trim());
                }
            });
        });
        setRecentLocations(Array.from(locations));
    }, []);

    const handleTemplateSelect = (tmpl) => {
        setSelectedTemplate(tmpl);
        setStartTime(tmpl.start);
        setEndTime(tmpl.end);
    };

    const handleSave = () => {
        setError(null);
        try {
            if (!startTime || !endTime) {
                throw new Error("Bitte Start- und Endzeit angeben.");
            }

            const entry = createEntry(dateStr, startTime, endTime, location);

            // Save it
            const data = loadData();
            if (!data[dateStr]) data[dateStr] = [];
            data[dateStr].push(entry);
            saveData(data);

            if (onSaveSuccess) onSaveSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div className="modal-content premium-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {isQuick ? <><Zap size={24} className="text-success" /> Schnelleintrag</> : <><Clock size={24} className="text-primary" /> Arbeitszeit eintragen</>}
                    </h2>
                    <button className="btn-close" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="modal-body">
                    {error && <div className="modal-error">{error}</div>}

                    <div className="input-group">
                        <label>Datum (TT.MM.JJJJ)</label>
                        <input
                            type="text"
                            value={dateStr}
                            onChange={(e) => setDateStr(e.target.value)}
                            placeholder="z.B. 24.12.2024"
                        />
                    </div>

                    {isQuick && (
                        <div className="templates-section">
                            <label className="section-label">Vorlage wählen</label>
                            <div className="templates-grid">
                                {QUICK_TEMPLATES.map(tmpl => (
                                    <div
                                        key={tmpl.id}
                                        className={`template-card ${selectedTemplate?.id === tmpl.id ? 'selected' : ''}`}
                                        onClick={() => handleTemplateSelect(tmpl)}
                                    >
                                        <span className="tmpl-icon">{tmpl.icon}</span>
                                        <div className="tmpl-info">
                                            <span className="tmpl-label">{tmpl.label}</span>
                                            <span className="tmpl-times">{tmpl.times}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isQuick && (
                        <div className="times-row">
                            <div className="input-group">
                                <label>Startzeit</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label>Endzeit</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="input-group mt-3">
                        <label>Arbeitsort (Optional)</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="z.B. Büro, Homeoffice"
                            list="location-suggestions"
                        />
                        <datalist id="location-suggestions">
                            {recentLocations.map((loc, idx) => (
                                <option key={idx} value={loc} />
                            ))}
                        </datalist>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Abbrechen</button>
                    <button className="btn-primary" onClick={handleSave}>Speichern</button>
                </div>
            </div>
        </div>
    );
}
