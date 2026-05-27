// Main Application with Crystal Theme Support
class CrystalCalendarApp {
    constructor() {
        this.calendarManager = new CalendarManager();
        this.selectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.currentCalendar = 'english';
        this.clockInterval = null;
        this.sunTimesInterval = null;
        this.sunTimes = null;
        this.hijriAdjustment = 0; // Hijri date adjustment in days
        
        this.init();
    }
    
    init() {
        // Setup all components
        this.setupTimezoneSelector();
        this.setupCalendarTabs();
        this.setupNavigationButtons();
        this.setupTodayButtons();
        this.setupSearchFilter();
        this.setupDetectLocation();
        this.setupHijriAdjustment();
        
        // Start the clock and render calendars
        this.startCrystalClock();
        this.renderAllCalendars();
        this.updateAllInfo();
        
        // Initialize sun times
        this.sunTimes = this.getCurrentSunTimes();
        this.updateSunTimes();
        
        // Update clock and sun countdown every second
        this.clockInterval = setInterval(() => {
            this.updateCrystalClock();
            this.updateSunCountdown();
        }, 1000);
        
        // Update calendar info and sun times every minute
        this.sunTimesInterval = setInterval(() => {
            this.updateAllInfo();
            this.sunTimes = this.getCurrentSunTimes();
            this.updateSunTimes();
        }, 60000);
        
        // Listen for theme changes
        window.addEventListener('themeChanged', () => {
            this.renderAllCalendars();
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    getCurrentDateTime() {
        let date = new Date();
        
        if (this.selectedTimezone) {
            try {
                const options = { timeZone: this.selectedTimezone };
                const timeString = date.toLocaleString('en-US', options);
                date = new Date(timeString);
            } catch (error) {
                console.warn('Invalid timezone, using local time');
            }
        }
        
        return date;
    }
    
    // Get current sun times
    getCurrentSunTimes() {
        try {
            const now = this.getCurrentDateTime();
            
            // Use Dhaka coordinates as default
            const latitude = 23.8103;
            const longitude = 90.4125;
            
            if (window.sunTimesCalculator) {
                return window.sunTimesCalculator.calculateSunTimes(
                    now,
                    latitude,
                    longitude,
                    this.selectedTimezone
                );
            }
            return null;
        } catch (error) {
            console.error('Error getting sun times:', error);
            return null;
        }
    }
    
    // Get adjusted Hijri date
    getAdjustedHijriDate() {
        const now = this.getCurrentDateTime();
        let hijriDate = this.calendarManager.hijriCalendar.gregorianToHijri(now);
        
        // Apply adjustment
        if (this.hijriAdjustment !== 0) {
            hijriDate = this.calendarManager.hijriCalendar.adjustDate(hijriDate, this.hijriAdjustment);
        }
        
        return hijriDate;
    }
    
    // Update sun times display
    updateSunTimes() {
        if (!this.sunTimes) {
            this.sunTimes = this.getCurrentSunTimes();
        }
        
        if (!this.sunTimes) return;
        
        try {
            // Update sunrise time
            const sunriseTime = document.getElementById('sunriseTime');
            if (sunriseTime && window.sunTimesCalculator) {
                sunriseTime.textContent = window.sunTimesCalculator.formatTime(
                    this.sunTimes.sunrise,
                    this.selectedTimezone
                );
            }
            
            // Update sunset time
            const sunsetTime = document.getElementById('sunsetTime');
            if (sunsetTime && window.sunTimesCalculator) {
                sunsetTime.textContent = window.sunTimesCalculator.formatTime(
                    this.sunTimes.sunset,
                    this.selectedTimezone
                );
            }
            
            // Update day length
            const dayLength = document.getElementById('dayLength');
            if (dayLength && this.sunTimes.dayLength) {
                const hours = String(this.sunTimes.dayLength.hours).padStart(2, '0');
                const minutes = String(this.sunTimes.dayLength.minutes).padStart(2, '0');
                dayLength.textContent = `${hours}:${minutes} ঘন্টা`;
            }
            
            // Update solar noon
            const solarNoon = document.getElementById('solarNoon');
            if (solarNoon && window.sunTimesCalculator) {
                solarNoon.textContent = window.sunTimesCalculator.formatTime(
                    this.sunTimes.solarNoon,
                    this.selectedTimezone
                );
            }
            
            // Update sun position visual
            this.updateSunPosition();
            
            // Update daylight status
            this.updateDaylightStatus();
            
            // Update countdown
            this.updateSunCountdown();
            
        } catch (error) {
            console.error('Error updating sun times:', error);
        }
    }
    
    // Update sun countdown timers
    updateSunCountdown() {
        if (!this.sunTimes) return;
        
        try {
            const now = this.getCurrentDateTime();
            const sunriseCountdown = document.getElementById('sunriseCountdown');
            const sunsetCountdown = document.getElementById('sunsetCountdown');
            
            if (!sunriseCountdown && !sunsetCountdown) return;
            
            // Calculate time until sunrise
            if (sunriseCountdown && this.sunTimes.sunrise) {
                let sunriseTime = new Date(this.sunTimes.sunrise);
                
                if (this.selectedTimezone) {
                    try {
                        const options = { timeZone: this.selectedTimezone };
                        const timeString = sunriseTime.toLocaleString('en-US', options);
                        sunriseTime = new Date(timeString);
                    } catch (error) {
                        console.warn('Timezone adjustment failed for sunrise countdown');
                    }
                }
                
                let diffMs = sunriseTime.getTime() - now.getTime();
                
                if (diffMs < 0) {
                    sunriseTime.setDate(sunriseTime.getDate() + 1);
                    diffMs = sunriseTime.getTime() - now.getTime();
                }
                
                const diffHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
                const diffMinutes = Math.floor((Math.abs(diffMs) % (1000 * 60 * 60)) / (1000 * 60));
                
                if (diffMs > 0) {
                    if (diffHours < 1) {
                        sunriseCountdown.textContent = `আর মাত্র ${diffMinutes} মিনিট`;
                        sunriseCountdown.classList.add('countdown-active');
                    } else {
                        sunriseCountdown.textContent = `আর ${diffHours} ঘ. ${diffMinutes} মি.`;
                        sunriseCountdown.classList.remove('countdown-active');
                    }
                }
            }
            
            // Calculate time until sunset
            if (sunsetCountdown && this.sunTimes.sunset) {
                let sunsetTime = new Date(this.sunTimes.sunset);
                
                if (this.selectedTimezone) {
                    try {
                        const options = { timeZone: this.selectedTimezone };
                        const timeString = sunsetTime.toLocaleString('en-US', options);
                        sunsetTime = new Date(timeString);
                    } catch (error) {
                        console.warn('Timezone adjustment failed for sunset countdown');
                    }
                }
                
                let diffMs = sunsetTime.getTime() - now.getTime();
                
                if (diffMs < 0) {
                    sunsetTime.setDate(sunsetTime.getDate() + 1);
                    diffMs = sunsetTime.getTime() - now.getTime();
                }
                
                const diffHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
                const diffMinutes = Math.floor((Math.abs(diffMs) % (1000 * 60 * 60)) / (1000 * 60));
                
                if (diffMs > 0) {
                    if (diffHours < 1) {
                        sunsetCountdown.textContent = `আর মাত্র ${diffMinutes} মিনিট`;
                        sunsetCountdown.classList.add('countdown-active');
                    } else {
                        sunsetCountdown.textContent = `আর ${diffHours} ঘ. ${diffMinutes} মি.`;
                        sunsetCountdown.classList.remove('countdown-active');
                    }
                }
            }
        } catch (error) {
            console.error('Error updating sun countdown:', error);
        }
    }
    
    // Update sun position visual
    updateSunPosition() {
        if (!this.sunTimes) return;
        
        const sunMarker = document.getElementById('sunMarker');
        if (!sunMarker) return;
        
        try {
            const now = this.getCurrentDateTime();
            let sunrise = new Date(this.sunTimes.sunrise);
            let sunset = new Date(this.sunTimes.sunset);
            
            if (this.selectedTimezone) {
                try {
                    const options = { timeZone: this.selectedTimezone };
                    const sunriseStr = sunrise.toLocaleString('en-US', options);
                    const sunsetStr = sunset.toLocaleString('en-US', options);
                    sunrise = new Date(sunriseStr);
                    sunset = new Date(sunsetStr);
                } catch (error) {
                    console.warn('Timezone adjustment failed for sun position');
                }
            }
            
            const totalDayMs = sunset.getTime() - sunrise.getTime();
            const currentMs = now.getTime() - sunrise.getTime();
            let positionPercent = (currentMs / totalDayMs) * 100;
            
            positionPercent = Math.max(0, Math.min(100, positionPercent));
            
            sunMarker.style.left = `${positionPercent}%`;
            
            if (now < sunrise || now > sunset) {
                sunMarker.innerHTML = '<i class="fas fa-moon"></i>';
                sunMarker.style.color = '#6366f1';
            } else if (positionPercent < 15 || positionPercent > 85) {
                sunMarker.innerHTML = '<i class="fas fa-sun"></i>';
                sunMarker.style.color = '#f97316';
                sunMarker.style.opacity = '0.7';
            } else {
                sunMarker.innerHTML = '<i class="fas fa-sun"></i>';
                sunMarker.style.color = '#f59e0b';
                sunMarker.style.opacity = '1';
            }
        } catch (error) {
            console.error('Error updating sun position:', error);
        }
    }
    
    // Update daylight status
    updateDaylightStatus() {
        if (!this.sunTimes) return;
        
        const daylightStatus = document.getElementById('daylightStatus');
        const sunPositionText = document.getElementById('sunPosition');
        
        if (!daylightStatus && !sunPositionText) return;
        
        try {
            const now = this.getCurrentDateTime();
            let sunrise = new Date(this.sunTimes.sunrise);
            let sunset = new Date(this.sunTimes.sunset);
            
            if (this.selectedTimezone) {
                try {
                    const options = { timeZone: this.selectedTimezone };
                    const sunriseStr = sunrise.toLocaleString('en-US', options);
                    const sunsetStr = sunset.toLocaleString('en-US', options);
                    sunrise = new Date(sunriseStr);
                    sunset = new Date(sunsetStr);
                } catch (error) {
                    console.warn('Timezone adjustment failed for daylight status');
                }
            }
            
            let status, position;
            
            if (now >= sunrise && now <= sunset) {
                const dayProgress = ((now.getTime() - sunrise.getTime()) / 
                                    (sunset.getTime() - sunrise.getTime())) * 100;
                
                if (dayProgress < 20) {
                    status = '🌅 সকাল';
                    position = 'সূর্যোদয়ের পর';
                } else if (dayProgress < 50) {
                    status = '☀️ দিন';
                    position = 'পূর্বাহ্ন';
                } else if (dayProgress < 80) {
                    status = '🌤️ অপরাহ্ন';
                    position = 'বিকাল';
                } else {
                    status = '🌅 সন্ধ্যা';
                    position = 'সূর্যাস্তের আগে';
                }
            } else {
                if (now < sunrise) {
                    const diffMs = sunrise.getTime() - now.getTime();
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    
                    if (diffHours < 2) {
                        status = '🌙 ভোর';
                        position = 'সূর্যোদয়ের আগে';
                    } else {
                        status = '🌙 রাত';
                        position = 'গভীর রাত';
                    }
                } else {
                    const diffMs = now.getTime() - sunset.getTime();
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    
                    if (diffHours < 2) {
                        status = '🌆 সন্ধ্যা';
                        position = 'সূর্যাস্তের পর';
                    } else {
                        status = '🌙 রাত';
                        position = 'রাতের বেলা';
                    }
                }
            }
            
            if (daylightStatus) daylightStatus.textContent = status;
            if (sunPositionText) sunPositionText.textContent = position;
        } catch (error) {
            console.error('Error updating daylight status:', error);
        }
    }
    
    // হিজরি অ্যাডজাস্টমেন্ট সেটআপ
    setupHijriAdjustment() {
        const decreaseBtn = document.getElementById('hijriDecreaseDay');
        const increaseBtn = document.getElementById('hijriIncreaseDay');
        const resetBtn = document.getElementById('hijriResetAdjustment');
        
        if (!decreaseBtn || !increaseBtn || !resetBtn) return;
        
        // Load saved adjustment from localStorage
        const savedAdjustment = localStorage.getItem('hijriAdjustment');
        if (savedAdjustment) {
            this.hijriAdjustment = parseInt(savedAdjustment);
            this.updateAdjustmentDisplay();
        }
        
        // Decrease button
        decreaseBtn.addEventListener('click', () => {
            this.hijriAdjustment--;
            this.updateAdjustmentDisplay();
            this.saveHijriAdjustment();
            this.renderAllCalendars();
            this.showAdjustmentNotification('কমানো হয়েছে');
            this.addClickEffect(decreaseBtn);
        });
        
        // Increase button
        increaseBtn.addEventListener('click', () => {
            this.hijriAdjustment++;
            this.updateAdjustmentDisplay();
            this.saveHijriAdjustment();
            this.renderAllCalendars();
            this.showAdjustmentNotification('বাড়ানো হয়েছে');
            this.addClickEffect(increaseBtn);
        });
        
        // Reset button
        resetBtn.addEventListener('click', () => {
            this.hijriAdjustment = 0;
            this.updateAdjustmentDisplay();
            this.saveHijriAdjustment();
            this.renderAllCalendars();
            this.showAdjustmentNotification('রিসেট হয়েছে');
            this.addClickEffect(resetBtn);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                this.hijriAdjustment--;
                this.updateAdjustmentDisplay();
                this.saveHijriAdjustment();
                this.renderAllCalendars();
            } else if (e.ctrlKey && e.key === 'ArrowRight') {
                e.preventDefault();
                this.hijriAdjustment++;
                this.updateAdjustmentDisplay();
                this.saveHijriAdjustment();
                this.renderAllCalendars();
            } else if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.hijriAdjustment = 0;
                this.updateAdjustmentDisplay();
                this.saveHijriAdjustment();
                this.renderAllCalendars();
            }
        });
        
        // Initial update
        this.updateAdjustmentDisplay();
    }
    
    // অ্যাডজাস্টমেন্ট ডিসপ্লে আপডেট
    updateAdjustmentDisplay() {
        const adjustmentValue = document.getElementById('hijriAdjustmentValue');
        const adjustmentDisplay = document.querySelector('.adjustment-display');
        const adjustmentNote = document.getElementById('hijriAdjustmentNote');
        const hijriMonthYear = document.getElementById('hijMonthYear');
        
        if (adjustmentValue) {
            const displayValue = this.hijriAdjustment > 0 ? 
                `+${this.hijriAdjustment}` : 
                this.hijriAdjustment.toString();
            adjustmentValue.textContent = displayValue;
        }
        
        if (adjustmentDisplay) {
            if (this.hijriAdjustment !== 0) {
                adjustmentDisplay.classList.add('active-adjustment');
            } else {
                adjustmentDisplay.classList.remove('active-adjustment');
            }
        }
        
        if (adjustmentNote) {
            if (this.hijriAdjustment !== 0) {
                adjustmentNote.textContent = `চাঁদ দেখার ভিত্তিতে ${Math.abs(this.hijriAdjustment)} দিন ${this.hijriAdjustment > 0 ? 'বাড়ানো' : 'কমানো'} হয়েছে`;
            } else {
                adjustmentNote.textContent = 'চাঁদ দেখার উপর ভিত্তি করে সমন্বয় করুন';
            }
        }
        
        if (hijriMonthYear) {
            const existingBadge = hijriMonthYear.querySelector('.adjustment-badge');
            if (existingBadge) existingBadge.remove();
            
            if (this.hijriAdjustment !== 0) {
                const badge = document.createElement('span');
                badge.className = 'adjustment-badge';
                badge.textContent = `${this.hijriAdjustment > 0 ? '+' : ''}${this.hijriAdjustment} দিন`;
                hijriMonthYear.appendChild(badge);
            }
        }
    }
    
    // লোকাল স্টোরেজে সেভ
    saveHijriAdjustment() {
        localStorage.setItem('hijriAdjustment', this.hijriAdjustment.toString());
    }
    
    // নোটিফিকেশন দেখান
    showAdjustmentNotification(message) {
        const existingNotification = document.querySelector('.hijri-adjustment-notification');
        if (existingNotification) existingNotification.remove();
        
        const notification = document.createElement('div');
        notification.className = 'hijri-adjustment-notification';
        notification.innerHTML = `
            <i class="fas fa-calendar-check"></i>
            <span>হিজরি তারিখ ${message} (${this.hijriAdjustment > 0 ? '+' : ''}${this.hijriAdjustment} দিন)</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 3000);
    }
    
    setupTimezoneSelector() {
        const timezoneSelect = document.getElementById('timezoneSelect');
        
        if (!timezoneSelect) return;
        
        timezoneSelect.value = this.selectedTimezone;
        
        timezoneSelect.addEventListener('change', (e) => {
            this.selectedTimezone = e.target.value;
            this.updateCrystalClock();
            this.updateAllInfo();
            this.renderAllCalendars();
            this.sunTimes = this.getCurrentSunTimes();
            this.updateSunTimes();
        });
    }
    
    setupSearchFilter() {
        const timezoneSearch = document.getElementById('timezoneSearch');
        if (!timezoneSearch) return;
        
        timezoneSearch.addEventListener('focus', () => timezoneSearch.select());
        
        let debounceTimer;
        timezoneSearch.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.filterTimezoneOptions(e.target.value);
            }, 300);
        });
    }
    
    filterTimezoneOptions(searchText) {
        const select = document.getElementById('timezoneSelect');
        if (!select) return;
        
        const options = select.options;
        const search = searchText.toLowerCase().trim();
        
        if (search === '') {
            for (let i = 0; i < options.length; i++) {
                options[i].style.display = '';
            }
            return;
        }
        
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            if (option.parentElement.tagName === 'OPTGROUP') {
                option.style.display = option.text.toLowerCase().includes(search) ? '' : 'none';
            }
        }
    }
    
    setupDetectLocation() {
        const detectBtn = document.getElementById('detectLocation');
        if (!detectBtn) return;
        
        detectBtn.addEventListener('click', () => {
            if (!('geolocation' in navigator)) {
                alert('আপনার ব্রাউজারে জিওলোকেশন সাপোর্ট করে না');
                return;
            }
            
            detectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>লোকেটিং...</span>';
            detectBtn.disabled = true;
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    this.selectedTimezone = timezone;
                    
                    const timezoneSelect = document.getElementById('timezoneSelect');
                    if (timezoneSelect) {
                        timezoneSelect.value = timezone;
                    }
                    
                    detectBtn.innerHTML = '<i class="fas fa-check-circle"></i><span>লোকেটেড!</span>';
                    this.updateCrystalClock();
                    this.updateAllInfo();
                    this.sunTimes = this.getCurrentSunTimes();
                    this.updateSunTimes();
                    
                    setTimeout(() => {
                        detectBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i><span>অটো-ডিটেক্ট</span>';
                        detectBtn.disabled = false;
                    }, 2000);
                },
                (error) => {
                    detectBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>লোকেশন পাওয়া যায়নি</span>';
                    detectBtn.disabled = false;
                    setTimeout(() => {
                        detectBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i><span>অটো-ডিটেক্ট</span>';
                    }, 3000);
                }
            );
        });
    }
    
    setupCalendarTabs() {
        const tabButtons = document.querySelectorAll('.crystal-tab');
        const calendarPanels = document.querySelectorAll('.calendar-panel');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const calendarType = button.dataset.calendar;
                if (!calendarType) return;
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                calendarPanels.forEach(panel => panel.classList.remove('active'));
                
                const targetPanel = document.getElementById(`${calendarType}Calendar`);
                if (targetPanel) targetPanel.classList.add('active');
                
                this.currentCalendar = calendarType;
                this.addClickEffect(button);
            });
        });
    }
    
    setupNavigationButtons() {
        this.bindNavButton('engPrevMonth', () => {
            this.calendarManager.currentEnglishMonth--;
            if (this.calendarManager.currentEnglishMonth < 0) {
                this.calendarManager.currentEnglishMonth = 11;
                this.calendarManager.currentEnglishYear--;
            }
            this.calendarManager.renderEnglishCalendar(this.calendarManager.currentEnglishYear, this.calendarManager.currentEnglishMonth);
        });
        
        this.bindNavButton('engNextMonth', () => {
            this.calendarManager.currentEnglishMonth++;
            if (this.calendarManager.currentEnglishMonth > 11) {
                this.calendarManager.currentEnglishMonth = 0;
                this.calendarManager.currentEnglishYear++;
            }
            this.calendarManager.renderEnglishCalendar(this.calendarManager.currentEnglishYear, this.calendarManager.currentEnglishMonth);
        });
        
        this.bindNavButton('benPrevMonth', () => {
            this.calendarManager.currentBengaliMonth--;
            if (this.calendarManager.currentBengaliMonth < 0) {
                this.calendarManager.currentBengaliMonth = 11;
                this.calendarManager.currentBengaliYear--;
            }
            this.calendarManager.renderBengaliCalendar(this.calendarManager.currentBengaliYear, this.calendarManager.currentBengaliMonth);
        });
        
        this.bindNavButton('benNextMonth', () => {
            this.calendarManager.currentBengaliMonth++;
            if (this.calendarManager.currentBengaliMonth > 11) {
                this.calendarManager.currentBengaliMonth = 0;
                this.calendarManager.currentBengaliYear++;
            }
            this.calendarManager.renderBengaliCalendar(this.calendarManager.currentBengaliYear, this.calendarManager.currentBengaliMonth);
        });
        
        this.bindNavButton('hijPrevMonth', () => {
            this.calendarManager.currentHijriMonth--;
            if (this.calendarManager.currentHijriMonth < 1) {
                this.calendarManager.currentHijriMonth = 12;
                this.calendarManager.currentHijriYear--;
            }
            this.calendarManager.renderHijriCalendar(this.calendarManager.currentHijriYear, this.calendarManager.currentHijriMonth);
        });
        
        this.bindNavButton('hijNextMonth', () => {
            this.calendarManager.currentHijriMonth++;
            if (this.calendarManager.currentHijriMonth > 12) {
                this.calendarManager.currentHijriMonth = 1;
                this.calendarManager.currentHijriYear++;
            }
            this.calendarManager.renderHijriCalendar(this.calendarManager.currentHijriYear, this.calendarManager.currentHijriMonth);
        });
    }
    
    bindNavButton(buttonId, callback) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                callback();
                this.addClickEffect(button);
            });
        }
    }
    
    setupTodayButtons() {
        ['engTodayBtn', 'benTodayBtn', 'hijTodayBtn'].forEach(btnId => {
            const button = document.getElementById(btnId);
            if (button) {
                button.addEventListener('click', () => {
                    this.resetAllToToday();
                    this.renderAllCalendars();
                    this.addClickEffect(button);
                });
            }
        });
    }
    
    resetAllToToday() {
        const now = this.getCurrentDateTime();
        
        this.calendarManager.currentEnglishMonth = now.getMonth();
        this.calendarManager.currentEnglishYear = now.getFullYear();
        
        const bengaliDate = this.calendarManager.bengaliCalendar.gregorianToBengali(now);
        this.calendarManager.currentBengaliMonth = bengaliDate.month;
        this.calendarManager.currentBengaliYear = bengaliDate.year;
        
        const hijriDate = this.calendarManager.hijriCalendar.gregorianToHijri(now);
        this.calendarManager.currentHijriMonth = hijriDate.month;
        this.calendarManager.currentHijriYear = hijriDate.year;
    }
    
    startCrystalClock() {
        this.updateCrystalClock();
    }
    
    updateCrystalClock() {
        const now = this.getCurrentDateTime();
        
        const hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = String(hours % 12 || 12).padStart(2, '0');
        
        const currentHours = document.getElementById('currentHours');
        const currentMinutes = document.getElementById('currentMinutes');
        const currentSeconds = document.getElementById('currentSeconds');
        const ampmIndicator = document.getElementById('ampmIndicator');
        
        if (currentHours) currentHours.textContent = displayHours;
        if (currentMinutes) currentMinutes.textContent = minutes;
        if (currentSeconds) currentSeconds.textContent = seconds;
        if (ampmIndicator) ampmIndicator.textContent = ampm;
        
        const weekdays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
        
        const currentDayName = document.getElementById('currentDayName');
        const currentFullDate = document.getElementById('currentFullDate');
        
        if (currentDayName) currentDayName.textContent = weekdays[now.getDay()];
        if (currentFullDate) currentFullDate.textContent = `${now.getDate()} ${this.calendarManager.englishMonths[now.getMonth()]} ${now.getFullYear()}`;
        
        const displayTimezone = document.getElementById('displayTimezone');
        const displayGMTOffset = document.getElementById('displayGMTOffset');
        
        if (displayTimezone) displayTimezone.textContent = this.selectedTimezone;
        if (displayGMTOffset) {
            const offset = -now.getTimezoneOffset() / 60;
            displayGMTOffset.textContent = `GMT${offset >= 0 ? '+' : ''}${offset}:00`;
        }
    }
    
    renderAllCalendars() {
        try {
            this.resetAllToToday();
            
            this.calendarManager.renderEnglishCalendar(this.calendarManager.currentEnglishYear, this.calendarManager.currentEnglishMonth, this.selectedTimezone);
            this.calendarManager.renderBengaliCalendar(this.calendarManager.currentBengaliYear, this.calendarManager.currentBengaliMonth, this.selectedTimezone);
            this.calendarManager.renderHijriCalendar(this.calendarManager.currentHijriYear, this.calendarManager.currentHijriMonth, this.selectedTimezone);
        } catch (error) {
            console.error('Error rendering calendars:', error);
        }
    }
    
    updateAllInfo() {
        try {
            const now = this.getCurrentDateTime();
            
            // Quick English
            const quickEnglishDate = document.getElementById('quickEnglishDate');
            const quickEnglishDay = document.getElementById('quickEnglishDay');
            if (quickEnglishDate) quickEnglishDate.textContent = `${now.getDate()} ${this.calendarManager.englishMonths[now.getMonth()]} ${now.getFullYear()}`;
            if (quickEnglishDay) quickEnglishDay.textContent = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'][now.getDay()];
            
            // Quick Bengali
            const bengaliDate = this.calendarManager.bengaliCalendar.gregorianToBengali(now);
            const quickBengaliDate = document.getElementById('quickBengaliDate');
            const quickBengaliSeason = document.getElementById('quickBengaliSeason');
            if (quickBengaliDate) quickBengaliDate.textContent = this.calendarManager.bengaliCalendar.formatBengaliDate(bengaliDate);
            if (quickBengaliSeason) quickBengaliSeason.textContent = `ঋতু: ${bengaliDate.season}`;
            
            // Quick Hijri
            const hijriDate = this.getAdjustedHijriDate();
            const quickHijriDate = document.getElementById('quickHijriDate');
            const quickHijriEvent = document.getElementById('quickHijriEvent');
            if (quickHijriDate) quickHijriDate.textContent = this.calendarManager.hijriCalendar.formatHijriDate(hijriDate);
            if (quickHijriEvent) {
                const importantEvent = this.calendarManager.hijriCalendar.isImportantDate(hijriDate.month, hijriDate.day);
                quickHijriEvent.textContent = importantEvent || 'সাধারণ দিন';
                if (this.hijriAdjustment !== 0) quickHijriEvent.textContent += ' (সমন্বিত)';
            }
            
            // Week & Day info
            const weekNumber = document.getElementById('weekNumber');
            const dayOfYear = document.getElementById('dayOfYear');
            if (weekNumber) weekNumber.textContent = this.getWeekNumber(now);
            if (dayOfYear) dayOfYear.textContent = this.getDayOfYear(now);
            
        } catch (error) {
            console.error('Error updating info:', error);
        }
    }
    
    getWeekNumber(date) {
        const start = new Date(date.getFullYear(), 0, 1);
        const diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
        return Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
    }
    
    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        return Math.floor((date - start) / (1000 * 60 * 60 * 24));
    }
    
    handleResize() {
        const width = window.innerWidth;
        document.querySelectorAll('.calendar-panel').forEach(panel => {
            panel.style.padding = width < 768 ? '20px' : '30px';
        });
    }
    
    addClickEffect(element) {
        if (!element) return;
        element.style.transform = 'scale(0.95)';
        setTimeout(() => element.style.transform = 'scale(1)', 150);
    }
    
    destroy() {
        if (this.clockInterval) clearInterval(this.clockInterval);
        if (this.sunTimesInterval) clearInterval(this.sunTimesInterval);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (typeof CalendarManager === 'undefined') throw new Error('CalendarManager class not loaded');
        if (typeof BengaliCalendar === 'undefined') throw new Error('BengaliCalendar class not loaded');
        if (typeof HijriCalendar === 'undefined') throw new Error('HijriCalendar class not loaded');
        if (typeof SunTimesCalculator === 'undefined') throw new Error('SunTimesCalculator class not loaded');
        
        window.crystalApp = new CrystalCalendarApp();
        console.log('🌟 Crystal Calendar initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize:', error);
    }
});

window.addEventListener('beforeunload', () => {
    if (window.crystalApp) window.crystalApp.destroy();
});