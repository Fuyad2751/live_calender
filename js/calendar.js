// Calendar Manager - Updated for Crystal Theme
class CalendarManager {
    constructor() {
        this.currentEnglishDate = new Date();
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
        
        // Initialize current months
        this.currentEnglishMonth = new Date().getMonth();
        this.currentEnglishYear = new Date().getFullYear();
        
        const now = new Date();
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
        
        // Check if elements exist
        if (!daysGrid || !monthYearTitle) {
            console.warn('English calendar elements not found in DOM');
            return;
        }
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();
        
        monthYearTitle.textContent = `${this.englishMonths[month]} ${year}`;
        
        let html = '';
        const today = new Date();
        
        // Adjust today for timezone if specified
        let todayDate = today.getDate();
        let todayMonth = today.getMonth();
        let todayYear = today.getFullYear();
        
        if (timezone) {
            try {
                const options = { timeZone: timezone };
                const timeString = today.toLocaleString('en-US', options);
                const tzDate = new Date(timeString);
                todayDate = tzDate.getDate();
                todayMonth = tzDate.getMonth();
                todayYear = tzDate.getFullYear();
            } catch (error) {
                console.warn('Timezone adjustment failed, using local time');
            }
        }
        
        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayNumber = prevMonthDays - i;
            html += `<div class="day-cell other-month" data-date="${year}-${month}-${dayNumber}">
                <span class="day-number">${dayNumber}</span>
            </div>`;
        }
        
        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = todayDate === day && 
                           todayMonth === month && 
                           todayYear === year;
            const dayOfWeek = new Date(year, month, day).getDay();
            const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday & Saturday
            
            let classes = 'day-cell';
            if (isToday) classes += ' today';
            if (isWeekend) classes += ' weekend';
            
            html += `<div class="${classes}" data-date="${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}">
                <span class="day-number">${day}</span>
                ${isToday ? '<span class="today-dot"></span>' : ''}
            </div>`;
        }
        
        // Next month days
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        const nextMonthDays = totalCells - (firstDay + daysInMonth);
        const nextMonth = month + 1 > 11 ? 0 : month + 1;
        const nextYear = month + 1 > 11 ? year + 1 : year;
        
        for (let i = 1; i <= nextMonthDays; i++) {
            html += `<div class="day-cell other-month" data-date="${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}">
                <span class="day-number">${i}</span>
            </div>`;
        }
        
        daysGrid.innerHTML = html;
        
        // Add click events to day cells
        this.addDayCellEvents(daysGrid);
    }
    
    renderBengaliCalendar(year, month, timezone = null) {
        const daysGrid = document.getElementById('benDaysGrid');
        const monthYearTitle = document.getElementById('benMonthYear');
        
        // Check if elements exist
        if (!daysGrid || !monthYearTitle) {
            console.warn('Bengali calendar elements not found in DOM');
            return;
        }
        
        const today = new Date();
        const bengaliDate = this.bengaliCalendar.gregorianToBengali(today);
        
        monthYearTitle.textContent = `${this.bengaliCalendar.bengaliMonths[month]} ${this.bengaliCalendar.toBengaliNumeral(year)}`;
        
        // Bengali calendar month days (approximate)
        const monthDays = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30];
        const daysInMonth = monthDays[month];
        
        let html = '';
        
        // Calculate first day of week (simplified)
        const firstDay = (year + month) % 7; // Simple calculation
        
        // Add empty cells for start of month
        for (let i = 0; i < firstDay; i++) {
            html += `<div class="day-cell other-month"><span class="day-number">•</span></div>`;
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = bengaliDate.day === day && 
                           bengaliDate.month === month &&
                           bengaliDate.year === year;
            
            let classes = 'day-cell';
            if (isToday) classes += ' today';
            
            html += `<div class="${classes}">
                <span class="day-number">${this.bengaliCalendar.toBengaliNumeral(day)}</span>
                ${isToday ? '<span class="today-dot"></span>' : ''}
            </div>`;
        }
        
        daysGrid.innerHTML = html;
    }
    
   renderHijriCalendar(year, month, timezone = null) {
    const daysGrid = document.getElementById('hijDaysGrid');
    const monthYearTitle = document.getElementById('hijMonthYear');
    
    // Check if elements exist
    if (!daysGrid || !monthYearTitle) {
        console.warn('Hijri calendar elements not found in DOM');
        return;
    }
    
    const today = new Date();
    
    // Get accurate Hijri date
    const hijriDate = this.hijriCalendar.gregorianToHijri(today);
    
    // Update title with current displayed month/year
    monthYearTitle.textContent = `${this.hijriCalendar.hijriMonths[month - 1]} ${year} হি.`;
    
    // Get correct month length
    const daysInMonth = this.hijriCalendar.getHijriMonthLength(month, year);
    
    let html = '';
    
    // Calculate first day of the month (simplified)
    // For a more accurate first day calculation, we would need to know the weekday of 1st of the month
    const firstDayOfMonth = this.getHijriFirstDayOfWeek(year, month);
    
    // Add empty cells for start of month
    for (let i = 0; i < firstDayOfMonth; i++) {
        html += `<div class="day-cell other-month"><span class="day-number">•</span></div>`;
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = hijriDate.day === day && 
                       hijriDate.month === month &&
                       hijriDate.year === year;
        
        let classes = 'day-cell hijri-date';
        if (isToday) classes += ' today';
        
        // Check for important Islamic dates
        const importantDate = this.hijriCalendar.isImportantDate(month, day);
        const tooltip = importantDate ? ` title="${importantDate}"` : '';
        
        html += `<div class="${classes}"${tooltip}>
            <span class="day-number">${day}</span>
            ${importantDate ? '<span class="important-dot" title="' + importantDate + '">•</span>' : ''}
            ${isToday ? '<span class="today-dot"></span>' : ''}
        </div>`;
    }
    
    daysGrid.innerHTML = html;
}

