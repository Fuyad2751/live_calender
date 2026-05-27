// Crystal Calendar App
class CrystalCalendarApp {
    constructor() {
        this.calendarManager = new CalendarManager();
        this.selectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.currentCalendar = 'english';
        this.clockInterval = null;
        this.sunTimesInterval = null;
        this.sunTimes = null;
        this.hijriAdjustment = 0;
        this.init();
    }
    
    init() {
        this.setupTimezoneSelector();
        this.setupCalendarTabs();
        this.setupNavigationButtons();
        this.setupTodayButtons();
        this.setupHijriAdjustment();
        this.startCrystalClock();
        this.renderAllCalendars();
        this.updateAllInfo();
        this.sunTimes = this.getCurrentSunTimes();
        this.updateSunTimes();
        
        this.clockInterval = setInterval(() => {
            this.updateCrystalClock();
            this.updateSunCountdown();
        }, 1000);
        
        this.sunTimesInterval = setInterval(() => {
            this.updateAllInfo();
            this.sunTimes = this.getCurrentSunTimes();
            this.updateSunTimes();
        }, 60000);
        
        window.addEventListener('themeChanged', () => this.renderAllCalendars());
        window.addEventListener('resize', () => this.handleResize());
    }
    
    getCurrentDateTime() {
        let date = new Date();
        if (this.selectedTimezone) {
            try {
                const options = { timeZone: this.selectedTimezone };
                const timeString = date.toLocaleString('en-US', options);
                date = new Date(timeString);
            } catch (error) {
                console.warn('Invalid timezone');
            }
        }
        return date;
    }
    
    getCurrentSunTimes() {
        try {
            const now = this.getCurrentDateTime();
            if (window.sunTimesCalculator) {
                return window.sunTimesCalculator.calculateSunTimes(now, 23.8103, 90.4125, this.selectedTimezone);
            }
        } catch (error) {
            console.error('Sun times error:', error);
        }
        return null;
    }
    
    getAdjustedHijriDate() {
        const now = this.getCurrentDateTime();
        let hijriDate = this.calendarManager.hijriCalendar.gregorianToHijri(now);
        if (this.hijriAdjustment !== 0) {
            hijriDate = this.calendarManager.hijriCalendar.adjustDate(hijriDate, this.hijriAdjustment);
        }
        return hijriDate;
    }
    
    updateSunTimes() {
        if (!this.sunTimes) this.sunTimes = this.getCurrentSunTimes();
        if (!this.sunTimes) return;
        
        try {
            const sunriseEl = document.getElementById('sunriseTime');
            const sunsetEl = document.getElementById('sunsetTime');
            const dayLenEl = document.getElementById('dayLength');
            const noonEl = document.getElementById('solarNoon');
            
            if (sunriseEl) sunriseEl.textContent = window.sunTimesCalculator.formatTime(this.sunTimes.sunrise, this.selectedTimezone);
            if (sunsetEl) sunsetEl.textContent = window.sunTimesCalculator.formatTime(this.sunTimes.sunset, this.selectedTimezone);
            if (dayLenEl && this.sunTimes.dayLength) {
                dayLenEl.textContent = `${String(this.sunTimes.dayLength.hours).padStart(2, '0')}:${String(this.sunTimes.dayLength.minutes).padStart(2, '0')} ঘন্টা`;
            }
            if (noonEl) noonEl.textContent = window.sunTimesCalculator.formatTime(this.sunTimes.solarNoon, this.selectedTimezone);
            
            this.updateSunPosition();
            this.updateDaylightStatus();
            this.updateSunCountdown();
        } catch (error) {
            console.error('Update sun times error:', error);
        }
    }
    
