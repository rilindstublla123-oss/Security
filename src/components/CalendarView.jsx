import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Trash2 } from 'lucide-react';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parse,
    isWeekend
} from 'date-fns';
import { de } from 'date-fns/locale';
import { loadData, loadConfig, saveConfig, saveData } from '../utils/config';
import { fetchBavarianHolidays } from '../utils/holidays';
import './CalendarView.css';

export default function CalendarView({ globalSelectedDate, setGlobalSelectedDate }) {
    const [currentDate, setCurrentDate] = useState(globalSelectedDate || new Date());
    const [data, setData] = useState({});
    const [config, setConfig] = useState({});
    const [dynamicHolidays, setDynamicHolidays] = useState([]);

    useEffect(() => {
        setData(loadData());
        setConfig(loadConfig());
    }, []);

    // Fetch holidays anytime the displayed year changes
    useEffect(() => {
        const fetchHolidays = async () => {
            const year = currentDate.getFullYear();
            const holidaysThisYear = await fetchBavarianHolidays(year);
            // We might want to fetch previous/next year too if the user scrolls,
            // but keeping it to current year is usually fine.
            setDynamicHolidays(holidaysThisYear);
        };
        fetchHolidays();
    }, [currentDate.getFullYear()]);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setGlobalSelectedDate(today);
    };

    const onDateClick = (day) => {
        setGlobalSelectedDate(day);
    };

    const toggleHoliday = () => {
        const dateStr = format(globalSelectedDate, 'dd.MM.yyyy');
        let holidays = config.holidays || [];

        if (holidays.includes(dateStr)) {
            holidays = holidays.filter(d => d !== dateStr);
        } else {
            holidays.push(dateStr);
        }

        const newConfig = { ...config, holidays };
        saveConfig(newConfig);
        setConfig(newConfig);
    };

    const handleDeleteEntry = (idx) => {
        if (window.confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
            const dateStr = format(globalSelectedDate, 'dd.MM.yyyy');
            const currentData = { ...data };
            if (currentData[dateStr]) {
                currentData[dateStr].splice(idx, 1);
                if (currentData[dateStr].length === 0) {
                    delete currentData[dateStr];
                }
                saveData(currentData);
                setData(currentData);
            }
        }
    };

    const renderHeader = () => {
        return (
            <div className="calendar-nav">
                <button className="btn-ghost" onClick={prevMonth}><ChevronLeft size={20} /> Zurück</button>
                <h2 className="calendar-month-title">
                    {format(currentDate, 'MMMM yyyy', { locale: de })}
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-primary" onClick={goToToday}>Heute</button>
                    <button className="btn-ghost" onClick={nextMonth}>Weiter <ChevronRight size={20} /></button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = [];
        const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday

        for (let i = 0; i < 7; i++) {
            days.push(
                <div className="calendar-day-header" key={i}>
                    {format(addDays(startDate, i), 'EEEE', { locale: de }).substring(0, 2)}
                </div>
            );
        }
        return <div className="calendar-days-row">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        const userHolidays = config.holidays || [];

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, 'dd.MM.yyyy');
                const cloneDay = day;

                const isUserHoliday = userHolidays.includes(formattedDate);
                const isDynamicHoliday = dynamicHolidays.includes(formattedDate);
                const isAnyHoliday = isUserHoliday || isDynamicHoliday;

                const weekend = isWeekend(day);

                const hasEntries = data[formattedDate] && data[formattedDate].length > 0;

                days.push(
                    <div
                        className={`calendar-cell ${!isSameMonth(day, monthStart)
                            ? "disabled"
                            : isSameDay(day, globalSelectedDate)
                                ? "selected"
                                : ""
                            } ${isAnyHoliday ? "holiday-bg" : ""} ${weekend ? "weekend-bg" : ""} ${hasEntries ? "has-entry-bg" : ""}`}
                        key={day}
                        onClick={() => onDateClick(cloneDay)}
                    >
                        <span className={`number ${weekend || isAnyHoliday ? 'text-danger' : ''}`}>{format(day, 'd')}</span>

                        <div className="indicators">
                            {hasEntries && <span className="indicator-dot entry"></span>}
                            {isUserHoliday && <span className="indicator-dot holiday"></span>}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="calendar-row" key={day}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="calendar-body">{rows}</div>;
    };

    const renderInfoCard = () => {
        const formattedDate = format(globalSelectedDate, 'dd.MM.yyyy');
        const dayName = format(globalSelectedDate, 'EEEE', { locale: de });

        const userHolidays = config.holidays || [];
        const isUserHoliday = userHolidays.includes(formattedDate);
        const isDynamicHoliday = dynamicHolidays.includes(formattedDate);
        const isAnyHoliday = isUserHoliday || isDynamicHoliday;

        const isSunday = globalSelectedDate.getDay() === 0;
        const isSaturday = globalSelectedDate.getDay() === 6;
        const isWknd = isSunday || isSaturday;

        const entries = data[formattedDate] || [];
        const entriesCount = entries.length;
        let totalHours = 0;
        let totalEarnings = 0;

        entries.forEach(e => {
            totalHours += e.hours;
            totalEarnings += e.earnings;
        });

        return (
            <div className="day-info-container">
                <div className="premium-card info-card">
                    <h3 className="card-title">Tagesinfo</h3>
                    <div className="info-list">
                        <div className={`info-item ${isWknd ? 'text-danger' : ''}`}>📅 {dayName}</div>
                        <div className="info-item">📆 {formattedDate}</div>

                        {isDynamicHoliday && <div className="info-item text-danger">🛑 Gesetzlicher Feiertag (Bayern)</div>}
                        {isUserHoliday && !isDynamicHoliday && <div className="info-item text-warning">🎉 Eigener Feiertag</div>}
                        {isSunday && !isAnyHoliday && <div className="info-item text-danger">☀️ Sonntag</div>}
                        {isSaturday && !isAnyHoliday && <div className="info-item text-danger">☀️ Samstag</div>}

                        <hr className="divider" />

                        {entriesCount > 0 ? (
                            <>
                                <div className="info-item font-semibold">📋 {entriesCount} Eintrag(e)</div>
                                <div className="info-item">⏱️ {totalHours.toFixed(2)}h</div>
                                <div className="info-item text-success" style={{ marginBottom: '12px' }}>💰 {totalEarnings.toFixed(2)} €</div>
                                {entries.map((entry, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-light)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '8px', border: '1px solid var(--color-border)' }}>
                                        <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <div style={{ fontWeight: '600' }}>{entry.start} - {entry.end}</div>
                                            <div style={{ color: 'var(--color-text-secondary)' }}>{entry.hours.toFixed(2)}h | {entry.earnings.toFixed(2)}€</div>
                                        </div>
                                        <button className="btn-ghost" style={{ color: '#FF3B30', padding: '6px' }} onClick={() => handleDeleteEntry(idx)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="info-item text-muted">Keine Einträge für diesen Tag</div>
                        )}
                    </div>
                </div>

                <div className="premium-card action-card">
                    <button className="btn-secondary full-width mb-3" onClick={toggleHoliday}>
                        <Check size={18} /> {isUserHoliday ? 'Eigenen Feiertag entfernen' : 'Als Feiertag markieren'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="calendar-view animate-fade-in">
            <div className="header-wrapper">
                <h1 className="page-title">Kalender</h1>
            </div>

            <div className="calendar-layout">
                <div className="premium-card calendar-card">
                    {renderHeader()}
                    {renderDays()}
                    {renderCells()}
                </div>
                {renderInfoCard()}
            </div>
        </div>
    );
}