// Helper method to get the first day of week for a Hijri month
getHijriFirstDayOfWeek(year, month) {
    // This is a simplified calculation
    // For accurate results, we would need to calculate the exact Julian day
    const today = new Date();
    const hijriDate = this.hijriCalendar.gregorianToHijri(today);
    
    // Calculate difference between current month and displayed month
    const monthDiff = (year - hijriDate.year) * 12 + (month - hijriDate.month);
    const approximateDays = monthDiff * 29.5;
    
    // Get weekday of today
    const todayWeekday = today.getDay();
    
    // Calculate first day of displayed month
    const firstDay = (todayWeekday - (hijriDate.day - 1) + approximateDays) % 7;
    
    // Ensure positive value
    return ((firstDay % 7) + 7) % 7;
}
    
    addDayCellEvents(gridElement) {
        const dayCells = gridElement.querySelectorAll('.day-cell:not(.other-month)');
        
        dayCells.forEach(cell => {
            cell.addEventListener('click', () => {
                // Remove previous selection
                gridElement.querySelectorAll('.day-cell.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                
                // Add selection to clicked cell
                cell.classList.add('selected');
                
                // Get date from data attribute
                const dateAttr = cell.dataset.date;
                if (dateAttr) {
                    console.log('Selected date:', dateAttr);
                    // You can add more functionality here
                }
            });
        });
    }
    
    // Helper method to format date
    formatDate(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    // Get calendar metadata
    getCalendarInfo(calendarType) {
        switch(calendarType) {
            case 'english':
                return {
                    months: this.englishMonths,
                    weekdays: this.englishWeekdays,
                    currentMonth: this.currentEnglishMonth,
                    currentYear: this.currentEnglishYear
                };
            case 'bengali':
                return {
                    months: this.bengaliCalendar.bengaliMonths,
                    weekdays: this.englishWeekdays,
                    currentMonth: this.currentBengaliMonth,
                    currentYear: this.currentBengaliYear
                };
            case 'hijri':
                return {
                    months: this.hijriCalendar.hijriMonths,
                    weekdays: this.hijriCalendar.hijriWeekdays,
                    currentMonth: this.currentHijriMonth,
                    currentYear: this.currentHijriYear
                };
            default:
                return null;
        }
    }
}

// Also update the BengaliCalendar class to handle edge cases better
// Add this at the beginning of bengaliCalendar.js if not already there:

// Ensure BengaliCalendar class is properly defined
if (typeof BengaliCalendar === 'undefined') {
    console.error('BengaliCalendar class not loaded. Make sure bengaliCalendar.js is loaded before calendar.js');
}

// Ensure HijriCalendar class is properly defined
if (typeof HijriCalendar === 'undefined') {
    console.error('HijriCalendar class not loaded. Make sure hijriCalendar.js is loaded before calendar.js');
}