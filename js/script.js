/* ============================================
   Live Calendar Pro - Main JavaScript
   Version: 3.0 (Event Listener Based)
   ============================================ */

class CalendarApp {
    constructor() {
        // State Management
        this.state = {
            currentDate: new Date(),
            englishDate: new Date(),
            bengaliDate: new Date(),
            arabicDate: new Date(),
            arabicOffset: 0,
            theme: localStorage.getItem('calendarTheme') || 'light',
            location: {
                latitude: 23.8103,
                longitude: 90.4125,
                city: 'Dhaka'
            },
            isLoading: true
        };

        // Month Data
        this.bengaliMonths = [
            'বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন',
            'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'
        ];

        this.arabicMonths = [
            'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
            'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
            'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
        ];

        this.englishWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.bengaliWeekdays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
        this.arabicWeekdays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

        this.bengaliDays = [
            '০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০',
            '১১', '১২', '১৩', '১৪', '১৫', '১৬', '১৭', '১৮', '১৯', '২০',
            '২১', '২২', '২৩', '২৪', '২৫', '২৬', '২৭', '২৮', '২৯', '৩০', '৩১'
        ];

        // Bind all methods
        this.init = this.init.bind(this);
        this.toggleTheme = this.toggleTheme.bind(this);
        this.refreshAll = this.refreshAll.bind(this);
        this.adjustArabicDate = this.adjustArabicDate.bind(this);
        this.navigateMonth = this.navigateMonth.bind(this);
        this.onDayClick = this.onDayClick.bind(this);
        this.showToast = this.showToast.bind(this);

        // Initialize
        this.init();
    }

