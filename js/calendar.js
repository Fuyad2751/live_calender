var CalendarManager = function() {
    var self = this;
    this.englishMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    this.bengaliCal = new BengaliCalendar();
    this.hijriCal = new HijriCalendar();
    
    var now = new Date();
    this.engMonth = now.getMonth();
    this.engYear = now.getFullYear();
    var bd = this.bengaliCal.convert(now);
    this.benMonth = bd.month;
    this.benYear = bd.year;
    var hd = this.hijriCal.convert(now);
    this.hijMonth = hd.month;
    this.hijYear = hd.year;
    
    this.renderEnglish = function(year, month) {
        var grid = document.getElementById('engDaysGrid');
        var title = document.getElementById('engMonthYear');
        if (!grid || !title) return;
        title.textContent = this.englishMonths[month] + ' ' + year;
        var fd = new Date(year, month, 1).getDay();
        var dim = new Date(year, month + 1, 0).getDate();
        var pd = new Date(year, month, 0).getDate();
        var today = new Date();
        var html = '';
        for (var i = fd - 1; i >= 0; i--) { html += '<div class="day-cell other-month"><span>' + (pd - i) + '</span></div>'; }
        for (var d = 1; d <= dim; d++) {
            var isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
            var cls = 'day-cell'; if (isToday) cls += ' today';
            var dow = new Date(year, month, d).getDay(); if (dow === 5 || dow === 6) cls += ' weekend';
            html += '<div class="' + cls + '"><span>' + d + '</span></div>';
        }
        var total = Math.ceil((fd + dim) / 7) * 7;
        var rem = total - (fd + dim);
        for (var d = 1; d <= rem; d++) { html += '<div class="day-cell other-month"><span>' + d + '</span></div>'; }
        grid.innerHTML = html;
    };
    
    this.renderBengali = function(year, month) {
        var grid = document.getElementById('benDaysGrid');
        var title = document.getElementById('benMonthYear');
        if (!grid || !title) return;
        var today = new Date();
        var bd = this.bengaliCal.convert(today);
        title.textContent = this.bengaliCal.months[month] + ' ' + this.bengaliCal.toBengali(year);
        var dim = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30][month];
        var html = '';
        for (var d = 1; d <= dim; d++) {
            var isToday = bd.day === d && bd.month === month && bd.year === year;
            var cls = 'day-cell'; if (isToday) cls += ' today';
            html += '<div class="' + cls + '"><span>' + this.bengaliCal.toBengali(d) + '</span></div>';
        }
        grid.innerHTML = html;
    };
    
    this.renderHijri = function(year, month) {
        var grid = document.getElementById('hijDaysGrid');
        var title = document.getElementById('hijMonthYear');
        if (!grid || !title) return;
        var hd = window.crystalApp ? window.crystalApp.getHijriDate() : this.hijriCal.convert(new Date());
        title.textContent = this.hijriCal.months[month - 1] + ' ' + year + ' হি.';
        var dim = this.hijriCal.monthLength(month, year);
        var html = '';
        for (var d = 1; d <= dim; d++) {
            var isToday = hd.day === d && hd.month === month && hd.year === year;
            var cls = 'day-cell hijri-date'; if (isToday) cls += ' today';
            html += '<div class="' + cls + '"><span>' + d + '</span></div>';
        }
        grid.innerHTML = html;
    };
};