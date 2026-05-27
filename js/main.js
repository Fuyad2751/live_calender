<<<<<<< HEAD
var CrystalApp = function() {
=======
var CrystalCalendarApp = function() {
>>>>>>> b6f36f53465809e6c07261ed25aaaf5ba57a0785
    var self = this;
    this.cal = new CalendarManager();
    this.hijriAdj = parseInt(localStorage.getItem('hijriAdj') || '0');
    this.sunCalc = new SunTimesCalculator();
    
    this.calendarManager = new CalendarManager();
    this.selectedTimezone = 'Asia/Dhaka';
    this.hijriAdjustment = 0;
    this.sunTimes = null;
    
    this.init = function() {
        self.setupTabs();
<<<<<<< HEAD
        self.setupNav();
        self.setupHijriAdj();
        self.renderAll();
        self.startClock();
        self.updateSun();
        
        setInterval(function() { self.updateClock(); }, 1000);
        setInterval(function() { self.updateSun(); }, 60000);
    };
    
    this.getHijriDate = function() {
        var hd = self.cal.hijriCal.convert(new Date());
        if (self.hijriAdj !== 0) hd = self.cal.hijriCal.adjust(hd, self.hijriAdj);
=======
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
>>>>>>> b6f36f53465809e6c07261ed25aaaf5ba57a0785
        return hd;
    };
    
    this.setupTabs = function() {
<<<<<<< HEAD
        document.querySelectorAll('.crystal-tab').forEach(function(tab) {
            tab.onclick = function() {
                var type = this.dataset.calendar;
                document.querySelectorAll('.crystal-tab').forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
=======
        var tabs = document.querySelectorAll('.crystal-tab');
        tabs.forEach(function(tab) {
            tab.onclick = function() {
                var type = this.dataset.calendar;
                tabs.forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
                
>>>>>>> b6f36f53465809e6c07261ed25aaaf5ba57a0785
                document.querySelectorAll('.calendar-panel').forEach(function(p) { p.classList.remove('active'); });
                var panel = document.getElementById(type + 'Calendar');
                if (panel) panel.classList.add('active');
            };
        });
    };
    
<<<<<<< HEAD
    this.setupNav = function() {
=======
    this.setupNavigation = function() {
>>>>>>> b6f36f53465809e6c07261ed25aaaf5ba57a0785
        var bind = function(id, fn) {
            var btn = document.getElementById(id);
            if (btn) btn.onclick = fn;
        };
        
        bind('engPrevMonth', function() {
            self.cal.engMonth--;
            if (self.cal.engMonth < 0) { self.cal.engMonth = 11; self.cal.engYear--; }
            self.cal.renderEnglish(self.cal.engYear, self.cal.engMonth);
        });
        
        bind('engNextMonth', function() {
            self.cal.engMonth++;
            if (self.cal.engMonth > 11) { self.cal.engMonth = 0; self.cal.engYear++; }
            self.cal.renderEnglish(self.cal.engYear, self.cal.engMonth);
        });
        
        bind('benPrevMonth', function() {
            self.cal.benMonth--;
            if (self.cal.benMonth < 0) { self.cal.benMonth = 11; self.cal.benYear--; }
            self.cal.renderBengali(self.cal.benYear, self.cal.benMonth);
        });
        
        bind('benNextMonth', function() {
            self.cal.benMonth++;
            if (self.cal.benMonth > 11) { self.cal.benMonth = 0; self.cal.benYear++; }
            self.cal.renderBengali(self.cal.benYear, self.cal.benMonth);
        });
        
        bind('hijPrevMonth', function() {
            self.cal.hijMonth--;
            if (self.cal.hijMonth < 1) { self.cal.hijMonth = 12; self.cal.hijYear--; }
            self.cal.renderHijri(self.cal.hijYear, self.cal.hijMonth);
        });
        
        bind('hijNextMonth', function() {
            self.cal.hijMonth++;
            if (self.cal.hijMonth > 12) { self.cal.hijMonth = 1; self.cal.hijYear++; }
            self.cal.renderHijri(self.cal.hijYear, self.cal.hijMonth);
        });
    };
    
<<<<<<< HEAD
    this.setupHijriAdj = function() {
        var dec = document.getElementById('hijriDecreaseDay');
        var inc = document.getElementById('hijriIncreaseDay');
        var rst = document.getElementById('hijriResetAdjustment');
        var val = document.getElementById('hijriAdjustmentValue');
        
        if (!dec || !inc || !rst) return;
        if (val) val.textContent = self.hijriAdj;
        
        dec.onclick = function() { self.hijriAdj--; self.updateAdjDisplay(); self.renderAll(); };
        inc.onclick = function() { self.hijriAdj++; self.updateAdjDisplay(); self.renderAll(); };
        rst.onclick = function() { self.hijriAdj = 0; self.updateAdjDisplay(); self.renderAll(); };
    };
    
    this.updateAdjDisplay = function() {
        var val = document.getElementById('hijriAdjustmentValue');
        if (val) val.textContent = self.hijriAdj;
        localStorage.setItem('hijriAdj', self.hijriAdj);
        self.updateInfo();
    };
    
    this.renderAll = function() {
        self.cal.renderEnglish(self.cal.engYear, self.cal.engMonth);
        self.cal.renderBengali(self.cal.benYear, self.cal.benMonth);
        self.cal.renderHijri(self.cal.hijYear, self.cal.hijMonth);
        self.updateInfo();
    };
    
    this.startClock = function() { self.updateClock(); };
=======
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
>>>>>>> b6f36f53465809e6c07261ed25aaaf5ba57a0785
    
    this.updateClock = function() {
        var now = new Date();
        var h = now.getHours(), m = String(now.getMinutes()).padStart(2, '0'), s = String(now.getSeconds()).padStart(2, '0');
        
<<<<<<< HEAD
        document.getElementById('currentHours').textContent = String(h % 12 || 12).padStart(2, '0');
        document.getElementById('currentMinutes').textContent = m;
        document.getElementById('currentSeconds').textContent = s;
        document.getElementById('ampmIndicator').textContent = h >= 12 ? 'PM' : 'AM';
=======
        var e = function(id) { return document.getElementById(id); };
        if (e('currentHours')) e('currentHours').textContent = String(h % 12 || 12).padStart(2, '0');
        if (e('currentMinutes')) e('currentMinutes').textContent = m;
        if (e('currentSeconds')) e('currentSeconds').textContent = s;
        if (e('ampmIndicator')) e('ampmIndicator').textContent = h >= 12 ? 'PM' : 'AM';
>>>>>>> b6f36f53465809e6c07261ed25aaaf5ba57a0785
        
        var wd = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
        document.getElementById('currentDayName').textContent = wd[now.getDay()];
        document.getElementById('currentFullDate').textContent = now.getDate() + ' ' + self.cal.englishMonths[now.getMonth()] + ' ' + now.getFullYear();
    };
    
<<<<<<< HEAD
    this.updateInfo = function() {
        var now = new Date();
        var wd = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
        
        document.getElementById('quickEnglishDate').textContent = now.getDate() + ' ' + self.cal.englishMonths[now.getMonth()] + ' ' + now.getFullYear();
        document.getElementById('quickEnglishDay').textContent = wd[now.getDay()];
        
        var bd = self.cal.bengaliCal.convert(now);
        document.getElementById('quickBengaliDate').textContent = self.cal.bengaliCal.format(bd);
        document.getElementById('quickBengaliSeason').textContent = 'ঋতু: ' + bd.season;
        
        var hd = self.getHijriDate();
        document.getElementById('quickHijriDate').textContent = self.cal.hijriCal.format(hd);
    };
    
    this.updateSun = function() {
        var st = self.sunCalc.calculate(new Date(), 23.8103, 90.4125);
        if (!st) return;
        
        document.getElementById('sunriseTime').textContent = self.sunCalc.formatTime(st.sunrise);
        document.getElementById('sunsetTime').textContent = self.sunCalc.formatTime(st.sunset);
        document.getElementById('dayLength').textContent = String(st.dayLength.hours).padStart(2, '0') + ':' + String(st.dayLength.minutes).padStart(2, '0');
        document.getElementById('solarNoon').textContent = self.sunCalc.formatTime(st.solarNoon);
=======
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
>>>>>>> b6f36f53465809e6c07261ed25aaaf5ba57a0785
    };
    
    this.init();
};

document.addEventListener('DOMContentLoaded', function() {
<<<<<<< HEAD
    window.crystalApp = new CrystalApp();
});
=======
    window.crystalApp = new CrystalCalendarApp();
    console.log('Calendar Ready');
});
>>>>>>> b6f36f53465809e6c07261ed25aaaf5ba57a0785
