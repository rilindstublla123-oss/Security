import { format } from 'date-fns';

export const exportToICS = (entries) => {
    // .ics files require a specific date-time format: YYYYMMDDTHHMMSSZ
    const formatDateForICS = (dateObj) => {
        return format(dateObj, "yyyyMMdd'T'HHmmss");
    };

    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Arbeitszeit Tracker Pro//DE',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ];

    entries.forEach(entry => {
        // Generate unique ID
        const uid = `${entry.dt.getTime()}-${Math.random().toString(36).substring(2, 9)}@arbeitszeit.tracker`;

        // Parse start and end times to valid JS Date objects for the .ics format
        const [startHour, startMin] = entry.start.split(':');
        const startDt = new Date(entry.dt);
        startDt.setHours(parseInt(startHour, 10), parseInt(startMin, 10), 0);

        const [endHour, endMin] = entry.end.split(':');
        const endDt = new Date(startDt);
        endDt.setHours(parseInt(endHour, 10), parseInt(endMin, 10), 0);

        // Handle overnight shifts (end time is smaller than start time)
        if (endDt <= startDt) {
            endDt.setDate(endDt.getDate() + 1);
        }

        const now = new Date();

        icsContent.push(
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTAMP:${formatDateForICS(now)}`,
            `DTSTART:${formatDateForICS(startDt)}`,
            `DTEND:${formatDateForICS(endDt)}`,
            `SUMMARY:Arbeitsschicht (${entry.hours.toFixed(2)}h)`,
            `DESCRIPTION:Verdienst: ${entry.earnings.toFixed(2)} Euro\\nOrt: ${entry.location}`,
            `LOCATION:${entry.location}`,
            'END:VEVENT'
        );
    });

    icsContent.push('END:VCALENDAR');

    const finalString = icsContent.join('\r\n');
    const blob = new Blob([finalString], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `Schichten_${format(new Date(), 'yyyyMMdd')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
