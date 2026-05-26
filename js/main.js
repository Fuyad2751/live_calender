// Main Application with Crystal Theme Support
class CrystalCalendarApp {
    constructor() {
        this.calendarManager = new CalendarManager();
        this.selectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.currentCalendar = 'english';
        this.clockInterval = null;
        this.sunTimesInterval = null;
        this.sunTimes = null;
        
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
            
            // Use Dhaka coordinates as default, you can make this dynamic
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
                
                // Adjust sunrise time for timezone
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
                
                // If sunrise has passed, calculate for tomorrow
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
                
                // Adjust sunset time for timezone
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
                
                // If sunset has passed, calculate for tomorrow
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
            
            // Adjust times for timezone
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
            
            // Calculate sun position percentage (0-100)
            const totalDayMs = sunset.getTime() - sunrise.getTime();
            const currentMs = now.getTime() - sunrise.getTime();
            let positionPercent = (currentMs / totalDayMs) * 100;
            
            // Clamp between 0 and 100
            positionPercent = Math.max(0, Math.min(100, positionPercent));
            
            // Update marker position
            sunMarker.style.left = `${positionPercent}%`;
            
            // Update sun icon based on time of day
            if (now < sunrise || now > sunset) {
                // Night time
                sunMarker.innerHTML = '<i class="fas fa-moon"></i>';
                sunMarker.style.color = '#6366f1';
            } else if (positionPercent < 15 || positionPercent > 85) {
                // Twilight
                sunMarker.innerHTML = '<i class="fas fa-sun"></i>';
                sunMarker.style.color = '#f97316';
                sunMarker.style.opacity = '0.7';
            } else {
                // Day time
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
            
            // Adjust times for timezone
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
                // Day time
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
                // Night time
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
            
            if (daylightStatus) {
                daylightStatus.textContent = status;
            }
            
            if (sunPositionText) {
                sunPositionText.textContent = position;
            }
        } catch (error) {
            console.error('Error updating daylight status:', error);
        }
    }
    
    setupTimezoneSelector() {
        const timezoneSelect = document.getElementById('timezoneSelect');
        const timezoneSearch = document.getElementById('timezoneSearch');
        
        if (!timezoneSelect) {
            console.warn('Timezone select element not found');
            return;
        }
        
        // Set initial value
        timezoneSelect.value = this.selectedTimezone;
        
        timezoneSelect.addEventListener('change', (e) => {
            this.selectedTimezone = e.target.value;
            this.updateCrystalClock();
            this.updateAllInfo();
            this.renderAllCalendars();
            // Update sun times when timezone changes
            this.sunTimes = this.getCurrentSunTimes();
            this.updateSunTimes();
        });
        
        if (timezoneSearch) {
            timezoneSearch.addEventListener('input', (e) => {
                this.filterTimezoneOptions(e.target.value);
            });
        }
    }
    
