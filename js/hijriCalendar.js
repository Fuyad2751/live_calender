var HijriCalendar = function() {
    this.months = ['মুহাররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান', 'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ্জ'];
    
    this.convert = function(date) {
        var d = new Date(date);
        var jd = this.toJD(d.getFullYear(), d.getMonth() + 1, d.getDate());
        var l = jd - 1948440 + 10632;
        var n = Math.floor((l - 1) / 10631);
        var l2 = l - 10631 * n + 354;
        var j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
        var l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
        var month = Math.floor((24 * l3) / 709);
        var day = l3 - Math.floor((709 * month) / 24);
        var year = 30 * n + j - 30;
        return { year: year, month: month, day: day, monthName: this.months[month - 1] };
    };
    
    this.toJD = function(y, m, d) {
        var a = Math.floor((14 - m) / 12);
        y = y + 4800 - a;
        m = m + 12 * a - 3;
        return d + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    };
    
    this.monthLength = function(month, year) { return month % 2 === 1 ? 30 : 29; };
    
    this.adjust = function(date, days) {
        if (days === 0) return date;
        var d = { year: date.year, month: date.month, day: date.day, monthName: date.monthName };
        d.day += days;
        while (d.day > this.monthLength(d.month, d.year)) { d.day -= this.monthLength(d.month, d.year); d.month++; if (d.month > 12) { d.month = 1; d.year++; } }
        while (d.day < 1) { d.month--; if (d.month < 1) { d.month = 12; d.year--; } d.day += this.monthLength(d.month, d.year); }
        d.monthName = this.months[d.month - 1];
        return d;
    };
    
    this.format = function(hd) { return hd.day + ' ' + hd.monthName + ' ' + hd.year + ' হি.'; };
};