    updateSunCountdown() {
        if (!this.sunTimes) return;
        try {
            const now = this.getCurrentDateTime();
            const sunriseEl = document.getElementById('sunriseCountdown');
            const sunsetEl = document.getElementById('sunsetCountdown');
            
            if (sunriseEl && this.sunTimes.sunrise) {
                let st = new Date(this.sunTimes.sunrise);
                let diff = st.getTime() - now.getTime();
                if (diff < 0) { st.setDate(st.getDate() + 1); diff = st.getTime() - now.getTime(); }
                const h = Math.floor(Math.abs(diff) / 3600000);
                const m = Math.floor((Math.abs(diff) % 3600000) / 60000);
                sunriseEl.textContent = h < 1 ? `আর ${m} মিনিট` : `আর ${h} ঘ. ${m} মি.`;
            }
            
            if (sunsetEl && this.sunTimes.sunset) {
                let st = new Date(this.sunTimes.sunset);
                let diff = st.getTime() - now.getTime();
                if (diff < 0) { st.setDate(st.getDate() + 1); diff = st.getTime() - now.getTime(); }
                const h = Math.floor(Math.abs(diff) / 3600000);
                const m = Math.floor((Math.abs(diff) % 3600000) / 60000);
                sunsetEl.textContent = h < 1 ? `আর ${m} মিনিট` : `আর ${h} ঘ. ${m} মি.`;
            }
        } catch (error) {
            console.error('Countdown error:', error);
        }
    }
    
    updateSunPosition() {
        if (!this.sunTimes) return;
        const marker = document.getElementById('sunMarker');
        if (!marker) return;
        
        try {
            const now = this.getCurrentDateTime();
            const sunrise = new Date(this.sunTimes.sunrise);
            const sunset = new Date(this.sunTimes.sunset);
            const total = sunset.getTime() - sunrise.getTime();
            const current = now.getTime() - sunrise.getTime();
            let percent = Math.max(0, Math.min(100, (current / total) * 100));
            
            marker.style.left = `${percent}%`;
            
            if (now < sunrise || now > sunset) {
                marker.innerHTML = '<i class="fas fa-moon"></i>';
                marker.style.color = '#6366f1';
            } else {
                marker.innerHTML = '<i class="fas fa-sun"></i>';
                marker.style.color = '#f59e0b';
            }
        } catch (error) {
            console.error('Sun position error:', error);
        }
    }
    
    updateDaylightStatus() {
        if (!this.sunTimes) return;
        const statusEl = document.getElementById('daylightStatus');
        const posEl = document.getElementById('sunPosition');
        
        try {
            const now = this.getCurrentDateTime();
            const sunrise = new Date(this.sunTimes.sunrise);
            const sunset = new Date(this.sunTimes.sunset);
            
            if (now >= sunrise && now <= sunset) {
                if (statusEl) statusEl.textContent = '☀️ দিন';
                if (posEl) posEl.textContent = 'দিনের আলো';
            } else {
                if (statusEl) statusEl.textContent = '🌙 রাত';
                if (posEl) posEl.textContent = 'রাতের বেলা';
            }
        } catch (error) {
            console.error('Daylight status error:', error);
        }
    }
    
    setupHijriAdjustment() {
        const decBtn = document.getElementById('hijriDecreaseDay');
        const incBtn = document.getElementById('hijriIncreaseDay');
        const rstBtn = document.getElementById('hijriResetAdjustment');
        
        if (!decBtn || !incBtn || !rstBtn) return;
        
        const saved = localStorage.getItem('hijriAdjustment');
        if (saved) { this.hijriAdjustment = parseInt(saved); this.updateAdjustmentDisplay(); }
        
        decBtn.addEventListener('click', () => {
            this.hijriAdjustment--;
            this.updateAdjustmentDisplay();
            this.saveHijriAdjustment();
            this.renderAllCalendars();
        });
        
        incBtn.addEventListener('click', () => {
            this.hijriAdjustment++;
            this.updateAdjustmentDisplay();
            this.saveHijriAdjustment();
            this.renderAllCalendars();
        });
        
        rstBtn.addEventListener('click', () => {
            this.hijriAdjustment = 0;
            this.updateAdjustmentDisplay();
            this.saveHijriAdjustment();
            this.renderAllCalendars();
        });
        
        this.updateAdjustmentDisplay();
    }
    
    updateAdjustmentDisplay() {
        const valEl = document.getElementById('hijriAdjustmentValue');
        const display = document.querySelector('.adjustment-display');
        
        if (valEl) {
            valEl.textContent = this.hijriAdjustment > 0 ? `+${this.hijriAdjustment}` : this.hijriAdjustment.toString();
        }
        if (display) {
            display.classList.toggle('active-adjustment', this.hijriAdjustment !== 0);
        }
    }
    