    async init() {
        try {
            console.log('Calendar App Initializing...');
            
            // Set initial theme
            document.body.setAttribute('data-theme', this.state.theme);
            this.updateThemeUI();

            // Setup event listeners
            this.setupEventListeners();

            // Get user location
            await this.getUserLocation();
            
            // Initialize components
            this.initializeParticles();
            this.updateAllCalendars();
            this.startLiveClock();
            await this.updateSunInfo();
            
            // Set intervals
            this.startIntervals();
            
            // Hide loading screen
            setTimeout(() => {
                const loadingScreen = document.getElementById('loadingScreen');
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                }
                this.state.isLoading = false;
            }, 1000);

            this.showToast('✅ Calendar Ready!');
            console.log('Calendar App Initialized Successfully');

        } catch (error) {
            console.error('Initialization error:', error);
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.innerHTML = '<div class="loader-text">Error loading calendar. Please refresh.</div>';
            }
        }
    }

    // Setup Event Listeners
    setupEventListeners() {
        // Arabic date adjustment buttons
        const arabicMinusBtn = document.getElementById('arabicMinusBtn');
        const arabicPlusBtn = document.getElementById('arabicPlusBtn');
        
        if (arabicMinusBtn) {
            arabicMinusBtn.addEventListener('click', () => this.adjustArabicDate(-1));
        }
        if (arabicPlusBtn) {
            arabicPlusBtn.addEventListener('click', () => this.adjustArabicDate(1));
        }

        // Theme toggle
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshAll());
        }

        // Calendar navigation buttons
        const englishPrev = document.getElementById('englishPrevBtn');
        const englishNext = document.getElementById('englishNextBtn');
        const bengaliPrev = document.getElementById('bengaliPrevBtn');
        const bengaliNext = document.getElementById('bengaliNextBtn');
        const arabicPrev = document.getElementById('arabicPrevBtn');
        const arabicNext = document.getElementById('arabicNextBtn');

        if (englishPrev) englishPrev.addEventListener('click', () => this.navigateMonth('english', -1));
        if (englishNext) englishNext.addEventListener('click', () => this.navigateMonth('english', 1));
        if (bengaliPrev) bengaliPrev.addEventListener('click', () => this.navigateMonth('bengali', -1));
        if (bengaliNext) bengaliNext.addEventListener('click', () => this.navigateMonth('bengali', 1));
        if (arabicPrev) arabicPrev.addEventListener('click', () => this.navigateMonth('arabic', -1));
        if (arabicNext) arabicNext.addEventListener('click', () => this.navigateMonth('arabic', 1));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 't' || e.key === 'T') {
                this.toggleTheme();
            } else if (e.key === 'r' || e.key === 'R') {
                this.refreshAll();
            }
        });
    }

    // Get User Location
    async getUserLocation() {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.state.location.latitude = position.coords.latitude;
                        this.state.location.longitude = position.coords.longitude;
                        this.getCityName(position.coords.latitude, position.coords.longitude);
                        resolve();
                    },
                    () => {
                        console.log('Using default location');
                        resolve();
                    },
                    { timeout: 5000 }
                );
            } else {
                resolve();
            }
        });
    }

    // Get City Name
    async getCityName(lat, lon) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
            );
            const data = await response.json();
            if (data.address) {
                const city = data.address.city || data.address.town || 
                           data.address.village || data.address.state_district || 'Dhaka';
                this.state.location.city = city;
                const cityElement = document.getElementById('cityName');
                if (cityElement) cityElement.textContent = city;
            }
        } catch (error) {
            console.log('City name fetch failed');
        }
    }

    // Initialize Particles
    initializeParticles() {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const particles = [];
        const app = this;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.opacity = Math.random() * 0.5 + 0.1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }

            draw() {
                const isDark = app.state.theme === 'dark';
                ctx.fillStyle = isDark 
                    ? `rgba(255, 255, 255, ${this.opacity})`
                    : `rgba(99, 102, 241, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < 50; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            const isDark = app.state.theme === 'dark';
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.strokeStyle = isDark
                            ? `rgba(255, 255, 255, ${0.1 * (1 - distance / 150)})`
                            : `rgba(99, 102, 241, ${0.1 * (1 - distance / 150)})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        };

        animate();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    // Theme Functions
    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', this.state.theme);
        localStorage.setItem('calendarTheme', this.state.theme);
        this.updateThemeUI();
        this.showToast(`Theme: ${this.state.theme === 'dark' ? 'Dark 🌙' : 'Light ☀️'}`);
    }

    updateThemeUI() {
        const themeIcon = document.getElementById('themeIcon');
        const themeText = document.getElementById('themeText');
        if (themeIcon) {
            themeIcon.className = this.state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        if (themeText) {
            themeText.textContent = this.state.theme === 'dark' ? 'Light' : 'Dark';
        }
    }

    // Live Clock
    startLiveClock() {
        const updateClock = () => {
            const now = new Date();
            
            const timeString = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            const dateString = now.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            const timeElement = document.getElementById('liveTime');
            const dateElement = document.getElementById('liveDate');
            
            if (timeElement) timeElement.textContent = timeString;
            if (dateElement) dateElement.textContent = dateString;

            this.updateProgressBars(now);
        };

        updateClock();
        this._clockInterval = setInterval(updateClock.bind(this), 1000);
    }

    // Progress Bars
    updateProgressBars(now) {
        const sunriseHour = 6;
        const sunriseMin = 15;
        const sunsetHour = 17;
        const sunsetMin = 45;

        const dayStart = new Date(now);
        dayStart.setHours(0, 0, 0, 0);

        const sunriseTime = new Date(now);
        sunriseTime.setHours(sunriseHour, sunriseMin, 0);

        const sunsetTime = new Date(now);
        sunsetTime.setHours(sunsetHour, sunsetMin, 0);

        const nowTime = now.getTime();
        
        const sunriseProgress = ((nowTime - dayStart.getTime()) / (sunriseTime.getTime() - dayStart.getTime())) * 100;
        const sunriseBar = document.getElementById('sunriseProgress');
        if (sunriseBar) sunriseBar.style.width = Math.min(100, Math.max(0, sunriseProgress)) + '%';
        
        const sunsetProgress = ((nowTime - sunriseTime.getTime()) / (sunsetTime.getTime() - sunriseTime.getTime())) * 100;
        const sunsetBar = document.getElementById('sunsetProgress');
        if (sunsetBar) sunsetBar.style.width = Math.min(100, Math.max(0, sunsetProgress)) + '%';
    }

    // Intervals
    startIntervals() {
        this._calendarInterval = setInterval(() => this.updateAllCalendars(), 60000);
        this._sunInterval = setInterval(() => this.updateSunInfo(), 300000);
    }

    // Update All Calendars
    updateAllCalendars() {
        this.updateEnglishCalendar();
        this.updateBengaliCalendar();
        this.updateArabicCalendar();
        this.updateDateDisplay();
    }

    // English Calendar
    updateEnglishCalendar() {
        const date = this.state.englishDate;
        const year = date.getFullYear();
        const month = date.getMonth();
        
        const monthElement = document.getElementById('englishMonth');
        const yearElement = document.getElementById('englishYear');
        
        if (monthElement) monthElement.textContent = date.toLocaleString('en-US', { month: 'long' });
        if (yearElement) yearElement.textContent = year;
        
        this.generateWeekdays('englishWeekdays', this.englishWeekdays);
        this.generateCalendarDays('englishDays', year, month, 'gregorian');
    }

    // Bengali Calendar
    updateBengaliCalendar() {
        const date = this.state.bengaliDate;
        const year = date.getFullYear();
        const month = date.getMonth();
        
        const bengaliYear = year - 593;
        const bengaliMonthIndex = (month + 8) % 12;
        
        const monthElement = document.getElementById('bengaliMonth');
        const yearElement = document.getElementById('bengaliYear');
        
        if (monthElement) monthElement.textContent = this.bengaliMonths[bengaliMonthIndex];
        if (yearElement) yearElement.textContent = this.convertToBengaliNumber(bengaliYear);
        
        this.generateWeekdays('bengaliWeekdays', this.bengaliWeekdays);
        this.generateCalendarDays('bengaliDays', year, month, 'bengali');
    }

    // Arabic Calendar
    updateArabicCalendar() {
        const date = new Date(this.state.arabicDate);
        date.setDate(date.getDate() + this.state.arabicOffset);
        
        const hijriDate = this.gregorianToHijri(date);
        
        const monthElement = document.getElementById('arabicMonth');
        const yearElement = document.getElementById('arabicYear');
        
        if (monthElement) monthElement.textContent = this.arabicMonths[hijriDate.month - 1];
        if (yearElement) yearElement.textContent = this.convertToArabicNumber(hijriDate.year);
        
        this.generateWeekdays('arabicWeekdays', this.arabicWeekdays);
        this.generateHijriDays(hijriDate);
    }

    // Generate Weekdays
    generateWeekdays(elementId, weekdays) {
        const container = document.getElementById(elementId);
        if (!container) return;
        
        container.innerHTML = weekdays.map(day => 
            `<div class="weekday">${day}</div>`
        ).join('');
    }

    // Generate Calendar Days
    generateCalendarDays(elementId, year, month, calendarType) {
        const container = document.getElementById(elementId);
        if (!container) return;
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        
        let daysHTML = '';
        
        for (let i = 0; i < firstDay; i++) {
            daysHTML += '<div class="calendar-day other-month"></div>';
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const isToday = currentDate.toDateString() === today.toDateString();
            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
            
            let classes = ['calendar-day'];
            if (isToday) classes.push('today');
            if (isWeekend) classes.push('weekend');
            
            const displayDay = calendarType === 'bengali' ? 
                this.convertToBengaliNumber(day) : day;
            
            daysHTML += `
                <div class="${classes.join(' ')}" data-year="${year}" data-month="${month}" data-day="${day}">
                    ${displayDay}
                </div>`;
        }
        
        container.innerHTML = daysHTML;
        
        // Add click handlers to days
        container.querySelectorAll('.calendar-day').forEach(dayElement => {
            if (!dayElement.classList.contains('other-month')) {
                dayElement.addEventListener('click', () => {
                    const y = parseInt(dayElement.dataset.year);
                    const m = parseInt(dayElement.dataset.month);
                    const d = parseInt(dayElement.dataset.day);
                    this.onDayClick(y, m, d);
                });
            }
        });
    }

    // Generate Hijri Days
    generateHijriDays(hijriDate) {
        const container = document.getElementById('arabicDays');
        if (!container) return;
        
        const firstDay = this.getHijriFirstDay(hijriDate);
        const daysInMonth = hijriDate.daysInMonth;
        
        let daysHTML = '';
        
        for (let i = 0; i < firstDay; i++) {
            daysHTML += '<div class="calendar-day other-month"></div>';
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === hijriDate.day;
            let classes = ['calendar-day'];
            if (isToday) classes.push('today');
            
            const arabicDay = this.convertToArabicNumber(day);
            
            daysHTML += `<div class="${classes.join(' ')}">${arabicDay}</div>`;
        }
        
        container.innerHTML = daysHTML;
    }

    // Hijri First Day
    getHijriFirstDay(hijriDate) {
        const jd = this.hijriToJD(hijriDate.year, hijriDate.month, 1);
        return (jd + 1) % 7;
    }

    // Gregorian to Hijri
    gregorianToHijri(date) {
        const jd = this.gregorianToJD(date);
        const l = jd - 1948440 + 10632;
        const n = Math.floor((l - 1) / 10631);
        const l2 = l - 10631 * n + 354;
        const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + 
                  Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
        const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - 
                   Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
        const month = Math.floor((24 * l3) / 709);
        const day = l3 - Math.floor((709 * month) / 24);
        const year = 30 * n + j - 30;
        
        return {
            year: year,
            month: month,
            day: day,
            daysInMonth: month % 2 === 0 ? 29 : 30
        };
    }

    // Julian Date Conversions
    gregorianToJD(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        let a = Math.floor((14 - month) / 12);
        let y = year + 4800 - a;
        let m = month + 12 * a - 3;
        
        return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
               Math.floor(y / 4) - Math.floor(y / 100) + 
               Math.floor(y / 400) - 32045;
    }

    hijriToJD(year, month, day) {
        return Math.floor((11 * year + 3) / 30) + 
               354 * year + 30 * month - 
               Math.floor((month - 1) / 2) + day + 1948440 - 385;
    }

    // Sun Information
    async updateSunInfo() {
        try {
            const { latitude, longitude } = this.state.location;
            const response = await fetch(
                `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`
            );
            
            if (!response.ok) throw new Error('API response not OK');
            
            const data = await response.json();
            
            if (data.status === 'OK' && data.results) {
                const sunrise = new Date(data.results.sunrise);
                const sunset = new Date(data.results.sunset);
                const solarNoon = new Date(data.results.solar_noon);
                const dayLengthSeconds = parseInt(data.results.day_length);
                
                const formatTime = (date) => {
                    if (!date || isNaN(date.getTime())) return '--:--';
                    return date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });
                };
                
                const sunriseElement = document.getElementById('sunriseTime');
                const sunsetElement = document.getElementById('sunsetTime');
                const solarNoonElement = document.getElementById('solarNoonTime');
                const dayLengthElement = document.getElementById('dayLength');
                
                if (sunriseElement) sunriseElement.textContent = formatTime(sunrise);
                if (sunsetElement) sunsetElement.textContent = formatTime(sunset);
                if (solarNoonElement) solarNoonElement.textContent = formatTime(solarNoon);
                
                if (dayLengthElement && !isNaN(dayLengthSeconds)) {
                    const hours = Math.floor(dayLengthSeconds / 3600);
                    const minutes = Math.floor((dayLengthSeconds % 3600) / 60);
                    dayLengthElement.textContent = `${hours}h ${minutes}m`;
                }
            }
        } catch (error) {
            console.error('Sun info fetch error:', error.message);
            this.calculateSunInfoFallback();
        }
    }

    // Fallback Sun Calculation
    calculateSunInfoFallback() {
        const now = new Date();
        const sunriseTime = new Date(now);
        sunriseTime.setHours(6, 15, 0);
        const sunsetTime = new Date(now);
        sunsetTime.setHours(17, 45, 0);
        const solarNoon = new Date(now);
        solarNoon.setHours(12, 0, 0);
        
        const formatTime = (date) => {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };
        
        const sunriseElement = document.getElementById('sunriseTime');
        const sunsetElement = document.getElementById('sunsetTime');
        const solarNoonElement = document.getElementById('solarNoonTime');
        const dayLengthElement = document.getElementById('dayLength');
        
        if (sunriseElement) sunriseElement.textContent = formatTime(sunriseTime);
        if (sunsetElement) sunsetElement.textContent = formatTime(sunsetTime);
        if (solarNoonElement) solarNoonElement.textContent = formatTime(solarNoon);
        if (dayLengthElement) {
            const diff = sunsetTime - sunriseTime;
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            dayLengthElement.textContent = `${hours}h ${minutes}m`;
        }
    }

    // Update Date Display
    updateDateDisplay() {
        const now = new Date();
        
        const gregElement = document.getElementById('gregorianFullDate');
        if (gregElement) {
            gregElement.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        const bengaliYear = now.getFullYear() - 593;
        const bengaliMonthIndex = (now.getMonth() + 8) % 12;
        const bengaliDay = now.getDate();
        const bengElement = document.getElementById('bengaliFullDate');
        if (bengElement) {
            bengElement.textContent = 
                `${this.bengaliDays[bengaliDay]} ${this.bengaliMonths[bengaliMonthIndex]} ${this.convertToBengaliNumber(bengaliYear)}`;
        }
        
        const hijriDate = this.gregorianToHijri(now);
        const hijriElement = document.getElementById('hijriFullDate');
        if (hijriElement) {
            hijriElement.textContent = 
                `${this.convertToArabicNumber(hijriDate.day)} ${this.arabicMonths[hijriDate.month - 1]} ${this.convertToArabicNumber(hijriDate.year)}`;
        }
    }

    // Navigation
    navigateMonth(calendarType, direction) {
        switch(calendarType) {
            case 'english':
                this.state.englishDate.setMonth(this.state.englishDate.getMonth() + direction);
                break;
            case 'bengali':
                this.state.bengaliDate.setMonth(this.state.bengaliDate.getMonth() + direction);
                break;
            case 'arabic':
                this.state.arabicDate.setMonth(this.state.arabicDate.getMonth() + direction);
                break;
        }
        this.updateAllCalendars();
    }

    // Arabic Date Adjustment
    adjustArabicDate(change) {
        this.state.arabicOffset += change;
        const offsetDisplay = document.getElementById('arabicOffsetDisplay');
        if (offsetDisplay) {
            offsetDisplay.textContent = 
                (this.state.arabicOffset >= 0 ? '+' : '') + this.state.arabicOffset;
        }
        this.updateArabicCalendar();
        this.showToast(`Hijri adjustment: ${this.state.arabicOffset > 0 ? '+' : ''}${this.state.arabicOffset} days`);
    }

    // Day Click Handler
    onDayClick(year, month, day) {
        const date = new Date(year, month, day);
        const dateString = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        this.showToast(`Selected: ${dateString}`);
    }

    // Number Conversions
    convertToBengaliNumber(number) {
        const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return String(number).split('').map(digit => {
            const num = parseInt(digit);
            return !isNaN(num) ? bengaliDigits[num] : digit;
        }).join('');
    }

    convertToArabicNumber(number) {
        const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return String(number).split('').map(digit => {
            const num = parseInt(digit);
            return !isNaN(num) ? arabicDigits[num] : digit;
        }).join('');
    }

    // Refresh All
    refreshAll() {
        this.state.englishDate = new Date();
        this.state.bengaliDate = new Date();
        this.state.arabicDate = new Date();
        this.state.arabicOffset = 0;
        
        const offsetDisplay = document.getElementById('arabicOffsetDisplay');
        if (offsetDisplay) offsetDisplay.textContent = '+0';
        
        this.updateAllCalendars();
        this.updateSunInfo();
        this.showToast('Calendar Refreshed 🔄');
    }

    // Toast Notification
    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.CalendarApp = new CalendarApp();
    console.log('Calendar App Instance Created:', window.CalendarApp);
});

