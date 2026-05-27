// Calendar Manager
class CalendarManager {
    constructor() {
        this.englishMonths = [
            'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
            'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
        ];
        this.englishWeekdays = [
            'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার',
            'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
        ];
        this.bengaliCalendar = new BengaliCalendar();
        this.hijriCalendar = new HijriCalendar();
        
        const now = new Date();
        this.currentEnglishMonth = now.getMonth();
        this.currentEnglishYear = now.getFullYear();
        
        const bengaliDate = this.bengaliCalendar.gregorianToBengali(now);
        this.currentBengaliMonth = bengaliDate.month;
        this.currentBengaliYear = bengaliDate.year;
        
        const hijriDate = this.hijriCalendar.gregorianToHijri(now);
        this.currentHijriMonth = hijriDate.month;
        this.currentHijriYear = hijriDate.year;
    }
    
    renderEnglishCalendar(year, month, timezone = null) {
        const daysGrid = document.getElementById('engDaysGrid');
        const monthYearTitle = document.getElementById('engMonthYear');
        
        if (!daysGrid || !monthYearTitle) return;
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();
        
        monthYearTitle.textContent = `${this.englishMonths[month]} ${year}`;
        
        const today = new Date();
        let todayDate = today.getDate();
        let todayMonth = today.getMonth();
        let todayYear = today.getFullYear();
        
        let html = '';
        
        // Previous month
        for (let i = firstDay - 1; i >= 0; i--) {
            html += `<div class="day-cell other-month"><span class="day-number">${prevMonthDays - i}</span></div>`;
        }
        
        // Current month
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = todayDate === day && todayMonth === month && todayYear === year;
            const dayOfWeek = new Date(year, month, day).getDay();
            const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
            
            let classes = 'day-cell';
            if (isToday) classes += ' today';
            if (isWeekend) classes += ' weekend';
            
            html += `<div class="${classes}"><span class="day-number">${day}</span>${isToday ? '<span class="today-dot"></span>' : ''}</div>`;
        }
        
        // Next month
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        const nextMonthDays = totalCells - (firstDay + daysInMonth);
        
        for (let i = 1; i <= nextMonthDays; i++) {
            html += `<div class="day-cell other-month"><span class="day-number">${i}</span></div>`;
        }
        
        daysGrid.innerHTML = html;
    }
    
    renderBengaliCalendar(year, month, timezone = null) {
        const daysGrid = document.getElementById('benDaysGrid');
        const monthYearTitle = document.getElementById('benMonthYear');
        
        if (!daysGrid || !monthYearTitle) return;
        
        const today = new Date();
        const bengaliDate = this.bengaliCalendar.gregorianToBengali(today);
        
        monthYearTitle.textContent = `${this.bengaliCalendar.bengaliMonths[month]} ${this.bengaliCalendar.toBengaliNumeral(year)}`;
        
        const monthDays = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30];
        const daysInMonth = monthDays[month];
        const firstDay = (year + month) % 7;
        
        let html = '';
        
        for (let i = 0; i < firstDay; i++) {
            html += `<div class="day-cell other-month"><span class="day-number">•</span></div>`;
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = bengaliDate.day === day && bengaliDate.month === month && bengaliDate.year === year;
            let classes = 'day-cell';
            if (isToday) classes += ' today';
            
            html += `<div class="${classes}"><span class="day-number">${this.bengaliCalendar.toBengaliNumeral(day)}</span>${isToday ? '<span class="today-dot"></span>' : ''}</div>`;
        }
        
        daysGrid.innerHTML = html;
    }
    
    renderHijriCalendar(year, month, timezone = null) {
        const daysGrid = document.getElementById('hijDaysGrid');
        const monthYearTitle = document.getElementById('hijMonthYear');
        
        if (!daysGrid || !monthYearTitle) return;
        
        let currentHijriDate;
        if (window.crystalApp && typeof window.crystalApp.getAdjustedHijriDate === 'function') {
            currentHijriDate = window.crystalApp.getAdjustedHijriDate();
        } else {
            currentHijriDate = this.hijriCalendar.gregorianToHijri(new Date());
        }
        
        monthYearTitle.innerHTML = `${this.hijriCalendar.hijriMonths[month - 1]} ${year} হি.`;
        
        const daysInMonth = this.hijriCalendar.getHijriMonthLength(month, year);
        const firstDayOfMonth = this.getHijriFirstDayOfWeek(year, month);
        
        let html = '';
        
        for (let i = 0; i < firstDayOfMonth; i++) {
            html += `<div class="day-cell other-month"><span class="day-number">•</span></div>`;
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = currentHijriDate.day === day && currentHijriDate.month === month && currentHijriDate.year === year;
            let classes = 'day-cell hijri-date';
            if (isToday) classes += ' today';
            
            const importantDate = this.hijriCalendar.isImportantDate(month, day);
            
            html += `<div class="${classes}">
                <span class="day-number">${day}</span>
                ${importantDate ? '<span class="important-dot">•</span>' : ''}
                ${isToday ? '<span class="today-dot"></span>' : ''}
            </div>`;
        }
        
        daysGrid.innerHTML = html;
    }
    
    getHijriFirstDayOfWeek(year, month) {
        const today = new Date();
        const hijriDate = this.hijriCalendar.gregorianToHijri(today);
        const monthDiff = (year - hijriDate.year) * 12 + (month - hijriDate.month);
        const approximateDays = monthDiff * 29.5;
        const todayWeekday = today.getDay();
        const firstDay = (todayWeekday - (hijriDate.day - 1) + Math.round(approximateDays)) % 7;
        return ((firstDay % 7) + 7) % 7;
    }
    
    formatDate(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    getCalendarInfo(calendarType) {
        switch(calendarType) {
            case 'english':
                return { months: this.englishMonths, weekdays: this.englishWeekdays, currentMonth: this.currentEnglishMonth, currentYear: this.currentEnglishYear };
            case 'bengali':
                return { months: this.bengaliCalendar.bengaliMonths, weekdays: this.englishWeekdays, currentMonth: this.currentBengaliMonth, currentYear: this.currentBengaliYear };
            case 'hijri':
                return { months: this.hijriCalendar.hijriMonths, weekdays: this.hijriCalendar.hijriWeekdays, currentMonth: this.currentHijriMonth, currentYear: this.currentHijriYear };
            default:
                return null;
        }
    }
}

console.log('📅 Calendar Manager loaded!');