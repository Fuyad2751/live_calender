var CrystalApp = function() {
    var self = this;
    this.cal = new CalendarManager();
    this.hijriAdj = parseInt(localStorage.getItem('hijriAdj') || '0');
    this.sunCalc = new SunTimesCalculator();
    
    this.init = function() {
        self.setupTabs();
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
        return hd;
    };
    
    this.setupTabs = function() {
        document.querySelectorAll('.crystal-tab').forEach(function(tab) {
            tab.onclick = function() {
                var type = this.dataset.calendar;
                document.querySelectorAll('.crystal-tab').forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
                document.querySelectorAll('.calendar-panel').forEach(function(p) { p.classList.remove('active'); });
                var panel = document.getElementById(type + 'Calendar');
                if (panel) panel.classList.add('active');
            };
        });
    };
    
    this.setupNav = function() {
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
    
    this.updateClock = function() {
        var now = new Date();
        var h = now.getHours(), m = String(now.getMinutes()).padStart(2, '0'), s = String(now.getSeconds()).padStart(2, '0');
        
        document.getElementById('currentHours').textContent = String(h % 12 || 12).padStart(2, '0');
        document.getElementById('currentMinutes').textContent = m;
        document.getElementById('currentSeconds').textContent = s;
        document.getElementById('ampmIndicator').textContent = h >= 12 ? 'PM' : 'AM';
        
        var wd = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
        document.getElementById('currentDayName').textContent = wd[now.getDay()];
        document.getElementById('currentFullDate').textContent = now.getDate() + ' ' + self.cal.englishMonths[now.getMonth()] + ' ' + now.getFullYear();
    };
    
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
    };
    
    this.init();
};

document.addEventListener('DOMContentLoaded', function() {
    window.crystalApp = new CrystalApp();
});