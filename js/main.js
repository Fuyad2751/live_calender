var CrystalCalendarApp = function() {
    var self = this;
    
    this.calendarManager = new CalendarManager();
    this.selectedTimezone = 'Asia/Dhaka';
    this.hijriAdjustment = 0;
    this.sunTimes = null;
    
    this.init = function() {
        self.setupTabs();
        self.setupNavigation();
        self.setupTodayButtons();
        self.setupHijriAdjustment();
        self.setupTimezone();
        self.renderAllCalendars();
        self.startClock();
        self.updateAllInfo();
        
        if (window.sunTimesCalculator) {
            self.sunTimes = self.getSunTimes();
            self.updateSunTimes();
        }
        
        setInterval(function() { self.updateClock(); }, 1000);
        setInterval(function() { self.updateAllInfo(); }, 60000);
    };
    
    this.getCurrentDateTime = function() {
        return new Date();
    };
    
    this.getSunTimes = function() {
        if (window.sunTimesCalculator) {
            return window.sunTimesCalculator.calculateSunTimes(new Date(), 23.8103, 90.4125);
        }
        return null;
    };
    
    this.getAdjustedHijriDate = function() {
        var hd = self.calendarManager.hijriCalendar.gregorianToHijri(new Date());
        if (self.hijriAdjustment !== 0) {
            hd = self.calendarManager.hijriCalendar.adjustDate(hd, self.hijriAdjustment);
        }
        return hd;
    };
    
    this.setupTabs = function() {
        var tabs = document.querySelectorAll('.crystal-tab');
        tabs.forEach(function(tab) {
            tab.onclick = function() {
                var type = this.dataset.calendar;
                tabs.forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
                
                document.querySelectorAll('.calendar-panel').forEach(function(p) { p.classList.remove('active'); });
                var panel = document.getElementById(type + 'Calendar');
                if (panel) panel.classList.add('active');
            };
        });
    };
    
    this.setupNavigation = function() {
        var bind = function(id, fn) {
            var btn = document.getElementById(id);
            if (btn) btn.onclick = fn;
        };
        
        bind('engPrevMonth', function() {
            self.calendarManager.currentEnglishMonth--;
            if (self.calendarManager.currentEnglishMonth < 0) { self.calendarManager.currentEnglishMonth = 11; self.calendarManager.currentEnglishYear--; }
            self.calendarManager.renderEnglishCalendar(self.calendarManager.currentEnglishYear, self.calendarManager.currentEnglishMonth);
        });
        
        bind('engNextMonth', function() {
            self.calendarManager.currentEnglishMonth++;
            if (self.calendarManager.currentEnglishMonth > 11) { self.calendarManager.currentEnglishMonth = 0; self.calendarManager.currentEnglishYear++; }
            self.calendarManager.renderEnglishCalendar(self.calendarManager.currentEnglishYear, self.calendarManager.currentEnglishMonth);
        });
        
        bind('benPrevMonth', function() {
            self.calendarManager.currentBengaliMonth--;
            if (self.calendarManager.currentBengaliMonth < 0) { self.calendarManager.currentBengaliMonth = 11; self.calendarManager.currentBengaliYear--; }
            self.calendarManager.renderBengaliCalendar(self.calendarManager.currentBengaliYear, self.calendarManager.currentBengaliMonth);
        });
        
        bind('benNextMonth', function() {
            self.calendarManager.currentBengaliMonth++;
            if (self.calendarManager.currentBengaliMonth > 11) { self.calendarManager.currentBengaliMonth = 0; self.calendarManager.currentBengaliYear++; }
            self.calendarManager.renderBengaliCalendar(self.calendarManager.currentBengaliYear, self.calendarManager.currentBengaliMonth);
        });
        
        bind('hijPrevMonth', function() {
            self.calendarManager.currentHijriMonth--;
            if (self.calendarManager.currentHijriMonth < 1) { self.calendarManager.currentHijriMonth = 12; self.calendarManager.currentHijriYear--; }
            self.calendarManager.renderHijriCalendar(self.calendarManager.currentHijriYear, self.calendarManager.currentHijriMonth);
        });
        
        bind('hijNextMonth', function() {
            self.calendarManager.currentHijriMonth++;
            if (self.calendarManager.currentHijriMonth > 12) { self.calendarManager.currentHijriMonth = 1; self.calendarManager.currentHijriYear++; }
            self.calendarManager.renderHijriCalendar(self.calendarManager.currentHijriYear, self.calendarManager.currentHijriMonth);
        });
    };
    
    this.setupTodayButtons = function() {
        ['engTodayBtn', 'benTodayBtn', 'hijTodayBtn'].forEach(function(id) {
            var btn = document.getElementById(id);
            if (btn) {
                btn.onclick = function() {
                    self.resetToToday();
                    self.renderAllCalendars();
                };
            }
        });
    };
    
    this.setupHijriAdjustment = function() {
        var db = document.getElementById('hijriDecreaseDay');
        var ib = document.getElementById('hijriIncreaseDay');
        var rb = document.getElementById('hijriResetAdjustment');
        
        if (!db || !ib || !rb) return;
        
        var saved = localStorage.getItem('hijriAdjustment');
        if (saved) self.hijriAdjustment = parseInt(saved);
        
        db.onclick = function() { self.hijriAdjustment--; self.updateAdjustmentDisplay(); self.saveAdjustment(); self.renderAllCalendars(); };
        ib.onclick = function() { self.hijriAdjustment++; self.updateAdjustmentDisplay(); self.saveAdjustment(); self.renderAllCalendars(); };
        rb.onclick = function() { self.hijriAdjustment = 0; self.updateAdjustmentDisplay(); self.saveAdjustment(); self.renderAllCalendars(); };
        
        self.updateAdjustmentDisplay();
    };
    
    this.updateAdjustmentDisplay = function() {
        var ve = document.getElementById('hijriAdjustmentValue');
        if (ve) ve.textContent = self.hijriAdjustment.toString();
    };
    
    this.saveAdjustment = function() {
        localStorage.setItem('hijriAdjustment', self.hijriAdjustment.toString());
    };
    
    this.setupTimezone = function() {
        var sel = document.getElementById('timezoneSelect');
        if (sel) sel.value = self.selectedTimezone;
    };
    
    this.resetToToday = function() {
        var now = new Date();
        self.calendarManager.currentEnglishMonth = now.getMonth();
        self.calendarManager.currentEnglishYear = now.getFullYear();
        
        var bd = self.calendarManager.bengaliCalendar.gregorianToBengali(now);
        self.calendarManager.currentBengaliMonth = bd.month;
        self.calendarManager.currentBengaliYear = bd.year;
        
        var hd = self.calendarManager.hijriCalendar.gregorianToHijri(now);
        self.calendarManager.currentHijriMonth = hd.month;
        self.calendarManager.currentHijriYear = hd.year;
    };
    
    this.renderAllCalendars = function() {
        self.resetToToday();
        self.calendarManager.renderEnglishCalendar(self.calendarManager.currentEnglishYear, self.calendarManager.currentEnglishMonth);
        self.calendarManager.renderBengaliCalendar(self.calendarManager.currentBengaliYear, self.calendarManager.currentBengaliMonth);
        self.calendarManager.renderHijriCalendar(self.calendarManager.currentHijriYear, self.calendarManager.currentHijriMonth);
    };
    
    this.startClock = function() {
        self.updateClock();
    };
    
    this.updateClock = function() {
        var now = new Date();
        var h = now.getHours(), m = String(now.getMinutes()).padStart(2, '0'), s = String(now.getSeconds()).padStart(2, '0');
        
        var e = function(id) { return document.getElementById(id); };
        if (e('currentHours')) e('currentHours').textContent = String(h % 12 || 12).padStart(2, '0');
        if (e('currentMinutes')) e('currentMinutes').textContent = m;
        if (e('currentSeconds')) e('currentSeconds').textContent = s;
        if (e('ampmIndicator')) e('ampmIndicator').textContent = h >= 12 ? 'PM' : 'AM';
        
        var wd = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
        if (e('currentDayName')) e('currentDayName').textContent = wd[now.getDay()];
        if (e('currentFullDate')) e('currentFullDate').textContent = now.getDate() + ' ' + self.calendarManager.englishMonths[now.getMonth()] + ' ' + now.getFullYear();
    };
    
    this.updateAllInfo = function() {
        var now = new Date();
        var e = function(id) { return document.getElementById(id); };
        
        if (e('quickEnglishDate')) e('quickEnglishDate').textContent = now.getDate() + ' ' + self.calendarManager.englishMonths[now.getMonth()] + ' ' + now.getFullYear();
        if (e('quickEnglishDay')) {
            var wd = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
            e('quickEnglishDay').textContent = wd[now.getDay()];
        }
        
        var bd = self.calendarManager.bengaliCalendar.gregorianToBengali(now);
        if (e('quickBengaliDate')) e('quickBengaliDate').textContent = self.calendarManager.bengaliCalendar.formatBengaliDate(bd);
        
        var hd = self.getAdjustedHijriDate();
        if (e('quickHijriDate')) e('quickHijriDate').textContent = self.calendarManager.hijriCalendar.formatHijriDate(hd);
    };
    
    this.updateSunTimes = function() {
        if (!self.sunTimes || !window.sunTimesCalculator) return;
        var se = document.getElementById('sunriseTime');
        var sse = document.getElementById('sunsetTime');
        if (se) se.textContent = window.sunTimesCalculator.formatTime(self.sunTimes.sunrise);
        if (sse) sse.textContent = window.sunTimesCalculator.formatTime(self.sunTimes.sunset);
    };
    
    this.init();
};

document.addEventListener('DOMContentLoaded', function() {
    window.crystalApp = new CrystalCalendarApp();
    console.log('Calendar Ready');
});
