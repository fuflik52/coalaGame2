class GameSettings {
    constructor() {
        this.settings = {
            canHighlight: false, // Возможность выделения текста
            darkMode: false,     // Темный режим
            showHints: true      // Показывать подсказки
        };
        
        this.initializeSettings();
    }

    initializeSettings() {
        // Загружаем сохраненные настройки
        const savedSettings = localStorage.getItem('gameSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        }

        // Добавляем настройки в интерфейс
        const settingsContainer = document.querySelector('.settings-list');
        if (settingsContainer) {
            settingsContainer.insertAdjacentHTML('beforeend', `
                <div class="setting-item">
                    <div class="setting-info">
                        <span class="setting-name">Выделение текста</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="highlightToggle" ${this.settings.canHighlight ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="setting-item">
                    <div class="setting-info">
                        <span class="setting-name">Темный режим</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="darkModeToggle" ${this.settings.darkMode ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="setting-item">
                    <div class="setting-info">
                        <span class="setting-name">Подсказки</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="hintsToggle" ${this.settings.showHints ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            `);
        }

        // Добавляем обработчики событий
        this.addEventListeners();
        this.applySettings();
    }

    addEventListeners() {
        const highlightToggle = document.getElementById('highlightToggle');
        const darkModeToggle = document.getElementById('darkModeToggle');
        const hintsToggle = document.getElementById('hintsToggle');

        if (highlightToggle) {
            highlightToggle.addEventListener('change', (e) => {
                this.settings.canHighlight = e.target.checked;
                this.saveSettings();
                this.applySettings();
            });
        }

        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => {
                this.settings.darkMode = e.target.checked;
                this.saveSettings();
                this.applySettings();
            });
        }

        if (hintsToggle) {
            hintsToggle.addEventListener('change', (e) => {
                this.settings.showHints = e.target.checked;
                this.saveSettings();
                this.applySettings();
            });
        }
    }

    applySettings() {
        // Применяем настройку выделения текста
        document.body.style.userSelect = this.settings.canHighlight ? 'text' : 'none';
        
        // Применяем темный режим
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Применяем настройку подсказок
        const hints = document.querySelectorAll('.game-hint');
        hints.forEach(hint => {
            hint.style.display = this.settings.showHints ? 'block' : 'none';
        });
    }

    saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    }
}

// Инициализация настроек при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.gameSettings = new GameSettings();
}); 