    saveHijriAdjustment() {
        localStorage.setItem('hijriAdjustment', this.hijriAdjustment.toString());
    }
    
    setupTimezoneSelector() {
        const select = document.getElementById('timezoneSelect');
        if (!select) return;
        select.value = this.selectedTimezone;
        select.addEventListener('change', (e) => {
            this.selectedTimezone = e.target.value;
            this.updateCrystalClock();
            this.renderAllCalendars();
        });
    }
    
    setupCalendarTabs() {
        document.querySelectorAll('.crystal-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.calendar;
                if (!type) return;
                
                document.querySelectorAll('.crystal-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                document.querySelectorAll('.calendar-panel').forEach(p => p.classList.remove('active'));
                const panel = document.getElementById(`${type}Calendar`);
                if (panel) panel.classList.add('active');
                
                this.currentCalendar = type;
            });
        });
    }
    
    setupNavigationButtons() {
        const bind = (id, cb) => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', cb);
        };
        
        bind('engPrevMonth', () => {
            this.calendarManager.currentEnglishMonth--;
            if (this.calendarManager.currentEnglishMonth < 0) { this.calendarManager.currentEnglishMonth = 11; this.calendarManager.currentEnglishYear--; }
            this.calendarManager.renderEnglishCalendar(this.calendarManager.currentEnglishYear, this.calendarManager.currentEnglishMonth);
        });
        
        bind('engNextMonth', () => {
            this.calendarManager.currentEnglishMonth++;
            if (this.calendarManager.currentEnglishMonth > 11) { this.calendarManager.currentEnglishMonth = 0; this.calendarManager.currentEnglishYear++; }
            this.calendarManager.renderEnglishCalendar(this.calendarManager.currentEnglishYear, this.calendarManager.currentEnglishMonth);
        });
        
        bind('benPrevMonth', () => {
            this.calendarManager.currentBengaliMonth--;
            if (this.calendarManager.currentBengaliMonth < 0) { this.calendarManager.currentBengaliMonth = 11; this.calendarManager.currentBengaliYear--; }
            this.calendarManager.renderBengaliCalendar(this.calendarManager.currentBengaliYear, this.calendarManager.currentBengaliMonth);
        });
        
        bind('benNextMonth', () => {
            this.calendarManager.currentBengaliMonth++;
            if (this.calendarManager.currentBengaliMonth > 11) { this.calendarManager.currentBengaliMonth = 0; this.calendarManager.currentBengaliYear++; }
            this.calendarManager.renderBengaliCalendar(this.calendarManager.currentBengaliYear, this.calendarManager.currentBengaliMonth);
        });
        
        bind('hijPrevMonth', () => {
            this.calendarManager.currentHijriMonth--;
            if (this.calendarManager.currentHijriMonth < 1) { this.calendarManager.currentHijriMonth = 12; this.calendarManager.currentHijriYear--; }
            this.calendarManager.renderHijriCalendar(this.calendarManager.currentHijriYear, this.calendarManager.currentHijriMonth);
        });
        
        bind('hijNextMonth', () => {
            this.calendarManager.currentHijriMonth++;
            if (this.calendarManager.currentHijriMonth > 12) { this.calendarManager.currentHijriMonth = 1; this.calendarManager.currentHijriYear++; }
            this.calendarManager.renderHijriCalendar(this.calendarManager.currentHijriYear, this.calendarManager.currentHijriMonth);
        });
    }
    
    setupTodayButtons() {
        ['engTodayBtn', 'benTodayBtn', 'hijTodayBtn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.resetAllToToday();
                    this.renderAllCalendars();
                });
            }
        });
    }
    
    resetAllToToday() {
        const now = this.getCurrentDateTime();
        this.calendarManager.currentEnglishMonth = now.getMonth();
        this.calendarManager.currentEnglishYear = now.getFullYear();
        
        const bDate = this.calendarManager.bengaliCalendar.gregorianToBengali(now);
        this.calendarManager.currentBengaliMonth = bDate.month;
        this.calendarManager.currentBengaliYear = bDate.year;
        
        const hDate = this.calendarManager.hijriCalendar.gregorianToHijri(now);
        this.calendarManager.currentHijriMonth = hDate.month;
        this.calendarManager.currentHijriYear = hDate.year;
    }
    
    startCrystalClock() { this.updateCrystalClock(); }
    
    updateCrystalClock() {
        const now = this.getCurrentDateTime();
        const h = now.getHours(), m = String(now.getMinutes()).padStart(2, '0'), s = String(now.getSeconds()).padStart(2, '0');
        
        const el = (id) => document.getElementById(id);
        if (el('currentHours')) el('currentHours').textContent = String(h % 12 || 12).padStart(2, '0');
        if (el('currentMinutes')) el('currentMinutes').textContent = m;
        if (el('currentSeconds')) el('currentSeconds').textContent = s;
        if (el('ampmIndicator')) el('ampmIndicator').textContent = h >= 12 ? 'PM' : 'AM';
        
        const wd = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
        if (el('currentDayName')) el('currentDayName').textContent = wd[now.getDay()];
        if (el('currentFullDate')) el('currentFullDate').textContent = `${now.getDate()} ${this.calendarManager.englishMonths[now.getMonth()]} ${now.getFullYear()}`;
    }
    
    renderAllCalendars() {
        try {
            this.resetAllToToday();
            this.calendarManager.renderEnglishCalendar(this.calendarManager.currentEnglishYear, this.calendarManager.currentEnglishMonth);
            this.calendarManager.renderBengaliCalendar(this.calendarManager.currentBengaliYear, this.calendarManager.currentBengaliMonth);
            this.calendarManager.renderHijriCalendar(this.calendarManager.currentHijriYear, this.calendarManager.currentHijriMonth);
        } catch (error) {
            console.error('Render error:', error);
        }
    }
    
    updateAllInfo() {
        try {
            const now = this.getCurrentDateTime();
            const el = (id) => document.getElementById(id);
            const wd = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
            
            if (el('quickEnglishDate')) el('quickEnglishDate').textContent = `${now.getDate()} ${this.calendarManager.englishMonths[now.getMonth()]} ${now.getFullYear()}`;
            if (el('quickEnglishDay')) el('quickEnglishDay').textContent = wd[now.getDay()];
            
            const bDate = this.calendarManager.bengaliCalendar.gregorianToBengali(now);
            if (el('quickBengaliDate')) el('quickBengaliDate').textContent = this.calendarManager.bengaliCalendar.formatBengaliDate(bDate);
            if (el('quickBengaliSeason')) el('quickBengaliSeason').textContent = `ঋতু: ${bDate.season}`;
            
            const hDate = this.getAdjustedHijriDate();
            if (el('quickHijriDate')) el('quickHijriDate').textContent = this.calendarManager.hijriCalendar.formatHijriDate(hDate);
            if (el('quickHijriEvent')) {
                const evt = this.calendarManager.hijriCalendar.isImportantDate(hDate.month, hDate.day);
                el('quickHijriEvent').textContent = evt || 'সাধারণ দিন';
            }
        } catch (error) {
            console.error('Update info error:', error);
        }
    }
    
    handleResize() {
        const w = window.innerWidth;
        document.querySelectorAll('.calendar-panel').forEach(p => p.style.padding = w < 768 ? '20px' : '30px');
    }
    
    destroy() {
        if (this.clockInterval) clearInterval(this.clockInterval);
        if (this.sunTimesInterval) clearInterval(this.sunTimesInterval);
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (typeof CalendarManager === 'undefined') throw new Error('CalendarManager missing');
        if (typeof BengaliCalendar === 'undefined') throw new Error('BengaliCalendar missing');
        if (typeof HijriCalendar === 'undefined') throw new Error('HijriCalendar missing');
        if (typeof SunTimesCalculator === 'undefined') throw new Error('SunTimesCalculator missing');
        
        window.crystalApp = new CrystalCalendarApp();
        console.log('✅ Crystal Calendar Ready!');
    } catch (error) {
        console.error('Init error:', error.message);
    }
});

window.addEventListener('beforeunload', () => {
    if (window.crystalApp) window.crystalApp.destroy();
});