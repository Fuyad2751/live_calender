class HijriCalendar {
    constructor() {
        this.hijriMonths = ['মুহাররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান', 'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ্জ'];
        this.hijriWeekdays = ['আহাদ', 'ইছনাইন', 'ছুলাছা', 'আরবিআ', 'খামিস', 'জুমুআ', 'সাবত'];
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
            var gDate = new Date(gregorianDate);
            if (isNaN(gDate.getTime())) {
                throw new Error('Invalid date');
            }
            return this.accurateConversion(gDate);
        } catch (e) {
            return this.fallbackHijriConversion(gregorianDate);
        }
    }
    
    gregorianToJulianDay(year, month, day) {
        var a = Math.floor((14 - month) / 12);
        var y = year + 4800 - a;
        var m = month + 12 * a - 3;
        return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    }
    
    getHijriMonthLength(month, year) {
        if (month === 12 && this.isHijriLeapYear(year)) return 30;
        return month % 2 === 1 ? 30 : 29;
    }
    
    isHijriLeapYear(year) {
        var leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
        var y = year % 30;
        if (y === 0) y = 30;
        return leapYears.indexOf(y) !== -1;
    }
    
    fallbackHijriConversion(gregorianDate) {
        var date = new Date(gregorianDate);
        var refDate = new Date(622, 6, 16);
        var diffDays = Math.floor((date.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return { year: 1, month: 1, day: 1, monthName: this.hijriMonths[0], weekday: this.hijriWeekdays[date.getDay()] };
        }
        
        var hijriYear = Math.floor(diffDays / 354.367) + 1;
        var remaining = Math.ceil(diffDays - Math.floor((hijriYear - 1) * 354.367));
        var month = 1;
        var monthDays = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
        
        for (var i = 0; i < 12; i++) {
            if (remaining <= monthDays[i]) { month = i + 1; break; }
            remaining -= monthDays[i];
        }
        
        return {
            year: hijriYear,
            month: month,
            day: Math.max(1, Math.min(remaining, 30)),
            monthName: this.hijriMonths[month - 1],
            weekday: this.hijriWeekdays[date.getDay()]
        };
    }
    
    getKnownReferenceDates() {
        return [
            { g: [2024, 1, 1], h: [1445, 6, 19] },
            { g: [2024, 3, 11], h: [1445, 9, 1] },
            { g: [2024, 4, 10], h: [1445, 10, 1] },
            { g: [2025, 1, 1], h: [1446, 7, 1] },
            { g: [2026, 5, 27], h: [1447, 11, 10] }
        ];
    }
    
    accurateConversion(date) {
        var refs = this.getKnownReferenceDates();
        var gDate = new Date(date);
        var best = refs[0];
        var bestDiff = Infinity;
        
        for (var i = 0; i < refs.length; i++) {
            var rd = new Date(refs[i].g[0], refs[i].g[1] - 1, refs[i].g[2]);
            var diff = gDate.getTime() - rd.getTime();
            if (diff >= 0 && diff < bestDiff) {
                bestDiff = diff;
                best = refs[i];
            }
        }
        
        var refDate = new Date(best.g[0], best.g[1] - 1, best.g[2]);
        var diffDays = Math.floor((gDate.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
        
        var hYear = best.h[0];
        var hMonth = best.h[1];
        var hDay = best.h[2];
        
        for (var i = 0; i < diffDays; i++) {
            hDay++;
            var maxDay = this.getHijriMonthLength(hMonth, hYear);
            if (hDay > maxDay) {
                hDay = 1;
                hMonth++;
                if (hMonth > 12) { hMonth = 1; hYear++; }
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
        var adj = {
            year: originalDate.year,
            month: originalDate.month,
            day: originalDate.day,
            monthName: originalDate.monthName,
            weekday: originalDate.weekday
        };
        var total = adj.day + adjustmentDays;
        
        while (total > this.getHijriMonthLength(adj.month, adj.year)) {
            total -= this.getHijriMonthLength(adj.month, adj.year);
            adj.month++;
            if (adj.month > 12) { adj.month = 1; adj.year++; }
        }
        while (total < 1) {
            adj.month--;
            if (adj.month < 1) { adj.month = 12; adj.year--; }
            total += this.getHijriMonthLength(adj.month, adj.year);
        }
        adj.day = total;
        adj.monthName = this.hijriMonths[adj.month - 1];
        return adj;
    }
    
    isImportantDate(month, day) {
        var mk = month.toString();
        var dk = day.toString();
        if (this.importantDates[mk] && this.importantDates[mk][dk]) {
            return this.importantDates[mk][dk];
        }
        return null;
    }
    
    formatHijriDate(hijriDate) {
        if (!hijriDate) return 'N/A';
        return hijriDate.day + ' ' + hijriDate.monthName + ' ' + hijriDate.year + ' হি.';
    }
}

if (typeof window !== 'undefined') {
    window.hijriCalendar = new HijriCalendar();
}