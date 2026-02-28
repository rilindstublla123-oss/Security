import { parse, addDays, isSunday, differenceInSeconds } from 'date-fns';
import { loadConfig } from './config';

const DATE_FORMAT = 'dd.MM.yyyy';
const TIME_FORMAT = 'HH:mm';

// Parses "14:00" strings into Date objects on an arbitrary day (or specific day)
export const parseTime = (dateStr, timeStr) => {
    return parse(`${dateStr} ${timeStr}`, `${DATE_FORMAT} ${TIME_FORMAT}`, new Date());
};

export const calculateNightHours = (startDt, endDt, config) => {
    if (startDt >= endDt) return 0.0;

    const { night_start, night_end } = config;

    const isNight = (dt) => {
        const hour = dt.getHours();
        if (night_start === night_end) return false;
        if (night_start < night_end) {
            return hour >= night_start && hour < night_end;
        }
        // Crosses midnight (e.g., 20:00 to 06:00)
        return hour >= night_start || hour < night_end;
    };

    let nightMinutes = 0;
    let current = new Date(startDt.getTime());

    // Step minute by minute
    while (current < endDt) {
        if (isNight(current)) {
            nightMinutes += 1;
        }
        current.setMinutes(current.getMinutes() + 1);
    }

    return nightMinutes / 60.0;
};

export const calculateBonus = (startDt, endDt, dateStr, config, dynamicHolidays = []) => {
    const totalSeconds = differenceInSeconds(endDt, startDt);
    const hours = totalSeconds / 3600.0;

    let dayFactor = 1.0;

    // A day is a holiday if it's in the user config OR in the auto-fetched list
    const isHoliday = (config.holidays && config.holidays.includes(dateStr)) ||
        (dynamicHolidays && dynamicHolidays.includes(dateStr));

    if (isHoliday) {
        dayFactor = config.holiday_bonus;
    } else if (isSunday(startDt)) {
        dayFactor = config.sunday_bonus;
    }

    const htNight = calculateNightHours(startDt, endDt, config);
    const nightExtra = htNight * config.hourly_rate * (config.night_bonus - 1.0);

    const earnings = hours * config.hourly_rate * dayFactor + nightExtra;

    return { hours, earnings, dayFactor, nightHours: htNight };
};

export const createEntry = (dateStr, startTime, endTime, location, dynamicHolidays = []) => {
    const config = loadConfig();

    let startDt = parseTime(dateStr, startTime);
    let endDtStr = endTime < startTime ? (addDays(startDt, 1)) : startDt;

    let endDt = parse(endTime, TIME_FORMAT, endDtStr);

    if (endDt <= startDt) {
        throw new Error("Endzeit muss nach Startzeit liegen.");
    }

    const { hours, earnings } = calculateBonus(startDt, endDt, dateStr, config, dynamicHolidays);
    const baseEarnings = hours * config.hourly_rate;
    const bonusEarnings = earnings - baseEarnings;

    return {
        start: startTime,
        end: endTime,
        location: location || "Arbeitsplatz",
        hours: Number(hours.toFixed(6)),
        earnings: Number(earnings.toFixed(6)),
        base_earnings: Number(baseEarnings.toFixed(6)),
        bonus_earnings: Number(bonusEarnings.toFixed(6))
    };
};
