class CalendarManager {
    constructor() {
        this.englishMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
        this.bengaliCalendar = new BengaliCalendar();
        this.hijriCalendar = new HijriCalendar();
        
        var now = new Date();
        this.currentEnglishMonth = now.getMonth();
        this.currentEnglishYear = now.getFullYear();
        
        var bd = this.bengaliCalendar.gregorianToBengali(now);
        this.currentBengaliMonth = bd.month;
        this.currentBengaliYear = bd.year;
        
        var hd = this.hijriCalendar.gregorianToHijri(now);
        this.currentHijriMonth = hd.month;
        this.currentHijriYear = hd.year;
    }
    
    renderEnglishCalendar(year, month) {
        var grid = document.getElementById('engDaysGrid');
        var title = document.getElementById('engMonthYear');
        if (!grid || !title) return;
        
        title.textContent = this.englishMonths[month] + ' ' + year;
        
        var firstDay = new Date(year, month, 1).getDay();
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var prevDays = new Date(year, month, 0).getDate();
        var today = new Date();
        
        var html = '';
        
        for (var i = firstDay - 1; i >= 0; i--) {
            html += '<div class="day-cell other-month"><span>' + (prevDays - i) + '</span></div>';
        }
        
        for (var d = 1; d <= daysInMonth; d++) {
            var isToday = (today.getDate() === d && today.getMonth() === month && today.getFullYear() === year);
            var dow = new Date(year, month, d).getDay();
            var cls = 'day-cell';
            if (isToday) cls += ' today';
            if (dow === 5 || dow === 6) cls += ' weekend';
            
            html += '<div class="' + cls + '"><span>' + d + '</span></div>';
        }
        
        var totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        var remaining = totalCells - (firstDay + daysInMonth);
        
        for (var d = 1; d <= remaining; d++) {
            html += '<div class="day-cell other-month"><span>' + d + '</span></div>';
        }
        
        grid.innerHTML = html;
    }
    
    renderBengaliCalendar(year, month) {
        var grid = document.getElementById('benDaysGrid');
        var title = document.getElementById('benMonthYear');
        if (!grid || !title) return;
        
        var today = new Date();
        var bd = this.bengaliCalendar.gregorianToBengali(today);
        
        title.textContent = this.bengaliCalendar.bengaliMonths[month] + ' ' + this.bengaliCalendar.toBengaliNumeral(year);
        
        var monthDays = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30];
        var dim = monthDays[month];
        var firstDay = (year + month) % 7;
        
        var html = '';
        
        for (var i = 0; i < firstDay; i++) {
            html += '<div class="day-cell other-month"><span>•</span></div>';
        }
        
        for (var d = 1; d <= dim; d++) {
            var isToday = (bd.day === d && bd.month === month && bd.year === year);
            var cls = 'day-cell';
            if (isToday) cls += ' today';
            
            html += '<div class="' + cls + '"><span>' + this.bengaliCalendar.toBengaliNumeral(d) + '</span></div>';
        }
        
        grid.innerHTML = html;
    }
    
    renderHijriCalendar(year, month) {
        var grid = document.getElementById('hijDaysGrid');
        var title = document.getElementById('hijMonthYear');
        if (!grid || !title) return;
        
        var hd;
        if (window.crystalApp) {
            hd = window.crystalApp.getAdjustedHijriDate();
        } else {
            hd = this.hijriCalendar.gregorianToHijri(new Date());
        }
        
        title.innerHTML = this.hijriCalendar.hijriMonths[month - 1] + ' ' + year + ' হি.';
        
        var dim = this.hijriCalendar.getHijriMonthLength(month, year);
        var firstDay = this.getHijriFirstDayOfWeek(year, month);
        
        var html = '';
        
        for (var i = 0; i < firstDay; i++) {
            html += '<div class="day-cell other-month"><span>•</span></div>';
        }
        
        for (var d = 1; d <= dim; d++) {
            var isToday = (hd.day === d && hd.month === month && hd.year === year);
            var cls = 'day-cell hijri-date';
            if (isToday) cls += ' today';
            
            html += '<div class="' + cls + '"><span>' + d + '</span></div>';
        }
        
        grid.innerHTML = html;
    }
    
    getHijriFirstDayOfWeek(year, month) {
        var today = new Date();
        var hd = this.hijriCalendar.gregorianToHijri(today);
        var monthDiff = (year - hd.year) * 12 + (month - hd.month);
        var approxDays = Math.round(monthDiff * 29.5);
        var fd = (today.getDay() - (hd.day - 1) + approxDays) % 7;
        return ((fd % 7) + 7) % 7;
    }
}
