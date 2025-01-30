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
    const newsButton = settingsModal.querySelector('.news-button');
    const settingsList = settingsModal.querySelector('.settings-list');
    
    // Изначально скрываем модальное окно
    if (settingsModal) {
        settingsModal.style.display = 'none';
    }
    
    // Добавляем форму промокода в настройки
    const promoSection = document.createElement('div');
    promoSection.className = 'setting-item promo-section';
    promoSection.innerHTML = `
        <div class="promo-form">
            <input type="text" id="promoCodeInput" placeholder="Введите промокод" maxlength="20">
            <button onclick="usePromoCode()">Активировать</button>
        </div>
    `;
    settingsList.appendChild(promoSection);

    // Добавляем стили для формы промокода
    const style = document.createElement('style');
    style.textContent = `
        .promo-section {
            margin: 20px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }
        .promo-form {
            display: flex;
            gap: 10px;
        }
        .promo-form input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #30363d;
            border-radius: 6px;
            background: #21262d;
            color: #c9d1d9;
            font-size: 14px;
        }
        .promo-form button {
            padding: 8px 16px;
            background: #238636;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }
        .promo-form button:hover {
            background: #2ea043;
        }
    `;
    document.head.appendChild(style);

    settingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });

    closeButton.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    newsButton.addEventListener('click', () => {
        showNews();
    });

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    // Добавляем функцию использования промокода
    async function usePromoCode() {
        const input = document.getElementById('promoCodeInput');
        if (!input || !input.value) {
            showNotification('Введите промокод', 'error');
            return;
        }

        const code = input.value.trim().toUpperCase();
        if (!code) {
            showNotification('Введите промокод', 'error');
            return;
        }

        try {
            // Получаем текущий Telegram ID
            const telegramId = window.tg?.initDataUnsafe?.user?.id?.toString();
            if (!telegramId) {
                showNotification('Ошибка: не удалось получить ID пользователя', 'error');
                return;
            }

            // Используем промокод
            const result = await window.db.usePromoCode(telegramId, code);
            
            if (result.success) {
                showNotification(result.message, 'success');
                input.value = ''; // Очищаем поле ввода
                
                // Обновляем баланс или энергию в зависимости от типа награды
                if (result.reward.type === 'coins') {
                    updateBalanceDisplay();
                } else if (result.reward.type === 'energy') {
                    const userData = await window.db.getUserData(telegramId);
                    if (userData && typeof updateEnergyDisplay === 'function') {
                        updateEnergyDisplay(userData.energy, userData.max_energy);
                    }
                }
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Ошибка при использовании промокода:', error);
            showNotification('Произошла ошибка при использовании промокода', 'error');
        }
    }

    // Добавляем обработчик для кнопки активации промокода
    const promoButton = promoSection.querySelector('button');
    if (promoButton) {
        promoButton.onclick = usePromoCode;
    }

    // Получаем элементы настроек
    const snowToggle = settingsModal.querySelector('input[type="checkbox"]:nth-child(3)');

    // Устанавливаем начальное состояние переключателя снега
    if (snowToggle) {
        snowToggle.checked = localStorage.getItem('snowEnabled') === 'true';
    }

    // Обработчик для переключателя снега
    snowToggle?.addEventListener('change', (e) => {
        if (window.snowAnimation) {
            const isEnabled = window.snowAnimation.toggle();
            e.target.checked = isEnabled;
        }
    });
}); 