/* ============================================
   CELESTIAL ANIMATIONS - SUN & MOON
   ============================================ */

class CelestialAnimation {
    constructor() {
        this.sunContainer = null;
        this.moonContainer = null;
        this.starsContainer = null;
        this.cloudsContainer = null;
        this.skyCanvas = null;
        this.animationFrame = null;
        
        this.init();
    }

    init() {
        this.createSkyElements();
        this.updateCelestialPositions();
        this.startAnimationLoop();
        
        // Update every minute
        setInterval(() => this.updateCelestialPositions(), 60000);
        
        // Handle window resize
        window.addEventListener('resize', () => this.updateCelestialPositions());
    }

    createSkyElements() {
        // Create Sky Canvas
        this.skyCanvas = document.createElement('div');
        this.skyCanvas.className = 'sky-canvas';
        document.body.insertBefore(this.skyCanvas, document.body.firstChild);

        // Create Sun
        this.sunContainer = document.createElement('div');
        this.sunContainer.className = 'sun-container';
        this.sunContainer.innerHTML = `
            <div class="sun">
                <div class="sun-core"></div>
                <div class="sun-rays">
                    ${Array(12).fill().map(() => '<div class="sun-ray"></div>').join('')}
                </div>
                <div class="sun-glow"></div>
            </div>
        `;
        document.body.appendChild(this.sunContainer);

        // Create Moon
        this.moonContainer = document.createElement('div');
        this.moonContainer.className = 'moon-container';
        this.moonContainer.innerHTML = `
            <div class="moon">
                <div class="moon-core"></div>
                <div class="moon-craters">
                    <div class="moon-crater"></div>
                    <div class="moon-crater"></div>
                    <div class="moon-crater"></div>
                    <div class="moon-crater"></div>
                    <div class="moon-crater"></div>
                </div>
                <div class="moon-glow"></div>
            </div>
        `;
        document.body.appendChild(this.moonContainer);

        // Create Stars
        this.starsContainer = document.createElement('div');
        this.starsContainer.className = 'stars-container';
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.width = Math.random() * 3 + 1 + 'px';
            star.style.height = star.style.width;
            star.style.setProperty('--duration', Math.random() * 3 + 2 + 's');
            star.style.setProperty('--delay', Math.random() * 2 + 's');
            this.starsContainer.appendChild(star);
        }
        document.body.appendChild(this.starsContainer);

