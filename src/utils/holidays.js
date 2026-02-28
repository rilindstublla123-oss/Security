// Fetches public holidays for Germany (Bavaria)
export const fetchBavarianHolidays = async (year) => {
    try {
        // We use the nager.date API for public holidays
        // DE-BY is the ISO 3166-2 code for Bavaria (Bayern)
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/DE`);
        if (!response.ok) return [];

        const data = await response.json();

        // Filter for national holidays OR holidays specific to Bavaria
        const bavarianHolidays = data.filter(holiday => {
            if (!holiday.counties) return true; // National holiday
            return holiday.counties.includes('DE-BY'); // Specific to Bavaria
        });

        // Format to our standard "dd.MM.yyyy"
        return bavarianHolidays.map(h => {
            const [y, m, d] = h.date.split('-');
            return `${d}.${m}.${y}`;
        });
    } catch (error) {
        console.error("Failed to fetch holidays:", error);
        return [];
    }
};
