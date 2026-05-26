// Bengali Calendar Converter - Updated
class BengaliCalendar {
    constructor() {
        this.bengaliMonths = [
            'বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র',
            'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ',
            'ফাল্গুন', 'চৈত্র'
        ];
        
        this.bengaliSeasons = [
            'গ্রীষ্ম', 'বর্ষা', 'শরৎ', 'হেমন্ত', 'শীত', 'বসন্ত'
        ];
        
        this.bengaliWeekdays = [
            'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার',
            'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
        ];
        
        this.bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    }
    
    // Convert Gregorian to Bengali date
    gregorianToBengali(gregorianDate) {
        try {
            const gDate = new Date(gregorianDate);
            
            // Validate date
            if (isNaN(gDate.getTime())) {
                throw new Error('Invalid date provided');
            }
            
            // Bengali year is Gregorian year - 593
            let bengaliYear = gDate.getFullYear() - 593;
            
            // Pohela Boishakh is on April 14
            const april14 = new Date(gDate.getFullYear(), 3, 14); // Month is 0-indexed
            
            let diffDays;
            let actualBengaliYear;
            
            if (gDate >= april14) {
                // After April 14 of current year
                const diffTime = gDate.getTime() - april14.getTime();
                diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
                actualBengaliYear = bengaliYear;
            } else {
                // Before April 14 (previous Bengali year)
                const prevApril14 = new Date(gDate.getFullYear() - 1, 3, 14);
                const diffTime = gDate.getTime() - prevApril14.getTime();
                diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
                actualBengaliYear = bengaliYear - 1;
            }
            
            // Calculate Bengali month and day
            const monthDays = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30];
            let remainingDays = diffDays;
            let bengaliMonth = 0;
            
            for (let i = 0; i < 12; i++) {
                if (remainingDays <= monthDays[i]) {
                    bengaliMonth = i;
                    break;
                }
                remainingDays -= monthDays[i];
                if (i === 11) {
                    // If we go beyond all months, stay in the last month
                    bengaliMonth = 11;
                    remainingDays = Math.min(remainingDays, monthDays[11]);
                }
            }
            
            return {
                year: actualBengaliYear,
                month: bengaliMonth,
                day: remainingDays,
                monthName: this.bengaliMonths[bengaliMonth],
                season: this.getSeason(bengaliMonth)
            };
        } catch (error) {
            console.error('Error converting to Bengali date:', error);
            // Return a fallback date
            return {
                year: new Date().getFullYear() - 593,
                month: 0,
                day: 1,
                monthName: this.bengaliMonths[0],
                season: this.bengaliSeasons[0]
            };
        }
    }
    
    getSeason(monthIndex) {
        if (monthIndex >= 0 && monthIndex <= 1) return this.bengaliSeasons[0]; // গ্রীষ্ম
        if (monthIndex >= 2 && monthIndex <= 3) return this.bengaliSeasons[1]; // বর্ষা
        if (monthIndex >= 4 && monthIndex <= 5) return this.bengaliSeasons[2]; // শরৎ
        if (monthIndex >= 6 && monthIndex <= 7) return this.bengaliSeasons[3]; // হেমন্ত
        if (monthIndex >= 8 && monthIndex <= 9) return this.bengaliSeasons[4]; // শীত
        return this.bengaliSeasons[5]; // বসন্ত
    }
    
    toBengaliNumeral(number) {
        if (number === undefined || number === null) return '০';
        return number.toString().split('').map(digit => {
            const num = parseInt(digit);
            return isNaN(num) ? digit : this.bengaliDigits[num];
        }).join('');
    }
    
    formatBengaliDate(bengaliDate) {
        if (!bengaliDate) return 'তারিখ পাওয়া যায়নি';
        return `${this.toBengaliNumeral(bengaliDate.day)} ${bengaliDate.monthName} ${this.toBengaliNumeral(bengaliDate.year)}`;
    }
}