        // Create Clouds
        this.cloudsContainer = document.createElement('div');
        this.cloudsContainer.className = 'clouds-container';
        for (let i = 0; i < 5; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            cloud.style.top = Math.random() * 50 + '%';
            cloud.style.width = Math.random() * 100 + 100 + 'px';
            cloud.style.height = Math.random() * 30 + 40 + 'px';
            cloud.style.setProperty('--duration', Math.random() * 30 + 20 + 's');
            cloud.style.left = Math.random() * 100 + '%';
            this.cloudsContainer.appendChild(cloud);
        }
        document.body.appendChild(this.cloudsContainer);
    }

    updateCelestialPositions() {
        const now = new Date();
        const hours = now.getHours() + now.getMinutes() / 60;
        const sunrise = 6; // 6:00 AM
        const sunset = 18; // 6:00 PM
        const noon = 12;

        // Update sky background
        this.updateSkyBackground(hours, sunrise, sunset);

        // Calculate position on the arc
        let sunProgress = 0;
        let moonProgress = 0;

        if (hours >= sunrise && hours <= sunset) {
            // Daytime - Sun is visible
            sunProgress = (hours - sunrise) / (sunset - sunrise);
            this.sunContainer.style.opacity = '1';
            this.moonContainer.style.opacity = '0';
            this.starsContainer.style.opacity = '0';
        } else {
            // Nighttime - Moon is visible
            if (hours > sunset) {
                moonProgress = (hours - sunset) / (24 - sunset + sunrise);
            } else {
                moonProgress = (hours + (24 - sunset)) / (24 - sunset + sunrise);
            }
            this.sunContainer.style.opacity = '0';
            this.moonContainer.style.opacity = '1';
            this.starsContainer.style.opacity = '1';
        }

        // Calculate position on arc (east to west)
        const calculateArcPosition = (progress) => {
            const angle = progress * Math.PI; // 0 to PI (left to right)
            const x = progress * 100; // 0% to 100% across screen
            const y = 50 - Math.sin(angle) * 30; // Arc height
            
            return {
                left: `${x}%`,
                top: `${y}%`
            };
        };

        // Update Sun position
        if (hours >= sunrise && hours <= sunset) {
            const sunPos = calculateArcPosition(sunProgress);
            this.sunContainer.style.left = sunPos.left;
            this.sunContainer.style.top = sunPos.top;
            
            // Adjust sun size based on position (bigger at horizon)
            const horizonFactor = Math.sin(sunProgress * Math.PI);
            const scale = 1 + horizonFactor * 0.5;
            this.sunContainer.style.transform = `translate(-50%, -50%) scale(${scale})`;
            
            // Change sun color based on time
            if (sunProgress < 0.2 || sunProgress > 0.8) {
                this.sunContainer.style.filter = 'drop-shadow(0 0 30px rgba(255, 100, 0, 0.8))';
            } else {
                this.sunContainer.style.filter = 'drop-shadow(0 0 30px rgba(255, 200, 0, 0.6))';
            }
        }

        // Update Moon position
        if (hours < sunrise || hours > sunset) {
            const moonPos = calculateArcPosition(moonProgress);
            this.moonContainer.style.left = moonPos.left;
            this.moonContainer.style.top = moonPos.top;
            this.moonContainer.style.transform = 'translate(-50%, -50%)';
        }

        // Show both during transition times
        if (Math.abs(hours - sunrise) < 0.5 || Math.abs(hours - sunset) < 0.5) {
            this.sunContainer.style.opacity = '0.7';
            this.moonContainer.style.opacity = '0.7';
        }
    }

    updateSkyBackground(hours, sunrise, sunset) {
        let background;
        
        if (hours >= sunrise + 1 && hours <= sunset - 1) {
            // Day
            background = 'var(--sky-day)';
        } else if (hours > sunset || hours < sunrise - 1) {
            // Night
            background = 'var(--sky-night)';
        } else if (Math.abs(hours - sunrise) < 1) {
            // Sunrise
            background = 'var(--sky-sunrise)';
        } else if (Math.abs(hours - sunset) < 1) {
            // Sunset
            background = 'var(--sky-sunset)';
        }
        
        if (this.skyCanvas && background) {
            this.skyCanvas.style.background = background;
        }
    }

    startAnimationLoop() {
        const animate = () => {
            // Smooth continuous updates can go here
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.sunContainer) this.sunContainer.remove();
        if (this.moonContainer) this.moonContainer.remove();
        if (this.starsContainer) this.starsContainer.remove();
        if (this.cloudsContainer) this.cloudsContainer.remove();
        if (this.skyCanvas) this.skyCanvas.remove();
    }
}

// Initialize Celestial Animation when DOM is ready
let celestialAnimation = null;

document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the main app to initialize
    setTimeout(() => {
        celestialAnimation = new CelestialAnimation();
        console.log('🌞🌙 Celestial Animation Started');
    }, 500);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (celestialAnimation) {
        celestialAnimation.destroy();
    }
});