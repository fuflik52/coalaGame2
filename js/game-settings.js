class GameSettings {
    constructor() {
        this.settings = {
            sound: false,      // Звук (в разработке)
            vibration: false,  // Вибрация
            snow: false        // Снег
        };
        this.initializeSettings();
    }

    initializeSettings() {
        // Загружаем сохраненные настройки
        const savedSettings = localStorage.getItem('gameSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }

        // Добавляем настройки в интерфейс
        const settingsContainer = document.querySelector('.settings-list');
        if (settingsContainer) {
            settingsContainer.innerHTML = `
                <div class="setting-item">
                    <div class="setting-info">
                        <span class="setting-name">Звук</span>
                        <span class="setting-badge">в разработке</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="soundToggle" ${this.settings.sound ? 'checked' : ''} disabled>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="setting-item">
                    <div class="setting-info">
                        <span class="setting-name">Вибрация</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="vibrationToggle" ${this.settings.vibration ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="setting-item">
                    <div class="setting-info">
                        <span class="setting-name">Снег</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="snowToggle" ${this.settings.snow ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            `;

            // Добавляем обработчики событий
            this.addEventListeners();
        }
    }

    addEventListeners() {
        // Обработчик для вибрации
        const vibrationToggle = document.getElementById('vibrationToggle');
        if (vibrationToggle) {
            vibrationToggle.addEventListener('change', (e) => {
                this.settings.vibration = e.target.checked;
                this.saveSettings();
                if (e.target.checked && window.navigator.vibrate) {
                    window.navigator.vibrate(50); // Тестовая вибрация
                }
            });
        }

        // Обработчик для снега
        const snowToggle = document.getElementById('snowToggle');
        if (snowToggle) {
            snowToggle.addEventListener('change', (e) => {
                this.settings.snow = e.target.checked;
                this.saveSettings();
                this.toggleSnow(e.target.checked);
            });
        }
    }

    toggleSnow(enabled) {
        const snowContainer = document.querySelector('.snow-container');
        if (enabled) {
            if (!snowContainer) {
                const container = document.createElement('div');
                container.className = 'snow-container';
                document.body.appendChild(container);
                
                // Создаем снежинки
                for (let i = 0; i < 50; i++) {
                    const snowflake = document.createElement('div');
                    snowflake.className = 'snowflake';
                    snowflake.style.left = `${Math.random() * 100}%`;
                    snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`;
                    snowflake.style.animationDelay = `${Math.random() * 2}s`;
                    container.appendChild(snowflake);
                }
            }
        } else if (snowContainer) {
            snowContainer.remove();
        }
    }

    saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    }
}

// Инициализация настроек при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.gameSettings = new GameSettings();
}); 