// Sun Times Calculator
class SunTimesCalculator {
    constructor() {
        this.sunriseTime = null;
        this.sunsetTime = null;
    }
    
    // Calculate sun times for a given date and location
    calculateSunTimes(date, latitude, longitude, timezone) {
        try {
            // Use the date provided or current date
            const targetDate = date || new Date();
            
            // Calculate day of year
            const dayOfYear = this.getDayOfYear(targetDate);
            
            // Calculate solar declination
            const declination = this.calculateSolarDeclination(dayOfYear);
            
            // Calculate equation of time
            const eqTime = this.calculateEquationOfTime(dayOfYear);
            
            // Calculate hour angle
            const hourAngle = this.calculateHourAngle(latitude, declination);
            
            // Calculate sunrise and sunset in UTC
            let sunriseUTC = 12 - (hourAngle / 15) - (eqTime / 60);
            let sunsetUTC = 12 + (hourAngle / 15) - (eqTime / 60);
            
            // Adjust for longitude
            sunriseUTC -= longitude / 15;
            sunsetUTC -= longitude / 15;
            
            // Convert to date objects
            const sunrise = this.utcToDate(targetDate, sunriseUTC);
            const sunset = this.utcToDate(targetDate, sunsetUTC);
            
            // Adjust for timezone if provided
            if (timezone) {
                try {
                    const options = { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false };
                    // We'll store UTC times and let the display handle timezone conversion
                } catch (error) {
                    console.warn('Timezone adjustment failed for sun times');
                }
            }
            
            return {
                sunrise: sunrise,
                sunset: sunset,
                dayLength: this.calculateDayLength(sunrise, sunset),
                solarNoon: this.calculateSolarNoon(sunrise, sunset)
            };
        } catch (error) {
            console.error('Error calculating sun times:', error);
            return null;
        }
    }
    
    // Get day of year (1-366)
    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }
    
    // Calculate solar declination
    calculateSolarDeclination(dayOfYear) {
        // More accurate formula using the Spencer formula
        const b = (360 / 365) * (dayOfYear - 81);
        const bRad = this.toRadians(b);
        
        // Solar declination in degrees
        const declination = 23.45 * Math.sin(this.toRadians((360 / 365) * (dayOfYear - 81)));
        return declination;
    }
    
    // Calculate equation of time (in minutes)
    calculateEquationOfTime(dayOfYear) {
        const b = (360 / 365) * (dayOfYear - 81);
        const bRad = this.toRadians(b);
        
        // Equation of time in minutes (Spencer formula)
        const eqTime = 9.87 * Math.sin(2 * bRad) - 7.53 * Math.cos(bRad) - 1.5 * Math.sin(bRad);
        return eqTime;
    }
    
    // Calculate hour angle
    calculateHourAngle(latitude, declination) {
        const latRad = this.toRadians(latitude);
        const decRad = this.toRadians(declination);
        
        // Zenith angle for sunrise/sunset (90.833 degrees for atmospheric refraction)
        const zenith = this.toRadians(90.833);
        
        // Calculate hour angle
        const cosHourAngle = (Math.cos(zenith) - Math.sin(latRad) * Math.sin(decRad)) / 
                            (Math.cos(latRad) * Math.cos(decRad));
        
        // Check for polar day/night
        if (cosHourAngle > 1) {
            return 0; // Polar night
        } else if (cosHourAngle < -1) {
            return 180; // Polar day
        }
        
        const hourAngle = this.toDegrees(Math.acos(cosHourAngle));
        return hourAngle;
    }
    
    // Convert UTC hours to Date object
    utcToDate(date, utcHours) {
        const result = new Date(date);
        
        // Normalize hours to 0-24 range
        while (utcHours < 0) utcHours += 24;
        while (utcHours >= 24) utcHours -= 24;
        
        const hours = Math.floor(utcHours);
        const minutes = Math.floor((utcHours - hours) * 60);
        const seconds = Math.floor(((utcHours - hours) * 60 - minutes) * 60);
        
        result.setUTCHours(hours, minutes, seconds, 0);
        return result;
    }
    
    // Calculate day length
    calculateDayLength(sunrise, sunset) {
        const diff = sunset.getTime() - sunrise.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return {
            hours: hours,
            minutes: minutes,
            totalMinutes: hours * 60 + minutes
        };
    }
    
    // Calculate solar noon
    calculateSolarNoon(sunrise, sunset) {
        const noonTime = new Date((sunrise.getTime() + sunset.getTime()) / 2);
        return noonTime;
    }
    
    // Format time for display
    formatTime(date, timezone = null) {
        if (!date) return '--:--';
        
        try {
            let formattedDate = date;
            
            if (timezone) {
                const options = {
                    timeZone: timezone,
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                };
                const timeString = new Intl.DateTimeFormat('en-US', options).format(date);
                const [hour, minute] = timeString.split(':');
                formattedDate = new Date(date);
                formattedDate.setHours(parseInt(hour), parseInt(minute), 0);
            }
            
            const hours = String(formattedDate.getHours()).padStart(2, '0');
            const minutes = String(formattedDate.getMinutes()).padStart(2, '0');
            
            return `${hours}:${minutes}`;
        } catch (error) {
            console.error('Error formatting time:', error);
            return '--:--';
        }
    }
    
    // Format time in 12-hour format with AM/PM
    formatTime12Hour(date, timezone = null) {
        if (!date) return '--:--';
        
        try {
            let hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            
            return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
        } catch (error) {
            return '--:--';
        }
    }
    
    // Get sun times for major cities in Bangladesh
    getBangladeshSunTimes(date = null) {
        // Default to Dhaka coordinates
        return this.calculateSunTimes(date, 23.8103, 90.4125, 'Asia/Dhaka');
    }
    
    // Get sun times for popular locations
    getLocationSunTimes(locationName, date = null) {
        const locations = {
            'dhaka': { lat: 23.8103, lon: 90.4125, tz: 'Asia/Dhaka' },
            'chittagong': { lat: 22.3569, lon: 91.7832, tz: 'Asia/Dhaka' },
            'sylhet': { lat: 24.8949, lon: 91.8687, tz: 'Asia/Dhaka' },
            'rajshahi': { lat: 24.3745, lon: 88.6042, tz: 'Asia/Dhaka' },
            'khulna': { lat: 22.8456, lon: 89.5403, tz: 'Asia/Dhaka' },
            'barisal': { lat: 22.7010, lon: 90.3535, tz: 'Asia/Dhaka' },
            'rangpur': { lat: 25.7439, lon: 89.2752, tz: 'Asia/Dhaka' },
            'mymensingh': { lat: 24.7471, lon: 90.4203, tz: 'Asia/Dhaka' },
            'dubai': { lat: 25.2048, lon: 55.2708, tz: 'Asia/Dubai' },
            'riyadh': { lat: 24.7136, lon: 46.6753, tz: 'Asia/Riyadh' },
            'london': { lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
            'new_york': { lat: 40.7128, lon: -74.0060, tz: 'America/New_York' }
        };
        
        const location = locations[locationName.toLowerCase()];
        if (!location) return null;
        
        return this.calculateSunTimes(date, location.lat, location.lon, location.tz);
    }
    
    // Utility functions
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    toDegrees(radians) {
        return radians * (180 / Math.PI);
    }
}

// Initialize global sun times calculator
if (typeof window !== 'undefined') {
    window.sunTimesCalculator = new SunTimesCalculator();
}