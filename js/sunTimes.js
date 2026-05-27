var SunTimesCalculator = function() {
    this.calculate = function(date, lat, lon) {
        var d = new Date(date);
        var doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
        var dec = 23.45 * Math.sin((Math.PI / 180) * (360 / 365) * (doy - 81));
        var eqTime = 9.87 * Math.sin(2 * (Math.PI / 180) * (360 / 365) * (doy - 81)) - 7.53 * Math.cos((Math.PI / 180) * (360 / 365) * (doy - 81)) - 1.5 * Math.sin((Math.PI / 180) * (360 / 365) * (doy - 81));
        var ha = Math.acos((Math.cos((Math.PI / 180) * 90.833) - Math.sin((Math.PI / 180) * lat) * Math.sin((Math.PI / 180) * dec)) / (Math.cos((Math.PI / 180) * lat) * Math.cos((Math.PI / 180) * dec))) * (180 / Math.PI);
        var srH = 12 - ha / 15 - eqTime / 60;
        var ssH = 12 + ha / 15 - eqTime / 60;
        var sr = new Date(d); sr.setHours(Math.floor(srH), Math.floor((srH % 1) * 60), 0, 0);
        var ss = new Date(d); ss.setHours(Math.floor(ssH), Math.floor((ssH % 1) * 60), 0, 0);
        var noon = new Date((sr.getTime() + ss.getTime()) / 2);
        var len = (ss - sr) / 60000;
        return { sunrise: sr, sunset: ss, solarNoon: noon, dayLength: { hours: Math.floor(len / 60), minutes: Math.floor(len % 60) } };
    };
    
    this.formatTime = function(d) { return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
};