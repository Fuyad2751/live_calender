var CrystalCalendarApp = function() {
    this.calendarManager = new CalendarManager();
    this.selectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.currentCalendar = 'english';
    this.clockInterval = null;
    this.sunTimesInterval = null;
    this.sunTimes = null;
    this.hijriAdjustment = 0;
    
    var self = this;
    
    this.init = function() {
        self.setupTimezoneSelector();
        self.setupCalendarTabs();
        self.setupNavigationButtons();
        self.setupTodayButtons();
        self.setupHijriAdjustment();
        self.startCrystalClock();
        self.renderAllCalendars();
        self.updateAllInfo();
        self.sunTimes = self.getCurrentSunTimes();
        self.updateSunTimes();
        
        self.clockInterval = setInterval(function() {
            self.updateCrystalClock();
            if (self.sunTimes) self.updateSunCountdown();
        }, 1000);
        
        self.sunTimesInterval = setInterval(function() {
            self.updateAllInfo();
            self.sunTimes = self.getCurrentSunTimes();
            self.updateSunTimes();
        }, 60000);
        
        window.addEventListener('themeChanged', function() { self.renderAllCalendars(); });
        window.addEventListener('resize', function() { self.handleResize(); });
    };
    
    this.getCurrentDateTime = function() {
        var date = new Date();
        if (self.selectedTimezone) {
            try {
                var opts = { timeZone: self.selectedTimezone };
                var ts = date.toLocaleString('en-US', opts);
                date = new Date(ts);
            } catch(e) {}
        }
        return date;
    };
    
    this.getCurrentSunTimes = function() {
        try {
            var now = self.getCurrentDateTime();
            if (window.sunTimesCalculator) {
                return window.sunTimesCalculator.calculateSunTimes(now, 23.8103, 90.4125, self.selectedTimezone);
            }
        } catch(e) {}
        return null;
    };
    
    this.getAdjustedHijriDate = function() {
        var now = self.getCurrentDateTime();
        var hd = self.calendarManager.hijriCalendar.gregorianToHijri(now);
        if (self.hijriAdjustment !== 0) {
            hd = self.calendarManager.hijriCalendar.adjustDate(hd, self.hijriAdjustment);
        }
        return hd;
    };
    
    this.updateSunTimes = function() {
        if (!self.sunTimes) self.sunTimes = self.getCurrentSunTimes();
        if (!self.sunTimes || !window.sunTimesCalculator) return;
        
        try {
            var se = document.getElementById('sunriseTime');
            var sse = document.getElementById('sunsetTime');
            var dle = document.getElementById('dayLength');
            var sne = document.getElementById('solarNoon');
            
            if (se) se.textContent = window.sunTimesCalculator.formatTime(self.sunTimes.sunrise, self.selectedTimezone);
            if (sse) sse.textContent = window.sunTimesCalculator.formatTime(self.sunTimes.sunset, self.selectedTimezone);
            if (dle && self.sunTimes.dayLength) {
                dle.textContent = String(self.sunTimes.dayLength.hours).padStart(2, '0') + ':' + String(self.sunTimes.dayLength.minutes).padStart(2, '0');
            }
            if (sne) sne.textContent = window.sunTimesCalculator.formatTime(self.sunTimes.solarNoon, self.selectedTimezone);
            
            self.updateSunPosition();
            self.updateDaylightStatus();
            self.updateSunCountdown();
        } catch(e) {}
    };
    
    this.updateSunCountdown = function() {
        if (!self.sunTimes) return;
        try {
            var now = self.getCurrentDateTime();
            var src = document.getElementById('sunriseCountdown');
            var ssc = document.getElementById('sunsetCountdown');
            
            if (src && self.sunTimes.sunrise) {
                var st = new Date(self.sunTimes.sunrise);
                var diff = st.getTime() - now.getTime();
                if (diff < 0) { st.setDate(st.getDate() + 1); diff = st.getTime() - now.getTime(); }
                var h = Math.floor(Math.abs(diff) / 3600000);
                var m = Math.floor((Math.abs(diff) % 3600000) / 60000);
                src.textContent = h < 1 ? 'আর ' + m + ' মিনিট' : 'আর ' + h + ' ঘ. ' + m + ' মি.';
            }
            
            if (ssc && self.sunTimes.sunset) {
                var st = new Date(self.sunTimes.sunset);
                var diff = st.getTime() - now.getTime();
                if (diff < 0) { st.setDate(st.getDate() + 1); diff = st.getTime() - now.getTime(); }
                var h = Math.floor(Math.abs(diff) / 3600000);
                var m = Math.floor((Math.abs(diff) % 3600000) / 60000);
                ssc.textContent = h < 1 ? 'আর ' + m + ' মিনিট' : 'আর ' + h + ' ঘ. ' + m + ' মি.';
            }
        } catch(e) {}
    };
    
    this.updateSunPosition = function() {
        if (!self.sunTimes) return;
        var marker = document.getElementById('sunMarker');
        if (!marker) return;
        
        try {
            var now = self.getCurrentDateTime();
            var sr = new Date(self.sunTimes.sunrise);
            var ss = new Date(self.sunTimes.sunset);
            var total = ss.getTime() - sr.getTime();
            var curr = now.getTime() - sr.getTime();
            var pct = Math.max(0, Math.min(100, (curr / total) * 100));
            marker.style.left = pct + '%';
            
            if (now < sr || now > ss) {
                marker.innerHTML = '<i class="fas fa-moon"></i>';
                marker.style.color = '#6366f1';
            } else {
                marker.innerHTML = '<i class="fas fa-sun"></i>';
                marker.style.color = '#f59e0b';
            }
        } catch(e) {}
    };
    
    this.updateDaylightStatus = function() {
        if (!self.sunTimes) return;
        var se = document.getElementById('daylightStatus');
        var pe = document.getElementById('sunPosition');
        try {
            var now = self.getCurrentDateTime();
            var sr = new Date(self.sunTimes.sunrise);
            var ss = new Date(self.sunTimes.sunset);
            if (now >= sr && now <= ss) {
                if (se) se.textContent = '☀️ দিন';
                if (pe) pe.textContent = 'দিনের আলো';
            } else {
                if (se) se.textContent = '🌙 রাত';
                if (pe) pe.textContent = 'রাতের বেলা';
            }
        } catch(e) {}
    };
    
    this.setupHijriAdjustment = function() {
        var db = document.getElementById('hijriDecreaseDay');
        var ib = document.getElementById('hijriIncreaseDay');
        var rb = document.getElementById('hijriResetAdjustment');
        if (!db || !ib || !rb) return;
        
        var saved = localStorage.getItem('hijriAdjustment');
        if (saved) { self.hijriAdjustment = parseInt(saved); self.updateAdjustmentDisplay(); }
        
        db.onclick = function() { self.hijriAdjustment--; self.updateAdjustmentDisplay(); self.saveHijriAdjustment(); self.renderAllCalendars(); };
        ib.onclick = function() { self.hijriAdjustment++; self.updateAdjustmentDisplay(); self.saveHijriAdjustment(); self.renderAllCalendars(); };
        rb.onclick = function() { self.hijriAdjustment = 0; self.updateAdjustmentDisplay(); self.saveHijriAdjustment(); self.renderAllCalendars(); };
        
        self.updateAdjustmentDisplay();
    };
    
    this.updateAdjustmentDisplay = function() {
        var ve = document.getElementById('hijriAdjustmentValue');
        var dd = document.querySelector('.adjustment-display');
        if (ve) ve.textContent = self.hijriAdjustment > 0 ? '+' + self.hijriAdjustment : '' + self.hijriAdjustment;
        if (dd) {
            if (self.hijriAdjustment !== 0) dd.classList.add('active-adjustment');
            else dd.classList.remove('active-adjustment');
        }
    };
    
    this.saveHijriAdjustment = function() {
        localStorage.setItem('hijriAdjustment', '' + self.hijriAdjustment);
    };
    
    this.setupTimezoneSelector = function() {
        var sel = document.getElementById('timezoneSelect');
        if (!sel) return;
        sel.value = self.selectedTimezone;
        sel.onchange = function(e) {
            self.selectedTimezone = e.target.value;
            self.updateCrystalClock();
            self.renderAllCalendars();
        };
    };
    
    this.setupCalendarTabs = function() {
        var tabs = document.querySelectorAll('.crystal-tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].onclick = function() {
                var type = this.dataset.calendar;
                if (!type) return;
                for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove('active');
                this.classList.add('active');
                var panels = document.querySelectorAll('.calendar-panel');
                for (var k = 0; k < panels.length; k++) panels[k].classList.remove('active');
                var panel = document.getElementById(type + 'Calendar');
                if (panel) panel.classList.add('active');
                self.currentCalendar = type;
            };
        }
    };
    
    this.setupNavigationButtons = function() {
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
        var ids = ['engTodayBtn', 'benTodayBtn', 'hijTodayBtn'];
        for (var i = 0; i < ids.length; i++) {
            var btn = document.getElementById(ids[i]);
            if (btn) {
                btn.onclick = function() {
                    self.resetAllToToday();
                    self.renderAllCalendars();
                };
            }
        }
    };
    
    this.resetAllToToday = function() {
        var now = self.getCurrentDateTime();
        self.calendarManager.currentEnglishMonth = now.getMonth();
        self.calendarManager.currentEnglishYear = now.getFullYear();
        var bd = self.calendarManager.bengaliCalendar.gregorianToBengali(now);
        self.calendarManager.currentBengaliMonth = bd.month;
        self.calendarManager.currentBengaliYear = bd.year;
        var hd = self.calendarManager.hijriCalendar.gregorianToHijri(now);
        self.calendarManager.currentHijriMonth = hd.month;
        self.calendarManager.currentHijriYear = hd.year;
    };
    
    this.startCrystalClock = function() { self.updateCrystalClock(); };
    
    this.updateCrystalClock = function() {
        var now = self.getCurrentDateTime();
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
    
    this.renderAllCalendars = function() {
        try {
            self.resetAllToToday();
            self.calendarManager.renderEnglishCalendar(self.calendarManager.currentEnglishYear, self.calendarManager.currentEnglishMonth);
            self.calendarManager.renderBengaliCalendar(self.calendarManager.currentBengaliYear, self.calendarManager.currentBengaliMonth);
            self.calendarManager.renderHijriCalendar(self.calendarManager.currentHijriYear, self.calendarManager.currentHijriMonth);
        } catch(e) {}
    };
    
    this.updateAllInfo = function() {
        try {
            var now = self.getCurrentDateTime();
            var e = function(id) { return document.getElementById(id); };
            var wd = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
            
            if (e('quickEnglishDate')) e('quickEnglishDate').textContent = now.getDate() + ' ' + self.calendarManager.englishMonths[now.getMonth()] + ' ' + now.getFullYear();
            if (e('quickEnglishDay')) e('quickEnglishDay').textContent = wd[now.getDay()];
            
            var bd = self.calendarManager.bengaliCalendar.gregorianToBengali(now);
            if (e('quickBengaliDate')) e('quickBengaliDate').textContent = self.calendarManager.bengaliCalendar.formatBengaliDate(bd);
            if (e('quickBengaliSeason')) e('quickBengaliSeason').textContent = 'ঋতু: ' + bd.season;
            
            var hd = self.getAdjustedHijriDate();
            if (e('quickHijriDate')) e('quickHijriDate').textContent = self.calendarManager.hijriCalendar.formatHijriDate(hd);
            if (e('quickHijriEvent')) {
                var evt = self.calendarManager.hijriCalendar.isImportantDate(hd.month, hd.day);
                e('quickHijriEvent').textContent = evt || 'সাধারণ দিন';
            }
        } catch(e) {}
    };
    
    this.handleResize = function() {
        var w = window.innerWidth;
        var panels = document.querySelectorAll('.calendar-panel');
        for (var i = 0; i < panels.length; i++) {
            panels[i].style.padding = w < 768 ? '20px' : '30px';
        }
    };
    
    this.destroy = function() {
        if (self.clockInterval) clearInterval(self.clockInterval);
        if (self.sunTimesInterval) clearInterval(self.sunTimesInterval);
    };
    
    this.init();
};

document.addEventListener('DOMContentLoaded', function() {
    if (typeof CalendarManager === 'undefined') { console.error('CalendarManager missing'); return; }
    if (typeof BengaliCalendar === 'undefined') { console.error('BengaliCalendar missing'); return; }
    if (typeof HijriCalendar === 'undefined') { console.error('HijriCalendar missing'); return; }
    
    window.crystalApp = new CrystalCalendarApp();
    console.log('✅ Crystal Calendar Ready!');
});

window.addEventListener('beforeunload', function() {
    if (window.crystalApp) window.crystalApp.destroy();
});