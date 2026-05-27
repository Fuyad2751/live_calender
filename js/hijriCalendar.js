// Hijri Calendar Converter
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
    
    gregorianToHijri(gregorianDate) {
        try {
            const gDate = new Date(gregorianDate);
            if (isNaN(gDate.getTime())) {
                throw new Error('Invalid date');
            }
            return this.accurateConversion(gDate);
        } catch (error) {
            console.error('Hijri conversion error:', error);
            return this.fallbackHijriConversion(gregorianDate);
        }
    }
    
    gregorianToJulianDay(year, month, day) {
        let a = Math.floor((14 - month) / 12);
        let y = year + 4800 - a;
        let m = month + 12 * a - 3;
        return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    }
    
    getHijriMonthLength(month, year) {
        const basePattern = month % 2 === 1 ? 30 : 29;
        if (month === 12 && this.isHijriLeapYear(year)) {
            return 30;
        }
        return basePattern;
    }
    
    isHijriLeapYear(year) {
        const leapYearsInCycle = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
        const yearInCycle = year % 30;
        return leapYearsInCycle.includes(yearInCycle === 0 ? 30 : yearInCycle);
    }
    
    fallbackHijriConversion(gregorianDate) {
        const date = new Date(gregorianDate);
        const referenceDate = new Date(622, 6, 16);
        const diffTime = date.getTime() - referenceDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return { year: 1, month: 1, day: 1, monthName: this.hijriMonths[0], weekday: this.hijriWeekdays[date.getDay()] };
        }
        
        const hijriYear = Math.floor(diffDays / 354.367) + 1;
        let dayOfYear = Math.ceil(diffDays - Math.floor((hijriYear - 1) * 354.367));
        let month = 1;
        const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
        
        for (let i = 0; i < 12; i++) {
            if (dayOfYear <= monthLengths[i]) {
                month = i + 1;
                break;
            }
            dayOfYear -= monthLengths[i];
        }
        
        return {
            year: hijriYear,
            month: month,
            day: Math.max(1, Math.min(Math.ceil(dayOfYear), 30)),
            monthName: this.hijriMonths[month - 1],
            weekday: this.hijriWeekdays[date.getDay()]
        };
    }
    
    getKnownReferenceDates() {
        return [
            { gregorian: [2024, 1, 1], hijri: [1445, 6, 19] },
            { gregorian: [2024, 3, 11], hijri: [1445, 9, 1] },
            { gregorian: [2024, 4, 10], hijri: [1445, 10, 1] },
            { gregorian: [2024, 6, 17], hijri: [1445, 12, 10] },
            { gregorian: [2025, 1, 1], hijri: [1446, 7, 1] },
            { gregorian: [2026, 5, 27], hijri: [1447, 11, 9] },
            { gregorian: [2026, 6, 17], hijri: [1447, 12, 1] }
        ];
    }
    
    accurateConversion(date) {
        const references = this.getKnownReferenceDates();
        const gDate = new Date(date);
        
        let closestRef = references[0];
        let closestDiff = Infinity;
        
        for (const ref of references) {
            const refDate = new Date(ref.gregorian[0], ref.gregorian[1] - 1, ref.gregorian[2]);
            const diff = gDate.getTime() - refDate.getTime();
            if (diff >= 0 && diff < closestDiff) {
                closestDiff = diff;
                closestRef = ref;
            }
        }
        
        const refDate = new Date(closestRef.gregorian[0], closestRef.gregorian[1] - 1, closestRef.gregorian[2]);
        const diffDays = Math.floor((gDate.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
        
        let hYear = closestRef.hijri[0];
        let hMonth = closestRef.hijri[1];
        let hDay = closestRef.hijri[2];
        
        for (let i = 0; i < diffDays; i++) {
            hDay++;
            const maxDay = this.getHijriMonthLength(hMonth, hYear);
            if (hDay > maxDay) {
                hDay = 1;
                hMonth++;
                if (hMonth > 12) {
                    hMonth = 1;
                    hYear++;
                }
            }
        }
        
        return {
            year: hYear,
            month: hMonth,
            day: hDay,
            monthName: this.hijriMonths[hMonth - 1],
            weekday: this.hijriWeekdays[gDate.getDay()]
        };
    }
    
    adjustDate(originalDate, adjustmentDays) {
        if (adjustmentDays === 0) return originalDate;
        
        const adjusted = { ...originalDate };
        let totalDays = adjusted.day + adjustmentDays;
        
        while (totalDays > this.getHijriMonthLength(adjusted.month, adjusted.year)) {
            totalDays -= this.getHijriMonthLength(adjusted.month, adjusted.year);
            adjusted.month++;
            if (adjusted.month > 12) {
                adjusted.month = 1;
                adjusted.year++;
            }
        }
        
        while (totalDays < 1) {
            adjusted.month--;
            if (adjusted.month < 1) {
                adjusted.month = 12;
                adjusted.year--;
            }
            totalDays += this.getHijriMonthLength(adjusted.month, adjusted.year);
        }
        
        adjusted.day = totalDays;
        adjusted.monthName = this.hijriMonths[adjusted.month - 1];
        
        return adjusted;
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

// Initialize global
if (typeof window !== 'undefined') {
    window.hijriCalendar = new HijriCalendar();
    console.log('🕌 Hijri Calendar loaded!');
}