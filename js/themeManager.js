var ThemeManager = function() {
    var theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    
    document.getElementById('themeToggle').onclick = function() {
        theme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };
    
    document.getElementById('settingsBtn').onclick = function() {
        var themes = ['dark', 'light', 'aurora'];
        var current = themes.indexOf(theme);
        theme = themes[(current + 1) % themes.length];
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };
};

new ThemeManager();