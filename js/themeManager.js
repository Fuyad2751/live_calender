// Theme Manager with Crystal Effects
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('crystalTheme') || 'dark';
        this.crystalEffect = localStorage.getItem('crystalEffect') !== 'false';
        this.particleEffect = localStorage.getItem('particleEffect') !== 'false';
        
        this.init();
    }
    
    init() {
        this.applyTheme(this.currentTheme);
        this.setupThemeToggle();
        this.setupCrystalEffects();
        this.setupParticles();
        this.setupSettingsModal();
    }
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('crystalTheme', theme);
        
        // Update theme option buttons
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            }
        });
        
        // Dispatch custom event for theme change
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }
    
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        
        themeToggle.addEventListener('click', () => {
            const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
            this.applyTheme(newTheme);
            this.addCrystalClickEffect(themeToggle);
        });
        
        // Update toggle position based on current theme
        this.updateTogglePosition();
    }
    
    updateTogglePosition() {
        const toggleThumb = document.querySelector('.toggle-thumb');
        if (this.currentTheme === 'light') {
            toggleThumb.style.transform = 'translateX(30px)';
        } else {
            toggleThumb.style.transform = 'translateX(0)';
        }
    }
    
    setupCrystalEffects() {
        const crystalEffectBtn = document.getElementById('crystalEffect');
        const crystalEffectToggle = document.getElementById('crystalEffectToggle');
        
        // Initial state
        if (!this.crystalEffect) {
            document.body.classList.add('no-crystal');
        }
        
        crystalEffectBtn.addEventListener('click', () => {
            this.crystalEffect = !this.crystalEffect;
            localStorage.setItem('crystalEffect', this.crystalEffect);
            
            if (this.crystalEffect) {
                document.body.classList.remove('no-crystal');
                crystalEffectBtn.classList.add('active');
            } else {
                document.body.classList.add('no-crystal');
                crystalEffectBtn.classList.remove('active');
            }
            
            this.addCrystalClickEffect(crystalEffectBtn);
        });
        
        crystalEffectToggle.addEventListener('change', (e) => {
            this.crystalEffect = e.target.checked;
            localStorage.setItem('crystalEffect', this.crystalEffect);
            
            if (this.crystalEffect) {
                document.body.classList.remove('no-crystal');
            } else {
                document.body.classList.add('no-crystal');
            }
        });
    }
    
    setupParticles() {
        const particlesContainer = document.getElementById('crystalParticles');
        const particleToggle = document.getElementById('particleEffectToggle');
        
        if (this.particleEffect) {
            this.createParticles(particlesContainer);
        }
        
        particleToggle.addEventListener('change', (e) => {
            this.particleEffect = e.target.checked;
            localStorage.setItem('particleEffect', this.particleEffect);
            
            if (this.particleEffect) {
                particlesContainer.style.display = 'block';
                this.createParticles(particlesContainer);
            } else {
                particlesContainer.style.display = 'none';
                particlesContainer.innerHTML = '';
            }
        });
    }
    
    createParticles(container) {
        container.innerHTML = '';
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'crystal-particle';
            
            // Random properties
            const size = Math.random() * 4 + 2;
            const left = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = Math.random() * 10 + 15;
            const opacity = Math.random() * 0.3 + 0.1;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${left}%;
                animation-delay: ${delay}s;
                animation-duration: ${duration}s;
                opacity: ${opacity};
                background: var(--crystal-highlight);
                border-radius: 50%;
                filter: blur(1px);
            `;
            
            container.appendChild(particle);
        }
    }
    
    setupSettingsModal() {
        const settingsBtn = document.getElementById('settingsBtn');
        const modal = document.getElementById('settingsModal');
        const closeModal = document.getElementById('closeModal');
        const saveSettings = document.getElementById('saveSettings');
        const resetSettings = document.getElementById('resetSettings');
        
        settingsBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        });
        
        closeModal.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }
        });
        
        // Theme options
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.applyTheme(theme);
            });
        });
        
        saveSettings.addEventListener('click', () => {
            // Save all settings
            localStorage.setItem('crystalTheme', this.currentTheme);
            localStorage.setItem('crystalEffect', this.crystalEffect);
            localStorage.setItem('particleEffect', this.particleEffect);
            
            // Close modal
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            
            // Show success notification
            this.showNotification('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
        });
        
        resetSettings.addEventListener('click', () => {
            this.applyTheme('dark');
            this.crystalEffect = true;
            this.particleEffect = true;
            
            document.body.classList.remove('no-crystal');
            document.getElementById('crystalParticles').style.display = 'block';
            
            document.getElementById('crystalEffectToggle').checked = true;
            document.getElementById('particleEffectToggle').checked = true;
            
            localStorage.clear();
            this.showNotification('সেটিংস রিসেট করা হয়েছে!');
        });
    }
    
    addCrystalClickEffect(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'crystal-notification glass-card';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize Theme Manager
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});