var BengaliCalendar = function() {
    this.months = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'];
    this.seasons = ['গ্রীষ্ম', 'বর্ষা', 'শরৎ', 'হেমন্ত', 'শীত', 'বসন্ত'];
    this.digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    
    this.convert = function(date) {
        var d = new Date(date);
        var year = d.getFullYear() - 593;
        var april14 = new Date(d.getFullYear(), 3, 14);
        if (d < april14) { year--; april14 = new Date(d.getFullYear() - 1, 3, 14); }
        var diff = Math.floor((d - april14) / 86400000) + 1;
        var monthDays = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30];
        var month = 0, day = diff;
        for (var i = 0; i < 12; i++) { if (day <= monthDays[i]) { month = i; break; } day -= monthDays[i]; }
        return { year: year, month: month, day: day, monthName: this.months[month], season: this.seasons[Math.floor(month / 2)] };
    };
    
    this.toBengali = function(num) {
        return String(num).split('').map(function(d) { return this.digits[parseInt(d)]; }.bind(this)).join('');
    };
    
    this.format = function(bd) {
        return this.toBengali(bd.day) + ' ' + bd.monthName + ' ' + this.toBengali(bd.year);
    };
};