function openSettings() {
    const settingsModal = document.querySelector('.settings-modal');
    if (settingsModal) {
        settingsModal.classList.add('active');
    }
}

function closeSettings() {
    const settingsModal = document.querySelector('.settings-modal');
    if (settingsModal) {
        settingsModal.classList.remove('active');
    }
}

function toggleSetting(settingId) {
    const setting = document.getElementById(settingId);
    if (setting) {
        const isEnabled = setting.checked;
        localStorage.setItem(settingId, isEnabled);
        
        // Применяем настройки
        switch(settingId) {
            case 'soundEnabled':
                // Логика для включения/выключения звука
                break;
            case 'notificationsEnabled':
                // Логика для включения/выключения уведомлений
                break;
            case 'vibrationEnabled':
                // Логика для включения/выключения вибрации
                break;
        }
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем сохраненные настройки или устанавливаем значения по умолчанию
    const settings = {
        'soundEnabled': false,
        'vibrationEnabled': false,
        'notificationsEnabled': true
    };

    Object.entries(settings).forEach(([settingId, defaultValue]) => {
        const setting = document.getElementById(settingId);
        if (setting) {
            const savedValue = localStorage.getItem(settingId);
            setting.checked = savedValue === null ? defaultValue : savedValue === 'true';
            if (savedValue === null) {
                localStorage.setItem(settingId, defaultValue);
            }
        }
    });

    const settingsButton = document.getElementById('settingsButton');
    const settingsModal = document.getElementById('settingsModal');
    const closeButton = settingsModal.querySelector('.close-button');
    
    // Изначально скрываем модальное окно
    if (settingsModal) {
        settingsModal.style.display = 'none';
    }
    
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            settingsModal.style.display = 'flex';
        });
    }
    
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });
    }

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    // Добавляем поле для промокода в модальное окно
    const settingsList = settingsModal.querySelector('.settings-list');
    const promoCodeHtml = `
        <div class="setting-item promo-code-section">
            <div class="promo-code-input">
                <input type="text" id="promoCodeInput" placeholder="Введите промокод">
                <button id="applyPromoCode">Применить</button>
            </div>
        </div>
    `;
    settingsList.insertAdjacentHTML('beforeend', promoCodeHtml);

    // Обработчик применения промокода
    const promoCodeInput = document.getElementById('promoCodeInput');
    const applyPromoCodeButton = document.getElementById('applyPromoCode');

    const promoCodes = {
        '1': 500000,
    };

    applyPromoCodeButton.addEventListener('click', () => {
        const code = promoCodeInput.value.toLowerCase();
        const reward = promoCodes[code];

        if (reward) {
            // Проверяем, использовался ли промокод
            const usedCodes = JSON.parse(localStorage.getItem('usedPromoCodes') || '[]');
            if (usedCodes.includes(code)) {
                showNotification('Этот промокод уже был использован', 'error');
                return;
            }

            // Начисляем награду
            addMoney(reward);
            
            // Сохраняем использованный промокод
            usedCodes.push(code);
            localStorage.setItem('usedPromoCodes', JSON.stringify(usedCodes));
            
            showNotification(`Промокод активирован! Получено ${reward} монет`, 'success');
            promoCodeInput.value = '';
        } else {
            showNotification('Неверный промокод', 'error');
        }
    });
}); 