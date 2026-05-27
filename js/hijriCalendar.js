class HijriCalendar {
    constructor() {
        this.hijriMonths = ['মুহাররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান', 'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ্জ'];
        this.hijriWeekdays = ['আহাদ', 'ইছনাইন', 'ছুলাছা', 'আরবিআ', 'খামিস', 'জুমুআ', 'সাবত'];
    }
    
    gregorianToHijri(date) {
        var d = new Date(date);
        if (isNaN(d.getTime())) return { year: 1447, month: 11, day: 10, monthName: 'জিলকদ', weekday: 'আরবিআ' };
        
        var jd = this.gregorianToJulianDay(d.getFullYear(), d.getMonth() + 1, d.getDate());
        var l = jd - 1948440 + 10632;
        var n = Math.floor((l - 1) / 10631);
        var l2 = l - 10631 * n + 354;
        var j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
        var l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
        
        var month = Math.floor((24 * l3) / 709);
        var day = l3 - Math.floor((709 * month) / 24);
        var year = 30 * n + j - 30;
        
        if (month < 1) { month = 12; year--; }
        if (month > 12) { month = 1; year++; }
        
        var maxDay = this.getHijriMonthLength(month, year);
        if (day > maxDay) day = maxDay;
        if (day < 1) day = 1;
        
        return {
            year: year,
            month: month,
            day: day,
            monthName: this.hijriMonths[month - 1],
            weekday: this.hijriWeekdays[d.getDay()]
        };
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
    
    adjustDate(originalDate, adjustmentDays) {
        if (adjustmentDays === 0) return originalDate;
        
        var adj = { year: originalDate.year, month: originalDate.month, day: originalDate.day, monthName: originalDate.monthName, weekday: originalDate.weekday };
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
        var dates = {
            '1': { '10': 'আশুরা' },
            '3': { '12': 'ঈদে মিলাদুন্নবী' },
            '9': { '1': 'রমজান শুরু', '27': 'শবে কদর' },
            '10': { '1': 'ঈদুল ফিতর' },
            '12': { '9': 'আরাফাত দিবস', '10': 'ঈদুল আজহা' }
        };
        
        var m = month.toString();
        var d = day.toString();
        
        if (dates[m] && dates[m][d]) return dates[m][d];
        return null;
    }
    
    formatHijriDate(hijriDate) {
        if (!hijriDate) return 'N/A';
        return hijriDate.day + ' ' + hijriDate.monthName + ' ' + hijriDate.year + ' হি.';
    }
}
