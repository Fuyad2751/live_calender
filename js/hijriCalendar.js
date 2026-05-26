// Hijri Calendar Converter - Updated
class HijriCalendar {
    constructor() {
        this.hijriMonths = [
            'মুহাররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি',
            'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান',
            'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ্জ'
        ];
        
        this.hijriWeekdays = [
            'আহাদ', 'ইছনাইন', 'ছুলাছা', 'আরবিআ',
            'খামিস', 'জুমুআ', 'সাবত'
        ];
        
        this.importantDates = {
            '1': { '10': 'আশুরা' },
            '3': { '12': 'ঈদে মিলাদুন্নবী (সা.)' },
            '7': { '27': 'শবে মেরাজ' },
            '8': { '15': 'শবে বরাত' },
            '9': { '1': 'রমজান শুরু', '27': 'শবে কদর' },
            '10': { '1': 'ঈদুল ফিতর' },
            '12': { '9': 'আরাফাত দিবস', '10': 'ঈদুল আজহা' }
        };
    }
    
    // Convert Gregorian to Hijri
    gregorianToHijri(gregorianDate) {
        try {
            const gDate = new Date(gregorianDate);
            
            // Validate date
            if (isNaN(gDate.getTime())) {
                throw new Error('Invalid date provided');
            }
            
            const jd = this.gregorianToJulianDay(gDate);
            const hijriDate = this.julianDayToHijri(jd);
            
            return {
                year: hijriDate.year,
                month: hijriDate.month,
                day: hijriDate.day,
                monthName: this.hijriMonths[hijriDate.month - 1],
                weekday: this.hijriWeekdays[gDate.getDay()]
            };
        } catch (error) {
            console.error('Error converting to Hijri date:', error);
            // Return a fallback date
            return {
                year: 1447,
                month: 11,
                day: 29,
                monthName: this.hijriMonths[10],
                weekday: this.hijriWeekdays[2]
            };
        }
    }
    
    gregorianToJulianDay(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        let a = Math.floor((14 - month) / 12);
        let y = year + 4800 - a;
        let m = month + 12 * a - 3;
        
        return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
               Math.floor(y / 4) - Math.floor(y / 100) + 
               Math.floor(y / 400) - 32045;
    }
    
    julianDayToHijri(jd) {
        try {
            const l = jd - 1948440 + 10632;
            const n = Math.floor((l - 1) / 10631);
            const l2 = l - 10631 * n + 354;
            const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + 
                      Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
            const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - 
                      Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
            
            const month = Math.floor((24 * l3) / 709);
            const day = l3 - Math.floor((709 * month) / 24);
            const year = 30 * n + j - 30;
            
            // Ensure valid ranges
            const validMonth = Math.max(1, Math.min(12, month));
            const maxDay = validMonth % 2 === 0 ? 29 : 30;
            const validDay = Math.max(1, Math.min(maxDay, day));
            
            return {
                year: year,
                month: validMonth,
                day: validDay
            };
        } catch (error) {
            console.error('Error in Julian to Hijri conversion:', error);
            return {
                year: 1447,
                month: 11,
                day: 29
            };
        }
    }
    
    isImportantDate(month, day) {
        const monthKey = month.toString();
        const dayKey = day.toString();
        
        if (this.importantDates[monthKey] && this.importantDates[monthKey][dayKey]) {
            return this.importantDates[monthKey][dayKey];
        }
        return null;
    }
    
    formatHijriDate(hijriDate) {
        if (!hijriDate) return 'তারিখ পাওয়া যায়নি';
        return `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year} হি.`;
    }
}