    setupSearchFilter() {
        const timezoneSearch = document.getElementById('timezoneSearch');
        
        if (!timezoneSearch) {
            console.warn('Timezone search element not found');
            return;
        }
        
        // Clear search on focus
        timezoneSearch.addEventListener('focus', () => {
            timezoneSearch.select();
        });
        
        // Add debounce for better performance
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
            // Show all options
            for (let i = 0; i < options.length; i++) {
                options[i].style.display = '';
            }
            // Show all optgroups
            const optgroups = select.querySelectorAll('optgroup');
            optgroups.forEach(group => {
                group.style.display = '';
            });
            return;
        }
        
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            // Skip optgroup labels
            if (option.parentElement.tagName === 'OPTGROUP') {
                const text = option.text.toLowerCase();
                
                if (text.includes(search)) {
                    option.style.display = '';
                } else {
                    option.style.display = 'none';
                }
            }
        }
        
        // Hide empty optgroups
        const optgroups = select.querySelectorAll('optgroup');
        optgroups.forEach(group => {
            const visibleOptions = Array.from(group.options).filter(opt => opt.style.display !== 'none');
            group.style.display = visibleOptions.length > 0 ? '' : 'none';
        });
    }
    
    setupDetectLocation() {
        const detectBtn = document.getElementById('detectLocation');
        
        if (!detectBtn) {
            console.warn('Detect location button not found');
            return;
        }
        
        detectBtn.addEventListener('click', () => {
            if ('geolocation' in navigator) {
                // Show loading state
                detectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>লোকেটিং...</span>';
                detectBtn.disabled = true;
                
                // Set timeout for geolocation
                const timeout = setTimeout(() => {
                    detectBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>টাইমআউট!</span>';
                    detectBtn.disabled = false;
                    setTimeout(() => {
                        detectBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i><span>অটো-ডিটেক্ট</span>';
                    }, 2000);
                }, 10000);
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        clearTimeout(timeout);
                        
                        // Get timezone from browser
                        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                        this.selectedTimezone = timezone;
                        
                        // Update select element
                        const timezoneSelect = document.getElementById('timezoneSelect');
                        if (timezoneSelect) {
                            // Check if timezone exists in options
                            let found = false;
                            for (let i = 0; i < timezoneSelect.options.length; i++) {
                                if (timezoneSelect.options[i].value === timezone) {
                                    timezoneSelect.value = timezone;
                                    found = true;
                                    break;
                                }
                            }
                            
                            if (!found) {
                                // Add custom option
                                const option = document.createElement('option');
                                option.value = timezone;
                                option.textContent = `📍 ${timezone} (বর্তমান)`;
                                option.selected = true;
                                timezoneSelect.insertBefore(option, timezoneSelect.firstChild);
                            }
                        }
                        
                        // Update display
                        detectBtn.innerHTML = '<i class="fas fa-check-circle"></i><span>লোকেটেড!</span>';
                        
                        this.updateCrystalClock();
                        this.updateAllInfo();
                        // Update sun times for new location
                        this.sunTimes = this.getCurrentSunTimes();
                        this.updateSunTimes();
                        
                        setTimeout(() => {
                            detectBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i><span>অটো-ডিটেক্ট</span>';
                            detectBtn.disabled = false;
                        }, 2000);
                    },
                    (error) => {
                        clearTimeout(timeout);
                        
                        let errorMessage = 'লোকেশন পাওয়া যায়নি';
                        switch(error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = 'লোকেশন অনুমতি প্রত্যাখ্যান';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = 'লোকেশন তথ্য অনুপলব্ধ';
                                break;
                            case error.TIMEOUT:
                                errorMessage = 'লোকেশন টাইমআউট';
                                break;
                        }
                        
                        detectBtn.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>${errorMessage}</span>`;
                        detectBtn.disabled = false;
                        
                        setTimeout(() => {
                            detectBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i><span>অটো-ডিটেক্ট</span>';
                        }, 3000);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            } else {
                alert('আপনার ব্রাউজারে জিওলোকেশন সাপোর্ট করে না');
            }
        });
    }
    
    setupCalendarTabs() {
        const tabButtons = document.querySelectorAll('.crystal-tab');
        const calendarPanels = document.querySelectorAll('.calendar-panel');
        
        if (tabButtons.length === 0) {
            console.warn('No calendar tabs found');
            return;
        }
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const calendarType = button.dataset.calendar;
                
                if (!calendarType) return;
                
                // Update active states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                calendarPanels.forEach(panel => panel.classList.remove('active'));
                
                const targetPanel = document.getElementById(`${calendarType}Calendar`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
                
                this.currentCalendar = calendarType;
                
                // Add click animation
                this.addClickEffect(button);
            });
        });
    }
    
    setupNavigationButtons() {
        // English calendar navigation
        this.bindNavButton('engPrevMonth', () => {
            this.calendarManager.currentEnglishMonth--;
            if (this.calendarManager.currentEnglishMonth < 0) {
                this.calendarManager.currentEnglishMonth = 11;
                this.calendarManager.currentEnglishYear--;
            }
            this.calendarManager.renderEnglishCalendar(
                this.calendarManager.currentEnglishYear,
                this.calendarManager.currentEnglishMonth
            );
        });
        
        this.bindNavButton('engNextMonth', () => {
            this.calendarManager.currentEnglishMonth++;
            if (this.calendarManager.currentEnglishMonth > 11) {
                this.calendarManager.currentEnglishMonth = 0;
                this.calendarManager.currentEnglishYear++;
            }
            this.calendarManager.renderEnglishCalendar(
                this.calendarManager.currentEnglishYear,
                this.calendarManager.currentEnglishMonth
            );
        });
        
        // Bengali calendar navigation
        this.bindNavButton('benPrevMonth', () => {
            this.calendarManager.currentBengaliMonth--;
            if (this.calendarManager.currentBengaliMonth < 0) {
                this.calendarManager.currentBengaliMonth = 11;
                this.calendarManager.currentBengaliYear--;
            }
            this.calendarManager.renderBengaliCalendar(
                this.calendarManager.currentBengaliYear,
                this.calendarManager.currentBengaliMonth
            );
        });
        
        this.bindNavButton('benNextMonth', () => {
            this.calendarManager.currentBengaliMonth++;
            if (this.calendarManager.currentBengaliMonth > 11) {
                this.calendarManager.currentBengaliMonth = 0;
                this.calendarManager.currentBengaliYear++;
            }
            this.calendarManager.renderBengaliCalendar(
                this.calendarManager.currentBengaliYear,
                this.calendarManager.currentBengaliMonth
            );
        });
        
        // Hijri calendar navigation
        this.bindNavButton('hijPrevMonth', () => {
            this.calendarManager.currentHijriMonth--;
            if (this.calendarManager.currentHijriMonth < 1) {
                this.calendarManager.currentHijriMonth = 12;
                this.calendarManager.currentHijriYear--;
            }
            this.calendarManager.renderHijriCalendar(
                this.calendarManager.currentHijriYear,
                this.calendarManager.currentHijriMonth
            );
        });
        
        this.bindNavButton('hijNextMonth', () => {
            this.calendarManager.currentHijriMonth++;
            if (this.calendarManager.currentHijriMonth > 12) {
                this.calendarManager.currentHijriMonth = 1;
                this.calendarManager.currentHijriYear++;
            }
            this.calendarManager.renderHijriCalendar(
                this.calendarManager.currentHijriYear,
                this.calendarManager.currentHijriMonth
            );
        });
    }
    
    bindNavButton(buttonId, callback) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                callback();
                this.addClickEffect(button);
            });
        } else {
            console.warn(`Navigation button ${buttonId} not found`);
        }
    }
    
    setupTodayButtons() {
        const todayButtons = ['engTodayBtn', 'benTodayBtn', 'hijTodayBtn'];
        
        todayButtons.forEach(btnId => {
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
        
        // Update time digits
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
        
        // Update date display
        const weekdays = [
            'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার',
            'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
        ];
        
        const currentDayName = document.getElementById('currentDayName');
        const currentFullDate = document.getElementById('currentFullDate');
        
        if (currentDayName) {
            currentDayName.textContent = weekdays[now.getDay()];
        }
        
        if (currentFullDate) {
            currentFullDate.textContent = 
                `${now.getDate()} ${this.calendarManager.englishMonths[now.getMonth()]} ${now.getFullYear()}`;
        }
        
        // Update timezone info
        const displayTimezone = document.getElementById('displayTimezone');
        const displayGMTOffset = document.getElementById('displayGMTOffset');
        
        if (displayTimezone) {
            displayTimezone.textContent = this.selectedTimezone;
        }
        
        if (displayGMTOffset) {
            const offset = -now.getTimezoneOffset() / 60;
            const offsetSign = offset >= 0 ? '+' : '';
            displayGMTOffset.textContent = `GMT${offsetSign}${offset}:00`;
        }
    }
    
    renderAllCalendars() {
        try {
            const now = this.getCurrentDateTime();
            
            // Reset to current dates
            this.resetAllToToday();
            
            // Render all calendars
            this.calendarManager.renderEnglishCalendar(
                this.calendarManager.currentEnglishYear,
                this.calendarManager.currentEnglishMonth,
                this.selectedTimezone
            );
            
            this.calendarManager.renderBengaliCalendar(
                this.calendarManager.currentBengaliYear,
                this.calendarManager.currentBengaliMonth,
                this.selectedTimezone
            );
            
            this.calendarManager.renderHijriCalendar(
                this.calendarManager.currentHijriYear,
                this.calendarManager.currentHijriMonth,
                this.selectedTimezone
            );
        } catch (error) {
            console.error('Error rendering calendars:', error);
        }
    }
    
    updateAllInfo() {
        try {
            const now = this.getCurrentDateTime();
            
            // Quick date cards
            const quickEnglishDate = document.getElementById('quickEnglishDate');
            const quickEnglishDay = document.getElementById('quickEnglishDay');
            
            if (quickEnglishDate) {
                quickEnglishDate.textContent = 
                    `${now.getDate()} ${this.calendarManager.englishMonths[now.getMonth()]} ${now.getFullYear()}`;
            }
            
            if (quickEnglishDay) {
                const weekdays = [
                    'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার',
                    'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
                ];
                quickEnglishDay.textContent = weekdays[now.getDay()];
            }
            
            // Bengali info
            const bengaliDate = this.calendarManager.bengaliCalendar.gregorianToBengali(now);
            const quickBengaliDate = document.getElementById('quickBengaliDate');
            const quickBengaliSeason = document.getElementById('quickBengaliSeason');
            
            if (quickBengaliDate) {
                quickBengaliDate.textContent = 
                    this.calendarManager.bengaliCalendar.formatBengaliDate(bengaliDate);
            }
            
            if (quickBengaliSeason) {
                quickBengaliSeason.textContent = `ঋতু: ${bengaliDate.season}`;
            }
            
            // Hijri info
            const hijriDate = this.calendarManager.hijriCalendar.gregorianToHijri(now);
            const quickHijriDate = document.getElementById('quickHijriDate');
            const quickHijriEvent = document.getElementById('quickHijriEvent');
            
            if (quickHijriDate) {
                quickHijriDate.textContent = 
                    this.calendarManager.hijriCalendar.formatHijriDate(hijriDate);
            }
            
            if (quickHijriEvent) {
                const importantEvent = this.calendarManager.hijriCalendar.isImportantDate(
                    hijriDate.month, hijriDate.day
                );
                quickHijriEvent.textContent = importantEvent || 'সাধারণ দিন';
            }
            
            // Additional events
            const weekNumber = document.getElementById('weekNumber');
            const dayOfYear = document.getElementById('dayOfYear');
            const sunriseTime = document.getElementById('sunriseTime');
            const sunsetTime = document.getElementById('sunsetTime');
            
            if (weekNumber) {
                weekNumber.textContent = this.getWeekNumber(now);
            }
            
            if (dayOfYear) {
                dayOfYear.textContent = this.getDayOfYear(now);
            }
            
            // Update sun times if elements exist
            if (sunriseTime || sunsetTime) {
                this.updateSunTimes();
            }
            
        } catch (error) {
            console.error('Error updating info:', error);
        }
    }
    
    getWeekNumber(date) {
        const start = new Date(date.getFullYear(), 0, 1);
        const diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        return Math.ceil(diff / oneWeek);
    }
    
    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }
    
    handleResize() {
        // Handle responsive adjustments if needed
        const width = window.innerWidth;
        
        if (width < 768) {
            // Mobile adjustments
            document.querySelectorAll('.calendar-panel').forEach(panel => {
                panel.style.padding = '20px';
            });
        } else {
            // Desktop adjustments
            document.querySelectorAll('.calendar-panel').forEach(panel => {
                panel.style.padding = '30px';
            });
        }
    }
    
    addClickEffect(element) {
        if (!element) return;
        
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }
    
    // Clean up when destroying the app
    destroy() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
        if (this.sunTimesInterval) {
            clearInterval(this.sunTimesInterval);
        }
    }
}

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Check if all required classes are loaded
        if (typeof CalendarManager === 'undefined') {
            throw new Error('CalendarManager class not loaded. Please check if calendar.js is loaded correctly.');
        }
        if (typeof BengaliCalendar === 'undefined') {
            throw new Error('BengaliCalendar class not loaded. Please check if bengaliCalendar.js is loaded correctly.');
        }
        if (typeof HijriCalendar === 'undefined') {
            throw new Error('HijriCalendar class not loaded. Please check if hijriCalendar.js is loaded correctly.');
        }
        if (typeof SunTimesCalculator === 'undefined') {
            throw new Error('SunTimesCalculator class not loaded. Please check if sunTimes.js is loaded correctly.');
        }
        
        // Initialize the app
        window.crystalApp = new CrystalCalendarApp();
        
        console.log('🌟 Crystal Calendar initialized successfully with Sun Times!');
        
    } catch (error) {
        console.error('Failed to initialize Crystal Calendar:', error);
        
        // Show error message to user
        const container = document.querySelector('.main-container');
        if (container) {
            container.innerHTML = `
                <div class="glass-card" style="padding: 40px; text-align: center; margin-top: 50px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f59e0b; margin-bottom: 20px;"></i>
                    <h2 style="color: var(--text-primary); margin-bottom: 10px;">লোডিং এরর!</h2>
                    <p style="color: var(--text-secondary);">${error.message}</p>
                    <p style="color: var(--text-tertiary); margin-top: 10px; font-size: 0.9rem;">
                        দয়া করে পৃষ্ঠাটি রিফ্রেশ করুন অথবা ক্যাশে ক্লিয়ার করুন।
                    </p>
                </div>
            `;
        }
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.crystalApp) {
        window.crystalApp.destroy();
    }
});