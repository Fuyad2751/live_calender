var CACHE = 'crystal-cal-v2';

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE).then(function(cache) {
            return cache.addAll([
                '/live_calender/',
                '/live_calender/index.html',
                '/live_calender/css/style.css',
                '/live_calender/css/themes.css',
                '/live_calender/css/animations.css',
                '/live_calender/js/main.js',
                '/live_calender/js/calendar.js',
                '/live_calender/js/bengaliCalendar.js',
                '/live_calender/js/hijriCalendar.js',
                '/live_calender/js/sunTimes.js',
                '/live_calender/js/themeManager.js',
                '/live_calender/manifest.json'
            ]);
        })
    );
});

self.addEventListener('fetch', function(e) {
    e.respondWith(
        caches.match(e.request).then(function(r) {
            return r || fetch(e.request);
        })
    );
});